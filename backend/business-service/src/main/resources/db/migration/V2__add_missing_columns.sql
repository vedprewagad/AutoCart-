-- ====================================================================
-- AutoCart Business Service Schema Migration V2
-- Adds missing columns used by JPA entities, DTOs, and frontend UI:
-- 1. car_models.thumbnail: used by CarModel entity, ModelResponse,
--    VehicleCardResponse, ModelCard.jsx, Home.jsx, and aiFilterService.
-- 2. variant_images.colour_name: used by VariantImage entity,
--    ImageResponse, and VariantSelection.jsx.
-- ====================================================================

ALTER TABLE `car_models`
  ADD COLUMN `thumbnail` varchar(255) DEFAULT NULL;

ALTER TABLE `variant_images`
  ADD COLUMN `colour_name` varchar(30) DEFAULT NULL;
