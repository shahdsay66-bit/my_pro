from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):
    """Everything the model needs to price one property listing."""

    location: str = Field(..., min_length=1, examples=["Wakad"])
    carpet_area_sqft: float = Field(..., gt=0, examples=[950.0])
    floor_num: int = Field(..., examples=[3])
    bathroom: int = Field(..., ge=0, examples=[2])
    balcony: int = Field(..., ge=0, examples=[1])
    furnishing: str = Field(..., examples=["Semi-Furnished"])
    transaction: str = Field(..., examples=["Resale"])
    ownership: str = Field(..., examples=["Freehold"])
    facing: str = Field(..., examples=["East"])


class PredictionResponse(BaseModel):
    predicted_price: float


class HealthResponse(BaseModel):
    status: str
