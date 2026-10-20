import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import carImage from "../assets/hero-car.png";
import { getBrands, getVehicles } from "../services/catalogService";
import { getImageUrl } from "../utils/imageUrl";
import {
  FaSearch,
  FaCar,
  FaShieldAlt,
  FaRegCheckCircle,
  FaHandshake,
  FaCalendarCheck,
  FaPercentage,
  FaMapMarkerAlt,
  FaChevronRight,
  FaStar,
  FaPhoneAlt,
  FaEnvelope,
  FaBuilding,
  FaAward,
} from "react-icons/fa";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  const [brands, setBrands] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick Filter State
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedBodyType, setSelectedBodyType] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");

  const [bodyTypeCounts, setBodyTypeCounts] = useState({ SUV: 0, SEDAN: 0, HATCHBACK: 0, MUV: 0 });

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    setLoading(true);
    try {
      const [brandData, vehicleData] = await Promise.all([
        getBrands().catch(() => []),
        getVehicles({ page: 0, size: 100 }).catch(() => ({ content: [] })),
      ]);
      setBrands(brandData || []);

      const allVehicles = vehicleData?.content || [];

      const modelBodyMap = new Map();
      const modelMap = new Map();

      allVehicles.forEach((v) => {
        const modelKey = `${v.brand}-${v.model}`;
        if (v.bodyType) {
          modelBodyMap.set(modelKey, v.bodyType.toUpperCase());
        }
        if (!modelMap.has(modelKey) || Number(v.basePrice) < Number(modelMap.get(modelKey).basePrice)) {
          modelMap.set(modelKey, v);
        }
      });

      const counts = { SUV: 0, SEDAN: 0, HATCHBACK: 0, MUV: 0 };
      modelBodyMap.forEach((bType) => {
        if (counts[bType] !== undefined) {
          counts[bType]++;
        }
      });
      setBodyTypeCounts(counts);

      setVehicles(Array.from(modelMap.values()));
    } catch (err) {
      console.error("Error loading home data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSearch = (e) => {
    e.preventDefault();
    navigate("/dashboard", {
      state: {
        brand: selectedBrand,
        bodyType: selectedBodyType,
        price: selectedPrice,
      },
    });
  };

  const createSvgPlaceholder = (title, bg = "#1e293b") => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380">
      <rect width="600" height="380" fill="${bg}"/>
      <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, sans-serif" font-size="64">🚗</text>
      <text x="50%" y="68%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, sans-serif" font-size="22" font-weight="bold" fill="#ffffff">${title}</text>
    </svg>`;
    try {
      return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
    } catch {
      return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    }
  };

  const getCarImageUrl = (v) => {
    let imgPath = v.thumbnail;
    if (!imgPath && v.model) {
      const slug = v.model.toLowerCase().replace(/\s+/g, "_");
      imgPath = `/images/models/${slug}_exterior_1.png`;
    }
    if (!imgPath) return createSvgPlaceholder(`${v.brand} ${v.model}`);
    return getImageUrl(imgPath);
  };

  const bodyTypes = [
    { name: "SUV", icon: "🚙", count: `${bodyTypeCounts.SUV || 0} ${bodyTypeCounts.SUV === 1 ? 'Model' : 'Models'}`, desc: "Spacious, powerful & all-terrain ready" },
    { name: "Sedan", icon: "🚘", count: `${bodyTypeCounts.SEDAN || 0} ${bodyTypeCounts.SEDAN === 1 ? 'Model' : 'Models'}`, desc: "Executive comfort & highway cruising" },
    { name: "Hatchback", icon: "🚗", count: `${bodyTypeCounts.HATCHBACK || 0} ${bodyTypeCounts.HATCHBACK === 1 ? 'Model' : 'Models'}`, desc: "Agile, efficient & city-smart" },
    { name: "MUV", icon: "🚐", count: `${bodyTypeCounts.MUV || 0} ${bodyTypeCounts.MUV === 1 ? 'Model' : 'Models'}`, desc: "Family-first seating & heavy haul" },
  ];

  return (
    <main className="autocart-home">
      {/* ============================================================
          1. HERO SECTION WITH QUICK FILTER WIDGET
         ============================================================ */}
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center py-5 min-vh-hero">
            {/* HERO LEFT CONTENT */}
            <div className="col-lg-6 z-2">
              <div className="hero-badge mb-3">
                <span className="badge-pulse"></span>
                <span>⚡ INDIA'S MULTI-DEALER CAR MARKETPLACE</span>
              </div>

              <h1 className="display-4 fw-extrabold text-white hero-title mb-3">
                Find Your Dream Car. <br />
                <span className="gradient-text">Direct From Verified Showrooms.</span>
              </h1>

              <p className="lead hero-subtext mb-4">
                Compare live inventory across regional dealerships, lock in exclusive bank EMI offers, and book hassle-free test drives — all with 100% price transparency.
              </p>

              {/* ACTION BUTTONS */}
              <div className="d-flex flex-wrap gap-3 mb-4">
                <Link to="/dashboard" className="btn btn-primary-gradient btn-lg px-4 py-3 fw-bold">
                  <FaCar className="me-2" /> Browse Car Catalogue
                </Link>
                <Link to="/register" className="btn btn-outline-glass btn-lg px-4 py-3 fw-bold">
                  <FaHandshake className="me-2" /> Partner as Dealer
                </Link>
              </div>

              {/* HERO QUICK SEARCH WIDGET */}
              <div className="hero-search-card p-3 p-md-4 rounded-4 shadow-lg mb-4">
                <form onSubmit={handleQuickSearch} className="row g-2">
                  <div className="col-md-3 col-6">
                    <label className="form-label text-light small fw-bold mb-1">Brand</label>
                    <select
                      className="form-select form-select-sm search-select"
                      value={selectedBrand}
                      onChange={(e) => setSelectedBrand(e.target.value)}
                    >
                      <option value="">All Brands</option>
                      {brands.map((b) => (
                        <option key={b.id} value={b.name}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-3 col-6">
                    <label className="form-label text-light small fw-bold mb-1">Body Type</label>
                    <select
                      className="form-select form-select-sm search-select"
                      value={selectedBodyType}
                      onChange={(e) => setSelectedBodyType(e.target.value)}
                    >
                      <option value="">All Body Types</option>
                      <option value="SUV">SUV</option>
                      <option value="SEDAN">Sedan</option>
                      <option value="HATCHBACK">Hatchback</option>
                      <option value="MUV">MUV</option>
                    </select>
                  </div>

                  <div className="col-md-3 col-6">
                    <label className="form-label text-light small fw-bold mb-1">Budget</label>
                    <select
                      className="form-select form-select-sm search-select"
                      value={selectedPrice}
                      onChange={(e) => setSelectedPrice(e.target.value)}
                    >
                      <option value="">Any Budget</option>
                      <option value="10">Under ₹10 Lakh</option>
                      <option value="20">₹10 - ₹20 Lakh</option>
                      <option value="30">Above ₹20 Lakh</option>
                    </select>
                  </div>

                  <div className="col-md-3 col-6 d-flex align-items-end">
                    <button type="submit" className="btn btn-accent w-100 fw-bold btn-sm py-2">
                      <FaSearch className="me-1" /> Find Cars
                    </button>
                  </div>
                </form>
              </div>

              {/* STATS HIGHLIGHT */}
              <div className="row g-3 hero-stats-grid pt-2">
                <div className="col-4">
                  <div className="stat-card">
                    <h3 className="stat-num">500+</h3>
                    <p className="stat-label">Showroom Partners</p>
                  </div>
                </div>
                <div className="col-4">
                  <div className="stat-card">
                    <h3 className="stat-num">15,000+</h3>
                    <p className="stat-label">Happy Owners</p>
                  </div>
                </div>
                <div className="col-4">
                  <div className="stat-card">
                    <h3 className="stat-num">100%</h3>
                    <p className="stat-label">Price Transparency</p>
                  </div>
                </div>
              </div>
            </div>

            {/* HERO RIGHT VISUAL */}
            <div className="col-lg-6 d-none d-lg-flex justify-content-center align-items-center position-relative">
              <div className="hero-car-wrapper">
                <div className="car-glow-aura"></div>
                <img
                  src={carImage}
                  alt="Featured AutoCart Vehicle"
                  className="hero-car-image"
                />
                <div className="car-floating-badge shadow-lg">
                  <div className="d-flex align-items-center gap-3">
                    <span className="badge-icon">⭐</span>
                    <div>
                      <h6 className="fw-bold text-dark mb-0">Certified Dealer Network</h6>
                      <small className="text-muted">Verified GST & Authorization</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          2. FEATURED BRANDS STRIP
         ============================================================ */}
      <section className="brands-strip py-4 bg-white border-bottom">
        <div className="container">
          <p className="text-center text-muted small fw-bold text-uppercase tracking-wider mb-3">
            Top Authorized Manufacturer Brands Available
          </p>
          <div className="d-flex flex-wrap justify-content-center align-items-center gap-4 gap-md-5 brand-logos">
            {brands.length > 0 ? (
              brands.map((b) => (
                <div
                  key={b.id}
                  className="brand-pill px-4 py-2 rounded-pill shadow-sm"
                  onClick={() => navigate(`/brands/${b.id}`)}
                >
                  <span className="fw-extrabold text-dark">{b.name}</span>
                </div>
              ))
            ) : (
              ["Mahindra", "Tata Motors", "Hyundai", "Toyota", "Honda", "Maruti Suzuki"].map((name, i) => (
                <div key={i} className="brand-pill px-4 py-2 rounded-pill shadow-sm">
                  <span className="fw-extrabold text-dark">{name}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ============================================================
          3. BROWSE BY BODY TYPE
         ============================================================ */}
      <section className="py-5 bg-light">
        <div className="container py-2">
          <div className="section-header text-center mb-5">
            <span className="badge bg-primary-subtle text-primary px-3 py-2 fw-bold rounded-pill mb-2">
              POPULAR CATEGORIES
            </span>
            <h2 className="fw-extrabold text-dark">Explore By Body Style</h2>
            <p className="text-secondary max-w-xl mx-auto">
              Whether you need rugged SUV road presence, sleek sedan elegance, or city hatchback efficiency.
            </p>
          </div>

          <div className="row g-4">
            {bodyTypes.map((cat, idx) => (
              <div key={idx} className="col-md-3 col-sm-6">
                <div
                  className="category-card card border-0 shadow-sm rounded-4 p-4 text-center h-100"
                  onClick={() => navigate("/dashboard", { state: { bodyType: cat.name } })}
                >
                  <div className="category-icon mb-3">{cat.icon}</div>
                  <h4 className="fw-bold text-dark mb-1">{cat.name}</h4>
                  <span className="badge bg-primary text-white mb-2">{cat.count}</span>
                  <p className="text-muted small mb-0">{cat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          4. FEATURED CARS CATALOG GRID
         ============================================================ */}
      <section className="py-5 bg-white">
        <div className="container py-3">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
            <div>
              <span className="badge bg-success-subtle text-success px-3 py-2 fw-bold rounded-pill mb-2">
                VERIFIED INVENTORY
              </span>
              <h2 className="fw-extrabold text-dark mb-0">Featured Vehicles For Sale</h2>
            </div>
            <Link to="/dashboard" className="btn btn-outline-primary fw-bold px-4 rounded-3">
              View Complete Inventory <FaChevronRight className="ms-1" />
            </Link>
          </div>

          <div className="row g-4">
            {vehicles.length > 0 ? (
              vehicles.slice(0, 6).map((v) => (
                <div key={v.variantId} className="col-lg-4 col-md-6">
                  <div className="card car-card border-0 shadow-sm rounded-4 overflow-hidden h-100">
                    <div className="car-card-img-container">
                      <img
                        src={getCarImageUrl(v)}
                        alt={`${v.brand} ${v.model}`}
                        className="car-card-img"
                      />
                      <span className="badge bg-dark text-white car-body-badge">
                        {v.fuelType || "PETROL"}
                      </span>
                    </div>

                    <div className="card-body p-4 d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <small className="text-uppercase fw-bold text-primary">{v.brand}</small>
                          <h4 className="fw-extrabold text-dark mb-0">{v.model}</h4>
                          <span className="text-muted small">{v.variant}</span>
                        </div>
                        <span className="badge bg-primary-subtle text-primary fw-bold">
                          {v.transmission || "MANUAL"}
                        </span>
                      </div>

                      <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                        <div>
                          <small className="text-muted d-block">Starting Price</small>
                          <h4 className="fw-extrabold text-success mb-0">
                            ₹ {Number(v.basePrice).toLocaleString("en-IN")}
                          </h4>
                        </div>
                        <button
                          className="btn btn-primary fw-bold px-3 py-2 rounded-3"
                          onClick={() => navigate(`/models/${v.modelId || v.variantId}`)}
                        >
                          Explore <FaChevronRight className="ms-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Fallback curated cards if backend loading
              [
                { brand: "Mahindra", model: "Thar", variant: "LX Hardtop 4x4", price: 1450000, fuel: "DIESEL", trans: "AUTOMATIC" },
                { brand: "Tata Motors", model: "Harrier", variant: "Fearless Dark Edition", price: 2190000, fuel: "DIESEL", trans: "AUTOMATIC" },
                { brand: "Hyundai", model: "Creta", variant: "SX (O) Turbo DCT", price: 1980000, fuel: "PETROL", trans: "AUTOMATIC" },
              ].map((car, idx) => (
                <div key={idx} className="col-lg-4 col-md-6">
                  <div className="card car-card border-0 shadow-sm rounded-4 overflow-hidden h-100">
                    <div className="car-card-img-container">
                      <img
                        src={createSvgPlaceholder(`${car.brand} ${car.model}`, "#0f172a")}
                        alt={car.model}
                        className="car-card-img"
                      />
                      <span className="badge bg-dark text-white car-body-badge">{car.fuel}</span>
                    </div>

                    <div className="card-body p-4 d-flex flex-column">
                      <small className="text-uppercase fw-bold text-primary">{car.brand}</small>
                      <h4 className="fw-extrabold text-dark mb-0">{car.model}</h4>
                      <span className="text-muted small mb-3">{car.variant}</span>

                      <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                        <div>
                          <small className="text-muted d-block">Ex-Showroom Price</small>
                          <h4 className="fw-extrabold text-success mb-0">
                            ₹ {(car.price / 100000).toFixed(2)} Lakh
                          </h4>
                        </div>
                        <Link to="/dashboard" className="btn btn-primary fw-bold px-3 py-2 rounded-3">
                          Explore →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ============================================================
          5. HOW IT WORKS SECTION (4 STEPS)
         ============================================================ */}
      <section className="py-5 bg-light border-top">
        <div className="container py-3">
          <div className="text-center max-w-2xl mx-auto mb-5">
            <span className="badge bg-primary-subtle text-primary px-3 py-2 fw-bold rounded-pill mb-2">
              SIMPLE 4-STEP PROCESS
            </span>
            <h2 className="fw-extrabold text-dark">How AutoCart Works For Buyers</h2>
            <p className="text-muted">
              From discovering regional dealership stock to taking delivery — transparent and seamless.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-md-3 col-sm-6">
              <div className="step-card p-4 rounded-4 bg-white border text-center h-100 shadow-sm">
                <div className="step-num-badge">1</div>
                <h5 className="fw-bold text-dark mt-3">Search & Compare</h5>
                <p className="text-muted small mb-0">
                  Filter verified cars across authorized dealers by specs, price, and offers.
                </p>
              </div>
            </div>

            <div className="col-md-3 col-sm-6">
              <div className="step-card p-4 rounded-4 bg-white border text-center h-100 shadow-sm">
                <div className="step-num-badge">2</div>
                <h5 className="fw-bold text-dark mt-3">Book Test Drive</h5>
                <p className="text-muted small mb-0">
                  Select your preferred date and time slot for showroom or home test drive.
                </p>
              </div>
            </div>

            <div className="col-md-3 col-sm-6">
              <div className="step-card p-4 rounded-4 bg-white border text-center h-100 shadow-sm">
                <div className="step-num-badge">3</div>
                <h5 className="fw-bold text-dark mt-3">Lock EMI & Discount</h5>
                <p className="text-muted small mb-0">
                  Choose bank partner financing with pre-approved loans & festive offers.
                </p>
              </div>
            </div>

            <div className="col-md-3 col-sm-6">
              <div className="step-card p-4 rounded-4 bg-white border text-center h-100 shadow-sm">
                <div className="step-num-badge">4</div>
                <h5 className="fw-bold text-dark mt-3">Drive Away Happy</h5>
                <p className="text-muted small mb-0">
                  Complete documentation and collect key delivery from your local showroom.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          6. TRUST SIGNALS & WHY AUTOCART
         ============================================================ */}
      <section className="py-5 bg-dark text-white position-relative overflow-hidden">
        <div className="container py-4">
          <div className="row align-items-center g-5">
            <div className="col-lg-5">
              <span className="badge bg-primary px-3 py-2 fw-bold rounded-pill mb-3">
                TRUST & CREDIBILITY
              </span>
              <h2 className="display-6 fw-extrabold text-white mb-4">
                Why Thousands Choose AutoCart Marketplace
              </h2>
              <p className="text-light opacity-88 mb-4">
                We eliminate hidden fees and aggressive showroom markups by bringing verified multi-dealer inventory directly to your screen.
              </p>

              <div className="d-flex flex-column gap-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="trust-icon-box"><FaShieldAlt /></div>
                  <div>
                    <h6 className="fw-bold text-white mb-0">100% Verified Dealer Listings</h6>
                    <small className="text-light opacity-75">Every dealer undergoes strict GST and trade license audits.</small>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-3">
                  <div className="trust-icon-box"><FaPercentage /></div>
                  <div>
                    <h6 className="fw-bold text-white mb-0">Guaranteed Showroom Discounts</h6>
                    <small className="text-light opacity-75">Access exclusive festive offers and flat price reductions.</small>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-3">
                  <div className="trust-icon-box"><FaAward /></div>
                  <div>
                    <h6 className="fw-bold text-white mb-0">Instant Bank Partner Finance</h6>
                    <small className="text-light opacity-75">Hassle-free EMI calculators and instant eligibility checks.</small>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-7">
              <div className="row g-4">
                <div className="col-sm-6">
                  <div className="testimonial-card p-4 rounded-4 bg-slate-800 border border-slate-700">
                    <div className="d-flex text-warning mb-2">
                      <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                    </div>
                    <p className="text-light small mb-3">
                      "AutoCart made comparing Mahindra Thar variants across Pune dealerships effortless. Booked my test drive online and picked up my car within 4 days!"
                    </p>
                    <div className="fw-bold text-white">Rahul Deshmukh</div>
                    <small className="text-muted">Verified Car Buyer, Pune</small>
                  </div>
                </div>

                <div className="col-sm-6">
                  <div className="testimonial-card p-4 rounded-4 bg-slate-800 border border-slate-700">
                    <div className="d-flex text-warning mb-2">
                      <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                    </div>
                    <p className="text-light small mb-3">
                      "As an authorized dealer, AutoCart gives us direct access to serious car buyers. Managing inventory and test drive slots is smooth and transparent."
                    </p>
                    <div className="fw-bold text-white">B U Bhandari Showroom</div>
                    <small className="text-muted">Authorized Dealer Partner</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          7. EXECUTIVE FOOTER
         ============================================================ */}
      <footer className="autocart-footer bg-black text-light pt-5 pb-4">
        <div className="container">
          <div className="row g-4 mb-5">
            {/* BRAND COL */}
            <div className="col-lg-4 col-md-6">
              <h3 className="fw-extrabold text-white mb-3">
                Auto<span className="text-primary">Cart</span>
              </h3>
              <p className="text-secondary small max-w-sm mb-4">
                India's premier multi-dealer automotive marketplace. Connecting car buyers with verified regional dealerships, bank financing, and seamless test drive bookings.
              </p>
              <div className="d-flex gap-3 text-secondary">
                <span>📍 Pune & Mumbai, MH</span>
                <span>📞 1800-AUTOCART</span>
              </div>
            </div>

            {/* POPULAR BRANDS */}
            <div className="col-lg-2 col-md-6 col-6">
              <h6 className="fw-bold text-white uppercase tracking-wider mb-3">Top Brands</h6>
              <ul className="list-unstyled footer-links small">
                <li><Link to="/dashboard">Mahindra Cars</Link></li>
                <li><Link to="/dashboard">Tata Motors</Link></li>
                <li><Link to="/dashboard">Hyundai Motors</Link></li>
                <li><Link to="/dashboard">Toyota SUV</Link></li>
                <li><Link to="/dashboard">Honda Cars</Link></li>
              </ul>
            </div>

            {/* QUICK LINKS */}
            <div className="col-lg-3 col-md-6 col-6">
              <h6 className="fw-bold text-white uppercase tracking-wider mb-3">Quick Navigation</h6>
              <ul className="list-unstyled footer-links small">
                <li><Link to="/dashboard">Car Catalogue</Link></li>
                <li><Link to="/login">Dealer Portal Login</Link></li>
                <li><Link to="/register">Register Showroom</Link></li>
                <li><Link to="/my-test-drives">My Test Drives</Link></li>
                <li><Link to="/my-orders">My Purchase Orders</Link></li>
              </ul>
            </div>

            {/* SUPPORT & LEGAL */}
            <div className="col-lg-3 col-md-6">
              <h6 className="fw-bold text-white uppercase tracking-wider mb-3">Customer Care</h6>
              <p className="text-secondary small mb-3">
                Need assistance with vehicle specs or dealer inquiries? Our team is available 24/7.
              </p>
              <Link to="/register" className="btn btn-outline-light btn-sm fw-bold px-4">
                Become a Dealer Partner
              </Link>
            </div>
          </div>

          <div className="border-top border-secondary-subtle pt-4 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
            <small className="text-secondary">
              © {new Date().getFullYear()} AutoCart Marketplace Inc. All rights reserved.
            </small>
            <div className="d-flex gap-4 small text-secondary">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Dealer Guidelines</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default Home;
