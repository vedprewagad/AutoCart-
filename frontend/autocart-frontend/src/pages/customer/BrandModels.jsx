import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getBrandById, getModelsByBrand } from "../../services/catalogService";
import ModelCard from "../../components/brand/ModelCard";
import "./BrandModels.css";

function BrandModels() {
  const { brandId } = useParams();
  const navigate = useNavigate();

  const [brand, setBrand] = useState(null);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, [brandId]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const brandData = await getBrandById(brandId);
      const modelData = await getModelsByBrand(brandId);
      setBrand(brandData);
      setModels(modelData || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.response?.data?.error || "Failed to load car models. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container py-5 text-center text-muted">Loading car models...</div>;

  if (error) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger d-inline-block px-5 py-4 rounded-4 shadow-sm">
          <h5 className="fw-bold mb-2">Error Loading Models</h5>
          <p className="mb-3">{error}</p>
          <button className="btn btn-outline-danger btn-sm" onClick={loadData}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* HEADER MATCHING IMAGE 5 */}
      <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3">
        <h1 className="fw-bold display-6 mb-0 text-dark">
          {brand?.name} car models
        </h1>
        <Link to="/dashboard" className="text-primary fw-semibold text-decoration-none fs-5">
          ✏️ Change Brand
        </Link>
      </div>

      {models.length === 0 ? (
        <div className="alert alert-info py-4 text-center">
          No car models found for {brand?.name}. Check back soon or select another brand!
        </div>
      ) : (
        <div className="model-list">
          {models.map((model) => (
            <ModelCard
              key={model.id}
              model={model}
              brandName={brand?.name}
              onClick={(id) => navigate(`/models/${id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default BrandModels;
