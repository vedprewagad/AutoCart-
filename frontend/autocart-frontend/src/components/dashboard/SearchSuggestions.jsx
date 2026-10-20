import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getBrands, getVehicles } from "../../services/catalogService";

import "./SearchSuggestions.css";
import useDebounce from "../../hooks/useDebounce";

function SearchSuggestions({ searchTerm }) {
  const [brands, setBrands] = useState([]);

  const [vehicles, setVehicles] = useState([]);

  const navigate = useNavigate();

  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [brandData, vehicleData] = await Promise.all([
      getBrands(),
      getVehicles(),
    ]);

    setBrands(brandData);

    setVehicles(vehicleData.content);
  };

  const keyword = debouncedSearch.trim().toLowerCase();

  const brandSuggestions = brands.filter((brand) =>
    brand.name.toLowerCase().includes(keyword),
  );

  const vehicleSuggestions = vehicles.filter(
    (vehicle) =>
      vehicle.brand.toLowerCase().includes(keyword) ||
      vehicle.model.toLowerCase().includes(keyword) ||
      vehicle.variant.toLowerCase().includes(keyword),
  );

  const suggestions = [
    ...brandSuggestions.map((brand) => ({
      type: "brand",
      data: brand,
    })),

    ...vehicleSuggestions.map((vehicle) => ({
      type: "vehicle",
      data: vehicle,
    })),
  ];

  if (debouncedSearch.trim() === "") {
    return null;
  }

  return (
    <div className="search-dropdown">
      {brandSuggestions.map((brand) => (
        <div
          key={brand.id}
          className="search-item"
          onClick={() => navigate(`/brands/${brand.id}`)}
        >
          🏢 {brand.name}
        </div>
      ))}

      {vehicleSuggestions.map((vehicle) => (
        <div
          key={vehicle.variantId}
          className="search-item"
          onClick={() => navigate(vehicle.modelId ? `/models/${vehicle.modelId}` : `/vehicles/${vehicle.variantId}`)}
        >
          🚗 {vehicle.brand} {vehicle.model}
          <small className="ms-2 text-muted">{vehicle.variant}</small>
        </div>
      ))}
    </div>
  );
}

export default SearchSuggestions;
