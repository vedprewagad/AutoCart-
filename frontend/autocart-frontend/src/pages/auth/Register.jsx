import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { registerUser } from "../../services/authService";
import { getBrands } from "../../services/catalogService";

import "./Auth.css";

function Register() {
  const navigate = useNavigate();

  const [brandList, setBrandList] = useState([]);

  const [formData, setFormData] = useState({
    role: "CUSTOMER",

    firstName: "",
    lastName: "",

    email: "",

    password: "",
    confirmPassword: "",

    mobile: "",

    city: "",
    state: "",

    showroomName: "",
    gstNumber: "",
    licenseNumber: "",
    address: "",
    pinCode: "",
    contactPhone: "",
    workingHours: "",
    brandId: "",
    docUrl: "",
  });
  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [loading, setLoading] = useState(false);

  const [openingTime, setOpeningTime] = useState("");

  const [closingTime, setClosingTime] = useState("");

  useEffect(() => {
    getBrands().then((data) => setBrandList(data || [])).catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,

      [name]: value,
    }));
  };

  const generateTimeOptions = () => {
    const options = [];

    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const date = new Date();
        date.setHours(hour, minute, 0, 0);

        options.push({
          value: `${hour.toString().padStart(2, "0")}:${minute
            .toString()
            .padStart(2, "0")}`,
          label: date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
        });
      }
    }

    return options;
  };

  const timeOptions = generateTimeOptions();

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");

      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");

      return;
    }

    const mobilePattern = /^[6-9]\d{9}$/;
    if (!mobilePattern.test(formData.mobile.trim())) {
      setError("Mobile number must be a valid 10-digit Indian number starting with 6-9");
      return;
    }

    if (formData.role === "DEALER") {
      if (!formData.showroomName.trim()) {
        setError("Showroom name is required");

        return;
      }

      if (formData.gstNumber.trim().length !== 15) {
        setError("GST number must be exactly 15 characters");

        return;
      }

      const licenseLength = formData.licenseNumber.trim().length;

      if (licenseLength < 9 || licenseLength > 11) {
        setError("License number must be between 9 and 11 characters");

        return;
      }

      if (!formData.address.trim()) {
        setError("Address is required");
        return;
      }

      if (!formData.pinCode.trim()) {
        setError("Pin Code is required");
        return;
      }

      if (!formData.contactPhone.trim()) {
        setError("Contact Phone is required");
        return;
      }

      if (!openingTime || !closingTime) {
        setError("Please select both opening and closing times.");
        return;
      }

      if (openingTime >= closingTime) {
        setError("Closing time must be after opening time.");
        return;
      }
    }

    setLoading(true);

    try {
      const registrationData = {
        firstName: formData.firstName.trim(),

        lastName: formData.lastName.trim(),

        email: formData.email.trim(),

        password: formData.password,

        mobile: formData.mobile.trim(),

        city: formData.city.trim(),

        state: formData.state.trim(),

        role: formData.role,
      };

      if (formData.role === "DEALER") {
        registrationData.showroomName = formData.showroomName.trim();

        registrationData.gstNumber = formData.gstNumber.trim().toUpperCase();

        registrationData.licenseNumber = formData.licenseNumber
          .trim()
          .toUpperCase();

        registrationData.address = formData.address.trim();

        registrationData.pinCode = formData.pinCode.trim();

        registrationData.contactPhone = formData.contactPhone.trim();

        const openingLabel = timeOptions.find(
          (t) => t.value === openingTime,
        )?.label;

        const closingLabel = timeOptions.find(
          (t) => t.value === closingTime,
        )?.label;

        registrationData.workingHours = `${openingLabel} - ${closingLabel}`;
      }

      await registerUser(registrationData);

      if (formData.role === "DEALER") {
        setSuccess(
          "Dealer account submitted! Your application is pending admin approval before you can log in."
        );
      } else {
        setSuccess("Registration successful. Redirecting to login...");
      }

      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="container py-3">
        <div className="auth-card register-card">
          {/* HEADER */}

          <div className="text-center mb-4">
            <span className="badge bg-primary mb-3">Join AutoCart</span>

            <h2>Create Your Account</h2>

            <p className="auth-subtitle">
              Get started with AutoCart in just a few steps
            </p>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success" role="alert">
              {success}
            </div>
          )}

          <form onSubmit={handleRegister}>
            {/* ACCOUNT TYPE */}

            <div className="form-section-title">Account Type</div>

            <div className="mb-4">
              <label className="form-label">Register As</label>

              <select
                className="form-select"
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="CUSTOMER">Customer</option>
                <option value="DEALER">Dealer</option>
              </select>
            </div>

            <hr className="form-section-divider" />

            {/* BASIC INFORMATION */}

            <div className="form-section-title">Basic Information</div>

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">First Name</label>

                <input
                  type="text"
                  className="form-control"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Last Name</label>

                <input
                  type="text"
                  className="form-control"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Email Address</label>

                <input
                  type="email"
                  className="form-control"
                  name="email"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Mobile Number</label>

                <input
                  type="tel"
                  className="form-control"
                  name="mobile"
                  placeholder="Enter Mobile number"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">City</label>

                <input
                  type="text"
                  className="form-control"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">State</label>

                <input
                  type="text"
                  className="form-control"
                  name="state"
                  placeholder="State"
                  value={formData.state}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* DEALER INFORMATION */}

            {formData.role === "DEALER" && (
              <>
                <hr className="form-section-divider" />

                <div className="form-section-title">Dealer Information</div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Authorized Car Brand</label>
                    <select
                      className="form-select"
                      name="brandId"
                      value={formData.brandId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Choose Brand (e.g. Tata Motors) --</option>
                      {brandList.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Showroom Name</label>

                    <input
                      type="text"
                      className="form-control"
                      name="showroomName"
                      placeholder="Enter showroom name (e.g. B U Bhandari)"
                      value={formData.showroomName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-12">
                    <label className="form-label">Dealer Authorization Document URL</label>

                    <input
                      type="text"
                      className="form-control"
                      name="docUrl"
                      placeholder="Upload link / Document URL (GST/Auth Certificate)"
                      value={formData.docUrl}
                      onChange={handleChange}
                    />
                    <small className="text-muted">Will be verified by Admin during approval</small>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">GST Number</label>

                    <input
                      type="text"
                      className="
                          form-control
                          text-uppercase
                        "
                      name="gstNumber"
                      placeholder="15-character GST number"
                      value={formData.gstNumber}
                      onChange={handleChange}
                      maxLength="15"
                      required
                    />

                    <small className="text-muted">Exactly 15 characters</small>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">License Number</label>

                    <input
                      type="text"
                      className="
                          form-control
                          text-uppercase
                        "
                      name="licenseNumber"
                      placeholder="9 to 11 characters"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      minLength="9"
                      maxLength="11"
                      required
                    />

                    <small className="text-muted">9 to 11 characters</small>
                  </div>

                  <div className="col-md-12">
                    <label className="form-label">Address</label>

                    <input
                      type="text"
                      className="form-control"
                      name="address"
                      placeholder="Enter showroom address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Pin Code</label>

                    <input
                      type="text"
                      className="form-control"
                      name="pinCode"
                      placeholder="Enter pin code"
                      value={formData.pinCode}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Contact Phone</label>

                    <input
                      type="text"
                      className="form-control"
                      name="contactPhone"
                      placeholder="Enter contact phone"
                      value={formData.contactPhone}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-12">
                    <label className="form-label fw-semibold">
                      Working Hours
                    </label>

                    <div className="row">
                      <div className="col-md-6">
                        <label className="form-label text-muted">
                          Opening Time
                        </label>

                        <select
                          className="form-select"
                          value={openingTime}
                          onChange={(e) => {
                            setOpeningTime(e.target.value);

                            if (closingTime && e.target.value >= closingTime) {
                              setClosingTime("");
                            }
                          }}
                        >
                          <option value="">Select Opening Time</option>

                          {timeOptions.map((time) => (
                            <option key={time.value} value={time.value}>
                              {time.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label text-muted">
                          Closing Time
                        </label>

                        <select
                          className="form-select"
                          value={closingTime}
                          onChange={(e) => setClosingTime(e.target.value)}
                        >
                          <option value="">Select Closing Time</option>

                          {timeOptions
                            .filter(
                              (time) =>
                                !openingTime || time.value > openingTime,
                            )
                            .map((time) => (
                              <option key={time.value} value={time.value}>
                                {time.label}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>

                    {openingTime && closingTime && (
                      <div className="alert alert-success mt-3 mb-0">
                        <strong>Working Hours:</strong>{" "}
                        {
                          timeOptions.find((t) => t.value === openingTime)
                            ?.label
                        }
                        {" - "}
                        {
                          timeOptions.find((t) => t.value === closingTime)
                            ?.label
                        }
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            <hr className="form-section-divider" />

            {/* SECURITY */}

            <div className="form-section-title">Security</div>

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Password</label>

                <input
                  type="password"
                  className="form-control"
                  name="password"
                  placeholder="Minimum 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  minLength="8"
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Confirm Password</label>

                <input
                  type="password"
                  className="form-control"
                  name="confirmPassword"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="
                btn
                btn-primary
                w-100
                auth-submit-btn
                mt-4
              "
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="text-center mt-4">
            <span className="text-muted">Already have an account? </span>

            <Link
              to="/login"
              className="
                fw-semibold
                text-decoration-none
              "
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Register;
