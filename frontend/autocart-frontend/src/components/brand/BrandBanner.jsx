import { useNavigate } from "react-router-dom";
import { getImageUrl as resolveImageUrl } from "../../utils/imageUrl";
import "./BrandBanner.css";

function BrandBanner({ brand }) {
  const navigate = useNavigate();

  const getImageUrl = (url) => {
    return resolveImageUrl(url);
  };

  return (
    <section className="brand-banner">
      <button className="back-btn" onClick={() => navigate("/dashboard")}>
        ← Back to Dashboard
      </button>

      <div className="brand-header">
        <div className="brand-content">
          <h1>{brand.name} Cars</h1>
          <p>{brand.tagline}</p>
        </div>

        {brand.logoUrl && (
          <img
            className="brand-logo"
            src={getImageUrl(brand.logoUrl)}
            alt={brand.name}
            referrerPolicy="no-referrer"
          />
        )}
      </div>

      {brand.bannerUrl && (
        <div className="brand-banner-image">
          <img
            src={getImageUrl(brand.bannerUrl)}
            alt={brand.name}
            referrerPolicy="no-referrer"
          />
        </div>
      )}
    </section>
  );
}

export default BrandBanner;
