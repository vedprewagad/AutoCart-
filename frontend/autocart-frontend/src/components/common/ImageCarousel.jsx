import React, { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

function ImageCarousel({ images = [], altText = "Car Image", height = "320px", className = "" }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Normalize images input
  const normalizedImages = (images && images.length > 0)
    ? images.map((img) => {
        if (typeof img === "string") {
          return { url: img, type: "GALLERY" };
        }
        return {
          url: img.imageUrl || img.url || img.image_url,
          type: img.imageType || img.type || img.image_type || "EXTERIOR"
        };
      })
    : [];

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? normalizedImages.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === normalizedImages.length - 1 ? 0 : prev + 1));
  };

  if (normalizedImages.length === 0) {
    return (
      <div className={`position-relative text-center p-3 ${className}`}>
        <div
          className="d-flex align-items-center justify-content-center bg-light rounded-3 text-muted"
          style={{ height, width: "100%" }}
        >
          <span>🚗 No Images Available</span>
        </div>
      </div>
    );
  }

  const currentImage = normalizedImages[currentIndex];

  const getTypeBadge = (type, index) => {
    switch (type?.toUpperCase()) {
      case "INTERIOR":
        return <span className="badge bg-dark bg-opacity-75 text-white px-3 py-1 fw-bold">🛋️ Interior View</span>;
      case "EXTERIOR":
        return <span className="badge bg-primary bg-opacity-85 text-white px-3 py-1 fw-bold">🚗 Exterior {index === 0 ? "Front" : "View"}</span>;
      case "COLOUR":
      case "360":
        return <span className="badge bg-success bg-opacity-85 text-white px-3 py-1 fw-bold">🎨 Color View</span>;
      default:
        return <span className="badge bg-secondary bg-opacity-75 text-white px-3 py-1 fw-bold">🚗 Image {index + 1}</span>;
    }
  };

  return (
    <div className={`position-relative overflow-hidden rounded-3 ${className}`} style={{ userSelect: "none" }}>
      {/* MAIN CAROUSEL IMAGE DISPLAY */}
      <div
        className="d-flex align-items-center justify-content-center bg-light p-2 rounded-3 shadow-inner"
        style={{ height, width: "100%", position: "relative" }}
      >
        <img
          src={currentImage.url}
          alt={`${altText} - Slide ${currentIndex + 1}`}
          className="img-fluid rounded-3 transition-opacity duration-300"
          style={{ maxHeight: height, objectFit: "contain", width: "100%" }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `data:image/svg+xml;utf8,${encodeURIComponent(
              '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="#1e293b"/><text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, sans-serif" font-size="48">🚘</text><text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, sans-serif" font-size="22" font-weight="bold" fill="#ffffff">AutoCart Vehicle Preview</text></svg>'
            )}`;
          }}
        />

        {/* IMAGE TYPE OVERLAY BADGE */}
        <div className="position-absolute top-0 start-0 m-3 z-3">
          {getTypeBadge(currentImage.type, currentIndex)}
        </div>

        {/* IMAGE COUNTER BADGE */}
        <div className="position-absolute top-0 end-0 m-3 z-3">
          <span className="badge bg-dark bg-opacity-65 text-white px-2 py-1 small">
            {currentIndex + 1} / {normalizedImages.length}
          </span>
        </div>
      </div>

      {/* LEFT ARROW BUTTON */}
      {normalizedImages.length > 1 && (
        <button
          type="button"
          className="btn btn-dark rounded-circle position-absolute top-50 start-0 translate-middle-y ms-2 p-2 shadow z-3 d-flex align-items-center justify-content-center"
          style={{ width: "36px", height: "36px", opacity: 0.85, cursor: "pointer" }}
          onClick={handlePrev}
          title="Previous Image"
        >
          <FaChevronLeft className="text-white" size={14} />
        </button>
      )}

      {/* RIGHT ARROW BUTTON */}
      {normalizedImages.length > 1 && (
        <button
          type="button"
          className="btn btn-dark rounded-circle position-absolute top-50 end-0 translate-middle-y me-2 p-2 shadow z-3 d-flex align-items-center justify-content-center"
          style={{ width: "36px", height: "36px", opacity: 0.85, cursor: "pointer" }}
          onClick={handleNext}
          title="Next Image"
        >
          <FaChevronRight className="text-white" size={14} />
        </button>
      )}

      {/* BOTTOM DOT INDICATORS */}
      {normalizedImages.length > 1 && (
        <div className="position-absolute bottom-0 start-50 translate-middle-x mb-2 d-flex gap-2 z-3">
          {normalizedImages.map((_, idx) => (
            <button
              key={idx}
              type="button"
              className="p-0 border-0 rounded-circle transition-all"
              style={{
                width: idx === currentIndex ? "12px" : "8px",
                height: "8px",
                backgroundColor: idx === currentIndex ? "#0d6efd" : "rgba(255, 255, 255, 0.7)",
                cursor: "pointer",
              }}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              title={`Go to slide ${idx + 1}`}
            ></button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageCarousel;
