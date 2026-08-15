import { useLocation, useNavigate } from "react-router-dom";

function formatIndianPrice(price: number): string {
  if (price >= 1e7) {
    return `₹ ${(price / 1e7).toFixed(2)} Cr`;
  }
  if (price >= 1e5) {
    return `₹ ${(price / 1e5).toFixed(2)} Lac`;
  }
  return `₹ ${price.toLocaleString("en-IN")}`;
}

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const predictedPrice = (location.state as { predictedPrice?: number } | null)?.predictedPrice;

  if (predictedPrice === undefined) {
    return (
      <div className="page">
        <h1>No prediction yet</h1>
        <p className="subtitle">Fill in the form first to see an estimated price.</p>
        <button onClick={() => navigate("/")}>Back to form</button>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Estimated price</h1>
      <p className="predicted-price">{formatIndianPrice(predictedPrice)}</p>
      <p className="subtitle">({predictedPrice.toLocaleString("en-IN")} ₹)</p>
      <button onClick={() => navigate("/")}>Predict another property</button>
    </div>
  );
}
