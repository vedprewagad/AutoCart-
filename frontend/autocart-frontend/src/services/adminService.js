import authApi from "./authApi";
import businessApi from "./businessApi";

// Dealer Approval APIs (Auth Service)
export const getPendingDealers = async () => {
  const res = await authApi.get("/admin/dealers/pending");
  return res.data;
};

export const updateDealerStatus = async (dealerId, status, rejectionReason = "") => {
  const res = await authApi.put(`/admin/dealers/${dealerId}/status`, {
    status,
    rejectionReason,
  });
  return res.data;
};

// Inventory Approval APIs (Business Service)
export const getPendingInventory = async () => {
  const res = await businessApi.get("/admin/inventory/pending");
  return res.data;
};

export const updateInventoryStatus = async (inventoryId, status, rejectionReason = "") => {
  const res = await businessApi.put(`/admin/inventory/${inventoryId}/status`, {
    status,
    rejectionReason,
  });
  return res.data;
};

// Catalog Master APIs (Business Service)
export const createBrand = async (brandData) => {
  const res = await businessApi.post("/admin/catalog/brands", brandData);
  return res.data;
};

export const createModel = async (modelData) => {
  const res = await businessApi.post("/admin/catalog/models", modelData);
  return res.data;
};

export const createVariant = async (variantData) => {
  const res = await businessApi.post("/admin/catalog/variants", variantData);
  return res.data;
};

export const deleteBrand = async (brandId) => {
  const res = await businessApi.delete(`/admin/catalog/brands/${brandId}`);
  return res.data;
};

export const deleteModel = async (modelId) => {
  const res = await businessApi.delete(`/admin/catalog/models/${modelId}`);
  return res.data;
};

export const deleteVariant = async (variantId) => {
  const res = await businessApi.delete(`/admin/catalog/variants/${variantId}`);
  return res.data;
};
