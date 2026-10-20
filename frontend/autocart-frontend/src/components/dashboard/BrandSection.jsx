import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getBrands } from "../../services/catalogService";

import BrandCard from "../cards/BrandCard";

import "./BrandSection.css";

function BrandSection() {
  const [brands, setBrands] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    try {
      const data = await getBrands();

      setBrands(data);
    } catch (err) {
      console.error("Error loading brands:", err);
    }
  };

  const openBrand = (brandId) => {
    navigate(`/brands/${brandId}`);
  };

  return (
    <section className="brand-section">
      <div className="section-header">
        <h2>Top Brands</h2>

        <span>View All</span>
      </div>

      <div className="brand-grid">
        {brands.map((brand) => (
          <BrandCard key={brand.id} brand={brand} onClick={openBrand} />
        ))}
      </div>
    </section>
  );
}

export default BrandSection;
