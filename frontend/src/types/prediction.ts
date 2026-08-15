export type Furnishing = "Furnished" | "Semi-Furnished" | "Unfurnished";
export type Transaction = "New Property" | "Resale";

export interface PredictionRequest {
  location: string;
  carpet_area_sqft: number;
  floor_num: number;
  bathroom: number;
  balcony: number;
  furnishing: string;
  transaction: string;
  ownership: string;
  facing: string;
}

export interface PredictionResponse {
  predicted_price: number;
}

export interface ApiError {
  message: string;
}
