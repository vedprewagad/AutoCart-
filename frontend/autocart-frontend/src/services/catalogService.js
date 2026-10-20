import businessApi from "./businessApi";

// ------------------------
// Dashboard
// ------------------------

export const getBrands = async () => {
  const response = await businessApi.get("/brands");
  return response.data;
};

export const getVehicles = async (options = {}) => {
  const { page = 0, size = 12, brand, bodyType, fuelType, minPrice, maxPrice, transmission, sortBy } = options;
  const response = await businessApi.get("/vehicles", {
    params: {
      page,
      size,
      brand,
      bodyType,
      fuelType,
      minPrice,
      maxPrice,
      transmission,
      sortBy,
    },
  });

  return response.data;
};

// ------------------------
// Brand
// ------------------------

export const getBrandById = async (brandId) => {
  const response = await businessApi.get(`/brands/${brandId}`);
  return response.data;
};

export const getModelsByBrand = async (brandId) => {
  const response = await businessApi.get(`/brands/${brandId}/models`);
  return response.data;
};

// ------------------------
// Variants
// ------------------------
export const getVariantsByModel = async (modelId) => {
  const response = await businessApi.get(`/variants/model/${modelId}`);
  return response.data;
};

// ------------------------
// Variant Details
// ------------------------
export const getVariantDetails = async (variantId) => {
  const response = await businessApi.get(`/variants/${variantId}`);
  return response.data;
};
// ------------------------
// Model Details
// ------------------------
export const getModelById = async (modelId) => {
  const response = await businessApi.get(`/models/${modelId}`);
  return response.data;
};
// ------------------------
// Variant Images
// ------------------------
export const getVariantImages = async (variantId) => {
  const response = await businessApi.get(`/variants/${variantId}/images`);

  return response.data;
};

// ------------------------
// Variant Colours
// ------------------------
export const getVariantColours = async (variantId) => {
  const response = await businessApi.get(`/variants/${variantId}/colours`);
  return response.data;
};

