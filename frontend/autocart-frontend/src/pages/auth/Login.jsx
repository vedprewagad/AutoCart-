import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/slices/authSlice";
import { loginUser, getCurrentUser, forgotPassword } from "../../services/authService";
import { FaCar, FaUserShield, FaLock, FaEnvelope } from "react-icons/fa";
import "./Auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotError, setForgotError] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotMessage("");
    setForgotLoading(true);

    try {
      const msg = await forgotPassword(forgotEmail);
      setForgotMessage(msg || "Password reset instructions have been sent to your email.");
    } catch (err) {
      setForgotError(err.message || "Failed to request password reset.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginUser(email, password);

      if (data && data.email) {
        // Dispatch user + token together so businessApi interceptor can use it
        dispatch(
          setUser({
            id: data.id,
            dealerId: data.dealerId,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            role: data.role,
            status: data.status,
            token: data.token,
          })
        );
      } else {
        // Fallback: fetch from /auth/me (also returns token since backend fix)
        const user = await getCurrentUser();
        dispatch(setUser(user));
      }

      const destination = location.state?.from || "/dashboard";
      const checkoutState = location.state?.checkoutState;
      if (destination === "/payment" && checkoutState) {
        navigate("/payment", { state: checkoutState, replace: true });
      } else {
        navigate(destination, { replace: true });
      }
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="container">
        <div className="row align-items-center justify-content-between g-4">
          {/* LEFT SIDE INTRO */}
          <div className="col-lg-6 auth-intro">
            <span className="badge bg-primary px-3 py-2 mb-3 shadow-sm rounded-pill">
              Welcome to AutoCart
            </span>

            <h1 className="auth-brand-title text-white">
              Drive Your Journey
              <span className="text-primary d-block">With Confidence.</span>
            </h1>

            <p className="auth-intro-text lead mt-3">
              Single secure access point for Customers, Dealers, and Admins. Sign in to continue to your customized dashboard.
            </p>

            <div className="auth-features mt-4">
              <div className="auth-feature">
                <div className="auth-feature-icon">
                  <FaCar />
                </div>
                <span>Browse multi-brand vehicles & inventory</span>
              </div>

              <div className="auth-feature">
                <div className="auth-feature-icon">
                  <FaUserShield />
                </div>
                <span>Book test drives & get instant price quotes</span>
              </div>

              <div className="auth-feature">
                <div className="auth-feature-icon">⚡</div>
                <span>Track purchase enquiries & order status in real time</span>
              </div>
            </div>
          </div>

          {/* LOGIN CARD */}
          <div className="col-lg-5">
            <div className="auth-card shadow-lg">
              <div className="mb-4">
                <h2>Welcome Back</h2>
                <p className="auth-subtitle mb-0">
                  Enter your credentials to sign in to AutoCart
                </p>
              </div>

              {error && (
                <div
                  className={`alert ${
                    error.toLowerCase().includes("pending")
                      ? "alert-warning border-2 border-warning"
                      : "alert-danger"
                  } py-3 px-3 rounded-3 mb-4`}
                  role="alert"
                >
                  {error.toLowerCase().includes("pending") ? (
                    <div>
                      <h6 className="fw-bold mb-1 text-dark">⏳ Dealer Registration Pending Admin Approval</h6>
                      <small className="d-block text-dark opacity-88">
                        Your dealer showroom application has been submitted and is currently under review by our central Admin team. You will be able to sign in once an admin approves your application.
                      </small>
                    </div>
                  ) : (
                    <small>{error}</small>
                  )}
                </div>
              )}

              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <label className="form-label">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-transparent border-end-0">
                      <FaEnvelope className="text-muted" />
                    </span>
                    <input
                      type="email"
                      className="form-control border-start-0 ps-0"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label mb-0">Password</label>
                    <button
                      type="button"
                      className="btn btn-link p-0 text-decoration-none small text-primary fw-semibold"
                      onClick={() => {
                        setForgotEmail(email || "");
                        setForgotMessage("");
                        setForgotError("");
                        setShowForgotModal(true);
                      }}
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="input-group">
                    <span className="input-group-text bg-transparent border-end-0">
                      <FaLock className="text-muted" />
                    </span>
                    <input
                      type="password"
                      className="form-control border-start-0 ps-0"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 auth-submit-btn shadow-sm"
                  disabled={loading}
                >
                  {loading ? "Signing In..." : "Sign In"}
                </button>
              </form>

              <div className="text-center mt-4">
                <span className="text-muted">Don't have an account? </span>
                <Link to="/register" className="fw-semibold text-decoration-none ms-1">
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 p-3">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-dark">🔑 Reset Password</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowForgotModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p className="text-muted small mb-3">
                  Enter your registered email address and we'll send you an email with a secure link to reset your password.
                </p>

                {forgotError && <div className="alert alert-danger py-2 small mb-3">{forgotError}</div>}
                {forgotMessage && <div className="alert alert-success py-2 small mb-3">{forgotMessage}</div>}

                <form onSubmit={handleForgotPassword}>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Registered Email Address</label>
                    <div className="input-group">
                      <span className="input-group-text bg-transparent border-end-0">
                        <FaEnvelope className="text-muted" />
                      </span>
                      <input
                        type="email"
                        className="form-control border-start-0 ps-0"
                        placeholder="name@example.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="d-flex justify-content-end gap-2 mt-4">
                    <button
                      type="button"
                      className="btn btn-light fw-semibold"
                      onClick={() => setShowForgotModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary fw-semibold px-4"
                      disabled={forgotLoading}
                    >
                      {forgotLoading ? "Sending Link..." : "Send Reset Link"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Login;
