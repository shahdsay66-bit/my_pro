import json
import os
import tempfile
from pathlib import Path

import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

# NOTE: this file is imported by pytest before any test_*.py module in the same
# directory, which matters because app.core.config.Settings() reads env vars once,
# at import time, the first time a test module does `from app.main import app`.
# So we build a tiny dummy model and set MODEL_PATH/LOCATIONS_PATH here, at import
# time, so the test suite never depends on the real (large) trained model.

_tmp_dir = Path(tempfile.mkdtemp(prefix="house_price_test_model_"))
_model_path = _tmp_dir / "house_price.pkl"
_locations_path = _tmp_dir / "locations.json"

_numeric_features = ["carpet_area_sqft", "floor_num", "bathroom", "balcony"]
_categorical_features = ["location_grouped", "Furnishing", "Transaction", "Ownership", "facing"]

_X = pd.DataFrame({
    "carpet_area_sqft": [600, 900, 1200, 1500],
    "floor_num": [1, 2, 3, 4],
    "bathroom": [1, 2, 2, 3],
    "balcony": [0, 1, 1, 2],
    "location_grouped": ["Wakad", "other", "Wakad", "other"],
    "Furnishing": ["Unfurnished", "Semi-Furnished", "Furnished", "Unfurnished"],
    "Transaction": ["Resale", "New Property", "Resale", "Resale"],
    "Ownership": ["Freehold", "Freehold", "Leasehold", "Freehold"],
    "facing": ["East", "West", "North", "South"],
})
_y = pd.Series([3_000_000, 5_500_000, 8_000_000, 9_500_000])

_preprocessor = ColumnTransformer([
    ("num", Pipeline([
        ("impute", SimpleImputer(strategy="median")),
        ("scale", StandardScaler()),
    ]), _numeric_features),
    ("cat", Pipeline([
        ("impute", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(handle_unknown="ignore")),
    ]), _categorical_features),
])
_model = Pipeline([
    ("prep", _preprocessor),
    ("reg", RandomForestRegressor(n_estimators=10, random_state=42)),
])
_model.fit(_X, _y)
joblib.dump(_model, _model_path)
json.dump(["Wakad"], open(_locations_path, "w"))

os.environ["MODEL_PATH"] = str(_model_path)
os.environ["LOCATIONS_PATH"] = str(_locations_path)
