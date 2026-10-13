from app.utils.constants import CATEGORIES


def normalize_category(raw: str | None) -> tuple[str, float]:
    text = (raw or "").strip().lower()
    for category in CATEGORIES:
        if category in text:
            return category, 0.9
    return "miscellaneous", 0.4
