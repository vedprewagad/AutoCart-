import api from "./authApi";

// CUSTOMER / DEALER / ADMIN LOGIN — unified endpoint
export const loginUser = async (email, password) => {
  try {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Login failed");
  }
};

// CUSTOMER / DEALER REGISTER
export const registerUser = async (userData) => {
  try {
    const response = await api.post("/auth/register", userData);

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Registration failed");
  }
};

// GET CURRENT LOGGED-IN USER (also returns a fresh token for Redux rehydration)
export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

// LOGOUT
export const logoutUser = async () => {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    throw new Error(error.response?.data?.message || "Logout failed");
  }
};

// UPDATE PROFILE
export const updateProfile = async (profileData) => {
  const response = await api.put("/auth/me", profileData);
  return response.data;
};

// CHANGE PASSWORD
export const changePassword = async (passwordData) => {
  const response = await api.put("/auth/change-password", passwordData);

  return response.data;
};

// FORGOT PASSWORD
export const forgotPassword = async (email) => {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
};

// RESET PASSWORD WITH TOKEN
export const resetPassword = async (token, newPassword) => {
  const response = await api.post("/auth/reset-password", { token, newPassword });
  return response.data;
};
