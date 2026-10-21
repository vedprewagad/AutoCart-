import { useEffect, useState } from "react";

import { getBrands, getVehicles } from "../../services/catalogService";

import { useNavigate } from "react-router-dom";

import BrandCard from "../cards/BrandCard";

import VehicleCard from "../cards/VehicleCard";

function SearchResults({ searchTerm }) {
  const [brands, setBrands] = useState([]);

  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [brandData, vehicleData] = await Promise.all([
        getBrands(),
        getVehicles(),
      ]);

      setBrands(brandData);

      setVehicles(vehicleData.content);
    } catch (err) {
      console.error("Error loading search results:", err);
    }
  };

  const keyword = searchTerm.trim().toLowerCase();

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(keyword),
  );

  const filteredVehicles = (vehicles || []).filter(
    (vehicle) =>
      vehicle.brand?.toLowerCase().includes(keyword) ||
      vehicle.model?.toLowerCase().includes(keyword) ||
      vehicle.variant?.toLowerCase().includes(keyword) ||
      vehicle.fuelType?.toLowerCase().includes(keyword) ||
      vehicle.transmission?.toLowerCase().includes(keyword),
  );
  const navigate = useNavigate();

  const openBrand = (brandId) => {
    navigate(`/brands/${brandId}`);
  };

  const openVehicle = (variantId) => {
    const matched = filteredVehicles.find((v) => v.variantId === variantId);
    const modelId = matched?.modelId || variantId;
    navigate(`/models/${modelId}`);
  };

  return (
    <section className="container py-5">
      <h2 className="fw-bold mb-2">🔍 Search Results</h2>

      <p className="text-muted mb-5">
        Showing results for "<strong>{searchTerm}</strong>"
      </p>

      {filteredBrands.length === 0 && filteredVehicles.length === 0 && (
        <div className="text-center py-5">
          <h4>No results found</h4>

          <p className="text-muted">Try another keyword.</p>
        </div>
      )}

      {filteredBrands.length > 0 && (
        <>
          <div className="section-header mb-4">
            <h3>Brands</h3>
          </div>

          <div className="brand-grid">
            {filteredBrands.map((brand) => (
              <BrandCard key={brand.id} brand={brand} onClick={openBrand} />
            ))}
          </div>
        </>
      )}

      {filteredVehicles.length > 0 && (
        <>
          <div className="section-header mt-5 mb-4">
            <h3>Vehicles</h3>
          </div>

          <div className="vehicle-grid">
            {filteredVehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.variantId}
                vehicle={vehicle}
                onClick={openVehicle}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export default SearchResults;
