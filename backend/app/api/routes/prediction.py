from fastapi import APIRouter, HTTPException

from app.schemas.prediction import HealthResponse, PredictionRequest, PredictionResponse
from app.services.inference import prediction_service
from app.utils.logging_config import logger

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok")


@router.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest) -> PredictionResponse:
    try:
        price = prediction_service.predict(request)
    except RuntimeError as exc:
        logger.error("Prediction failed: %s", exc)
        raise HTTPException(status_code=503, detail="Model is not ready yet") from exc
    return PredictionResponse(predicted_price=price)
