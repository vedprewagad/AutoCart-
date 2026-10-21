import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getApprovedDealersForVariant } from "../../services/dealerService";
import { useNavigate } from "react-router-dom";
import DealerReviewsModal from "../rating/DealerReviewsModal";

function DealerComparisonModal({ variant, onClose, onBookTestDrive }) {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewModalDealer, setReviewModalDealer] = useState(null);

  useEffect(() => {
    if (variant?.id) {
      loadDealers();
    }
  }, [variant]);

  const loadDealers = async () => {
    setLoading(true);
    try {
      const data = await getApprovedDealersForVariant(variant.id);
      setDealers(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (val) => {
    if (!val) return "N/A";
    const num = Number(val);
    if (num >= 100000) {
      return `₹ ${(num / 100000).toFixed(2)} Lakh`;
    }
    return `₹ ${num.toLocaleString("en-IN")}`;
  };

  return (
    <div className="modal show d-block tab-modal-backdrop bg-dark bg-opacity-75" tabIndex="-1">
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
          <div className="modal-header bg-primary text-white p-4">
            <div>
              <h4 className="modal-title fw-bold mb-1">
                Dealers offering {variant?.variantName || "Variant"}
              </h4>
              <small className="opacity-75">
                Compare approved dealer inventory, prices, and exclusive showroom offers
              </small>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4 bg-light" style={{ maxHeight: "70vh", overflowY: "auto" }}>
            {loading ? (
              <div className="text-center py-5 text-muted">Searching approved dealer inventory...</div>
            ) : dealers.length === 0 ? (
              <div className="text-center py-5">
                <div className="fs-1 mb-2">🏢</div>
                <h5 className="fw-bold text-dark">No Dealers Currently Listing Stock</h5>
                <p className="text-muted small max-w-md mx-auto mb-4">
                  There are currently no approved dealer stock listings for <strong>{variant?.variantName || "this variant"}</strong>. Please check back later or explore other car models.
                </p>
                <button className="btn btn-outline-secondary px-4 fw-bold rounded-3" onClick={onClose}>
                  Close & Explore Other Cars
                </button>
              </div>
            ) : (
              dealers.map((item) => {
                const finalPrice = Number(item.listedPrice) - Number(item.discountAmount || 0);
                const showroomTitle = item.showroomName || `Authorized Showroom #${item.dealerId}`;
                return (
                  <div key={item.id} className="card p-4 border-0 shadow-sm rounded-4 mb-3 bg-white">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                      <div>
                        <span className="badge bg-success-subtle text-success fw-bold px-3 py-1 mb-2 rounded-pill">
                          ✅ Admin Approved Inventory
                        </span>
                        <h5 className="fw-bold mb-1 text-dark">{showroomTitle}</h5>
                        {item.city && (
                          <p className="text-muted small mb-1">
                            📍 {item.city}{item.state ? `, ${item.state}` : ""}
                          </p>
                        )}
                        <p className="text-muted small mb-2">
                          Available Units: <strong>{item.unitsAvailable <= 0 ? "0 (Out of Stock)" : item.unitsAvailable}</strong> • Delivery in <strong>{item.deliveryDays} Days</strong>
                        </p>
                        {item.unitsAvailable <= 0 ? (
                          <span className="badge bg-danger text-white me-2">
                            ⚠️ Out of Stock
                          </span>
                        ) : item.discountAmount > 0 ? (
                          <span className="badge bg-danger text-white me-2">
                            Discount: ₹ {Number(item.discountAmount).toLocaleString("en-IN")}
                          </span>
                        ) : null}
                      </div>

                      <div className="text-md-end">
                        <small className="text-muted d-block text-decoration-line-through">
                          {formatPrice(item.listedPrice)}
                        </small>
                        <h3 className="text-primary fw-bold mb-1">{formatPrice(finalPrice)}</h3>
                        <div className="d-flex gap-2 mt-2">
                          <button
                            className="btn btn-outline-warning text-dark btn-sm fw-bold"
                            onClick={() => setReviewModalDealer({ dealerId: item.dealerId, showroomName: showroomTitle })}
                          >
                            ⭐ {item.rating ? Number(item.rating).toFixed(1) : "5.0"} Reviews
                          </button>
                          <button
                            className="btn btn-outline-primary btn-sm fw-bold"
                            onClick={() => {
                              if (!user) {
                                navigate("/login", {
                                  state: {
                                    from: `/models/${variant?.modelId}`,
                                    testDrive: { variantId: variant?.id, dealerId: item.dealerId }
                                  }
                                });
                              } else if (onBookTestDrive) {
                                onBookTestDrive(item.dealerId);
                              }
                            }}
                          >
                            🚗 Test Drive
                          </button>
                          {item.unitsAvailable <= 0 ? (
                            <button className="btn btn-secondary btn-sm fw-bold" disabled>
                              Out of Stock
                            </button>
                          ) : (
                            <button
                              className="btn btn-primary btn-sm fw-bold"
                              onClick={() => {
                                if (!user) {
                                  navigate("/login", {
                                    state: {
                                      from: "/payment",
                                      checkoutState: {
                                        variant,
                                        inventory: item,
                                        price: finalPrice,
                                        dealerName: showroomTitle
                                      }
                                    }
                                  });
                                } else {
                                  navigate(`/payment`, { state: { variant, inventory: item, price: finalPrice } });
                                }
                              }}
                            >
                              Select Dealer & Pay →
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {reviewModalDealer && (
        <DealerReviewsModal
          show={!!reviewModalDealer}
          onClose={() => setReviewModalDealer(null)}
          dealerId={reviewModalDealer.dealerId}
          showroomName={reviewModalDealer.showroomName}
        />
      )}
    </div>
  );
}

export default DealerComparisonModal;
