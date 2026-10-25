"""Create production tables and upgrade the original schema."""

import sqlalchemy as sa
from alembic import op

revision = "20261013_0001"
down_revision = None
branch_labels = None
depends_on = None


def _tables():
    return set(sa.inspect(op.get_bind()).get_table_names())


def _columns(table: str):
    return {column["name"] for column in sa.inspect(op.get_bind()).get_columns(table)}


def upgrade() -> None:
    if "users" not in _tables():
        from app.db.session import Base
        from app.models import budgets, goal, insight, job, monthly_income, refresh_token, transactions, user  # noqa: F401

        Base.metadata.create_all(bind=op.get_bind())
        return

    user_cols = _columns("users")
    if "auth_provider" not in user_cols:
        op.add_column(
            "users",
            sa.Column("auth_provider", sa.String(), nullable=False, server_default="password"),
        )
    if "provider_id" not in user_cols:
        op.add_column("users", sa.Column("provider_id", sa.String(), nullable=True))
    op.alter_column("users", "password", existing_type=sa.String(), nullable=True)

    tx_cols = _columns("transactions")
    additions = {
        "merchant": sa.Column("merchant", sa.String(), nullable=True),
        "tx_type": sa.Column("tx_type", sa.String(), nullable=False, server_default="expense"),
        "category_source": sa.Column("category_source", sa.String(), nullable=False, server_default="user"),
        "ai_confidence": sa.Column("ai_confidence", sa.Float(), nullable=True),
        "status": sa.Column("status", sa.String(), nullable=False, server_default="ready"),
    }
    for name, column in additions.items():
        if name not in tx_cols:
            op.add_column("transactions", column)

    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        op.execute("ALTER TABLE transactions ALTER COLUMN amount TYPE NUMERIC(12,2) USING amount::numeric")
        op.execute("ALTER TABLE budgets ALTER COLUMN amount TYPE NUMERIC(12,2) USING amount::numeric")
        op.execute(
            """
            DELETE FROM budgets a
            USING budgets b
            WHERE a.ctid < b.ctid
              AND a.user_id = b.user_id
              AND a.category = b.category
              AND a.month = b.month
            """
        )

    indexes = {index["name"] for index in sa.inspect(bind).get_indexes("transactions")}
    if "ix_transactions_user_date" not in indexes:
        op.create_index("ix_transactions_user_date", "transactions", ["user_id", "date"])
    budget_indexes = {index["name"] for index in sa.inspect(bind).get_indexes("budgets")}
    if "ix_budgets_user_month" not in budget_indexes:
        op.create_index("ix_budgets_user_month", "budgets", ["user_id", "month"])
    uniques = {item["name"] for item in sa.inspect(bind).get_unique_constraints("budgets")}
    if "uq_budget_user_cat_month" not in uniques:
        op.create_unique_constraint("uq_budget_user_cat_month", "budgets", ["user_id", "category", "month"])

    if "goals" not in _tables():
        op.create_table(
            "goals",
            sa.Column("id", sa.Uuid(), primary_key=True),
            sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id"), nullable=False),
            sa.Column("name", sa.String(), nullable=False),
            sa.Column("target_amount", sa.Numeric(12, 2), nullable=False),
            sa.Column("current_amount", sa.Numeric(12, 2), nullable=False),
            sa.Column("deadline", sa.Date(), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=True),
        )
        op.create_index("ix_goals_user_id", "goals", ["user_id"])
    if "insights" not in _tables():
        op.create_table(
            "insights",
            sa.Column("id", sa.Uuid(), primary_key=True),
            sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id"), nullable=False),
            sa.Column("month", sa.String(), nullable=False),
            sa.Column("prompt_hash", sa.String(), nullable=False),
            sa.Column("summary", sa.Text(), nullable=False),
            sa.Column("generated_at", sa.DateTime(), nullable=True),
            sa.UniqueConstraint("user_id", "month", name="uq_insight_user_month"),
        )
    if "jobs" not in _tables():
        op.create_table(
            "jobs",
            sa.Column("id", sa.Uuid(), primary_key=True),
            sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id"), nullable=False),
            sa.Column("type", sa.String(), nullable=False),
            sa.Column("status", sa.String(), nullable=False),
            sa.Column("payload", sa.Text(), nullable=True),
            sa.Column("error", sa.Text(), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=True),
            sa.Column("updated_at", sa.DateTime(), nullable=True),
        )
    if "refresh_tokens" not in _tables():
        op.create_table(
            "refresh_tokens",
            sa.Column("id", sa.Uuid(), primary_key=True),
            sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id"), nullable=False),
            sa.Column("token_hash", sa.String(), nullable=False),
            sa.Column("expires_at", sa.DateTime(), nullable=False),
            sa.Column("revoked", sa.Boolean(), nullable=False, server_default=sa.false()),
            sa.Column("created_at", sa.DateTime(), nullable=True),
        )
        op.create_index("ix_refresh_tokens_user_id", "refresh_tokens", ["user_id"])
        op.create_index("ix_refresh_tokens_token_hash", "refresh_tokens", ["token_hash"], unique=True)


def downgrade() -> None:
    for table in ("refresh_tokens", "jobs", "insights", "goals"):
        if table in _tables():
            op.drop_table(table)
