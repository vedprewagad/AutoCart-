import { getImageUrl as resolveImageUrl } from "../../utils/imageUrl";
import "./VehicleCard.css";

function VehicleCard({ vehicle, onClick }) {
  const createSvgDataUri = (title) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260" viewBox="0 0 400 260">
      <rect width="400" height="260" fill="#1e293b"/>
      <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, sans-serif" font-size="36">🚗</text>
      <text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, sans-serif" font-size="16" font-weight="bold" fill="#ffffff">${title}</text>
    </svg>`;
    try {
      return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
    } catch {
      return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    }
  };

  const defaultPlaceholder = createSvgDataUri(vehicle?.model || "AutoCart Vehicle");

  const getImageUrl = (url) => {
    let imgPath = url;
    if (!imgPath && vehicle?.model) {
      const slug = vehicle.model.toLowerCase().replace(/\s+/g, "_");
      imgPath = `/images/models/${slug}_exterior_1.png`;
    }
    if (!imgPath) return defaultPlaceholder;
    return resolveImageUrl(imgPath, defaultPlaceholder);
  };

  const formatPrice = (price) => {
    if (!price) return "Contact for Price";
    const num = Number(price);
    if (num >= 100000) {
      return `₹ ${(num / 100000).toFixed(2)} Lakh`;
    }
    return `₹ ${num.toLocaleString("en-IN")}`;
  };

  return (
    <div className="vehicle-card" onClick={() => onClick(vehicle.variantId)}>
      <div className="vehicle-image">
        <img
          src={getImageUrl(vehicle.thumbnail)}
          alt={`${vehicle.brand} ${vehicle.model}`}
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = defaultPlaceholder;
          }}
        />
      </div>

      <div className="vehicle-body">
        <h5>
          {vehicle.brand} {vehicle.model}
        </h5>

        <p className="variant">{vehicle.variant}</p>

        <div className="vehicle-info">
          <span className="badge bg-light text-dark me-2">{vehicle.fuelType}</span>
          <span className="badge bg-light text-dark">{vehicle.transmission}</span>
        </div>

        <h4 className="price mt-2">{formatPrice(vehicle.basePrice)}</h4>
      </div>
    </div>
  );
}

export default VehicleCard;
