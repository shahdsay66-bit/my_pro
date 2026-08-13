import pandas as pd

from app.schemas.prediction import PredictionRequest


def request_to_dataframe(request: PredictionRequest, known_locations: set[str]) -> pd.DataFrame:
    """Build a single-row DataFrame with exactly the column names used during training.

    Unknown locations are mapped to "other", the same bucket used for every
    long-tail location that didn't make the top-N cut in the notebook.
    """
    location_grouped = request.location if request.location in known_locations else "other"

    row = {
        "carpet_area_sqft": request.carpet_area_sqft,
        "floor_num": request.floor_num,
        "bathroom": request.bathroom,
        "balcony": request.balcony,
        "location_grouped": location_grouped,
        "Furnishing": request.furnishing,
        "Transaction": request.transaction,
        "Ownership": request.ownership,
        "facing": request.facing,
    }
    return pd.DataFrame([row])
