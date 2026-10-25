"""Store a description with the monthly income."""

import sqlalchemy as sa
from alembic import op

revision = "20261025_0003"
down_revision = "20261025_0002"
branch_labels = None
depends_on = None


def _tables():
    return set(sa.inspect(op.get_bind()).get_table_names())


def _columns(table: str):
    return {column["name"] for column in sa.inspect(op.get_bind()).get_columns(table)}


def upgrade() -> None:
    if "monthly_incomes" not in _tables():
        return
    if "description" in _columns("monthly_incomes"):
        return
    op.add_column("monthly_incomes", sa.Column("description", sa.String(), nullable=True))


def downgrade() -> None:
    if "monthly_incomes" not in _tables():
        return
    if "description" not in _columns("monthly_incomes"):
        return
    op.drop_column("monthly_incomes", "description")
