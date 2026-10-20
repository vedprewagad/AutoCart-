import { useSelector } from "react-redux";

import CustomerDashboard from "./customer/CustomerDashboard";
import DealerDashboard from "./dealer/DealerDashboard";
import AdminDashboard from "./admin/AdminDashboard";

function Dashboard({ searchTerm }) {
  const { user, loading } = useSelector((state) => state.auth);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "60vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <CustomerDashboard searchTerm={searchTerm} />;
  }

  switch (user.role) {
    case "CUSTOMER":
      return <CustomerDashboard searchTerm={searchTerm} />;

    case "DEALER":
      return <DealerDashboard />;

    case "ADMIN":
    case "SUPER_ADMIN":
      return <AdminDashboard />;

    default:
      return <CustomerDashboard searchTerm={searchTerm} />;
  }
}

export default Dashboard;
