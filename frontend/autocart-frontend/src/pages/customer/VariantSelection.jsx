import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getModelById,
  getVariantsByModel,
  getVariantDetails,
  getVariantImages,
  getVariantColours,
} from "../../services/catalogService";
import { getImageUrl as resolveImageUrl } from "../../utils/imageUrl";
import DealerComparisonModal from "../../components/vehicle/DealerComparisonModal";
import TestDriveModal from "../../components/vehicle/TestDriveModal";
import SpecificationCard from "../../components/vehicle/SpecificationCard";
import ImageCarousel from "../../components/common/ImageCarousel";

function VariantSelection() {
  const { modelId } = useParams();
  const navigate = useNavigate();

  const [model, setModel] = useState(null);
  const [variants, setVariants] = useState([]);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [variantDetails, setVariantDetails] = useState(null);
  const [images, setImages] = useState([]);
  const [colours, setColours] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedColour, setSelectedColour] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [fuelFilter, setFuelFilter] = useState("ALL");
  const [transFilter, setTransFilter] = useState("ALL");
  const [activeSpecTab, setActiveSpecTab] = useState("ALL"); // ALL, KEY_SPECS, DIMENSIONS, SAFETY

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
      if (variantData && variantData.length > 0) {
        setSelectedVariantId(variantData[0].id);
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load model variants. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedVariantId) {
      loadVariantData(selectedVariantId);
    }
  }, [selectedVariantId]);

  const loadVariantData = async (variantId) => {
    setDetailsLoading(true);
    try {
      const [details, imgData, colourData] = await Promise.all([
        getVariantDetails(variantId),
        getVariantImages(variantId),
        getVariantColours(variantId),
      ]);
      setVariantDetails(details);
      setImages(imgData || []);
      setColours(colourData || []);
      setSelectedImageIndex(0);

      if (imgData && imgData.length > 0) {
        const exterior = imgData.find((img) => img.imageType === "EXTERIOR");
        setSelectedImage(exterior || imgData[0]);

        const colourImg = imgData.find((img) => img.imageType === "COLOUR");
        if (colourImg) {
          setSelectedColour(colourImg);
        } else {
          setSelectedColour(null);
        }
      } else {
        setSelectedImage(null);
        setSelectedColour(null);
      }
    } catch (err) {
      console.error("Error loading variant details or images:", err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const createSvgDataUri = (title) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
      <rect width="600" height="400" fill="#1e293b"/>
      <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, sans-serif" font-size="54">🚗</text>
      <text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, sans-serif" font-size="22" font-weight="bold" fill="#ffffff">${title}</text>
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
    if (!price) return "Contact Showroom";
    const num = Number(price);
    if (num >= 100000) {
      return `₹ ${(num / 100000).toFixed(2)} Lakh`;
    }
    return `₹ ${num.toLocaleString("en-IN")}`;
  };

  const calculateEmi = (price) => {
    if (!price) return "₹ 0/month";
    const est = Math.round(Number(price) * 0.0175);
    return `₹ ${est.toLocaleString("en-IN")}/month`;
  };

  // Filter variants for table
  const filteredVariants = variants.filter((v) => {
    if (fuelFilter !== "ALL" && v.fuelType?.toUpperCase() !== fuelFilter) return false;
    if (
      transFilter === "AUTOMATIC" &&
      !["AUTOMATIC", "AMT", "CVT", "DCT"].includes(v.transmission?.toUpperCase())
    )
      return false;
    if (transFilter === "MANUAL" && v.transmission?.toUpperCase() !== "MANUAL") return false;
    return true;
  });

  if (loading) {
    return (
      <div className="container py-5 text-center text-muted">
        <div className="spinner-border text-primary mb-2" role="status"></div>
        <div>Loading model variants...</div>
      </div>
    );
  }

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
  const activeVariant = variants.find((v) => v.id === selectedVariantId) || variants[0];
  const activePrice = activeVariant?.basePrice || variantDetails?.basePrice;

  // Build carousel image list from real database images or fallback
  const carouselImages =
    images.length > 0
      ? images.map((img) => ({
          url: getImageUrl(img.imageUrl),
          type: img.imageType || "EXTERIOR",
          colourName: img.colourName,
        }))
      : model?.heroImage
      ? [{ url: getImageUrl(model.heroImage), type: "EXTERIOR" }]
      : [{ url: defaultPlaceholder, type: "EXTERIOR" }];

  return (
    <div className="container py-4">
      {/* NAVIGATION & TITLE */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)}>
          ← Back to Car Models
        </button>
        <span className="badge bg-primary px-3 py-2 fw-semibold">Master Catalogue Overview</span>
      </div>

      {/* 1. HERO VEHICLE PREVIEW & ACTIONS */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden bg-white border">
        <div className="row g-0 align-items-center">
          {/* LEFT: REAL IMAGE DISPLAY / CAROUSEL & THUMBNAILS */}
          <div className="col-lg-6 position-relative p-4 bg-light text-center border-end">
            <ImageCarousel
              images={carouselImages}
              altText={modelTitle}
              height="320px"
              selectedIndex={selectedImageIndex}
              onIndexChange={setSelectedImageIndex}
            />

            {/* INTERACTIVE THUMBNAIL ROW (WHEN MULTIPLE IMAGES EXIST) */}
            {images.length > 1 && (
              <div className="d-flex gap-2 justify-content-center overflow-auto py-2 mt-2">
                {images.map((img, idx) => (
                  <img
                    key={img.id || idx}
                    src={getImageUrl(img.imageUrl)}
                    alt={img.colourName || "Car thumbnail"}
                    className={`rounded border shadow-xs ${
                      selectedImageIndex === idx ? "border-primary border-3" : "opacity-75"
                    }`}
                    style={{
                      width: "60px",
                      height: "42px",
                      objectFit: "cover",
                      cursor: "pointer",
                      transition: "0.2s",
                    }}
                    onClick={() => {
                      setSelectedImageIndex(idx);
                      setSelectedImage(img);
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = defaultPlaceholder;
                    }}
                  />
                ))}
              </div>
            )}

            {/* BADGES */}
            <div className="d-flex justify-content-center flex-wrap gap-2 mt-2">
              <span className="badge bg-white text-dark border shadow-sm px-3 py-2 fw-semibold">
                📷 Multi-Angle Views
              </span>
              <span className="badge bg-white text-dark border shadow-sm px-3 py-2 fw-semibold">
                🛋️ Interior & Exterior
              </span>
              <span className="badge bg-white text-dark border shadow-sm px-3 py-2 fw-semibold">
                🎨 {variants.length} Trim Variant{variants.length > 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* RIGHT: DETAILS, PRICING, EMI & ACTION BUTTONS */}
          <div className="col-lg-6 p-4 p-md-5">
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge bg-success-subtle text-success fw-bold px-2 py-1">
                Verified Model
              </span>
              <small className="text-muted fw-semibold">Authorized Showrooms</small>
            </div>

            <h1 className="fw-bold display-6 text-dark mb-1">{modelTitle}</h1>
            <h3 className="text-primary fs-4 fw-semibold mb-3">
              {variantDetails?.variantName || activeVariant?.variantName || "Standard Variant"}
            </h3>

            <p className="text-secondary small mb-3">
              Explore official technical specifications, showroom offers, and direct booking options
              for the {modelTitle}.
            </p>

            <div className="d-flex align-items-baseline gap-2 mb-1">
              <span className="display-6 fw-bold text-dark">{formatLakh(activePrice)}</span>
            </div>

            <p className="text-muted small mb-4">
              Estimated EMI Starts from <strong>{calculateEmi(activePrice)}</strong>
            </p>

            <div className="d-flex flex-wrap gap-3">
              <button
                className="btn btn-danger btn-lg px-4 fw-bold shadow-sm"
                style={{ backgroundColor: "#ff5722", borderColor: "#ff5722" }}
                onClick={() => setSelectedVariantForDealers(activeVariant)}
              >
                View Dealer Offers
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. FULL SPECIFICATIONS SECTION */}
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white border">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-2">
          <div>
            <h3 className="fw-bold text-dark mb-1">
              {modelTitle} Specifications & Features
            </h3>
            <small className="text-muted">
              Displaying official specs for{" "}
              <strong>
                {variantDetails?.variantName || activeVariant?.variantName || "Selected Variant"}
              </strong>
            </small>
          </div>

          {/* SPECIFICATION CATEGORY TABS */}
          <div className="btn-group shadow-xs" role="group">
            {[
              { id: "ALL", label: "All Specs" },
              { id: "KEY_SPECS", label: "Performance" },
              { id: "DIMENSIONS", label: "Dimensions" },
              { id: "SAFETY", label: "Safety" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`btn btn-sm ${
                  activeSpecTab === tab.id ? "btn-primary fw-bold" : "btn-outline-secondary"
                }`}
                onClick={() => setActiveSpecTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {detailsLoading ? (
          <div className="text-center py-4 text-muted">
            <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
            Updating variant specifications...
          </div>
        ) : (
          <div className="row g-3">
            {/* KEY SPECS & PERFORMANCE */}
            {(activeSpecTab === "ALL" || activeSpecTab === "KEY_SPECS") && (
              <>
                <div className="col-6 col-md-4">
                  <SpecificationCard
                    title="Fuel Type"
                    value={variantDetails?.fuelType || activeVariant?.fuelType || "Petrol"}
                  />
                </div>
                <div className="col-6 col-md-4">
                  <SpecificationCard
                    title="Transmission"
                    value={variantDetails?.transmission || activeVariant?.transmission || "Manual"}
                  />
                </div>
                <div className="col-6 col-md-4">
                  <SpecificationCard
                    title="Engine Capacity"
                    value={
                      variantDetails?.engineCc || activeVariant?.engineCc
                        ? `${variantDetails?.engineCc || activeVariant?.engineCc} cc`
                        : "N/A"
                    }
                  />
                </div>
                <div className="col-6 col-md-4">
                  <SpecificationCard
                    title="Power"
                    value={variantDetails?.powerBhp ? `${variantDetails.powerBhp} bhp` : "N/A"}
                  />
                </div>
                <div className="col-6 col-md-4">
                  <SpecificationCard
                    title="Torque"
                    value={variantDetails?.torqueNm ? `${variantDetails.torqueNm} Nm` : "N/A"}
                  />
                </div>
                <div className="col-6 col-md-4">
                  <SpecificationCard
                    title="Mileage"
                    value={
                      variantDetails?.mileageKmpl || activeVariant?.mileageKmpl
                        ? `${variantDetails?.mileageKmpl || activeVariant?.mileageKmpl} km/l`
                        : "N/A"
                    }
                  />
                </div>
              </>
            )}

            {/* DIMENSIONS & CAPACITY */}
            {(activeSpecTab === "ALL" || activeSpecTab === "DIMENSIONS") && (
              <>
                <div className="col-6 col-md-4">
                  <SpecificationCard
                    title="Length"
                    value={variantDetails?.lengthMm ? `${variantDetails.lengthMm} mm` : "N/A"}
                  />
                </div>
                <div className="col-6 col-md-4">
                  <SpecificationCard
                    title="Width"
                    value={variantDetails?.widthMm ? `${variantDetails.widthMm} mm` : "N/A"}
                  />
                </div>
                <div className="col-6 col-md-4">
                  <SpecificationCard
                    title="Height"
                    value={variantDetails?.heightMm ? `${variantDetails.heightMm} mm` : "N/A"}
                  />
                </div>
                <div className="col-6 col-md-4">
                  <SpecificationCard
                    title="Wheelbase"
                    value={variantDetails?.wheelbaseMm ? `${variantDetails.wheelbaseMm} mm` : "N/A"}
                  />
                </div>
                <div className="col-6 col-md-4">
                  <SpecificationCard
                    title="Boot Space"
                    value={
                      variantDetails?.bootSpaceLitres
                        ? `${variantDetails.bootSpaceLitres} L`
                        : "N/A"
                    }
                  />
                </div>
                <div className="col-6 col-md-4">
                  <SpecificationCard
                    title="Seating Capacity"
                    value={
                      variantDetails?.seatingCapacity
                        ? `${variantDetails.seatingCapacity} Seats`
                        : "5 Seats"
                    }
                  />
                </div>
              </>
            )}

            {/* SAFETY & RATINGS */}
            {(activeSpecTab === "ALL" || activeSpecTab === "SAFETY") && (
              <>
                <div className="col-6 col-md-3">
                  <SpecificationCard
                    title="Airbags"
                    value={variantDetails?.airbags ?? 2}
                  />
                </div>
                <div className="col-6 col-md-3">
                  <SpecificationCard
                    title="ABS"
                    value={variantDetails?.abs ? "Standard" : "N/A"}
                  />
                </div>
                <div className="col-6 col-md-3">
                  <SpecificationCard
                    title="EBD"
                    value={variantDetails?.ebd ? "Standard" : "N/A"}
                  />
                </div>
                <div className="col-6 col-md-3">
                  <SpecificationCard
                    title="NCAP Safety Rating"
                    value={variantDetails?.ncapRating || "5 Star"}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* 3. VARIANT PRICE & SELECTION TABLE */}
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white border">
        <h3 className="fw-bold text-dark mb-2">{modelTitle} Price & Variants</h3>
        <p className="text-secondary small mb-4">
          Available in {variants.length} variant(s). Click any variant to preview its official specs,
          view dealer inventory, or request a test drive.
        </p>

        {/* FUEL TABS */}
        <div className="d-flex gap-4 border-bottom mb-3">
          {["ALL", "PETROL", "DIESEL", "CNG"].map((tab) => (
            <button
              key={tab}
              className={`btn btn-link px-0 pb-2 text-decoration-none fw-bold ${
                fuelFilter === tab
                  ? "text-danger border-bottom border-danger border-3"
                  : "text-secondary"
              }`}
              onClick={() => setFuelFilter(tab)}
            >
              {tab === "ALL" ? "All Fuel Types" : tab}
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
            <label className="form-check-label fw-semibold" htmlFor="transAll">
              All Transmissions
            </label>
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
            <label className="form-check-label fw-semibold" htmlFor="transAuto">
              Automatic
            </label>
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
            <label className="form-check-label fw-semibold" htmlFor="transManual">
              Manual
            </label>
          </div>
        </div>

        {/* TABLE */}
        <div className="table-responsive">
          <table className="table align-middle">
            <thead className="table-light">
              <tr>
                <th style={{ width: "45%" }}>Variant Trim</th>
                <th style={{ width: "25%" }}>Price</th>
                <th style={{ width: "30%" }} className="text-end">Dealer Offers</th>
              </tr>
            </thead>
            <tbody>
              {filteredVariants.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-muted">
                    No variants match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredVariants.map((v) => {
                  const isSelected = v.id === selectedVariantId;
                  return (
                    <tr
                      key={v.id}
                      className={isSelected ? "table-primary bg-opacity-25" : ""}
                      style={{ cursor: "pointer" }}
                      onClick={() => setSelectedVariantId(v.id)}
                    >
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <span className="fw-bold text-dark fs-5">{v.variantName}</span>
                          {isSelected && (
                            <span className="badge bg-primary text-white rounded-pill px-2 py-1 small">
                              Active Preview
                            </span>
                          )}
                        </div>
                        <small className="text-secondary">
                          {v.engineCc ? `${v.engineCc} cc` : ""}, {v.transmission || "Manual"},{" "}
                          {v.fuelType || "Petrol"},{" "}
                          {v.mileageKmpl ? `${v.mileageKmpl} kmpl` : ""}
                        </small>
                      </td>

                      <td>
                        <div className="fw-bold fs-5 text-dark">{formatLakh(v.basePrice)}</div>
                        <small className="text-muted">{calculateEmi(v.basePrice)}</small>
                      </td>

                      <td className="text-end">
                        <button
                          className="btn btn-outline-danger px-3 py-2 fw-bold rounded-3"
                          style={{ borderColor: "#ff5722", color: "#ff5722" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedVariantForDealers(v);
                          }}
                        >
                          View Dealer Offers
                        </button>
                      </td>
                    </tr>
                  );
                })
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
          onClose={() => {
            setSelectedVariantForTestDrive(null);
            setTestDriveDealerId(null);
          }}
        />
      )}
    </div>
  );
}

export default VariantSelection;
