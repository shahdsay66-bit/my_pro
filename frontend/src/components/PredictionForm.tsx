import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { predictPrice } from "../api/predictionClient";
import type { PredictionRequest } from "../types/prediction";

const FURNISHING_OPTIONS = ["Furnished", "Semi-Furnished", "Unfurnished"];
const TRANSACTION_OPTIONS = ["New Property", "Resale"];
const OWNERSHIP_OPTIONS = ["Freehold", "Leasehold", "Co-operative Society", "Power of Attorney"];
const FACING_OPTIONS = ["East", "West", "North", "South", "North-East", "North-West", "South-East", "South-West"];

type FormState = {
  location: string;
  carpet_area_sqft: string;
  floor_num: string;
  bathroom: string;
  balcony: string;
  furnishing: string;
  transaction: string;
  ownership: string;
  facing: string;
};

const initialState: FormState = {
  location: "",
  carpet_area_sqft: "",
  floor_num: "",
  bathroom: "",
  balcony: "",
  furnishing: FURNISHING_OPTIONS[0],
  transaction: TRANSACTION_OPTIONS[0],
  ownership: OWNERSHIP_OPTIONS[0],
  facing: FACING_OPTIONS[0],
};

export default function PredictionForm() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<string[]>([]);
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/locations.json")
      .then((res) => res.json())
      .then((data: string[]) => {
        setLocations(data);
        setForm((prev) => ({ ...prev, location: data[0] ?? "other" }));
      })
      .catch(() => {
        setLocations(["other"]);
        setForm((prev) => ({ ...prev, location: "other" }));
      });
  }, []);

  function handleChange(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate(): boolean {
    const newErrors: Partial<Record<keyof FormState, string>> = {};

    if (!form.location) newErrors.location = "Please choose a location.";

    const area = Number(form.carpet_area_sqft);
    if (!form.carpet_area_sqft || Number.isNaN(area) || area <= 0) {
      newErrors.carpet_area_sqft = "Carpet area must be a number greater than 0.";
    }

    if (form.floor_num === "" || Number.isNaN(Number(form.floor_num))) {
      newErrors.floor_num = "Please enter the floor number (0 for ground floor).";
    }

    if (form.bathroom === "" || Number(form.bathroom) < 0) {
      newErrors.bathroom = "Please enter a valid number of bathrooms.";
    }

    if (form.balcony === "" || Number(form.balcony) < 0) {
      newErrors.balcony = "Please enter a valid number of balconies.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setApiError(null);

    if (!validate()) return;

    const payload: PredictionRequest = {
      location: form.location,
      carpet_area_sqft: Number(form.carpet_area_sqft),
      floor_num: Number(form.floor_num),
      bathroom: Number(form.bathroom),
      balcony: Number(form.balcony),
      furnishing: form.furnishing,
      transaction: form.transaction,
      ownership: form.ownership,
      facing: form.facing,
    };

    setLoading(true);
    try {
      const result = await predictPrice(payload);
      navigate("/result", { state: { predictedPrice: result.predicted_price } });
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Prediction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="prediction-form" onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <label className="field">
          <span>Location</span>
          <select
            value={form.location}
            onChange={(e) => handleChange("location", e.target.value)}
          >
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
          {errors.location && <small className="error">{errors.location}</small>}
        </label>

        <label className="field">
          <span>Carpet area (sqft)</span>
          <input
            type="number"
            min="1"
            step="any"
            value={form.carpet_area_sqft}
            onChange={(e) => handleChange("carpet_area_sqft", e.target.value)}
            placeholder="e.g. 950"
          />
          {errors.carpet_area_sqft && <small className="error">{errors.carpet_area_sqft}</small>}
        </label>

        <label className="field">
          <span>Floor</span>
          <input
            type="number"
            step="1"
            value={form.floor_num}
            onChange={(e) => handleChange("floor_num", e.target.value)}
            placeholder="e.g. 3 (0 = ground)"
          />
          {errors.floor_num && <small className="error">{errors.floor_num}</small>}
        </label>

        <label className="field">
          <span>Bathrooms</span>
          <input
            type="number"
            min="0"
            step="1"
            value={form.bathroom}
            onChange={(e) => handleChange("bathroom", e.target.value)}
            placeholder="e.g. 2"
          />
          {errors.bathroom && <small className="error">{errors.bathroom}</small>}
        </label>

        <label className="field">
          <span>Balconies</span>
          <input
            type="number"
            min="0"
            step="1"
            value={form.balcony}
            onChange={(e) => handleChange("balcony", e.target.value)}
            placeholder="e.g. 1"
          />
          {errors.balcony && <small className="error">{errors.balcony}</small>}
        </label>

        <label className="field">
          <span>Furnishing</span>
          <select
            value={form.furnishing}
            onChange={(e) => handleChange("furnishing", e.target.value)}
          >
            {FURNISHING_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Transaction</span>
          <select
            value={form.transaction}
            onChange={(e) => handleChange("transaction", e.target.value)}
          >
            {TRANSACTION_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Ownership</span>
          <select
            value={form.ownership}
            onChange={(e) => handleChange("ownership", e.target.value)}
          >
            {OWNERSHIP_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Facing</span>
          <select value={form.facing} onChange={(e) => handleChange("facing", e.target.value)}>
            {FACING_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
      </div>

      {apiError && <p className="error api-error">{apiError}</p>}

      <button type="submit" disabled={loading}>
        {loading ? "Predicting..." : "Predict price"}
      </button>
    </form>
  );
}
