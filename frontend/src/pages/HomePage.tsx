import PredictionForm from "../components/PredictionForm";

export default function HomePage() {
  return (
    <div className="page">
      <h1>House Price Predictor</h1>
      <p className="subtitle">
        Enter the property details below to get an estimated price based on real listings
        from India.
      </p>
      <PredictionForm />
    </div>
  );
}
