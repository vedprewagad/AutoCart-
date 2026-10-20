import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getEmiProducts, getCardOffers, createPurchaseEnquiry } from "../../services/transactionService";
import { getVariantColours } from "../../services/catalogService";
import { useSelector } from "react-redux";

function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const { variant, inventory, price, dealerName } = location.state || {};

  const [emiProducts, setEmiProducts] = useState([]);
  const [cardOffers, setCardOffers] = useState([]);
  const [colours, setColours] = useState([]);
  const [selectedColour, setSelectedColour] = useState("");
  const [financeType, setFinanceType] = useState("EMI"); // CASH, EMI
  const [selectedEmiId, setSelectedEmiId] = useState(null);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!variant && !price) {
      navigate("/dashboard", {
        replace: true,
        state: { message: "Please select a vehicle before proceeding to checkout." },
      });
      return;
    }
    loadFinancingData();
    if (variant?.id) {
      getVariantColours(variant.id)
        .then((cList) => {
          setColours(cList || []);
          if (cList && cList.length > 0) {
            setSelectedColour(cList[0].colourName);
          } else {
            setSelectedColour("Standard Factory Colour");
          }
        })
        .catch((err) => console.error(err));
    }
  }, [variant, price, navigate]);

  const loadFinancingData = async () => {
    try {
      const [emiData, cardData] = await Promise.all([getEmiProducts(), getCardOffers()]);
      setEmiProducts(emiData || []);
      setCardOffers(cardData || []);
      if (emiData && emiData.length > 0) {
        setSelectedEmiId(emiData[0].id);
      }
    } catch (err) {
      console.error("Error loading financing data:", err);
    }
  };

  const basePrice = Number(variant?.basePrice || price || 0);
  const selectedEmi = emiProducts.find((p) => p.id === Number(selectedEmiId));
  const selectedCard = cardOffers.find((c) => c.id === Number(selectedCardId));

  let cardDiscount = 0;
  if (selectedCard) {
    const calculated = (basePrice * selectedCard.discountPercent) / 100;
    cardDiscount = Math.min(calculated, Number(selectedCard.maxDiscountCap || 25000));
  }

  const finalNetPrice = Math.max(0, basePrice - cardDiscount);

  const calculateMonthlyEmi = (principal, rate, months) => {
    if (!principal || !rate || !months) return 0;
    const r = rate / 12 / 100;
    const emi = (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
    return Math.round(emi);
  };

  const handleSubmitEnquiry = async () => {
    const resolvedDealerId = inventory?.dealerId || location.state?.dealerId;
    const resolvedUserId = user?.id;
    const resolvedInventoryId = inventory?.id || location.state?.inventoryId;

    if (!resolvedUserId) {
      alert("Please log in to submit a car purchase enquiry.");
      return;
    }

    if (!resolvedDealerId) {
      alert("Error: Dealer information is missing for this vehicle listing. Please select a vehicle from an authorized dealer showroom.");
      return;
    }

    if (!resolvedInventoryId) {
      alert("Error: Vehicle inventory listing ID is missing. Please select an active dealer inventory listing.");
      return;
    }

    setSubmitting(true);
    try {
      await createPurchaseEnquiry({
        userId: resolvedUserId,
        dealerId: resolvedDealerId,
        inventoryId: resolvedInventoryId,
        selectedColour: selectedColour || "Standard Factory Colour",
        financePreference: financeType,
        emiProductId: financeType === "EMI" ? selectedEmiId : null,
        cardOfferId: selectedCardId,
        cardOfferApplied: selectedCard ? selectedCard.description : null,
        finalPriceShown: finalNetPrice,
      });

      setSuccessMessage("Purchase Enquiry submitted successfully! Dealer representative will contact you for documentation & delivery.");
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || "Failed to submit enquiry. Please try again.";
      alert(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!variant && !price) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-warning">
          Please select a vehicle before proceeding to checkout. Redirecting...
        </div>
      </div>
    );
  }

  if (successMessage) {
    return (
      <div className="container py-5 text-center">
        <div className="card max-w-lg mx-auto border-0 shadow-lg rounded-4 p-5">
          <div className="fs-1 mb-3 text-success">🎉</div>
          <h2 className="fw-bold text-dark mb-3">Enquiry Confirmed!</h2>
          <p className="lead text-muted mb-4">{successMessage}</p>
          <div className="bg-light p-4 rounded-3 text-start mb-4">
            <h6 className="fw-bold mb-2">Order Summary</h6>
            <div><strong>Vehicle:</strong> {variant?.variantName || "Vehicle details unavailable"}</div>
            <div><strong>Selected Colour:</strong> {selectedColour}</div>
            <div><strong>Financing Option:</strong> {financeType}</div>
            <div><strong>Final Net Price:</strong> ₹ {finalNetPrice.toLocaleString("en-IN")}</div>
          </div>
          <button className="btn btn-primary btn-lg fw-bold px-5" onClick={() => navigate("/dashboard")}>
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)}>
          ← Back to Vehicle
        </button>
      </div>

      <h1 className="fw-bold display-6 mb-4">Final Price & Financing Options</h1>

      <div className="row g-4">
        {/* LEFT COLUMN: FINANCING & CARD OFFERS */}
        <div className="col-lg-8">
          {/* VEHICLE COLOUR SELECTOR */}
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
            <h4 className="fw-bold mb-3">🎨 Select Vehicle Colour</h4>
            {colours.length === 0 ? (
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-secondary p-2 rounded-circle" style={{ width: 16, height: 16, display: "inline-block" }}></span>
                <span className="fw-semibold">Standard Factory Colour</span>
              </div>
            ) : (
              <div className="d-flex flex-wrap gap-3">
                {colours.map((c) => {
                  const isSelected = selectedColour === c.colourName;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      className={`btn d-flex align-items-center gap-2 px-3 py-2 rounded-3 border-2 ${
                        isSelected ? "btn-primary fw-bold shadow-sm" : "btn-outline-secondary"
                      }`}
                      onClick={() => setSelectedColour(c.colourName)}
                    >
                      {c.hexCode && (
                        <span
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            backgroundColor: c.hexCode,
                            border: "1px solid #ccc",
                            display: "inline-block",
                          }}
                        />
                      )}
                      {c.colourName}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* PAYMENT MODE SELECTOR */}
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
            <h4 className="fw-bold mb-3">1. Select Payment Method</h4>
            <div className="row g-3">
              <div className="col-md-6">
                <div
                  className={`card p-3 rounded-3 cursor-pointer transition-all border-2 ${
                    financeType === "EMI" ? "border-primary bg-primary-subtle" : "border-light"
                  }`}
                  style={{ cursor: "pointer" }}
                  onClick={() => setFinanceType("EMI")}
                >
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="financeType"
                      checked={financeType === "EMI"}
                      onChange={() => setFinanceType("EMI")}
                    />
                    <label className="form-check-label fw-bold ms-2">
                      🏦 Partner Bank EMI / Loan
                    </label>
                  </div>
                  <small className="text-muted d-block mt-2">
                    Pay in easy monthly instalments with HDFC, ICICI, or SBI.
                  </small>
                </div>
              </div>

              <div className="col-md-6">
                <div
                  className={`card p-3 rounded-3 cursor-pointer transition-all border-2 ${
                    financeType === "CASH" ? "border-primary bg-primary-subtle" : "border-light"
                  }`}
                  style={{ cursor: "pointer" }}
                  onClick={() => setFinanceType("CASH")}
                >
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="financeType"
                      checked={financeType === "CASH"}
                      onChange={() => setFinanceType("CASH")}
                    />
                    <label className="form-check-label fw-bold ms-2">
                      💵 Full Cash / Outright Payment
                    </label>
                  </div>
                  <small className="text-muted d-block mt-2">
                    Pay 100% directly through bank transfer / cheque at showroom.
                  </small>
                </div>
              </div>
            </div>
          </div>

          {/* EMI PRODUCTS SELECTOR */}
          {financeType === "EMI" && (
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
              <h4 className="fw-bold mb-3">2. Available Bank EMI Plans</h4>
              <div className="row g-3">
                {emiProducts.map((p) => {
                  const isSelected = selectedEmiId === p.id;
                  const monthlyEmi = calculateMonthlyEmi(basePrice, p.interestRate, p.tenureMonths);
                  return (
                    <div key={p.id} className="col-md-6">
                      <div
                        className={`card p-3 rounded-3 border-2 transition-all ${
                          isSelected ? "border-primary bg-primary-subtle shadow-sm" : "border-light"
                        }`}
                        style={{ cursor: "pointer" }}
                        onClick={() => setSelectedEmiId(p.id)}
                      >
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="fw-bold mb-0 text-dark">{p.bank?.bankName || p.productName}</h6>
                          <span className="badge bg-primary">{p.tenureMonths} Months</span>
                        </div>
                        <p className="text-muted small mb-2">Interest Rate: <strong>{p.interestRate}% p.a.</strong></p>
                        <div className="d-flex justify-content-between align-items-center border-top pt-2 mt-2">
                          <small className="text-muted">Monthly Instalment:</small>
                          <h5 className="text-primary fw-bold mb-0">₹ {monthlyEmi.toLocaleString("en-IN")} / mo</h5>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* BANK CARD OFFERS */}
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <h4 className="fw-bold mb-3">3. Applicable Bank Card Offers</h4>
            <div className="vstack gap-3">
              <div
                className={`card p-3 rounded-3 border-2 transition-all ${
                  selectedCardId === null ? "border-primary bg-primary-subtle" : "border-light"
                }`}
                style={{ cursor: "pointer" }}
                onClick={() => setSelectedCardId(null)}
              >
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="cardOffer"
                    checked={selectedCardId === null}
                    onChange={() => setSelectedCardId(null)}
                  />
                  <label className="form-check-label fw-bold ms-2">No Card Offer Applied</label>
                </div>
              </div>

              {cardOffers.map((card) => {
                const isSelected = selectedCardId === card.id;
                const calcDisc = Math.min((basePrice * card.discountPercent) / 100, Number(card.maxDiscountCap || 25000));
                return (
                  <div
                    key={card.id}
                    className={`card p-3 rounded-3 border-2 transition-all ${
                      isSelected ? "border-success bg-success-subtle shadow-sm" : "border-light"
                    }`}
                    style={{ cursor: "pointer" }}
                    onClick={() => setSelectedCardId(card.id)}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="cardOffer"
                          checked={isSelected}
                          onChange={() => setSelectedCardId(card.id)}
                        />
                        <label className="form-label fw-bold ms-2 text-dark">
                          💳 {card.description?.replace(/Ôé\|-/g, "").replace(/Ôé/g, "").replace(/\|-/g, "")}
                        </label>
                      </div>
                      <span className="badge bg-success fw-bold">Save ₹ {calcDisc.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PRICE SUMMARY & SUBMIT */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white sticky-top" style={{ top: "90px" }}>
            <h4 className="fw-bold mb-3 border-bottom pb-3">Price Summary</h4>

            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Ex-Showroom Base Price</span>
              <span className="fw-semibold">₹ {basePrice.toLocaleString("en-IN")}</span>
            </div>

            {cardDiscount > 0 && (
              <div className="d-flex justify-content-between mb-2 text-success">
                <span>Bank Card Discount</span>
                <span className="fw-bold">- ₹ {cardDiscount.toLocaleString("en-IN")}</span>
              </div>
            )}

            <div className="d-flex justify-content-between mb-3 text-muted">
              <span>RTO & Insurance (Estimated)</span>
              <span>Included</span>
            </div>

            <hr />

            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold text-dark mb-0">Final Net Price</h5>
              <h3 className="text-primary fw-bold mb-0">₹ {finalNetPrice.toLocaleString("en-IN")}</h3>
            </div>

            {financeType === "EMI" && selectedEmi && (
              <div className="bg-primary-subtle p-3 rounded-3 mb-4 text-center">
                <small className="text-primary fw-bold d-block">Estimated EMI</small>
                <h4 className="text-primary fw-bold mb-0">
                  ₹ {calculateMonthlyEmi(finalNetPrice, selectedEmi.interestRate, selectedEmi.tenureMonths).toLocaleString("en-IN")} / month
                </h4>
                <small className="text-muted">{selectedEmi.tenureMonths} Months @ {selectedEmi.interestRate}%</small>
              </div>
            )}

            <button
              className="btn btn-primary btn-lg w-100 fw-bold py-3 shadow-sm rounded-3"
              disabled={submitting}
              onClick={handleSubmitEnquiry}
            >
              {submitting ? "Submitting Enquiry..." : "Submit Purchase Enquiry →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;
