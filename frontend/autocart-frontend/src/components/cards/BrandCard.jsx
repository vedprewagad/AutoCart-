import { getImageUrl } from "../../utils/imageUrl";
import "./BrandCard.css";

function BrandCard({ brand, onClick }) {
  const getLogoUrl = (url) => {
    return getImageUrl(url);
  };

  return (
    <div className="brand-card" onClick={() => onClick(brand.id)}>
      <img
        src={getLogoUrl(brand.logoUrl)}
        alt={brand.name}
        className="brand-logo"
        referrerPolicy="no-referrer"
      />

      <h6>{brand.name}</h6>
    </div>
  );
}

export default BrandCard;
