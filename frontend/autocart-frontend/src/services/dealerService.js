import businessApi from "./businessApi";

export const getDealerInventory = async (dealerId) => {
  const res = await businessApi.get("/dealer/inventory", { params: { dealerId } });
  return res.data;
};

export const addDealerInventory = async (inventoryData) => {
  const res = await businessApi.post("/dealer/inventory", inventoryData);
  return res.data;
};

export const getApprovedDealersForVariant = async (variantId) => {
  const res = await businessApi.get(`/vehicles/variant/${variantId}/dealers`);
  return res.data;
};

export const bookTestDrive = async (bookingData) => {
  const res = await businessApi.post("/test-drives", bookingData);
  return res.data;
};

export const getDealerTestDrives = async (dealerId) => {
  const res = await businessApi.get(`/test-drives/dealer/${dealerId}`);
  return res.data;
};

export const getUserTestDrives = async (userId) => {
  const res = await businessApi.get(`/test-drives/user/${userId}`);
  return res.data;
};

export const updateTestDriveStatus = async (bookingId, status, cancellationReason = "") => {
  const res = await businessApi.put(`/test-drives/${bookingId}/status`, {
    status,
    cancellationReason,
  });
  return res.data;
};

export const submitDealerRating = async (ratingData) => {
  const res = await businessApi.post("/ratings", ratingData);
  return res.data;
};

export const getDealerRatings = async (dealerId) => {
  const res = await businessApi.get(`/ratings/dealer/${dealerId}`);
  return res.data;
};

export const getUserRatingForDealer = async (userId, dealerId) => {
  const res = await businessApi.get(`/ratings/user/${userId}/dealer/${dealerId}`);
  return res.data;
};
