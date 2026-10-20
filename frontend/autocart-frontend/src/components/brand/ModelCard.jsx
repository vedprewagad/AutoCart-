import React from "react";
import { getImageUrl as resolveImageUrl } from "../../utils/imageUrl";
import "./ModelCard.css";

function ModelCard({ model, onClick, brandName }) {
  const createSvgDataUri = (title) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="320" viewBox="0 0 500 320">
      <rect width="500" height="320" fill="#1e293b"/>
      <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, sans-serif" font-size="42">🏎️</text>
      <text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, sans-serif" font-size="20" font-weight="bold" fill="#ffffff">${title}</text>
    </svg>`;
    try {
      return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
    } catch {
      return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    }
  };

  const defaultPlaceholder = createSvgDataUri(model?.name || "AutoCart Car");

  const getImageUrl = (url) => {
    let imgPath = url;
    if (!imgPath && model?.name) {
      const slug = model.name.toLowerCase().replace(/\s+/g, "_");
      imgPath = `/images/models/${slug}_exterior_1.png`;
    }
    if (!imgPath) return defaultPlaceholder;
    return resolveImageUrl(imgPath, defaultPlaceholder);
  };

  const formatPriceRange = (min, max) => {
    if (!min && !max) return "Price on Request";
    const minL = min ? (Number(min) / 100000).toFixed(2) : "5.79";
    const maxL = max ? (Number(max) / 100000).toFixed(2) : "13.71";
    if (minL === maxL) return `₹ ${minL} Lakh*`;
    return `₹ ${minL} - ${maxL} Lakh*`;
  };

  const fullName = `${brandName || model.brandName || "Maruti Suzuki"} ${model.name}`;

  return (
    <div className="card model-horizontal-card shadow-sm border rounded-4 mb-4 overflow-hidden" onClick={() => onClick(model.id)}>
      <div className="row g-0 align-items-center">
        {/* LEFT IMAGE WITH LAUNCH TAG */}
        <div className="col-md-5 position-relative bg-light text-center p-3">
          <span className="badge bg-white text-dark shadow-sm border position-absolute top-0 start-0 m-3 px-3 py-2 fw-semibold text-uppercase" style={{ fontSize: "0.75rem", borderRadius: "20px" }}>
            {model?.launchDate ? `LAUNCHED ON : ${new Date(model.launchDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }).toUpperCase()}` : (model?.status || "AVAILABLE NOW")}
          </span>
          <img
            src={getImageUrl(model.thumbnail)}
            alt={fullName}
            className="img-fluid rounded-3 my-2"
            style={{ maxHeight: "220px", objectFit: "contain", width: "100%" }}
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = defaultPlaceholder;
            }}
          />
        </div>

        {/* RIGHT CONTENT */}
        <div className="col-md-7 p-4">
          <h2 className="fw-bold fs-3 text-dark mb-1">{fullName}</h2>
          
          <div className="d-flex align-items-baseline gap-2 mb-3">
            <span className="fs-3 fw-bold text-dark">{formatPriceRange(model.startingPrice, model.maxPrice)}</span>
            <small className="text-secondary fw-semibold">(View On Road Price)</small>
          </div>

          <div className="model-specs-summary text-secondary mb-4" style={{ fontSize: "0.95rem" }}>
            <div className="mb-1">
              <span>{model.fuelType || "Fuel type unavailable"}</span>
              {model.mileage && <><span className="mx-2">•</span><span>{`${model.mileage} kmpl`}</span></>}
              {model.transmission && <><span className="mx-2">•</span><span>{model.transmission}</span></>}
            </div>
            <div>
              {model.engineCc && <span>{`${model.engineCc} cc`}</span>}
              {model.power && <><span className="mx-2">•</span><span>{`${model.power} bhp`}</span></>}
              {model.ncapRating && <><span className="mx-2">•</span><span>{model.ncapRating}</span></>}
            </div>
          </div>

          <button
            className="btn btn-outline-danger btn-lg px-4 fw-bold rounded-3 brand-offer-btn"
            onClick={(e) => {
              e.stopPropagation();
              onClick(model.id);
            }}
          >
            View {new Date().toLocaleString("en-US", { month: "long" })} Offers
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModelCard;
