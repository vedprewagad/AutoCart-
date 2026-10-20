import axios from "axios";
import store from "../redux/store";
import { logout } from "../redux/slices/authSlice";
import { API_BASE_URL } from "../utils/imageUrl";

const transactionApi = axios.create({
  baseURL: `${API_BASE_URL}/api/transaction`,
  withCredentials: true,
});

transactionApi.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

transactionApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLogin = error.config?.url?.includes("/login");
    const isAuthMeGet = error.config?.url?.includes("/auth/me") && error.config?.method?.toLowerCase() === "get";

    if (error.response && error.response.status === 401 && !isLogin && !isAuthMeGet) {
      store.dispatch(logout());
      if (window.location.pathname !== "/login" && !window._isRedirectingToLogin) {
        window._isRedirectingToLogin = true;
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const getBankPartners = async () => {
  const res = await transactionApi.get("/banks");
  return res.data;
};

export const getEmiProducts = async () => {
  const res = await transactionApi.get("/emi-products");
  return res.data;
};

export const getCardOffers = async () => {
  const res = await transactionApi.get("/card-offers");
  return res.data;
};

export const createPurchaseEnquiry = async (enquiryData) => {
  const res = await transactionApi.post("/enquiry", enquiryData);
  return res.data;
};

export const getUserEnquiries = async (userId) => {
  const res = await transactionApi.get(`/enquiries/user/${userId}`);
  return res.data;
};

export const getDealerEnquiries = async (dealerId) => {
  const res = await transactionApi.get(`/enquiries/dealer/${dealerId}`);
  return res.data;
};

export const updateEnquiryStatus = async (enquiryId, status) => {
  const res = await transactionApi.put(`/enquiries/${enquiryId}/status`, { status });
  return res.data;
};

// Admin Financial Master APIs
export const createBank = async (bankData) => {
  const res = await transactionApi.post("/admin/banks", bankData);
  return res.data;
};

export const deleteBank = async (bankId) => {
  const res = await transactionApi.delete(`/admin/banks/${bankId}`);
  return res.data;
};

export const createEmiProduct = async (productData) => {
  const res = await transactionApi.post("/admin/emi-products", productData);
  return res.data;
};

export const deleteEmiProduct = async (productId) => {
  const res = await transactionApi.delete(`/admin/emi-products/${productId}`);
  return res.data;
};

export const createCardOffer = async (offerData) => {
  const res = await transactionApi.post("/admin/card-offers", offerData);
  return res.data;
};

export const deleteCardOffer = async (offerId) => {
  const res = await transactionApi.delete(`/admin/card-offers/${offerId}`);
  return res.data;
};
