import React, { useState, useEffect } from "react";
import { bookTestDrive, getApprovedDealersForVariant } from "../../services/dealerService";
import { useSelector } from "react-redux";

function TestDriveModal({ variant, dealerId, onClose }) {
  const user = useSelector((state) => state.auth.user);
  const [selectedDealerId, setSelectedDealerId] = useState(dealerId || "");
  const [dealers, setDealers] = useState([]);
  const [loadingDealers, setLoadingDealers] = useState(false);
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("10:00 AM");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (dealerId) {
      setSelectedDealerId(dealerId);
    } else if (variant?.id) {
      setLoadingDealers(true);
      getApprovedDealersForVariant(variant.id)
        .then((data) => {
          setDealers(data || []);
          if (data && data.length > 0) {
            setSelectedDealerId(data[0].dealerId);
          }
        })
        .catch((err) => console.error("Error loading dealers for test drive:", err))
        .finally(() => setLoadingDealers(false));
    }
  }, [dealerId, variant]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) {
      setErrorMsg("Please log in to book a test drive.");
      return;
    }
    const targetDealerId = selectedDealerId || dealerId;
    if (!targetDealerId) {
      setErrorMsg("No dealer selected for test drive. Please select an authorized showroom.");
      return;
    }
    if (!preferredDate) {
      setErrorMsg("Please select your preferred date");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      await bookTestDrive({
        userId: user.id,
        dealerId: Number(targetDealerId),
        variantId: variant?.id,
        preferredDate,
        preferredTime,
      });
      setSuccessMsg("Test Drive booked successfully! The showroom representative will contact you shortly.");
      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || err.response?.data?.message || "Failed to book test drive. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];

  const allTimeSlots = [
    { value: "09:00 AM", label: "09:00 AM - 10:00 AM", startHour: 9 },
    { value: "10:00 AM", label: "10:00 AM - 11:00 AM", startHour: 10 },
    { value: "11:00 AM", label: "11:00 AM - 12:00 PM", startHour: 11 },
    { value: "12:00 PM", label: "12:00 PM - 01:00 PM", startHour: 12 },
    { value: "01:00 PM", label: "01:00 PM - 02:00 PM", startHour: 13 },
    { value: "02:00 PM", label: "02:00 PM - 03:00 PM", startHour: 14 },
    { value: "03:00 PM", label: "03:00 PM - 04:00 PM", startHour: 15 },
    { value: "04:00 PM", label: "04:00 PM - 05:00 PM", startHour: 16 },
    { value: "05:00 PM", label: "05:00 PM - 06:00 PM", startHour: 17 },
    { value: "06:00 PM", label: "06:00 PM - 07:00 PM", startHour: 18 },
  ];

  const currentHour = new Date().getHours();

  const availableSlots = preferredDate === todayStr
    ? allTimeSlots.filter((slot) => slot.startHour > currentHour)
    : allTimeSlots;

  return (
    <div className="modal show d-block bg-dark bg-opacity-75" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-4 border-0 shadow-lg p-3">
          <div className="modal-header border-0 pb-0">
            <h4 className="modal-title fw-bold text-dark">🚗 Book a Test Drive</h4>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            {successMsg ? (
              <div className="alert alert-success p-4 rounded-3 text-center my-3">
                <div className="fs-1">🎉</div>
                <h5 className="fw-bold mt-2">{successMsg}</h5>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <p className="text-muted small mb-3">
                  Schedule a free door-step or showroom test drive for <strong>{variant?.variantName || "Selected Vehicle"}</strong>.
                </p>

                {errorMsg && <div className="alert alert-danger small py-2 mb-3">{errorMsg}</div>}

                {loadingDealers ? (
                  <div className="text-muted small mb-3">
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Loading authorized showrooms...
                  </div>
                ) : dealers && dealers.length > 0 ? (
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Select Showroom / Dealer</label>
                    <select
                      className="form-select form-select-lg border-2"
                      value={selectedDealerId}
                      onChange={(e) => setSelectedDealerId(Number(e.target.value))}
                      required
                    >
                      {dealers.map((d) => (
                        <option key={d.dealerId} value={d.dealerId}>
                          {d.showroomName || `Showroom #${d.dealerId}`} ({d.city || "Authorized Showroom"})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}

                <div className="mb-3">
                  <label className="form-label fw-semibold">Preferred Date</label>
                  <input
                    type="date"
                    className="form-control form-control-lg border-2"
                    value={preferredDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">Preferred Time Slot</label>
                  {availableSlots.length === 0 ? (
                    <div className="alert alert-warning small py-2 mb-0">
                      ⚠️ No remaining time slots for today. Please choose a future date.
                    </div>
                  ) : (
                    <select
                      className="form-select form-select-lg border-2"
                      value={preferredTime}
                      onChange={(e) => setPreferredTime(e.target.value)}
                    >
                      {availableSlots.map((slot) => (
                        <option key={slot.value} value={slot.value}>
                          {slot.label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-100 fw-bold py-3 shadow-sm rounded-3"
                  disabled={loading || availableSlots.length === 0}
                >
                  {loading ? "Confirming Booking..." : "Confirm Test Drive Booking →"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestDriveModal;
