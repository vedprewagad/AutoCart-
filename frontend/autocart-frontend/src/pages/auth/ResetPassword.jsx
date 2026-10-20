import React, { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { resetPassword } from "../../services/authService";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("Invalid password reset link. Token is missing.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(token, newPassword);
      setMessage(res || "Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
      <div className="card border-0 shadow-lg rounded-4 p-4 p-md-5 bg-white" style={{ maxWidth: "480px", width: "100%" }}>
        <div className="text-center mb-4">
          <div className="fs-1 mb-2">🔑</div>
          <h3 className="fw-bold text-dark mb-1">Reset Your Password</h3>
          <p className="text-muted small">Enter a new secure password for your AutoCart account.</p>
        </div>

        {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}
        {message && <div className="alert alert-success py-2 small mb-3">{message}</div>}

        {!token ? (
          <div className="text-center py-3">
            <p className="text-danger small mb-3">Invalid or missing reset token in URL.</p>
            <Link to="/login" className="btn btn-primary btn-sm fw-bold">Return to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold text-dark">New Password</label>
              <input
                type="password"
                className="form-control form-control-lg rounded-3 fs-6"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold text-dark">Confirm New Password</label>
              <input
                type="password"
                className="form-control form-control-lg rounded-3 fs-6"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-100 fw-bold rounded-3" disabled={loading}>
              {loading ? "Resetting Password..." : "Reset Password"}
            </button>
          </form>
        )}

        <div className="text-center mt-4">
          <Link to="/login" className="text-decoration-none small text-secondary">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
