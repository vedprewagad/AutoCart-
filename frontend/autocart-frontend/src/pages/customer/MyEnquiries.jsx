import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getUserEnquiries } from "../../services/transactionService";
import { Link } from "react-router-dom";
import { FaReceipt, FaMoneyCheckAlt, FaPalette, FaCheckCircle, FaHourglassHalf, FaTimesCircle } from "react-icons/fa";
import RateDealerModal from "../../components/rating/RateDealerModal";

function MyEnquiries() {
  const user = useSelector((state) => state.auth.user);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rateModalDealer, setRateModalDealer] = useState(null);

  useEffect(() => {
    if (user?.id) {
      loadUserEnquiries();
    }
  }, [user]);

  const loadUserEnquiries = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUserEnquiries(user.id);
      setEnquiries(data || []);
    } catch (err) {
      console.error("Error loading enquiries:", err);
      setError(err.response?.data?.message || err.response?.data?.error || "Failed to load purchase enquiries. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case "PROCESSED":
      case "COMPLETED":
        return <span className="badge bg-success px-3 py-2"><FaCheckCircle className="me-1" /> {status}</span>;
      case "REJECTED":
        return <span className="badge bg-danger px-3 py-2"><FaTimesCircle className="me-1" /> Rejected</span>;
      default:
        return <span className="badge bg-warning text-dark px-3 py-2"><FaHourglassHalf className="me-1" /> Pending</span>;
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">📋 My Purchase Enquiries & Orders</h2>
          <p className="text-muted mb-0">View all your vehicle booking requests and price enquiries</p>
        </div>
        <Link to="/dashboard" className="btn btn-outline-primary fw-semibold">
          + Explore Vehicles
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-5 text-muted">
          <div className="spinner-border text-primary mb-2" role="status"></div>
          <div>Loading your purchase enquiries...</div>
        </div>
      ) : error ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white border border-danger">
          <div className="fs-1 mb-3 text-danger">⚠️</div>
          <h4 className="fw-bold text-danger">Unable to Load Purchase Enquiries</h4>
          <p className="text-muted mb-4">{error}</p>
          <div>
            <button onClick={loadUserEnquiries} className="btn btn-primary px-4 py-2 fw-bold rounded-3">
              Retry
            </button>
          </div>
        </div>
      ) : enquiries.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
          <div className="fs-1 mb-3">🏷️</div>
          <h4 className="fw-bold text-dark">No Purchase Enquiries Found</h4>
          <p className="text-muted mb-4">
            You haven't submitted any car purchase enquiries yet. Select a car and proceed to checkout!
          </p>
          <div>
            <Link to="/dashboard" className="btn btn-primary px-4 py-2 fw-bold rounded-3">
              Browse Catalogue
            </Link>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {enquiries.map((e) => (
            <div key={e.id} className="col-md-6 col-lg-4">
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white border h-100">
                <div className="card-header bg-light border-0 p-3 d-flex justify-content-between align-items-center">
                  <span className="fw-bold text-secondary">#ENQ-{e.id}</span>
                  {getStatusBadge(e.status || "PENDING")}
                </div>

                <div className="card-body p-4">
                  <h5 className="fw-bold text-dark mb-1">
                    <FaReceipt className="text-primary me-2" />
                    {e.carModelName || `Car Listing #${e.inventoryId}`}
                  </h5>
                  <div className="text-primary fw-semibold small mb-3">
                    🚗 <strong>Variant:</strong> {e.variantName || `Variant #${e.inventoryId}`}
                  </div>

                  <div className="mb-2 text-muted small">
                    🏢 <strong>Showroom:</strong> {e.showroomName || `Dealer Showroom #${e.dealerId}`}
                  </div>

                  <div className="mb-2 text-muted small">
                    <FaPalette className="me-2 text-secondary" />
                    <strong>Colour:</strong> {e.selectedColour || "Standard Factory Colour"}
                  </div>

                  <div className="mb-2 text-muted small">
                    <FaMoneyCheckAlt className="me-2 text-secondary" />
                    <strong>Finance:</strong> {e.financePreference || "CASH"}
                  </div>

                  {e.transactionId && (
                    <div className="mb-2 text-muted small">
                      💳 <strong>Txn ID:</strong> <code className="text-primary">{e.transactionId}</code>
                    </div>
                  )}

                  {e.paymentStatus && (
                    <div className="mb-2 text-muted small">
                      🏷️ <strong>Payment:</strong> <span className={`badge ms-1 ${e.paymentStatus === "PAID" ? "bg-success" : "bg-secondary"}`}>{e.paymentStatus}</span>
                    </div>
                  )}

                  {e.cardOfferApplied && (
                    <div className="alert alert-info py-2 small mb-3">
                      <strong>Offer Applied:</strong> {e.cardOfferApplied}
                    </div>
                  )}

                  <div className="pt-2 border-top mt-3 d-flex justify-content-between align-items-baseline">
                    <span className="text-muted small">Final Price:</span>
                    <span className="fs-5 fw-bold text-primary">
                      ₹ {Number(e.finalPriceShown || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <div className="card-footer bg-white border-top-0 p-3 d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    {e.createdAt ? new Date(e.createdAt).toLocaleDateString("en-IN") : "Recently"}
                  </small>
                  {["DELIVERED", "COMPLETED", "PROCESSED"].includes(e.status) && (
                    <button
                      className="btn btn-sm btn-outline-warning text-dark fw-bold"
                      onClick={() => setRateModalDealer({ dealerId: e.dealerId, showroomName: e.showroomName || "Showroom" })}
                    >
                      ⭐ Rate Dealer
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {rateModalDealer && (
        <RateDealerModal
          show={!!rateModalDealer}
          onClose={() => setRateModalDealer(null)}
          userId={user?.id}
          dealerId={rateModalDealer.dealerId}
          showroomName={rateModalDealer.showroomName}
          onRatingSubmitted={() => loadUserEnquiries()}
        />
      )}
    </div>
  );
}

export default MyEnquiries;
