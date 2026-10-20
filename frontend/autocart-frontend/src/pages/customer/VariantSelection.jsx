import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getModelById, getVariantsByModel } from "../../services/catalogService";
import { getImageUrl as resolveImageUrl } from "../../utils/imageUrl";
import DealerComparisonModal from "../../components/vehicle/DealerComparisonModal";
import TestDriveModal from "../../components/vehicle/TestDriveModal";
import ImageCarousel from "../../components/common/ImageCarousel";

function VariantSelection() {
  const { modelId } = useParams();
  const navigate = useNavigate();

  const [model, setModel] = useState(null);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters matching Image 2
  const [fuelFilter, setFuelFilter] = useState("ALL"); // ALL, PETROL, CNG
  const [transFilter, setTransFilter] = useState("ALL"); // ALL, AUTOMATIC, MANUAL
  const [activeSpecTab, setActiveSpecTab] = useState("KEY_SPECS"); // KEY_SPECS, HIGHLIGHTS

  // Modals
  const [selectedVariantForDealers, setSelectedVariantForDealers] = useState(null);
  const [selectedVariantForTestDrive, setSelectedVariantForTestDrive] = useState(null);
  const [testDriveDealerId, setTestDriveDealerId] = useState(null);

  useEffect(() => {
    loadModelAndVariants();
  }, [modelId]);

  const loadModelAndVariants = async () => {
    setLoading(true);
    setError(null);
    try {
      const [modelData, variantData] = await Promise.all([
        getModelById(modelId),
        getVariantsByModel(modelId),
      ]);
      setModel(modelData);
      setVariants(variantData || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.response?.data?.error || "Failed to load model variants. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const createSvgDataUri = (title) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
      <rect width="600" height="400" fill="#2563eb"/>
      <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, sans-serif" font-size="54">🚗</text>
      <text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, sans-serif" font-size="24" font-weight="bold" fill="#ffffff">${title}</text>
    </svg>`;
    try {
      return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
    } catch {
      return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    }
  };

  const defaultPlaceholder = createSvgDataUri(model?.name || "AutoCart Car");

  const getImageUrl = (url) => {
    if (!url) return defaultPlaceholder;
    return resolveImageUrl(url);
  };

  const formatLakh = (price) => {
    if (!price) return "₹ 5.79 Lakh*";
    const num = Number(price);
    if (num >= 100000) {
      return `₹ ${(num / 100000).toFixed(2)} Lakh*`;
    }
    return `₹ ${num.toLocaleString("en-IN")}`;
  };

  // Filter variants
  const filteredVariants = variants.filter((v) => {
    if (fuelFilter !== "ALL" && v.fuelType?.toUpperCase() !== fuelFilter) return false;
    if (transFilter === "AUTOMATIC" && !["AUTOMATIC", "AMT", "CVT", "DCT"].includes(v.transmission?.toUpperCase())) return false;
    if (transFilter === "MANUAL" && v.transmission?.toUpperCase() !== "MANUAL") return false;
    return true;
  });

  if (loading) return <div className="container py-5 text-center text-muted">Loading model variants...</div>;

  if (error) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger d-inline-block px-5 py-4 rounded-4 shadow-sm">
          <h5 className="fw-bold mb-2">Error Loading Variants</h5>
          <p className="mb-3">{error}</p>
          <button className="btn btn-outline-danger btn-sm" onClick={loadModelAndVariants}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const modelTitle = `${model?.brandName || ""} ${model?.name || "Car"}`.trim();
  const minPriceVal = variants.length > 0 ? Math.min(...variants.map((v) => Number(v.basePrice || 0))) : 0;
  const maxPriceVal = variants.length > 0 ? Math.max(...variants.map((v) => Number(v.basePrice || 0))) : 0;
  const priceRangeStr = minPriceVal > 0 
    ? (minPriceVal === maxPriceVal ? formatLakh(minPriceVal) : `${formatLakh(minPriceVal)} - ${formatLakh(maxPriceVal)}`)
    : "Contact Showroom";

  return (
    <div className="container py-4">
      {/* BACK & TITLE */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)}>
          ← Back to Car Models
        </button>
        <span className="badge bg-primary px-3 py-2 fw-semibold">Master Catalogue Overview</span>
      </div>

      {/* 1. TOP CAR HERO SECTION */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden bg-white border">
        <div className="row g-0 align-items-center">
          {/* LEFT CAR IMAGE CAROUSEL WITH BADGES */}
          <div className="col-lg-6 position-relative p-4 bg-light text-center">
            <ImageCarousel
              images={
                variants[0]?.variantImages?.length > 0
                  ? variants[0].variantImages
                  : [
                      { url: `/images/models/${model?.name?.toLowerCase().replace(/\s+/g, '_')}_interior.png`, type: "INTERIOR" },
                      { url: `/images/models/${model?.name?.toLowerCase().replace(/\s+/g, '_')}_exterior_1.png`, type: "EXTERIOR" },
                      { url: `/images/models/${model?.name?.toLowerCase().replace(/\s+/g, '_')}_exterior_2.png`, type: "EXTERIOR" }
                    ]
              }
              altText={modelTitle}
              height="320px"
            />
            {/* BADGES ON IMAGE BOTTOM */}
            <div className="d-flex justify-content-center gap-2 mt-3">
              <span className="badge bg-white text-dark border shadow-sm px-3 py-2 fw-semibold">📷 Multi-Angle Views</span>
              <span className="badge bg-white text-dark border shadow-sm px-3 py-2 fw-semibold">🛋️ Interior & Exterior</span>
              <span className="badge bg-white text-dark border shadow-sm px-3 py-2 fw-semibold">🎨 {variants.length} Trim Variants</span>
            </div>
          </div>

          {/* RIGHT DETAILS */}
          <div className="col-lg-6 p-4 p-md-5">
            <h1 className="fw-bold display-6 text-dark mb-1">{modelTitle}</h1>

            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="badge bg-success-subtle text-success fw-bold px-2 py-1">Verified Model</span>
              <small className="text-muted fw-semibold">Authorized Showrooms</small>
            </div>

            <p className="text-secondary small mb-3">
              Explore official specifications, ex-showroom pricing, and verified dealer inventory for the {modelTitle}.
            </p>

            <div className="d-flex align-items-baseline gap-2 mb-2">
              <span className="display-6 fw-bold text-dark">{priceRangeStr}</span>
              <button className="btn btn-link text-primary p-0 fw-semibold text-decoration-none small">
                Get On-Road Price
              </button>
            </div>
            <small className="text-muted d-block mb-4">*Ex-Showroom Price</small>

            <div className="d-flex align-items-center gap-3">
              <button
                className="btn btn-danger btn-lg px-4 fw-bold shadow-sm"
                style={{ backgroundColor: "#ff5722", borderColor: "#ff5722" }}
                onClick={() => setSelectedVariantForDealers(variants[0] || null)}
              >
                View Dealer Offers
              </button>
              <span className="text-muted small fw-semibold">⚡ Direct Showroom Offers</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SPECS & FEATURES SECTION */}
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white border">
        <h3 className="fw-bold text-dark mb-3">{modelTitle} Specs & Features</h3>

        {/* TABS */}
        <div className="d-flex gap-4 border-bottom mb-4">
          <span className="btn btn-link px-0 pb-2 text-decoration-none fw-bold text-danger border-bottom border-danger border-3">
            Key Specifications
          </span>
        </div>

        {/* 2-COLUMN SPECIFICATION GRID */}
        <div className="row g-4 mb-3">
          <div className="col-md-6">
            <div className="d-flex justify-content-between align-items-center p-2 border-bottom">
              <span className="text-secondary fw-semibold">⚙️ Engine</span>
              <span className="fw-bold text-dark">{variants[0]?.engineCc ? `${variants[0].engineCc} cc` : "N/A"}</span>
            </div>
          </div>
          <div className="col-md-6">
            <div className="d-flex justify-content-between align-items-center p-2 border-bottom">
              <span className="text-secondary fw-semibold">⚡ Power</span>
              <span className="fw-bold text-dark">{variants[0]?.powerBhp ? `${variants[0].powerBhp} bhp` : "N/A"}</span>
            </div>
          </div>

          <div className="col-md-6">
            <div className="d-flex justify-content-between align-items-center p-2 border-bottom">
              <span className="text-secondary fw-semibold">🔄 Torque</span>
              <span className="fw-bold text-dark">{variants[0]?.torqueNm ? `${variants[0].torqueNm} Nm` : "N/A"}</span>
            </div>
          </div>
          <div className="col-md-6">
            <div className="d-flex justify-content-between align-items-center p-2 border-bottom">
              <span className="text-secondary fw-semibold">🕹️ Transmission</span>
              <span className="fw-bold text-dark">{variants[0]?.transmission || "Manual / Automatic"}</span>
            </div>
          </div>

          <div className="col-md-6">
            <div className="d-flex justify-content-between align-items-center p-2 border-bottom">
              <span className="text-secondary fw-semibold">⛽ Mileage</span>
              <span className="fw-bold text-dark">{variants[0]?.mileageKmpl ? `${variants[0].mileageKmpl} kmpl` : "N/A"}</span>
            </div>
          </div>
          <div className="col-md-6">
            <div className="d-flex justify-content-between align-items-center p-2 border-bottom">
              <span className="text-secondary fw-semibold">⛽ Fuel</span>
              <span className="fw-bold text-dark">{variants[0]?.fuelType || "Petrol / Diesel"}</span>
            </div>
          </div>

          <div className="col-md-6">
            <div className="d-flex justify-content-between align-items-center p-2 border-bottom">
              <span className="text-secondary fw-semibold">🛡️ NCAP Safety Rating</span>
              <span className="fw-bold text-dark">{variants[0]?.ncapRating || "5 Star"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. VARIANT PRICE TABLE */}
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white border">
        <h3 className="fw-bold text-dark mb-2">{modelTitle} Price & Variants</h3>
        <p className="text-secondary small mb-4">
          {modelTitle} is available in {variants.length} variant(s) starting from {formatLakh(minPriceVal)}.
        </p>

        {/* FUEL TABS */}
        <div className="d-flex gap-4 border-bottom mb-3">
          {["ALL", "PETROL", "DIESEL", "CNG"].map((tab) => (
            <button
              key={tab}
              className={`btn btn-link px-0 pb-2 text-decoration-none fw-bold ${
                fuelFilter === tab ? "text-danger border-bottom border-danger border-3" : "text-secondary"
              }`}
              onClick={() => setFuelFilter(tab)}
            >
              {tab === "ALL" ? "All" : tab}
            </button>
          ))}
        </div>

        {/* TRANSMISSION RADIO FILTERS */}
        <div className="d-flex align-items-center gap-4 mb-4 py-2 px-3 bg-light rounded-3">
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name="transFilter"
              id="transAll"
              checked={transFilter === "ALL"}
              onChange={() => setTransFilter("ALL")}
            />
            <label className="form-check-label fw-semibold" htmlFor="transAll">All</label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name="transFilter"
              id="transAuto"
              checked={transFilter === "AUTOMATIC"}
              onChange={() => setTransFilter("AUTOMATIC")}
            />
            <label className="form-check-label fw-semibold" htmlFor="transAuto">Automatic</label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name="transFilter"
              id="transManual"
              checked={transFilter === "MANUAL"}
              onChange={() => setTransFilter("MANUAL")}
            />
            <label className="form-check-label fw-semibold" htmlFor="transManual">Manual</label>
          </div>
        </div>

        {/* TABLE HEADER */}
        <div className="table-responsive">
          <table className="table align-middle">
            <thead className="table-light">
              <tr>
                <th style={{ width: "35%" }}>Variant</th>
                <th style={{ width: "25%" }}>Ex-Showroom Price</th>
                <th style={{ width: "25%" }}>Action</th>
                <th style={{ width: "15%" }} className="text-center">Compare</th>
              </tr>
            </thead>
            <tbody>
              {filteredVariants.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-muted">No variants match the selected filters.</td>
                </tr>
              ) : (
                filteredVariants.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <div className="fw-bold text-dark fs-5">{v.variantName}</div>
                      <small className="text-secondary">
                        {v.engineCc ? `${v.engineCc} cc` : ""}, {v.transmission || "Manual"}, {v.fuelType || "Petrol"}, {v.mileageKmpl ? `${v.mileageKmpl} kmpl` : ""}
                      </small>
                    </td>

                    <td>
                      <div className="fw-bold fs-5 text-dark">{formatLakh(v.basePrice)}</div>
                      <button
                        className="btn btn-link p-0 text-primary fw-semibold small text-decoration-none"
                        onClick={() => setSelectedVariantForDealers(v)}
                      >
                        Get On-Road Price
                      </button>
                    </td>

                    <td>
                      <button
                        className="btn btn-outline-danger px-3 py-2 fw-bold rounded-3"
                        style={{ borderColor: "#ff5722", color: "#ff5722" }}
                        onClick={() => setSelectedVariantForDealers(v)}
                      >
                        View Dealer Offers
                      </button>
                    </td>

                    <td className="text-center">
                      <input className="form-check-input" type="checkbox" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* MODALS */}
      {selectedVariantForDealers && (
        <DealerComparisonModal
          variant={selectedVariantForDealers}
          onClose={() => setSelectedVariantForDealers(null)}
          onBookTestDrive={(dealerId) => {
            setSelectedVariantForTestDrive(selectedVariantForDealers);
            setTestDriveDealerId(dealerId);
            setSelectedVariantForDealers(null);
          }}
        />
      )}

      {selectedVariantForTestDrive && (
        <TestDriveModal
          variant={selectedVariantForTestDrive}
          dealerId={testDriveDealerId}
          onClose={() => setSelectedVariantForTestDrive(null)}
        />
      )}
    </div>
  );
}

export default VariantSelection;
