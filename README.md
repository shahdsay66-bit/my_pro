# House Price Prediction — End-to-End ML Web App

## Overview
Notebooks: Handles data cleaning, exploratory analysis, feature processing, and model training. The final pipeline is exported as house_price.pkl.

Backend: A FastAPI web service that loads the model pipeline on startup and provides endpoints for health checks and price predictions.

Frontend: A React with TypeScript web application built with Vite where users can input property parameters and receive real-time price estimates.

## Architecture
[ Browser / React UI ] ---> (POST /predict) ---> [ FastAPI Backend ] ---> [ ML Pipeline (.pkl) ]
[ Browser / React UI ] <--- { predicted_price } <--- [ FastAPI Backend ] <--- prediction
## Tech Stack
Data and Machine Learning: Python, pandas, numpy, scikit-learn, matplotlib, seaborn, joblib

Backend: FastAPI, Pydantic, uvicorn, pytest, httpx

Frontend: React, TypeScript, Vite, react-router-dom

Dataset: House Price dataset from Kaggle

Project Structure
house-price-app/
├── notebooks/
│   ├── house_price_model.ipynb
│   └── data/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── api/
│   │   ├── core/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── utils/
│   ├── models/
│   ├── tests/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   └── public/
└── README.md
Setup and Running
1. Model Training
Place house_prices.csv in notebooks/data/. Run notebooks/house_price_model.ipynb from start to finish to clean the data, train the model, and generate house_price.pkl and locations.json.

Copy the generated files:

house_price.pkl to backend/models/

locations.json to frontend/public/

2. Backend Setup
Bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
The API documentation will be available at http://localhost:8000/docs.

3. Frontend Setup
Bash
cd frontend
npm install
npm run dev
The client interface will run at http://localhost:5173.

API Documentation
GET /health
Returns operational status of the service.
Response: {"status": "ok"}

POST /predict
Accepts property specifications and returns an estimated valuation.

Request body example:

JSON
{
  "location": "Wakad",
  "carpet_area_sqft": 950,
  "floor_num": 3,
  "bathroom": 2,
  "balcony": 1,
  "furnishing": "Semi-Furnished",
  "transaction": "Resale",
  "ownership": "Freehold",
  "facing": "East"
}
Response body example:

JSON
{
  "predicted_price": 5615360.26
}
Model Performance
Evaluated on 174,471 cleaned records using an 80/20 train/test split:

Linear Regression: MAE = 4,528,921 | RMSE = 8,393,175 | R2 = 0.6227

Random Forest (Selected): MAE = 1,351,110 | RMSE = 5,367,105 | R2 = 0.8457

Random Forest was selected because it handles non-linear relationships between location categorizations, square footage, and property amenities much better than linear models.