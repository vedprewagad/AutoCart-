import axios from "axios";
import store from "../redux/store";
import { logout } from "../redux/slices/authSlice";
import { API_BASE_URL } from "../utils/imageUrl";

const businessApi = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
});

businessApi.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

businessApi.interceptors.response.use(
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

export default businessApi;
