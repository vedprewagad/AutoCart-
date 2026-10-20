import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getBrands, getModelsByBrand, getVariantsByModel } from "../../services/catalogService";
import { addDealerInventory, getDealerInventory, getDealerTestDrives, updateTestDriveStatus } from "../../services/dealerService";
import { getDealerEnquiries, updateEnquiryStatus } from "../../services/transactionService";
import { getCurrentUser } from "../../services/authService";
import { setUser } from "../../redux/slices/authSlice";

function DealerDashboard() {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState("INVENTORY"); // INVENTORY, ADD_STOCK, TEST_DRIVES, ENQUIRIES
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [variants, setVariants] = useState([]);

  const [inventoryList, setInventoryList] = useState([]);
  const [testDrives, setTestDrives] = useState([]);
  const [enquiries, setEnquiries] = useState([]);

  // Form State
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [selectedModelId, setSelectedModelId] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [listedPrice, setListedPrice] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");
  const [unitsAvailable, setUnitsAvailable] = useState("5");
  const [deliveryDays, setDeliveryDays] = useState("7");
  const [offerDescription, setOfferDescription] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadBrands();
    if (user?.role === "DEALER" && (!user?.showroomName || !user?.gstNumber)) {
      getCurrentUser()
        .then((profileData) => {
          if (profileData) dispatch(setUser(profileData));
        })
        .catch((err) => console.error(err));
    }
    if (user?.dealerId) {
      loadDealerData();
    }
  }, [user]);

  const loadBrands = async () => {
    try {
      const data = await getBrands();
      setBrands(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadDealerData = async () => {
    if (!user?.dealerId) return;
    try {
      const activeDealerId = user.dealerId;
      const [invData, tdData, enqData] = await Promise.all([
        getDealerInventory(activeDealerId),
        getDealerTestDrives(activeDealerId),
        getDealerEnquiries(activeDealerId),
      ]);
      setInventoryList(invData || []);
      setTestDrives(tdData || []);
      setEnquiries(enqData || []);
    } catch (err) {
      console.error("Error loading dealer data:", err);
      setMessage("⚠️ Failed to load dealer inventory and bookings. Please ensure backend services are reachable and click Refresh.");
    }
  };

  const handleRefreshDashboard = async () => {
    await loadDealerData();
    setMessage("🔄 Dealer dashboard refreshed successfully with latest database data!");
  };

  const handleUpdateTestDriveStatus = async (bookingId, newStatus) => {
    try {
      await updateTestDriveStatus(bookingId, newStatus);
      setMessage(`Test Drive #${bookingId} status updated to ${newStatus}!`);
      loadDealerData();
    } catch (err) {
      console.error(err);
      alert("Failed to update test drive status.");
    }
  };

  const handleUpdateEnquiryStatus = async (enquiryId, newStatus) => {
    try {
      await updateEnquiryStatus(enquiryId, newStatus);
      setMessage(`Enquiry #${enquiryId} status updated to ${newStatus}!`);
      loadDealerData();
    } catch (err) {
      console.error(err);
      alert("Failed to update enquiry status.");
    }
  };

  const handleBrandChange = async (brandId) => {
    setSelectedBrandId(brandId);
    setSelectedModelId("");
    setSelectedVariantId("");
    if (brandId) {
      const mList = await getModelsByBrand(brandId);
      setModels(mList || []);
    } else {
      setModels([]);
    }
  };

  const handleModelChange = async (modelId) => {
    setSelectedModelId(modelId);
    setSelectedVariantId("");
    if (modelId) {
      const vList = await getVariantsByModel(modelId);
      setVariants(vList || []);
    } else {
      setVariants([]);
    }
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    if (!user?.dealerId) {
      setMessage("Error: Dealer profile ID is missing. Please log in again.");
      return;
    }
    if (Number(listedPrice) <= 0) {
      setMessage("Error: Listed price must be a positive amount.");
      return;
    }
    if (Number(discountAmount) < 0) {
      setMessage("Error: Discount amount cannot be negative.");
      return;
    }
    if (Number(unitsAvailable) <= 0) {
      setMessage("Error: Available units must be at least 1.");
      return;
    }
    if (Number(deliveryDays) <= 0) {
      setMessage("Error: Estimated delivery days must be at least 1.");
      return;
    }
    setSubmitting(true);
    setMessage("");
    try {
      const activeDealerId = user.dealerId;
      await addDealerInventory({
        dealerId: activeDealerId,
        variantId: Number(selectedVariantId),
        listedPrice: Number(listedPrice),
        discountAmount: Number(discountAmount || 0),
        discountType: "FLAT",
        unitsAvailable: Number(unitsAvailable),
        deliveryDays: Number(deliveryDays),
        offers: offerDescription ? [{ offerType: "FESTIVE", offerDescription }] : [],
      });

      setMessage("Inventory submitted successfully! Sent to Admin for review.");
      setSelectedVariantId("");
      setListedPrice("");
      setDiscountAmount("");
      setOfferDescription("");
      loadDealerData();
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.error || err.response?.data?.message || "Failed to submit inventory. Please verify input details.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user?.dealerId) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary mb-3" role="status"></div>
        <h5 className="fw-bold text-dark">Loading Dealer Profile...</h5>
        <p className="text-muted small">Verifying dealer credentials</p>
      </div>
    );
  }

  const isPendingDealer = user?.status === "PENDING";

  return (
    <div className="container py-4">
      {/* PENDING STATUS BANNER */}
      {isPendingDealer && (
        <div className="alert alert-warning p-4 rounded-4 shadow-sm border-2 border-warning mb-4">
          <h5 className="fw-bold text-dark mb-1">⚠️ Dealer Account Status: PENDING Admin Approval</h5>
          <p className="mb-0 text-dark opacity-88">
            Your dealer registration request for <strong>{user?.showroomName || "Showroom"}</strong> is currently under Admin review. Once the Admin verifies your GST, Trade License, and Authorized Brand Certificate, your account will be fully activated.
          </p>
        </div>
      )}

      {/* DEALER SHOWROOM PROFILE BANNER */}
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-dark text-white">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <span className="badge bg-primary px-3 py-2 fw-bold mb-2">Authorized Dealer Portal</span>
            <h2 className="fw-bold mb-1">{user?.showroomName || (user?.firstName ? `${user.firstName}'s Showroom` : "Authorized Showroom")}</h2>
            <p className="text-light mb-0 opacity-88">
              📍 GST: <strong>{user?.gstNumber || "Registered GST"}</strong> • License: <strong>{user?.licenseNumber || "Active License"}</strong>
            </p>
          </div>
          <div>
            <button className="btn btn-outline-light fw-bold" onClick={handleRefreshDashboard}>
              🔄 Refresh Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* NAV TABS */}
      <ul className="nav nav-pills gap-2 mb-4 bg-white p-2 rounded-4 shadow-sm border">
        <li className="nav-item">
          <button
            className={`nav-link fw-bold px-4 ${activeTab === "INVENTORY" ? "active" : ""}`}
            onClick={() => setActiveTab("INVENTORY")}
          >
            📦 My Stock Inventory ({inventoryList.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link fw-bold px-4 ${activeTab === "ADD_STOCK" ? "active" : ""}`}
            onClick={() => setActiveTab("ADD_STOCK")}
          >
            ➕ Add Car Stock
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link fw-bold px-4 ${activeTab === "TEST_DRIVES" ? "active" : ""}`}
            onClick={() => setActiveTab("TEST_DRIVES")}
          >
            🚗 Test Drive Bookings ({testDrives.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link fw-bold px-4 ${activeTab === "ENQUIRIES" ? "active" : ""}`}
            onClick={() => setActiveTab("ENQUIRIES")}
          >
            📩 Purchase Enquiries ({enquiries.length})
          </button>
        </li>
      </ul>

      {/* TAB CONTENT: MY INVENTORY */}
      {activeTab === "INVENTORY" && (
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border">
          <h4 className="fw-bold mb-3">Submitted Inventory & Approval Status</h4>
          {inventoryList.length === 0 ? (
            <div className="text-center py-5 text-muted">
              No inventory listed yet. Click "Add Car Stock" to submit your first vehicle listing for Admin approval.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Variant</th>
                    <th>Listed Price</th>
                    <th>Discount</th>
                    <th>Units</th>
                    <th>Delivery</th>
                    <th>Approval Status</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryList.map((item) => (
                    <tr key={item.id}>
                      <td className="fw-bold">{item.variant?.variantName || `Variant #${item.variantId}`}</td>
                      <td>₹ {Number(item.listedPrice).toLocaleString("en-IN")}</td>
                      <td className="text-danger fw-bold">₹ {Number(item.discountAmount || 0).toLocaleString("en-IN")}</td>
                      <td>{item.unitsAvailable} Units</td>
                      <td>{item.deliveryDays} Days</td>
                      <td>
                        <span
                          className={`badge px-3 py-2 fw-bold ${
                            item.approvalStatus === "APPROVED"
                              ? "bg-success"
                              : item.approvalStatus === "REJECTED"
                              ? "bg-danger"
                              : "bg-warning text-dark"
                          }`}
                        >
                          {item.approvalStatus === "PENDING" ? "⏳ Pending Admin Approval" : item.approvalStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: ADD STOCK */}
      {activeTab === "ADD_STOCK" && (
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border max-w-2xl">
          <h4 className="fw-bold mb-3">Submit Vehicle Stock for Admin Approval</h4>

          {message && <div className="alert alert-info py-3 mb-3">{message}</div>}

          <form onSubmit={handleAddStock}>
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label className="form-label fw-semibold">Select Brand</label>
                <select
                  className="form-select border-2"
                  value={selectedBrandId}
                  onChange={(e) => handleBrandChange(e.target.value)}
                  required
                >
                  <option value="">-- Choose Brand --</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold">Select Car Model</label>
                <select
                  className="form-select border-2"
                  value={selectedModelId}
                  onChange={(e) => handleModelChange(e.target.value)}
                  required
                  disabled={!selectedBrandId}
                >
                  <option value="">-- Choose Model --</option>
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold">Select Variant</label>
                <select
                  className="form-select border-2"
                  value={selectedVariantId}
                  onChange={(e) => setSelectedVariantId(e.target.value)}
                  required
                  disabled={!selectedModelId}
                >
                  <option value="">-- Choose Variant --</option>
                  {variants.map((v) => (
                    <option key={v.id} value={v.id}>{v.variantName}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Listed Price (₹)</label>
                <input
                  type="number"
                  min="1"
                  className="form-control border-2"
                  placeholder="e.g. 865000"
                  value={listedPrice}
                  onChange={(e) => setListedPrice(e.target.value)}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Discount Amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  className="form-control border-2"
                  placeholder="e.g. 15000"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Available Units</label>
                <input
                  type="number"
                  min="1"
                  className="form-control border-2"
                  value={unitsAvailable}
                  onChange={(e) => setUnitsAvailable(e.target.value)}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Estimated Delivery Days</label>
                <input
                  type="number"
                  min="1"
                  className="form-control border-2"
                  value={deliveryDays}
                  onChange={(e) => setDeliveryDays(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">Additional Showroom Offers (Optional)</label>
              <input
                type="text"
                className="form-control border-2"
                placeholder="e.g. Free 2-Year Extended Warranty + Floor Mats Package"
                value={offerDescription}
                onChange={(e) => setOfferDescription(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg fw-bold px-5" disabled={submitting}>
              {submitting ? "Submitting to Admin..." : "Submit Listing for Admin Approval →"}
            </button>
          </form>
        </div>
      )}

      {/* TAB CONTENT: TEST DRIVES */}
      {activeTab === "TEST_DRIVES" && (
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border">
          <h4 className="fw-bold mb-3">Customer Test Drive Requests</h4>
          {testDrives.length === 0 ? (
            <div className="text-center py-5 text-muted">No test drive bookings requested yet.</div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Booking ID</th>
                    <th>Customer Details</th>
                    <th>Variant</th>
                    <th>Preferred Date</th>
                    <th>Time Slot</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {testDrives.map((td) => (
                    <tr key={td.id}>
                      <td className="fw-bold">#TD-{td.id}</td>
                      <td>
                        <div className="fw-semibold text-dark">{td.customerName || `Customer #${td.userId}`}</div>
                        {td.customerMobile && <small className="text-muted">📞 {td.customerMobile}</small>}
                      </td>
                      <td>{td.variant?.variantName}</td>
                      <td>{td.preferredDate}</td>
                      <td>{td.preferredTime}</td>
                      <td>
                        <span className={`badge ${
                          td.status === "CONFIRMED" || td.status === "APPROVED" || td.status === "COMPLETED"
                            ? "bg-success"
                            : td.status === "CANCELLED" || td.status === "REJECTED"
                            ? "bg-danger"
                            : "bg-warning text-dark"
                        }`}>
                          {td.status || "PENDING"}
                        </span>
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-success me-1 fw-semibold"
                          onClick={() => handleUpdateTestDriveStatus(td.id, "CONFIRMED")}
                        >
                          ✓ Approve / Confirm
                        </button>
                        <button
                          className="btn btn-sm btn-outline-primary me-1 fw-semibold"
                          onClick={() => handleUpdateTestDriveStatus(td.id, "COMPLETED")}
                        >
                          ✓ Complete
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger fw-semibold"
                          onClick={() => handleUpdateTestDriveStatus(td.id, "CANCELLED")}
                        >
                          ✕ Cancel / Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: ENQUIRIES */}
      {activeTab === "ENQUIRIES" && (
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border">
          <h4 className="fw-bold mb-3">Customer Purchase Enquiries</h4>
          {enquiries.length === 0 ? (
            <div className="text-center py-5 text-muted">No purchase enquiries received yet.</div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Enquiry ID</th>
                    <th>Customer Details</th>
                    <th>Car Model & Variant</th>
                    <th>Finance Preference</th>
                    <th>Offer Applied</th>
                    <th>Final Price</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {enquiries.map((enq) => (
                    <tr key={enq.id}>
                      <td className="fw-bold">#ENQ-{enq.id}</td>
                      <td>
                        <div className="fw-semibold text-dark">{enq.customerName || `Customer #${enq.userId}`}</div>
                        {enq.customerMobile && <small className="text-muted">📞 {enq.customerMobile}</small>}
                      </td>
                      <td>
                        <div className="fw-semibold text-dark">{enq.carModelName || "Vehicle Listing"}</div>
                        <small className="text-primary">{enq.variantName || `Listing #${enq.inventoryId}`}</small>
                      </td>
                      <td><span className="badge bg-primary">{enq.financePreference}</span></td>
                      <td>{enq.cardOfferApplied || "None"}</td>
                      <td className="fw-bold text-success">₹ {Number(enq.finalPriceShown).toLocaleString("en-IN")}</td>
                      <td>
                        <span className={`badge ${
                          enq.status === "PROCESSED" || enq.status === "COMPLETED"
                            ? "bg-success"
                            : enq.status === "REJECTED"
                            ? "bg-danger"
                            : "bg-warning text-dark"
                        }`}>
                          {enq.status || "PENDING"}
                        </span>
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-success me-1 fw-semibold"
                          onClick={() => handleUpdateEnquiryStatus(enq.id, "PROCESSED")}
                        >
                          ✓ Process
                        </button>
                        <button
                          className="btn btn-sm btn-outline-primary me-1 fw-semibold"
                          onClick={() => handleUpdateEnquiryStatus(enq.id, "COMPLETED")}
                        >
                          ✓ Complete
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger fw-semibold"
                          onClick={() => handleUpdateEnquiryStatus(enq.id, "REJECTED")}
                        >
                          ✕ Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DealerDashboard;
