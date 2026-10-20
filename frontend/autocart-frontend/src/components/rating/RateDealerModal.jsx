import React, { useState, useEffect } from "react";
import { submitDealerRating, getUserRatingForDealer } from "../../services/dealerService";

function RateDealerModal({ show, onClose, userId, dealerId, showroomName, onRatingSubmitted }) {
  const [ratingValue, setRatingValue] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [existingRatingId, setExistingRatingId] = useState(null);

  useEffect(() => {
    if (show && userId && dealerId) {
      setLoading(true);
      setMessage("");
      getUserRatingForDealer(userId, dealerId)
        .then((data) => {
          if (data) {
            setRatingValue(data.ratingValue || 5);
            setReviewText(data.reviewText || "");
            setExistingRatingId(data.id);
          }
        })
        .catch(() => {
          setExistingRatingId(null);
        })
        .finally(() => setLoading(false));
    }
  }, [show, userId, dealerId]);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ratingValue || ratingValue < 1 || ratingValue > 5) {
      setMessage("Please select a valid star rating (1-5 stars).");
      return;
    }
    setSubmitting(true);
    setMessage("");

    try {
      await submitDealerRating({
        userId,
        dealerId,
        ratingValue,
        reviewText,
      });
      setMessage("Thank you! Your dealer rating & review has been submitted.");
      setTimeout(() => {
        if (onRatingSubmitted) onRatingSubmitted();
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      const serverMsg = err.response?.data?.error || err.response?.data?.message;
      setMessage(serverMsg || "Failed to submit rating. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-4 border-0 shadow-lg">
          <div className="modal-header bg-dark text-white rounded-top-4 py-3">
            <h5 className="modal-title fw-bold">
              ⭐ {existingRatingId ? "Update Rating for" : "Rate Your Experience with"} {showroomName || "Dealer"}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>

          <div className="modal-body p-4">
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-2 text-muted small">Loading rating details...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {message && (
                  <div className={`alert ${message.includes("Thank you") ? "alert-success" : "alert-danger"} py-2 small mb-3`}>
                    {message}
                  </div>
                )}

                <div className="text-center mb-4">
                  <label className="form-label fw-bold d-block text-dark mb-2">
                    How was your experience with {showroomName}?
                  </label>
                  <div className="d-flex justify-content-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="btn p-0 border-0 fs-2 transition-transform"
                        style={{ cursor: "pointer", outline: "none" }}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRatingValue(star)}
                      >
                        <span
                          style={{
                            color: star <= (hoverRating || ratingValue) ? "#ffc107" : "#e4e5e9",
                            transition: "color 0.2s ease-in-out",
                          }}
                        >
                          ★
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="text-muted small mt-1 fw-semibold">
                    {ratingValue === 1 && "1 - Poor"}
                    {ratingValue === 2 && "2 - Fair"}
                    {ratingValue === 3 && "3 - Good"}
                    {ratingValue === 4 && "4 - Very Good"}
                    {ratingValue === 5 && "5 - Excellent!"}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold text-dark">
                    Write a Review / Feedback (Optional)
                  </label>
                  <textarea
                    className="form-control border-2 rounded-3"
                    rows="3"
                    placeholder="Share your experience regarding customer service, pricing transparency, or delivery promptness..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    maxLength="500"
                  ></textarea>
                </div>

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button type="button" className="btn btn-outline-secondary fw-semibold px-4" onClick={onClose}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary fw-bold px-4" disabled={submitting}>
                    {submitting ? "Submitting..." : existingRatingId ? "Update Rating" : "Submit Rating ⭐"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RateDealerModal;
