import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="page">
      <h1>404</h1>
      <p className="subtitle">This page doesn't exist.</p>
      <Link to="/">Go back home</Link>
    </div>
  );
}
