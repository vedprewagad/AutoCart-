import { useEffect, useState } from "react";
import { getCurrentUser, updateProfile } from "../../services/authService";
import { FaUserCircle } from "react-icons/fa";

function Profile() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    city: "",
    state: "",
    role: "",
    showroomName: "",
    address: "",
    pinCode: "",
    contactPhone: "",
    workingHours: "",
    gstNumber: "",
    licenseNumber: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getCurrentUser();

      setFormData({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        mobile: data.mobile || "",
        city: data.city || "",
        state: data.state || "",
        role: data.role || "",
        showroomName: data.showroomName || "",
        address: data.address || "",
        pinCode: data.pinCode || "",
        contactPhone: data.contactPhone || "",
        workingHours: data.workingHours || "",
        gstNumber: data.gstNumber || "",
        licenseNumber: data.licenseNumber || "",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const [success, setSuccess] = useState("");

  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSuccess("");

    setError("");

    try {
      const updated = await updateProfile(formData);

      setFormData((prev) => ({
        ...prev,
        ...updated,
      }));

      setSuccess("Profile updated successfully.");
    } catch (err) {
      setError("Failed to update profile.");

      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body p-5">
              {success && <div className="alert alert-success">{success}</div>}
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="text-center mb-4">
                <i
                  className="bi bi-person-circle"
                  style={{ fontSize: "70px", color: "#2563eb" }}
                ></i>
                <FaUserCircle size={70} color="#2563eb" />

                <h2 className="fw-bold mt-3">My Profile</h2>

                <p className="text-muted">Manage your personal information</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">First Name</label>

                    <input
                      type="text"
                      className="form-control"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Last Name</label>

                    <input
                      type="text"
                      className="form-control"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Email</label>

                  <input
                    type="email"
                    className="form-control bg-light"
                    value={formData.email}
                    readOnly
                  />

                  <small className="text-muted">Email cannot be changed.</small>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Mobile</label>

                    <input
                      type="text"
                      className="form-control"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">City</label>

                    <input
                      type="text"
                      className="form-control"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label">State</label>

                  <input
                    type="text"
                    className="form-control"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                  />
                </div>

                {formData.role === "DEALER" && (
                  <>
                    <hr className="my-4" />
                    <h5 className="fw-bold mb-3 text-primary">Dealership Information</h5>

                    <div className="mb-3">
                      <label className="form-label">Showroom Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="showroomName"
                        value={formData.showroomName}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Showroom Address</label>
                      <input
                        type="text"
                        className="form-control"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Pincode</label>
                        <input
                          type="text"
                          className="form-control"
                          name="pinCode"
                          value={formData.pinCode}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="col-md-4 mb-3">
                        <label className="form-label">Contact Phone</label>
                        <input
                          type="text"
                          className="form-control"
                          name="contactPhone"
                          value={formData.contactPhone}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="col-md-4 mb-3">
                        <label className="form-label">Working Hours</label>
                        <input
                          type="text"
                          className="form-control"
                          name="workingHours"
                          value={formData.workingHours}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="row mb-4">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">GST Number</label>
                        <input
                          type="text"
                          className="form-control bg-light"
                          value={formData.gstNumber}
                          readOnly
                        />
                        <small className="text-muted">GST number cannot be changed.</small>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label">License Number</label>
                        <input
                          type="text"
                          className="form-control bg-light"
                          value={formData.licenseNumber}
                          readOnly
                        />
                        <small className="text-muted">License number cannot be changed.</small>
                      </div>
                    </div>
                  </>
                )}

                <div className="text-center">
                  <button type="submit" className="btn btn-primary px-5 py-2">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
