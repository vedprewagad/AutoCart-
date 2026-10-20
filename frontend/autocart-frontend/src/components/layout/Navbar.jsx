import "./Navbar.css";

import { Link, NavLink, useLocation } from "react-router-dom";

import { useRef, useEffect, useState } from "react";

import { useSelector, useDispatch } from "react-redux";

import { useNavigate } from "react-router-dom";

import { logout } from "../../redux/slices/authSlice";

import { logoutUser } from "../../services/authService";

import SearchSuggestions from "../dashboard/SearchSuggestions";

import {
  FaCarSide,
  FaSearch,
  FaUserCircle,
  FaUserEdit,
  FaSignOutAlt,
  FaLock,
  FaCalendarAlt,
  FaReceipt,
  FaBars,
  FaTimes,
} from "react-icons/fa";

const Navbar = ({ searchTerm, setSearchTerm }) => {
  const { user } = useSelector((state) => state.auth);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const searchRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isDashboard = location.pathname === "/dashboard";

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout request error:", error);
    } finally {
      dispatch(logout());
      navigate("/");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="autocart-navbar">
      <div className="autocart-navbar-container">
        {/* Logo */}
        <Link to="/" className="logo">
          <FaCarSide />
          <span>AutoCart</span>
        </Link>

        {/* Search */}
        <div className="search-wrapper" ref={searchRef}>
          <div className="search-box">
            <FaSearch className="search-icon" />

            <input
              type="text"
              placeholder="Search cars, brands, models..."
              value={searchTerm}
              onFocus={() => setShowSuggestions(true)}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {showSuggestions && searchTerm.trim() !== "" && (
            <SearchSuggestions searchTerm={searchTerm} />
          )}
        </div>

        {/* Menu - Show Home only when user is logged in */}
        {user && (
          <div className="menu">
            <NavLink to="/dashboard">Home</NavLink>
          </div>
        )}

        {/* Right Side */}
        <div className="nav-right">
          {!user ? (
            <>
              <Link to="/login" className="nav-btn">
                Login
              </Link>

              <Link to="/register" className="register-btn">
                Register
              </Link>
            </>
          ) : (
            <div className="dropdown">
              <button
                className="profile dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <FaUserCircle />

                <div className="profile-info">
                  <span className="welcome">Hi,</span>
                  <span className="username">
                    {user.firstName}
                    {user.role && (
                      <span className="badge bg-primary-subtle text-primary ms-1 px-1.5 py-0.5 rounded-pill style-role-badge">
                        {user.role === "SUPER_ADMIN" || user.role === "ADMIN"
                          ? "Admin"
                          : user.role === "DEALER"
                          ? "Dealer"
                          : "Customer"}
                      </span>
                    )}
                  </span>
                </div>
              </button>

              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <Link className="dropdown-item" to="/profile">
                    <FaUserEdit className="me-2" />
                    My Profile
                  </Link>
                </li>

                {user.role === "CUSTOMER" && (
                  <>
                    <li>
                      <Link className="dropdown-item" to="/my-test-drives">
                        <FaCalendarAlt className="me-2 text-primary" />
                        My Test Drives
                      </Link>
                    </li>

                    <li>
                      <Link className="dropdown-item" to="/my-orders">
                        <FaReceipt className="me-2 text-primary" />
                        My Enquiries & Orders
                      </Link>
                    </li>
                  </>
                )}

                <li>
                  <Link className="dropdown-item" to="/profile/change-password">
                    <FaLock className="me-2" />
                    Change Password
                  </Link>
                </li>

                <li>
                  <hr className="dropdown-divider" />
                </li>

                <li>
                  <button
                    className="dropdown-item logout-btn"
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt className="me-2" />
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          )}

          {/* Hamburger toggle button for mobile */}
          <button
            className="mobile-toggle-btn d-md-none border-0 bg-transparent text-dark fs-4 ms-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-drawer p-3 bg-white border-top shadow-sm d-md-none">
          <div className="search-box mb-3">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search cars, brands, models..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
            />
          </div>
          <div className="d-flex flex-column gap-2">
            {user ? (
              <>
                <NavLink
                  to="/dashboard"
                  className="py-2 px-3 fw-bold text-dark text-decoration-none rounded-2 bg-light"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Explore Vehicles
                </NavLink>
                <Link
                  to="/profile"
                  className="py-2 px-3 text-secondary text-decoration-none fw-semibold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FaUserEdit className="me-2" /> My Profile
                </Link>
                {user.role === "CUSTOMER" && (
                  <>
                    <Link
                      to="/my-test-drives"
                      className="py-2 px-3 text-secondary text-decoration-none fw-semibold"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <FaCalendarAlt className="me-2 text-primary" /> My Test Drives
                    </Link>
                    <Link
                      to="/my-orders"
                      className="py-2 px-3 text-secondary text-decoration-none fw-semibold"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <FaReceipt className="me-2 text-primary" /> My Enquiries & Orders
                    </Link>
                  </>
                )}
                <button
                  className="btn btn-outline-danger btn-sm text-start py-2 px-3 fw-bold mt-2"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                >
                  <FaSignOutAlt className="me-2" /> Logout
                </button>
              </>
            ) : (
              <div className="d-flex gap-2 mt-2">
                <Link
                  to="/login"
                  className="btn btn-outline-primary w-50 fw-bold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary w-50 fw-bold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
