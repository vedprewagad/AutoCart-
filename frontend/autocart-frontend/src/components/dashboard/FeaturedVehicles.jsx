import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getVehicles, getBrands } from "../../services/catalogService";
import VehicleCard from "../cards/VehicleCard";

import "./FeaturedVehicles.css";

import { useLocation } from "react-router-dom";

function FeaturedVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedFuelType, setSelectedFuelType] = useState("");
  const [selectedBodyType, setSelectedBodyType] = useState("");
  const [selectedSortBy, setSelectedSortBy] = useState("");

  // AI Dynamic Filter States
  const [aiTransmission, setAiTransmission] = useState(null);
  const [aiMaxPrice, setAiMaxPrice] = useState(null);
  const [aiMinPrice, setAiMinPrice] = useState(null);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const quickBodyType = location.state?.bodyType || "";
  const rawQuickPrice = location.state?.price ? Number(location.state.price) : null;
  const maxPriceRupees = rawQuickPrice ? (rawQuickPrice <= 500 ? rawQuickPrice * 100000 : rawQuickPrice) : null;
  const maxPriceLakhs = maxPriceRupees ? (maxPriceRupees / 100000).toFixed(1) : null;

  useEffect(() => {
    loadBrandsList();
  }, []);

  useEffect(() => {
    const handleAiFilterApply = (e) => {
      const aiResult = e.detail;
      if (!aiResult) return;
      if (aiResult.brand) setSelectedBrand(aiResult.brand);
      if (aiResult.bodyType) setSelectedBodyType(aiResult.bodyType);
      if (aiResult.fuelType) setSelectedFuelType(aiResult.fuelType);
      if (aiResult.transmission) setAiTransmission(aiResult.transmission);
      if (aiResult.maxPrice) setAiMaxPrice(aiResult.maxPrice);
      if (aiResult.minPrice) setAiMinPrice(aiResult.minPrice);
      if (aiResult.sortBy) setSelectedSortBy(aiResult.sortBy);
      setPage(0);
    };

    window.addEventListener("autocart:ai-filter-apply", handleAiFilterApply);
    return () => {
      window.removeEventListener("autocart:ai-filter-apply", handleAiFilterApply);
    };
  }, []);

  useEffect(() => {
    if (location.state?.brand) {
      setSelectedBrand(location.state.brand);
    }
    if (location.state?.bodyType) {
      setSelectedBodyType(location.state.bodyType);
    }
  }, [location.state]);

  useEffect(() => {
    loadVehicles();
  }, [page, selectedBrand, selectedFuelType, selectedBodyType, selectedSortBy, aiTransmission, aiMaxPrice, aiMinPrice, maxPriceRupees, quickBodyType]);

  const loadBrandsList = async () => {
    try {
      const data = await getBrands();
      setBrands(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadVehicles = async () => {
    setLoading(true);
    try {
      const activeBodyType = selectedBodyType || quickBodyType;
      const effectiveMaxPrice = aiMaxPrice || maxPriceRupees;
      const response = await getVehicles({
        page,
        size: 24,
        brand: selectedBrand || undefined,
        bodyType: activeBodyType || undefined,
        fuelType: selectedFuelType || undefined,
        minPrice: aiMinPrice || undefined,
        maxPrice: effectiveMaxPrice || undefined,
        transmission: aiTransmission || undefined,
        sortBy: selectedSortBy || undefined,
      });

      setVehicles(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (error) {
      console.error("Error loading vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  const openVehicle = (vehicle) => {
    navigate(`/models/${vehicle.modelId || vehicle.variantId}`);
  };

  const handleResetFilters = () => {
    setSelectedBrand("");
    setSelectedFuelType("");
    setSelectedBodyType("");
    setSelectedSortBy("");
    setAiTransmission(null);
    setAiMaxPrice(null);
    setAiMinPrice(null);
    setPage(0);
    if (location.state) {
      navigate("/dashboard", { replace: true, state: {} });
    }
  };

  // Group vehicles by model and select lowest base price variant (base model) per car model
  const modelMap = new Map();
  for (const item of vehicles) {
    const key = `${item.brand}-${item.model}`;
    if (!modelMap.has(key) || Number(item.basePrice) < Number(modelMap.get(key).basePrice)) {
      modelMap.set(key, item);
    }
  }
  const filteredVehicles = Array.from(modelMap.values());

  return (
    <section className="featured-vehicles py-4" id="vehicles-section">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Explore Vehicles</h2>
          <p className="text-muted mb-0">Browse and filter from our full lineup of available car models</p>
        </div>

        {/* Filter controls */}
        <div className="d-flex flex-wrap gap-2">
          <select
            className="form-select form-select-sm w-auto"
            value={selectedBrand}
            onChange={(e) => {
              setSelectedBrand(e.target.value);
              setPage(0);
            }}
          >
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b.id} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>

          <select
            className="form-select form-select-sm w-auto"
            value={selectedBodyType}
            onChange={(e) => {
              setSelectedBodyType(e.target.value);
              setPage(0);
            }}
          >
            <option value="">All Body Styles</option>
            <option value="SUV">SUV</option>
            <option value="SEDAN">Sedan</option>
            <option value="HATCHBACK">Hatchback</option>
            <option value="MUV">MUV</option>
          </select>

          <select
            className="form-select form-select-sm w-auto"
            value={selectedFuelType}
            onChange={(e) => {
              setSelectedFuelType(e.target.value);
              setPage(0);
            }}
          >
            <option value="">All Fuel Types</option>
            <option value="PETROL">Petrol</option>
            <option value="DIESEL">Diesel</option>
            <option value="ELECTRIC">Electric</option>
            <option value="HYBRID">Hybrid</option>
            <option value="CNG">CNG</option>
          </select>

          <select
            className="form-select form-select-sm w-auto border-primary text-primary fw-semibold"
            value={selectedSortBy}
            onChange={(e) => {
              setSelectedSortBy(e.target.value);
              setPage(0);
            }}
          >
            <option value="">Sort By: Default</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="newest">Newest Arrivals</option>
          </select>

          {(selectedBrand || selectedFuelType || selectedBodyType || quickBodyType || maxPriceRupees) && (
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={handleResetFilters}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {(quickBodyType || maxPriceLakhs) && (
        <div className="alert alert-info py-2 px-3 mb-4 rounded-3 d-flex justify-content-between align-items-center">
          <small className="fw-semibold">
            ⚡ Quick Search Applied: {quickBodyType && <span>Body: <strong>{quickBodyType}</strong></span>} {maxPriceLakhs && <span className="ms-2">Max Price: <strong>₹ {maxPriceLakhs} Lakh</strong></span>}
          </small>
          <button className="btn btn-sm btn-link text-decoration-none p-0 text-info fw-bold" onClick={handleResetFilters}>
            Clear Quick Search ✕
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5 text-muted">Loading vehicles...</div>
      ) : filteredVehicles.length === 0 ? (
        <div className="text-center py-5 bg-light rounded-3">
          <h5>No vehicles found matching filters</h5>
          <p className="text-muted mb-0">Try adjusting or clearing your quick search filters</p>
        </div>
      ) : (
        <>
          <div className="vehicle-grid">
            {filteredVehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.variantId}
                vehicle={vehicle}
                onClick={() => openVehicle(vehicle)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
              <small className="text-muted">
                Showing Page {page + 1} of {totalPages} ({totalElements} total vehicles)
              </small>

              <div className="btn-group">
                <button
                  className="btn btn-outline-primary btn-sm"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  ← Previous
                </button>
                <button
                  className="btn btn-outline-primary btn-sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default FeaturedVehicles;
