import json
from pathlib import Path

import joblib

from app.core.config import settings
from app.schemas.prediction import PredictionRequest
from app.services.preprocessing import request_to_dataframe
from app.utils.logging_config import logger


class PredictionService:
    """Wraps the trained scikit-learn pipeline. Loaded once at startup, reused per request."""

    def __init__(self) -> None:
        self.model = None
        self.known_locations: set[str] = set()

    def load(self) -> None:
        model_path = Path(settings.model_path)
        if not model_path.exists():
            raise FileNotFoundError(
                f"Model file not found at {model_path}. "
                "Run the notebook and copy house_price.pkl into backend/models/."
            )
        self.model = joblib.load(model_path)
        logger.info("Loaded model from %s", model_path)

        locations_path = Path(settings.locations_path)
        if locations_path.exists():
            self.known_locations = set(json.loads(locations_path.read_text(encoding="utf-8")))
            logger.info("Loaded %d known locations", len(self.known_locations))
        else:
            logger.warning("locations.json not found at %s — every location will map to 'other'", locations_path)

    def predict(self, request: PredictionRequest) -> float:
        if self.model is None:
            raise RuntimeError("Model is not loaded yet")
        row = request_to_dataframe(request, self.known_locations)
        prediction = self.model.predict(row)
        return float(prediction[0])


prediction_service = PredictionService()
