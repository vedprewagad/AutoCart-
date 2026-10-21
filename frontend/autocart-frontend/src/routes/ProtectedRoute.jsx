import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation();
  const { user, loading } = useSelector((state) => state.auth);

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{
          from: location.pathname,
          checkoutState: location.state
        }}
        replace
      />
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Dealer accounts awaiting admin approval cannot access the app
  if (user.role === "DEALER" && user.status && user.status !== "APPROVED" && user.status !== "ACTIVE") {
    return (
      <div
        className="d-flex flex-column justify-content-center align-items-center"
        style={{ height: "100vh", background: "var(--bg-dark, #0f172a)", color: "#fff" }}
      >
        <div className="text-center p-5" style={{ maxWidth: 480 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>⏳</div>
          <h2 className="fw-bold mb-3">Awaiting Admin Approval</h2>
          <p className="text-muted mb-4">
            Your dealer account has been submitted and is currently under
            review. You'll be able to log in once an admin approves your
            application. Please check back later.
          </p>
          <span
            className="badge px-3 py-2"
            style={{ background: "#f59e0b", color: "#000", fontSize: "0.85rem" }}
          >
            Status: {user.status}
          </span>
        </div>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;
