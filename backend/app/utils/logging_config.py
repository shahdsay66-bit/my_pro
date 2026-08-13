import logging

from app.core.config import settings


def configure_logging() -> None:
    """Set up a simple, consistent logging format for the whole app."""
    logging.basicConfig(
        level=getattr(logging, settings.log_level.upper(), logging.INFO),
        format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    )


logger = logging.getLogger("house_price_api")
