import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import SpecificationCard from "../../components/vehicle/SpecificationCard";
import DealerComparisonModal from "../../components/vehicle/DealerComparisonModal";
import TestDriveModal from "../../components/vehicle/TestDriveModal";

import {
  getVariantDetails,
  getVariantImages,
} from "../../services/catalogService";
import { getImageUrl as resolveImageUrl } from "../../utils/imageUrl";

import "./VehicleDetails.css";

function VehicleDetails() {
  const { variantId } = useParams();

  const [vehicle, setVehicle] = useState(null);
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedColour, setSelectedColour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [showDealerModal, setShowDealerModal] = useState(false);
  const [showTestDriveModal, setShowTestDriveModal] = useState(false);
  const [testDriveDealerId, setTestDriveDealerId] = useState(null);

  useEffect(() => {
    loadVehicle();
  }, [variantId]);

  const loadVehicle = async () => {
    setLoading(true);
    setError(null);
    try {
      const [vehicleData, imageData] = await Promise.all([
        getVariantDetails(variantId),
        getVariantImages(variantId),
      ]);

      setVehicle(vehicleData);
      setImages(imageData || []);

      if (imageData && imageData.length > 0) {
        const exterior = imageData.find((img) => img.imageType === "EXTERIOR");
        setSelectedImage(exterior || imageData[0]);

        const colour = imageData.find((img) => img.imageType === "COLOUR");
        if (colour) {
          setSelectedColour(colour);
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.response?.data?.error || "Failed to load vehicle details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (url) => {
    if (!url) return vehicle?.modelThumbnail ? getImageUrl(vehicle.modelThumbnail) : "";
    return resolveImageUrl(url);
  };

  const formatPrice = (price) => {
    if (!price) return "Contact for Price";
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

  if (loading) {
    return (
      <div className="container py-5 text-center text-muted">
        <div className="spinner-border text-primary mb-2" role="status"></div>
        <div>Loading vehicle details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5 text-center">
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white border border-danger d-inline-block">
          <div className="fs-1 mb-3 text-danger">⚠️</div>
          <h4 className="fw-bold text-danger">Error Loading Vehicle</h4>
          <p className="text-muted mb-4">{error}</p>
          <button className="btn btn-primary px-4 py-2 fw-bold rounded-3" onClick={loadVehicle}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-warning">Vehicle details not found.</div>
      </div>
    );
  }

  const currentImgUrl = selectedImage ? getImageUrl(selectedImage.imageUrl) : getImageUrl(vehicle.modelThumbnail);

  return (
    <div className="vehicle-page container py-4">
      <div className="vehicle-header mb-4">
        <Link className="back-link btn btn-link ps-0 text-decoration-none" to={`/models/${vehicle.modelId}`}>
          ← Back to Model Variants
        </Link>

        <h1 className="fw-bold mt-2 mb-1">
          {vehicle.brandName} {vehicle.modelName}
        </h1>

        <h3 className="text-muted fs-4">{vehicle.variantName}</h3>
      </div>

      <div className="vehicle-layout row g-4">
        <div className="left-section col-lg-7">
          <div className="vehicle-image bg-light rounded-3 p-3 text-center mb-3">
            <img
              src={currentImgUrl}
              alt={vehicle.modelName}
              className="img-fluid rounded"
              style={{ maxHeight: "380px", objectFit: "contain" }}
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/images/placeholder-car.png";
              }}
            />
          </div>

          {images.length > 0 && (
            <div className="thumbnail-row d-flex gap-2 overflow-auto py-2">
              {images.map((image) => (
                <img
                  key={image.id}
                  src={getImageUrl(image.imageUrl)}
                  alt={image.colourName || "vehicle thumbnail"}
                  className={`rounded border ${selectedImage?.id === image.id ? "border-primary border-3" : ""}`}
                  style={{ width: "70px", height: "50px", objectFit: "cover", cursor: "pointer" }}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/images/placeholder-car.png";
                  }}
                  onClick={() => setSelectedImage(image)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="right-section col-lg-5">
          <div className="price-card p-4 border rounded-3 bg-white shadow-sm">
            <span className="text-uppercase text-muted fw-bold small">Ex-Showroom Price</span>

            <h2 className="text-primary fw-bold my-2">{formatPrice(vehicle.basePrice)}</h2>

            <p className="text-muted small mb-4">
              Estimated EMI Starts from <strong>{calculateEmi(vehicle.basePrice)}</strong>
            </p>

            <div className="d-grid gap-2">
              <button
                className="btn btn-primary btn-lg fw-semibold"
                onClick={() => {
                  setTestDriveDealerId(null);
                  setShowTestDriveModal(true);
                }}
              >
                Book Test Drive
              </button>
              <button
                className="btn btn-outline-primary btn-lg fw-semibold"
                onClick={() => setShowDealerModal(true)}
              >
                Request Quotation
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Colour selection */}
      {images.some((img) => img.imageType === "COLOUR") && (
        <div className="colour-section my-4">
          <h4 className="fw-bold mb-3">Available Colours</h4>
          <div className="d-flex flex-wrap gap-2">
            {images
              .filter((img) => img.imageType === "COLOUR")
              .map((img) => (
                <button
                  key={img.id}
                  className={`btn btn-sm ${
                    selectedColour?.id === img.id ? "btn-dark" : "btn-outline-secondary"
                  }`}
                  onClick={() => {
                    setSelectedColour(img);
                    setSelectedImage(img);
                  }}
                >
                  🎨 {img.colourName}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Specifications */}
      <div className="specifications mt-5">
        <h3 className="fw-bold mb-3">Specifications</h3>
        <div className="spec-grid row g-3">
          <div className="col-6 col-md-4"><SpecificationCard title="Fuel Type" value={vehicle.fuelType} /></div>
          <div className="col-6 col-md-4"><SpecificationCard title="Transmission" value={vehicle.transmission} /></div>
          <div className="col-6 col-md-4"><SpecificationCard title="Engine" value={vehicle.engineCc ? `${vehicle.engineCc} cc` : "N/A"} /></div>
          <div className="col-6 col-md-4"><SpecificationCard title="Mileage" value={vehicle.mileageKmpl ? `${vehicle.mileageKmpl} km/l` : "N/A"} /></div>
          <div className="col-6 col-md-4"><SpecificationCard title="Power" value={vehicle.powerBhp ? `${vehicle.powerBhp} bhp` : "N/A"} /></div>
          <div className="col-6 col-md-4"><SpecificationCard title="Torque" value={vehicle.torqueNm ? `${vehicle.torqueNm} Nm` : "N/A"} /></div>
        </div>
      </div>

      {/* Dimensions */}
      <div className="specifications mt-4">
        <h3 className="fw-bold mb-3">Dimensions & Capacity</h3>
        <div className="spec-grid row g-3">
          <div className="col-6 col-md-4"><SpecificationCard title="Length" value={vehicle.lengthMm ? `${vehicle.lengthMm} mm` : "N/A"} /></div>
          <div className="col-6 col-md-4"><SpecificationCard title="Width" value={vehicle.widthMm ? `${vehicle.widthMm} mm` : "N/A"} /></div>
          <div className="col-6 col-md-4"><SpecificationCard title="Height" value={vehicle.heightMm ? `${vehicle.heightMm} mm` : "N/A"} /></div>
          <div className="col-6 col-md-4"><SpecificationCard title="Wheelbase" value={vehicle.wheelbaseMm ? `${vehicle.wheelbaseMm} mm` : "N/A"} /></div>
          <div className="col-6 col-md-4"><SpecificationCard title="Boot Space" value={vehicle.bootSpaceLitres ? `${vehicle.bootSpaceLitres} L` : "N/A"} /></div>
          <div className="col-6 col-md-4"><SpecificationCard title="Seating Capacity" value={vehicle.seatingCapacity ? `${vehicle.seatingCapacity} Seats` : "N/A"} /></div>
        </div>
      </div>

      {/* Safety */}
      <div className="specifications mt-4 mb-5">
        <h3 className="fw-bold mb-3">Safety Features</h3>
        <div className="spec-grid row g-3">
          <div className="col-6 col-md-3"><SpecificationCard title="Airbags" value={vehicle.airbags || 0} /></div>
          <div className="col-6 col-md-3"><SpecificationCard title="ABS" value={vehicle.abs ? "Standard" : "N/A"} /></div>
          <div className="col-6 col-md-3"><SpecificationCard title="EBD" value={vehicle.ebd ? "Standard" : "N/A"} /></div>
          <div className="col-6 col-md-3"><SpecificationCard title="NCAP Safety Rating" value={vehicle.ncapRating || "Not Rated"} /></div>
        </div>
      </div>

      {/* MODALS */}
      {showDealerModal && (
        <DealerComparisonModal
          variant={vehicle}
          onClose={() => setShowDealerModal(false)}
          onBookTestDrive={(dealerId) => {
            setTestDriveDealerId(dealerId);
            setShowDealerModal(false);
            setShowTestDriveModal(true);
          }}
        />
      )}

      {showTestDriveModal && (
        <TestDriveModal
          variant={vehicle}
          dealerId={testDriveDealerId}
          onClose={() => {
            setShowTestDriveModal(false);
            setTestDriveDealerId(null);
          }}
        />
      )}
    </div>
  );
}

export default VehicleDetails;
