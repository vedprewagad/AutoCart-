import React, { useState, useEffect } from "react";
import { getDealerRatings } from "../../services/dealerService";

function DealerReviewsModal({ show, onClose, dealerId, showroomName }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show && dealerId) {
      setLoading(true);
      getDealerRatings(dealerId)
        .then((data) => {
          setSummary(data);
        })
        .catch((err) => {
          console.error("Failed to fetch dealer ratings:", err);
        })
        .finally(() => setLoading(false));
    }
  }, [show, dealerId]);

  if (!show) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content rounded-4 border-0 shadow-lg">
          <div className="modal-header bg-dark text-white rounded-top-4 py-3">
            <h5 className="modal-title fw-bold">
              🏢 Customer Ratings & Reviews — {summary?.showroomName || showroomName || "Dealer"}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>

          <div className="modal-body p-4" style={{ maxHeight: "70vh", overflowY: "auto" }}>
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-2 text-muted small">Loading customer reviews...</p>
              </div>
            ) : summary ? (
              <div>
                {/* RATING SUMMARY CARD */}
                <div className="card border-0 bg-light p-3 rounded-4 mb-4">
                  <div className="d-flex align-items-center gap-3">
                    <div className="text-center px-4 py-2 bg-white rounded-3 shadow-sm border">
                      <span className="display-5 fw-extrabold text-warning d-block">
                        ★ {summary.averageRating > 0 ? summary.averageRating.toFixed(1) : "N/A"}
                      </span>
                      <small className="text-muted fw-semibold">Out of 5.0</small>
                    </div>
                    <div>
                      <h5 className="fw-bold mb-1">{summary.showroomName}</h5>
                      <p className="text-muted mb-0">
                        Based on <strong>{summary.totalReviews} verified customer review{summary.totalReviews === 1 ? "" : "s"}</strong>
                      </p>
                    </div>
                  </div>
                </div>

                {/* REVIEWS LIST */}
                <h6 className="fw-bold text-secondary mb-3">Customer Feedback & Reviews ({summary.reviews?.length || 0})</h6>

                {!summary.reviews || summary.reviews.length === 0 ? (
                  <div className="text-center py-4 text-muted border rounded-3 bg-white">
                    No written reviews submitted for this showroom yet.
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {summary.reviews.map((r) => (
                      <div key={r.id} className="card border-0 shadow-sm rounded-3 p-3 bg-white border">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <div className="d-flex align-items-center gap-2">
                            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: "36px", height: "36px" }}>
                              {r.customerName ? r.customerName.charAt(0).toUpperCase() : "C"}
                            </div>
                            <div>
                              <h6 className="fw-bold text-dark mb-0">{r.customerName}</h6>
                              <small className="text-muted">Verified Buyer / Test Drive Customer</small>
                            </div>
                          </div>
                          <div className="text-end">
                            <span className="badge bg-warning text-dark fw-bold px-2 py-1">
                              {"★".repeat(r.ratingValue)}{"☆".repeat(5 - r.ratingValue)} {r.ratingValue}.0
                            </span>
                            {r.createdAt && (
                              <div className="text-muted small" style={{ fontSize: "0.75rem" }}>
                                {new Date(r.createdAt).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                        {r.reviewText ? (
                          <p className="mb-0 text-dark opacity-90 italic fs-6 bg-light p-2 rounded-2 mt-1">
                            "{r.reviewText}"
                          </p>
                        ) : (
                          <small className="text-muted fst-italic">No comment left.</small>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-muted">Failed to load rating summary.</div>
            )}
          </div>

          <div className="modal-footer bg-light rounded-bottom-4 py-2">
            <button type="button" className="btn btn-secondary fw-semibold" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DealerReviewsModal;
