import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getUserTestDrives } from "../../services/dealerService";
import { Link } from "react-router-dom";
import { FaCalendarAlt, FaClock, FaCheckCircle, FaHourglassHalf, FaTimesCircle } from "react-icons/fa";
import RateDealerModal from "../../components/rating/RateDealerModal";

function MyTestDrives() {
  const user = useSelector((state) => state.auth.user);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rateModalDealer, setRateModalDealer] = useState(null);

  useEffect(() => {
    if (user?.id) {
      loadUserBookings();
    }
  }, [user]);

  const loadUserBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUserTestDrives(user.id);
      setBookings(data || []);
    } catch (err) {
      console.error("Error loading test drive bookings:", err);
      setError(err.response?.data?.message || err.response?.data?.error || "Failed to load test drive bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case "CONFIRMED":
      case "APPROVED":
      case "COMPLETED":
        return <span className="badge bg-success px-3 py-2"><FaCheckCircle className="me-1" /> {status}</span>;
      case "CANCELLED":
      case "REJECTED":
        return <span className="badge bg-danger px-3 py-2"><FaTimesCircle className="me-1" /> {status}</span>;
      default:
        return <span className="badge bg-warning text-dark px-3 py-2"><FaHourglassHalf className="me-1" /> Pending</span>;
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">🚗 My Test Drive Bookings</h2>
          <p className="text-muted mb-0">Manage and track your scheduled dealership test drive appointments</p>
        </div>
        <Link to="/dashboard" className="btn btn-outline-primary fw-semibold">
          + Book New Test Drive
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-5 text-muted">
          <div className="spinner-border text-primary mb-2" role="status"></div>
          <div>Loading your test drive bookings...</div>
        </div>
      ) : error ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white border border-danger">
          <div className="fs-1 mb-3 text-danger">⚠️</div>
          <h4 className="fw-bold text-danger">Unable to Load Test Drive Bookings</h4>
          <p className="text-muted mb-4">{error}</p>
          <div>
            <button onClick={loadUserBookings} className="btn btn-primary px-4 py-2 fw-bold rounded-3">
              Retry
            </button>
          </div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
          <div className="fs-1 mb-3">🚗</div>
          <h4 className="fw-bold text-dark">No Test Drive Bookings Found</h4>
          <p className="text-muted mb-4">
            You haven't scheduled any test drive appointments yet. Explore vehicles and book one today!
          </p>
          <div>
            <Link to="/dashboard" className="btn btn-primary px-4 py-2 fw-bold rounded-3">
              Explore Vehicles
            </Link>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {bookings.map((b) => (
            <div key={b.id} className="col-md-6 col-lg-4">
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white border h-100">
                <div className="card-header bg-light border-0 p-3 d-flex justify-content-between align-items-center">
                  <span className="fw-bold text-secondary">#TD-{b.id}</span>
                  {getStatusBadge(b.status || "PENDING")}
                </div>

                <div className="card-body p-4">
                  <h5 className="fw-bold text-primary mb-3">
                    {b.variant?.variantName || `Car Variant #${b.variantId}`}
                  </h5>

                  <div className="mb-2 text-muted small">
                    <FaCalendarAlt className="me-2 text-secondary" />
                    <strong>Date:</strong> {b.preferredDate}
                  </div>

                  <div className="mb-2 text-muted small">
                    <FaClock className="me-2 text-secondary" />
                    <strong>Time Slot:</strong> {b.preferredTime}
                  </div>

                  <div className="mb-3 text-muted small">
                    🏢 <strong>Authorized Dealer:</strong> {b.showroomName || `Showroom #${b.dealerId}`}
                  </div>

                  {b.cancellationReason && (
                    <div className="alert alert-danger py-2 small mb-0">
                      <strong>Reason:</strong> {b.cancellationReason}
                    </div>
                  )}
                </div>

                <div className="card-footer bg-white border-top-0 p-3 d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    {b.bookedAt ? new Date(b.bookedAt).toLocaleDateString("en-IN") : "Recently"}
                  </small>
                  {b.status === "COMPLETED" && (
                    <button
                      className="btn btn-sm btn-outline-warning text-dark fw-bold"
                      onClick={() => setRateModalDealer({ dealerId: b.dealerId, showroomName: b.showroomName || "Showroom" })}
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
          onRatingSubmitted={() => loadUserBookings()}
        />
      )}
    </div>
  );
}

export default MyTestDrives;
