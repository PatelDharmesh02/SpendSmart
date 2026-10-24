from datetime import datetime


def month_bounds(month: str):
    start = datetime.strptime(month, "%Y-%m").date()
    if start.month == 12:
        end = datetime(start.year + 1, 1, 1).date()
    else:
        end = datetime(start.year, start.month + 1, 1).date()
    return start, end
