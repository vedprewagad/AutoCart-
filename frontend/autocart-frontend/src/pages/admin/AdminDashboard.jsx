import React, { useEffect, useState } from "react";
import {
  getPendingDealers,
  updateDealerStatus,
  getPendingInventory,
  updateInventoryStatus,
  createBrand,
  createModel,
  createVariant,
  deleteBrand,
  deleteModel,
  deleteVariant,
} from "../../services/adminService";
import { getBrands, getModelsByBrand, getVariantsByModel } from "../../services/catalogService";
import {
  getBankPartners,
  getEmiProducts,
  getCardOffers,
  createBank,
  deleteBank,
  createEmiProduct,
  deleteEmiProduct,
  createCardOffer,
  deleteCardOffer,
} from "../../services/transactionService";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("PENDING_DEALERS"); // PENDING_DEALERS, PENDING_INVENTORY, CATALOG_MGMT, FINANCE_MGMT
  const [pendingDealers, setPendingDealers] = useState([]);
  const [pendingInventory, setPendingInventory] = useState([]);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [variants, setVariants] = useState([]);

  // Finance Master States
  const [banks, setBanks] = useState([]);
  const [emiProducts, setEmiProducts] = useState([]);
  const [cardOffers, setCardOffers] = useState([]);

  // Form States for Finance
  const [newBankName, setNewBankName] = useState("");
  const [newBankLogo, setNewBankLogo] = useState("");
  const [newBankEmail, setNewBankEmail] = useState("");

  const [selectedBankForEmi, setSelectedBankForEmi] = useState("");
  const [newEmiName, setNewEmiName] = useState("");
  const [newEmiTenure, setNewEmiTenure] = useState("36");
  const [newEmiRate, setNewEmiRate] = useState("8.5");
  const [newEmiFee, setNewEmiFee] = useState("1000");

  const [selectedBankForOffer, setSelectedBankForOffer] = useState("");
  const [newOfferType, setNewOfferType] = useState("CREDIT");
  const [newOfferNetwork, setNewOfferNetwork] = useState("Visa");
  const [newOfferPercent, setNewOfferPercent] = useState("10");
  const [newOfferCap, setNewOfferCap] = useState("25000");
  const [newOfferDesc, setNewOfferDesc] = useState("");

  // Catalog Form States
  const [newBrandName, setNewBrandName] = useState("");
  const [newBrandLogo, setNewBrandLogo] = useState("");
  const [newBrandOrigin, setNewBrandOrigin] = useState("India");

  const [selectedBrandForModel, setSelectedBrandForModel] = useState("");
  const [newModelName, setNewModelName] = useState("");
  const [newModelBodyType, setNewModelBodyType] = useState("SUV");
  const [newModelYear, setNewModelYear] = useState("2024");

  const [selectedBrandForVariant, setSelectedBrandForVariant] = useState("");
  const [selectedModelForVariant, setSelectedModelForVariant] = useState("");
  const [newVariantName, setNewVariantName] = useState("");
  const [newVariantFuel, setNewVariantFuel] = useState("PETROL");
  const [newVariantTrans, setNewVariantTrans] = useState("MANUAL");
  const [newVariantPrice, setNewVariantPrice] = useState("");
  const [newVariantCc, setNewVariantCc] = useState("1197");

  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const [dealers, inventory, brandList, bankList, emiList, offerList] = await Promise.all([
        getPendingDealers(),
        getPendingInventory(),
        getBrands(),
        getBankPartners(),
        getEmiProducts(),
        getCardOffers(),
      ]);
      setPendingDealers(dealers || []);
      setPendingInventory(inventory || []);
      setBrands(brandList || []);
      setBanks(bankList || []);
      setEmiProducts(emiList || []);
      setCardOffers(offerList || []);
    } catch (err) {
      console.error("Error loading admin data:", err);
    }
  };

  const handleAddBank = async (e) => {
    e.preventDefault();
    try {
      await createBank({ bankName: newBankName, logoUrl: newBankLogo, contactEmail: newBankEmail });
      setStatusMessage(`Bank "${newBankName}" added successfully!`);
      setNewBankName("");
      setNewBankLogo("");
      setNewBankEmail("");
      loadAdminData();
    } catch (err) {
      console.error(err);
      alert("Failed to add bank partner.");
    }
  };

  const handleDeleteBank = async (bankId, bankName) => {
    if (window.confirm(`Delete bank partner "${bankName}"?`)) {
      try {
        await deleteBank(bankId);
        setStatusMessage(`Bank "${bankName}" deleted successfully!`);
        loadAdminData();
      } catch (err) {
        console.error(err);
        alert("Failed to delete bank.");
      }
    }
  };

  const handleAddEmiProduct = async (e) => {
    e.preventDefault();
    try {
      await createEmiProduct({
        bankId: Number(selectedBankForEmi),
        productName: newEmiName || "Auto Loan Plan",
        tenureMonths: Number(newEmiTenure),
        interestRate: Number(newEmiRate),
        processingFee: Number(newEmiFee),
        noCostEmi: false,
      });
      setStatusMessage(`EMI Plan "${newEmiName}" added successfully!`);
      setNewEmiName("");
      loadAdminData();
    } catch (err) {
      console.error(err);
      alert("Failed to add EMI plan.");
    }
  };

  const handleDeleteEmiProduct = async (productId, name) => {
    if (window.confirm(`Delete EMI Plan "${name}"?`)) {
      try {
        await deleteEmiProduct(productId);
        setStatusMessage(`EMI Plan deleted successfully!`);
        loadAdminData();
      } catch (err) {
        console.error(err);
        alert("Failed to delete EMI plan.");
      }
    }
  };

  const handleAddCardOffer = async (e) => {
    e.preventDefault();
    try {
      await createCardOffer({
        bankId: Number(selectedBankForOffer),
        cardType: newOfferType,
        cardNetwork: newOfferNetwork,
        discountPercent: Number(newOfferPercent),
        maxDiscountCap: Number(newOfferCap),
        description: newOfferDesc || `Flat ${newOfferPercent}% off on ${newOfferNetwork} ${newOfferType} Cards`,
      });
      setStatusMessage(`Card Offer added successfully!`);
      setNewOfferDesc("");
      loadAdminData();
    } catch (err) {
      console.error(err);
      alert("Failed to add card offer.");
    }
  };

  const handleDeleteCardOffer = async (offerId) => {
    if (window.confirm("Delete this Card Offer?")) {
      try {
        await deleteCardOffer(offerId);
        setStatusMessage("Card Offer deleted successfully!");
        loadAdminData();
      } catch (err) {
        console.error(err);
        alert("Failed to delete card offer.");
      }
    }
  };

  const handleApproveDealer = async (dealerId) => {
    try {
      await updateDealerStatus(dealerId, "APPROVED");
      setStatusMessage(`Dealer #${dealerId} APPROVED successfully!`);
      loadAdminData();
    } catch (err) {
      console.error(err);
      alert("Failed to approve dealer.");
    }
  };

  const handleRejectDealer = async (dealerId) => {
    const reason = prompt("Enter rejection reason for dealer:");
    if (reason) {
      try {
        await updateDealerStatus(dealerId, "REJECTED", reason);
        setStatusMessage(`Dealer #${dealerId} REJECTED.`);
        loadAdminData();
      } catch (err) {
        console.error(err);
        alert("Failed to reject dealer.");
      }
    }
  };

  const handleApproveInventory = async (inventoryId) => {
    try {
      await updateInventoryStatus(inventoryId, "APPROVED");
      setStatusMessage(`Inventory listing #${inventoryId} APPROVED and published to buyers!`);
      loadAdminData();
    } catch (err) {
      console.error(err);
      alert("Failed to approve inventory.");
    }
  };

  const handleRejectInventory = async (inventoryId) => {
    const reason = prompt("Enter rejection reason for inventory listing:");
    if (reason) {
      try {
        await updateInventoryStatus(inventoryId, "REJECTED", reason);
        setStatusMessage(`Inventory listing #${inventoryId} REJECTED.`);
        loadAdminData();
      } catch (err) {
        console.error(err);
        alert("Failed to reject inventory.");
      }
    }
  };

  const handleAddBrand = async (e) => {
    e.preventDefault();
    try {
      await createBrand({
        name: newBrandName,
        logoUrl: newBrandLogo,
        originCountry: newBrandOrigin,
      });
      setStatusMessage(`Brand "${newBrandName}" created successfully!`);
      setNewBrandName("");
      setNewBrandLogo("");
      loadAdminData();
    } catch (err) {
      console.error(err);
      alert("Failed to create brand.");
    }
  };

  const handleBrandSelectForModel = async (bId) => {
    setSelectedBrandForModel(bId);
  };

  const handleBrandSelectForVariant = async (bId) => {
    setSelectedBrandForVariant(bId);
    if (bId) {
      const mList = await getModelsByBrand(bId);
      setModels(mList || []);
    } else {
      setModels([]);
    }
  };

  const handleSelectBrand = async (bId) => {
    setSelectedBrandForModel(bId);
    setSelectedBrandForVariant(bId);
    if (bId) {
      const mList = await getModelsByBrand(bId);
      setModels(mList || []);
      setVariants([]);
    } else {
      setModels([]);
      setVariants([]);
    }
  };

  const handleSelectModel = async (mId) => {
    setSelectedModelForVariant(mId);
    if (mId) {
      const vList = await getVariantsByModel(mId);
      setVariants(vList || []);
    } else {
      setVariants([]);
    }
  };

  const handleAddModel = async (e) => {
    e.preventDefault();
    try {
      await createModel({
        brandId: Number(selectedBrandForModel),
        name: newModelName,
        bodyType: newModelBodyType,
        launchYear: Number(newModelYear),
      });
      setStatusMessage(`Model "${newModelName}" created successfully!`);
      setNewModelName("");
      loadAdminData();
    } catch (err) {
      console.error(err);
      alert("Failed to create model.");
    }
  };

  const handleModelSelectForVariant = async (mId) => {
    setSelectedModelForVariant(mId);
    if (mId) {
      const vList = await getVariantsByModel(mId);
      setVariants(vList || []);
    } else {
      setVariants([]);
    }
  };

  const handleAddVariant = async (e) => {
    e.preventDefault();
    try {
      await createVariant({
        modelId: Number(selectedModelForVariant),
        variantName: newVariantName,
        fuelType: newVariantFuel,
        transmission: newVariantTrans,
        engineCc: Number(newVariantCc),
        basePrice: Number(newVariantPrice),
        airbags: 6,
        abs: true,
        ebd: true,
        ncapRating: "4 Star",
      });
      setStatusMessage(`Variant "${newVariantName}" created successfully!`);
      setNewVariantName("");
      setNewVariantPrice("");
      if (selectedModelForVariant) {
        const vList = await getVariantsByModel(selectedModelForVariant);
        setVariants(vList || []);
      }
      loadAdminData();
    } catch (err) {
      console.error(err);
      alert("Failed to create variant.");
    }
  };

  const handleDeleteBrand = async (brandId, brandName) => {
    if (window.confirm(`Are you sure you want to delete brand "${brandName}"?`)) {
      try {
        await deleteBrand(brandId);
        setStatusMessage(`Brand "${brandName}" deleted successfully!`);
        loadAdminData();
      } catch (err) {
        console.error(err);
        alert("Failed to delete brand.");
      }
    }
  };

  const handleDeleteModel = async (modelId, modelName) => {
    if (window.confirm(`Are you sure you want to delete model "${modelName}"?`)) {
      try {
        await deleteModel(modelId);
        setStatusMessage(`Model "${modelName}" deleted successfully!`);
        loadAdminData();
      } catch (err) {
        console.error(err);
        alert("Failed to delete model.");
      }
    }
  };

  const handleDeleteVariant = async (variantId, variantName) => {
    if (window.confirm(`Are you sure you want to delete variant "${variantName}"?`)) {
      try {
        await deleteVariant(variantId);
        setStatusMessage(`Variant "${variantName}" deleted successfully!`);
        if (selectedModelForVariant) {
          const vList = await getVariantsByModel(selectedModelForVariant);
          setVariants(vList || []);
        }
        loadAdminData();
      } catch (err) {
        console.error(err);
        alert("Failed to delete variant.");
      }
    }
  };

  const handleSyncData = async () => {
    await loadAdminData();
    setStatusMessage("🔄 Catalogue, dealer approvals, and pending stock listings synced with database!");
  };

  return (
    <div className="container py-4">
      {/* ADMIN HEADER BANNER */}
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-primary text-white">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <span className="badge bg-white text-primary px-3 py-2 fw-bold mb-2">Platform Super Admin Portal</span>
            <h1 className="fw-bold mb-1">Central Authority Dashboard</h1>
            <p className="text-light mb-0 opacity-88">
              Manage Dealer Approvals, Inventory Listings, and Master Car Catalogues
            </p>
          </div>
          <button className="btn btn-light fw-bold px-4" onClick={handleSyncData}>
            🔄 Sync Data
          </button>
        </div>
      </div>

      {statusMessage && <div className="alert alert-success py-3 mb-4 rounded-3 fw-semibold">{statusMessage}</div>}

      {/* METRICS CARDS */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card p-3 border-0 shadow-sm rounded-4 bg-white border-start border-warning border-4">
            <small className="text-muted text-uppercase fw-bold">Pending Dealers</small>
            <h2 className="fw-bold text-dark mb-0">{pendingDealers.length}</h2>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card p-3 border-0 shadow-sm rounded-4 bg-white border-start border-info border-4">
            <small className="text-muted text-uppercase fw-bold">Pending Inventory</small>
            <h2 className="fw-bold text-dark mb-0">{pendingInventory.length}</h2>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card p-3 border-0 shadow-sm rounded-4 bg-white border-start border-primary border-4">
            <small className="text-muted text-uppercase fw-bold">Master Brands</small>
            <h2 className="fw-bold text-dark mb-0">{brands.length}</h2>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card p-3 border-0 shadow-sm rounded-4 bg-white border-start border-success border-4">
            <small className="text-muted text-uppercase fw-bold">System Status</small>
            <h5 className="fw-bold text-success mb-0">Active & Operational</h5>
          </div>
        </div>
      </div>

      {/* NAV TABS */}
      <ul className="nav nav-pills gap-2 mb-4 bg-white p-2 rounded-4 shadow-sm border">
        <li className="nav-item">
          <button
            className={`nav-link fw-bold px-4 ${activeTab === "PENDING_DEALERS" ? "active" : ""}`}
            onClick={() => setActiveTab("PENDING_DEALERS")}
          >
            🏢 Pending Dealers ({pendingDealers.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link fw-bold px-4 ${activeTab === "PENDING_INVENTORY" ? "active" : ""}`}
            onClick={() => setActiveTab("PENDING_INVENTORY")}
          >
            🚗 Pending Stock Listings ({pendingInventory.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link fw-bold px-4 ${activeTab === "CATALOG_MGMT" ? "active" : ""}`}
            onClick={() => setActiveTab("CATALOG_MGMT")}
          >
            🛠️ Master Catalogue Control
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link fw-bold px-4 ${activeTab === "FINANCE_MGMT" ? "active" : ""}`}
            onClick={() => setActiveTab("FINANCE_MGMT")}
          >
            💳 Finance & Offers ({banks.length} Banks)
          </button>
        </li>
      </ul>

      {/* TAB 1: PENDING DEALER APPROVALS */}
      {activeTab === "PENDING_DEALERS" && (
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border">
          <h4 className="fw-bold mb-3">Dealer Registration Verification Requests</h4>
          {pendingDealers.length === 0 ? (
            <div className="text-center py-5 text-muted">No pending dealer registration applications.</div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Dealer Name</th>
                    <th>Showroom Name</th>
                    <th>GST Number</th>
                    <th>License No.</th>
                    <th>Location</th>
                    <th className="text-end">Admin Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingDealers.map((d) => (
                    <tr key={d.id}>
                      <td>
                        <div className="fw-bold">{d.firstName} {d.lastName}</div>
                        <small className="text-muted">{d.email} • {d.mobile}</small>
                      </td>
                      <td className="fw-bold text-primary">{d.showroomName}</td>
                      <td><code>{d.gstNumber}</code></td>
                      <td><code>{d.licenseNumber}</code></td>
                      <td>{d.city}, {d.state}</td>
                      <td className="text-end">
                        <button
                          className="btn btn-success btn-sm fw-bold me-2"
                          onClick={() => handleApproveDealer(d.id)}
                        >
                          ✓ Approve
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm fw-bold"
                          onClick={() => handleRejectDealer(d.id)}
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

      {/* TAB 2: PENDING INVENTORY APPROVALS */}
      {activeTab === "PENDING_INVENTORY" && (
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border">
          <h4 className="fw-bold mb-3">Dealer Stock Inventory Approval Requests</h4>
          {pendingInventory.length === 0 ? (
            <div className="text-center py-5 text-muted">No pending inventory stock submissions.</div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Listing ID</th>
                    <th>Dealer Showroom</th>
                    <th>Variant</th>
                    <th>Listed Price</th>
                    <th>Discount</th>
                    <th>Units</th>
                    <th className="text-end">Admin Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingInventory.map((inv) => (
                    <tr key={inv.id}>
                      <td className="fw-bold">#INV-{inv.id}</td>
                      <td>
                        <div className="fw-bold text-dark">{inv.showroomName || `Dealer Showroom #${inv.dealerId}`}</div>
                        {inv.contactPhone && <small className="text-muted">📞 {inv.contactPhone}</small>}
                      </td>
                      <td className="fw-bold">{inv.variant?.variantName || `Variant #${inv.variantId}`}</td>
                      <td>₹ {Number(inv.listedPrice).toLocaleString("en-IN")}</td>
                      <td className="text-danger fw-bold">₹ {Number(inv.discountAmount || 0).toLocaleString("en-IN")}</td>
                      <td>{inv.unitsAvailable} Units</td>
                      <td className="text-end">
                        <button
                          className="btn btn-success btn-sm fw-bold me-2"
                          onClick={() => handleApproveInventory(inv.id)}
                        >
                          ✓ Approve & Publish
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm fw-bold"
                          onClick={() => handleRejectInventory(inv.id)}
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

      {/* TAB 3: MASTER CATALOGUE CONTROL */}
      {activeTab === "CATALOG_MGMT" && (
        <div className="row g-4">
          {/* ADD BRAND */}
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border h-100">
              <h5 className="fw-bold mb-3">1. Add Master Brand</h5>
              <form onSubmit={handleAddBrand}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Brand Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Mahindra"
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Logo Image URL</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="https://..."
                    value={newBrandLogo}
                    onChange={(e) => setNewBrandLogo(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Origin Country</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newBrandOrigin}
                    onChange={(e) => setNewBrandOrigin(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100 fw-bold">
                  + Create Brand
                </button>
              </form>
            </div>
          </div>

          {/* ADD MODEL */}
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border h-100">
              <h5 className="fw-bold mb-3">2. Add Car Model</h5>
              <form onSubmit={handleAddModel}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Select Brand</label>
                  <select
                    className="form-select"
                    value={selectedBrandForModel}
                    onChange={(e) => handleBrandSelectForModel(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Brand --</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Model Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Thar"
                    value={newModelName}
                    onChange={(e) => setNewModelName(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Body Type</label>
                  <select
                    className="form-select"
                    value={newModelBodyType}
                    onChange={(e) => setNewModelBodyType(e.target.value)}
                  >
                    <option value="SUV">SUV</option>
                    <option value="HATCHBACK">HATCHBACK</option>
                    <option value="SEDAN">SEDAN</option>
                    <option value="MUV">MUV</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary w-100 fw-bold">
                  + Create Model
                </button>
              </form>
            </div>
          </div>

          {/* ADD VARIANT */}
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border h-100">
              <h5 className="fw-bold mb-3">3. Add Variant & Specs</h5>
              <form onSubmit={handleAddVariant}>
                <div className="mb-2">
                  <label className="form-label fw-semibold small">Select Brand</label>
                  <select
                    className="form-select form-select-sm"
                    value={selectedBrandForVariant}
                    onChange={(e) => handleBrandSelectForVariant(e.target.value)}
                    required
                  >
                    <option value="">-- Brand --</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-2">
                  <label className="form-label fw-semibold small">Select Model</label>
                  <select
                    className="form-select form-select-sm"
                    value={selectedModelForVariant}
                    onChange={(e) => setSelectedModelForVariant(e.target.value)}
                    required
                    disabled={!selectedBrandForVariant}
                  >
                    <option value="">-- Model --</option>
                    {models.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-2">
                  <label className="form-label fw-semibold small">Variant Name</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="e.g. LX Hardtop"
                    value={newVariantName}
                    onChange={(e) => setNewVariantName(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label fw-semibold small">Base Price (₹)</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    placeholder="e.g. 1135000"
                    value={newVariantPrice}
                    onChange={(e) => setNewVariantPrice(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100 fw-bold mt-2">
                  + Create Variant
                </button>
              </form>
            </div>
          </div>

          {/* CATALOGUE DELETION / MANAGEMENT TABLE */}
          <div className="col-12 mt-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border">
              <h5 className="fw-bold mb-3">4. Manage Existing Catalogue Brands, Models & Variants</h5>
              <div className="row g-4">
                {/* BRANDS LIST */}
                <div className="col-md-4">
                  <h6 className="fw-bold text-secondary mb-2">Master Brands ({brands.length})</h6>
                  <div className="table-responsive" style={{ maxHeight: "300px", overflowY: "auto" }}>
                    <table className="table table-sm align-middle">
                      <thead className="table-light sticky-top">
                        <tr>
                          <th>Brand Name</th>
                          <th>Origin</th>
                          <th className="text-end">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {brands.map((b) => (
                          <tr
                            key={b.id}
                            style={{ cursor: "pointer" }}
                            className={selectedBrandForModel == b.id ? "table-primary fw-bold" : ""}
                            onClick={() => handleSelectBrand(b.id)}
                          >
                            <td className="fw-bold">{b.name}</td>
                            <td className="text-muted">{b.originCountry || "India"}</td>
                            <td className="text-end" onClick={(e) => e.stopPropagation()}>
                              <button
                                className="btn btn-outline-danger btn-sm py-0 px-2 fw-semibold"
                                onClick={() => handleDeleteBrand(b.id, b.name)}
                              >
                                🗑️ Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* MODELS LIST */}
                <div className="col-md-4">
                  <h6 className="fw-bold text-secondary mb-2">Models List ({models.length})</h6>
                  {models.length === 0 ? (
                    <p className="text-muted small">Click any brand in the table on the left to view its models.</p>
                  ) : (
                    <div className="table-responsive" style={{ maxHeight: "300px", overflowY: "auto" }}>
                      <table className="table table-sm align-middle">
                        <thead className="table-light sticky-top">
                          <tr>
                            <th>Model Name</th>
                            <th>Body Type</th>
                            <th className="text-end">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {models.map((m) => (
                            <tr
                              key={m.id}
                              style={{ cursor: "pointer" }}
                              className={selectedModelForVariant == m.id ? "table-primary fw-bold" : ""}
                              onClick={() => handleSelectModel(m.id)}
                            >
                              <td className="fw-bold">{m.name}</td>
                              <td><span className="badge bg-secondary">{m.bodyType}</span></td>
                              <td className="text-end" onClick={(e) => e.stopPropagation()}>
                                <button
                                  className="btn btn-outline-danger btn-sm py-0 px-2 fw-semibold"
                                  onClick={() => handleDeleteModel(m.id, m.name)}
                                >
                                  🗑️ Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* VARIANTS LIST */}
                <div className="col-md-4">
                  <h6 className="fw-bold text-secondary mb-2">Variants List ({variants.length})</h6>
                  {variants.length === 0 ? (
                    <p className="text-muted small">Click any model in the table to view & manage its variants.</p>
                  ) : (
                    <div className="table-responsive" style={{ maxHeight: "300px", overflowY: "auto" }}>
                      <table className="table table-sm align-middle">
                        <thead className="table-light sticky-top">
                          <tr>
                            <th>Variant Name</th>
                            <th>Fuel / Trans</th>
                            <th className="text-end">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {variants.map((v) => (
                            <tr key={v.id}>
                              <td className="fw-bold">{v.variantName}</td>
                              <td className="small text-muted">{v.fuelType} / {v.transmission}</td>
                              <td className="text-end">
                                <button
                                  className="btn btn-outline-danger btn-sm py-0 px-2 fw-semibold"
                                  onClick={() => handleDeleteVariant(v.id, v.variantName)}
                                >
                                  🗑️ Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* TAB 4: FINANCE & OFFERS MANAGEMENT */}
      {activeTab === "FINANCE_MGMT" && (
        <div className="row g-4">
          {/* ADD BANK PARTNER */}
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border h-100">
              <h5 className="fw-bold mb-3">1. Add Partner Bank</h5>
              <form onSubmit={handleAddBank}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Bank Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Kotak Mahindra Bank"
                    value={newBankName}
                    onChange={(e) => setNewBankName(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Logo URL</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="https://..."
                    value={newBankLogo}
                    onChange={(e) => setNewBankLogo(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Contact Email</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="loans@bank.com"
                    value={newBankEmail}
                    onChange={(e) => setNewBankEmail(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100 fw-bold">
                  + Add Bank Partner
                </button>
              </form>
            </div>
          </div>

          {/* ADD EMI PRODUCT */}
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border h-100">
              <h5 className="fw-bold mb-3">2. Add EMI / Loan Plan</h5>
              <form onSubmit={handleAddEmiProduct}>
                <div className="mb-2">
                  <label className="form-label fw-semibold small">Select Bank</label>
                  <select
                    className="form-select form-select-sm"
                    value={selectedBankForEmi}
                    onChange={(e) => setSelectedBankForEmi(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Bank --</option>
                    {banks.map((b) => (
                      <option key={b.id} value={b.id}>{b.bankName}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-2">
                  <label className="form-label fw-semibold small">Plan Name</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="e.g. Flexi Auto Loan"
                    value={newEmiName}
                    onChange={(e) => setNewEmiName(e.target.value)}
                    required
                  />
                </div>
                <div className="row g-2 mb-2">
                  <div className="col-6">
                    <label className="form-label fw-semibold small">Tenure (Months)</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={newEmiTenure}
                      onChange={(e) => setNewEmiTenure(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label fw-semibold small">Interest (% p.a.)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-control form-control-sm"
                      value={newEmiRate}
                      onChange={(e) => setNewEmiRate(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary w-100 fw-bold mt-2">
                  + Create EMI Plan
                </button>
              </form>
            </div>
          </div>

          {/* ADD CARD OFFER */}
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border h-100">
              <h5 className="fw-bold mb-3">3. Add Bank Card Offer</h5>
              <form onSubmit={handleAddCardOffer}>
                <div className="mb-2">
                  <label className="form-label fw-semibold small">Select Bank</label>
                  <select
                    className="form-select form-select-sm"
                    value={selectedBankForOffer}
                    onChange={(e) => setSelectedBankForOffer(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Bank --</option>
                    {banks.map((b) => (
                      <option key={b.id} value={b.id}>{b.bankName}</option>
                    ))}
                  </select>
                </div>
                <div className="row g-2 mb-2">
                  <div className="col-6">
                    <label className="form-label fw-semibold small">Discount %</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={newOfferPercent}
                      onChange={(e) => setNewOfferPercent(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label fw-semibold small">Max Cap (₹)</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={newOfferCap}
                      onChange={(e) => setNewOfferCap(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="mb-2">
                  <label className="form-label fw-semibold small">Offer Description</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="e.g. 10% Instant Discount"
                    value={newOfferDesc}
                    onChange={(e) => setNewOfferDesc(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100 fw-bold mt-2">
                  + Create Card Offer
                </button>
              </form>
            </div>
          </div>

          {/* LIST OF BANKS & OFFERS */}
          <div className="col-12 mt-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border">
              <h5 className="fw-bold mb-3">4. Active Bank Partners & Financial Offers</h5>
              <div className="row g-4">
                {/* BANKS TABLE */}
                <div className="col-md-4">
                  <h6 className="fw-bold text-secondary mb-2">Bank Partners ({banks.length})</h6>
                  <div className="table-responsive" style={{ maxHeight: "300px", overflowY: "auto" }}>
                    <table className="table table-sm align-middle">
                      <thead className="table-light sticky-top">
                        <tr>
                          <th>Bank Name</th>
                          <th className="text-end">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {banks.map((b) => (
                          <tr key={b.id}>
                            <td className="fw-bold">{b.bankName}</td>
                            <td className="text-end">
                              <button
                                className="btn btn-outline-danger btn-sm py-0 px-2 fw-semibold"
                                onClick={() => handleDeleteBank(b.id, b.bankName)}
                              >
                                🗑️ Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* EMI PLANS TABLE */}
                <div className="col-md-4">
                  <h6 className="fw-bold text-secondary mb-2">EMI Plans ({emiProducts.length})</h6>
                  <div className="table-responsive" style={{ maxHeight: "300px", overflowY: "auto" }}>
                    <table className="table table-sm align-middle">
                      <thead className="table-light sticky-top">
                        <tr>
                          <th>Plan Name</th>
                          <th>Interest / Tenure</th>
                          <th className="text-end">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {emiProducts.map((p) => (
                          <tr key={p.id}>
                            <td className="fw-bold">{p.productName}</td>
                            <td className="small text-muted">{p.interestRate}% ({p.tenureMonths}m)</td>
                            <td className="text-end">
                              <button
                                className="btn btn-outline-danger btn-sm py-0 px-2 fw-semibold"
                                onClick={() => handleDeleteEmiProduct(p.id, p.productName)}
                              >
                                🗑️ Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* CARD OFFERS TABLE */}
                <div className="col-md-4">
                  <h6 className="fw-bold text-secondary mb-2">Card Offers ({cardOffers.length})</h6>
                  <div className="table-responsive" style={{ maxHeight: "300px", overflowY: "auto" }}>
                    <table className="table table-sm align-middle">
                      <thead className="table-light sticky-top">
                        <tr>
                          <th>Description</th>
                          <th>Disc %</th>
                          <th className="text-end">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cardOffers.map((o) => (
                          <tr key={o.id}>
                            <td className="small fw-bold">{o.description}</td>
                            <td><span className="badge bg-success">{o.discountPercent}%</span></td>
                            <td className="text-end">
                              <button
                                className="btn btn-outline-danger btn-sm py-0 px-2 fw-semibold"
                                onClick={() => handleDeleteCardOffer(o.id)}
                              >
                                🗑️ Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
