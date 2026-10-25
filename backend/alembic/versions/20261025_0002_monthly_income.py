"""Add a monthly income amount per user."""

import sqlalchemy as sa
from alembic import op

revision = "20261025_0002"
down_revision = "20261013_0001"
branch_labels = None
depends_on = None


def _tables():
    return set(sa.inspect(op.get_bind()).get_table_names())


def upgrade() -> None:
    if "monthly_incomes" in _tables():
        return
    op.create_table(
        "monthly_incomes",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("month", sa.String(), nullable=False),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.UniqueConstraint("user_id", "month", name="uq_monthly_income_user_month"),
    )
    op.create_index("ix_monthly_incomes_user_id", "monthly_incomes", ["user_id"])


def downgrade() -> None:
    if "monthly_incomes" in _tables():
        op.drop_table("monthly_incomes")
