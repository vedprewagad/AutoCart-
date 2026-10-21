package com.autocart.aiservice.service.impl;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.autocart.aiservice.dto.AiSearchRequest;
import com.autocart.aiservice.dto.AiSearchResponse;
import com.autocart.aiservice.dto.ExtractedFiltersDto;
import com.autocart.aiservice.service.AiService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class AiServiceImpl implements AiService {

    private static final Logger log = LoggerFactory.getLogger(AiServiceImpl.class);

    @Value("${anthropic.api.key:}")
    private String anthropicApiKey;

    @Value("${business.service.url:http://BUSINESS-SERVICE}")
    private String businessServiceUrl;

    private final RestTemplate restTemplate;
    private final RestTemplate rawRestTemplate;
    private final ObjectMapper objectMapper;

    public AiServiceImpl(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
        this.rawRestTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public AiSearchResponse searchVehiclesWithAi(AiSearchRequest request) {
        AiSearchResponse response = new AiSearchResponse();

        if (request == null || request.getQuery() == null || request.getQuery().trim().isEmpty()) {
            response.setStatus("INVALID_QUERY");
            response.setMessage("Please provide a valid natural language car search query.");
            response.setConfidence(0.0);
            response.setVehicles(Collections.emptyList());
            return response;
        }

        String userQuery = request.getQuery().trim();
        ExtractedFiltersDto filters = null;
        Double confidence = 0.0;
        String explanation = null;
        boolean aiSuccess = false;

        // Try calling Anthropic API server-side if key configured
        if (anthropicApiKey != null && !anthropicApiKey.isBlank()) {
            try {
                Map<String, Object> aiResult = callAnthropicApiServerSide(userQuery);
                if (aiResult != null && aiResult.containsKey("filters")) {
                    filters = (ExtractedFiltersDto) aiResult.get("filters");
                    confidence = (Double) aiResult.getOrDefault("confidence", 0.8);
                    explanation = (String) aiResult.get("explanation");
                    aiSuccess = true;
                }
            } catch (Exception e) {
                log.warn("Server-side Anthropic API call failed, using fallback rule parser: {}", e.getMessage());
            }
        }

        // Server-side fallback rule parser
        if (!aiSuccess || filters == null) {
            Map<String, Object> fallbackResult = parseWithServerFallbackRules(userQuery);
            filters = (ExtractedFiltersDto) fallbackResult.get("filters");
            confidence = (Double) fallbackResult.get("confidence");
            explanation = (String) fallbackResult.get("explanation");
        }

        response.setExtractedFilters(filters);
        response.setConfidence(confidence);

        if (confidence < 0.4 || isAllFiltersNull(filters)) {
            response.setStatus("INVALID_QUERY");
            response.setMessage("Could not confidently map query '" + userQuery + "' to vehicle search filters.");
            response.setExplanation("Try asking e.g. 'Show me SUVs under 15 Lakh with automatic transmission' or 'Honda Amaze specs'.");
            response.setVehicles(Collections.emptyList());
            return response;
        }

        // Call Business Service catalog API (/api/vehicles)
        List<Map<String, Object>> matchedCards = new ArrayList<>();
        Map<String, Object> rawPageResponse = null;

        try {
            StringBuilder urlBuilder = new StringBuilder(businessServiceUrl).append("/api/vehicles?page=0&size=50");
            if (filters.getBrand() != null) urlBuilder.append("&brand=").append(filters.getBrand());
            if (filters.getFuelType() != null) urlBuilder.append("&fuelType=").append(filters.getFuelType());
            if (filters.getMinPrice() != null) urlBuilder.append("&minPrice=").append(filters.getMinPrice());
            if (filters.getMaxPrice() != null) urlBuilder.append("&maxPrice=").append(filters.getMaxPrice());
            if (filters.getSortBy() != null) urlBuilder.append("&sortBy=").append(filters.getSortBy());

            ResponseEntity<Map> catalogResponse = restTemplate.getForEntity(urlBuilder.toString(), Map.class);
            if (catalogResponse.getStatusCode().is2xxSuccessful() && catalogResponse.getBody() != null) {
                rawPageResponse = catalogResponse.getBody();
                List<Map<String, Object>> content = (List<Map<String, Object>>) rawPageResponse.get("content");
                if (content != null) {
                    for (Map<String, Object> card : content) {
                        if (filters.getBodyType() != null && card.get("bodyType") != null) {
                            if (!card.get("bodyType").toString().equalsIgnoreCase(filters.getBodyType())) {
                                continue;
                            }
                        }
                        if (filters.getTransmission() != null && card.get("transmission") != null) {
                            if (!card.get("transmission").toString().equalsIgnoreCase(filters.getTransmission())) {
                                continue;
                            }
                        }
                        matchedCards.add(card);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to query business-service vehicles API: {}", e.getMessage());
        }

        response.setVehicles(matchedCards);
        response.setPageResponse(rawPageResponse);

        if (matchedCards.isEmpty()) {
            response.setStatus("NO_RESULTS");
            response.setMessage("No vehicles matched your criteria in our catalog.");
            response.setExplanation(explanation != null ? explanation : "Try broadening your price range or body style filter.");
        } else {
            response.setStatus("SUCCESS");
            response.setMessage("Found " + matchedCards.size() + " matching vehicle(s).");
            response.setExplanation(explanation != null ? explanation : "Found matching vehicles for your request.");
        }

        return response;
    }

    private List<String> fetchDynamicBrands() {
        try {
            String url = businessServiceUrl + "/api/brands";
            ResponseEntity<List> response = restTemplate.getForEntity(url, List.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List<String> dynamicBrands = new ArrayList<>();
                for (Object item : response.getBody()) {
                    if (item instanceof Map) {
                        Object name = ((Map<?, ?>) item).get("name");
                        if (name != null) {
                            dynamicBrands.add(name.toString().trim());
                        }
                    }
                }
                if (!dynamicBrands.isEmpty()) {
                    return dynamicBrands;
                }
            }
        } catch (Exception e) {
            log.warn("Could not dynamically retrieve brand names from business-service ({}), using default catalog fallback: {}", businessServiceUrl, e.getMessage());
        }
        return List.of("Honda", "Mahindra", "MG Motor", "Toyota", "Volkswagen");
    }

    private Map<String, Object> callAnthropicApiServerSide(String query) throws Exception {
        List<String> availableBrands = fetchDynamicBrands();
        String brandsEnum = "\"" + String.join("\", \"", availableBrands) + "\"";
        String systemPrompt = "You are an expert car recommendation AI assistant for AutoCart Indian automotive marketplace.\n" +
                "Parse the customer's request and reply with a JSON object matching this schema:\n" +
                "{\n" +
                "  \"brand\": string or null (one of " + brandsEnum + "),\n" +
                "  \"bodyType\": string or null (one of \"SUV\", \"SEDAN\", \"HATCHBACK\", \"MUV\"),\n" +
                "  \"fuelType\": string or null (one of \"PETROL\", \"DIESEL\", \"ELECTRIC\", \"HYBRID\", \"CNG\"),\n" +
                "  \"transmission\": string or null (one of \"AUTOMATIC\", \"MANUAL\"),\n" +
                "  \"minPrice\": number or null (in Rupees, e.g. 500000),\n" +
                "  \"maxPrice\": number or null (in Rupees, e.g. 1500000),\n" +
                "  \"confidence\": number (0.0 to 1.0),\n" +
                "  \"explanation\": string (2-3 concise sentences)\n" +
                "}\n" +
                "Output ONLY raw valid JSON.";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-api-key", anthropicApiKey);
        headers.set("anthropic-version", "2023-06-01");

        Map<String, Object> messageUser = new HashMap<>();
        messageUser.put("role", "user");
        messageUser.put("content", query);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "claude-3-5-sonnet-20241022");
        requestBody.put("max_tokens", 400);
        requestBody.put("system", systemPrompt);
        requestBody.put("messages", List.of(messageUser));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        ResponseEntity<String> responseEntity = rawRestTemplate.postForEntity("https://api.anthropic.com/v1/messages", entity, String.class);

        if (responseEntity.getStatusCode().is2xxSuccessful() && responseEntity.getBody() != null) {
            JsonNode root = objectMapper.readTree(responseEntity.getBody());
            String rawText = root.path("content").get(0).path("text").asText();
            String cleanJson = rawText.replaceAll("```json", "").replaceAll("```", "").trim();

            JsonNode parsedNode = objectMapper.readTree(cleanJson);
            ExtractedFiltersDto filters = new ExtractedFiltersDto();

            if (parsedNode.hasNonNull("brand")) filters.setBrand(parsedNode.get("brand").asText());
            if (parsedNode.hasNonNull("bodyType")) filters.setBodyType(parsedNode.get("bodyType").asText());
            if (parsedNode.hasNonNull("fuelType")) filters.setFuelType(parsedNode.get("fuelType").asText());
            if (parsedNode.hasNonNull("transmission")) filters.setTransmission(parsedNode.get("transmission").asText());
            if (parsedNode.hasNonNull("minPrice")) filters.setMinPrice(new BigDecimal(parsedNode.get("minPrice").asText()));
            if (parsedNode.hasNonNull("maxPrice")) filters.setMaxPrice(new BigDecimal(parsedNode.get("maxPrice").asText()));

            double confidence = parsedNode.has("confidence") ? parsedNode.get("confidence").asDouble() : 0.8;
            String explanation = parsedNode.has("explanation") ? parsedNode.get("explanation").asText() : "Parsed filters via AI.";

            Map<String, Object> result = new HashMap<>();
            result.put("filters", filters);
            result.put("confidence", confidence);
            result.put("explanation", explanation);
            return result;
        }

        return null;
    }

    private Map<String, Object> parseWithServerFallbackRules(String query) {
        String q = query.toLowerCase();
        ExtractedFiltersDto filters = new ExtractedFiltersDto();
        int matches = 0;

        List<String> dynamicBrands = fetchDynamicBrands();
        for (String b : dynamicBrands) {
            String bLower = b.toLowerCase();
            if (q.contains(bLower)) {
                filters.setBrand(b);
                matches++;
                break;
            } else if (bLower.equals("volkswagen") && (q.contains("vw") || q.contains("volkswagon"))) {
                filters.setBrand("Volkswagen");
                matches++;
                break;
            } else if (bLower.contains("mg") && q.contains("mg")) {
                filters.setBrand(b);
                matches++;
                break;
            }
        }

        if (q.contains("suv")) { filters.setBodyType("SUV"); matches++; }
        else if (q.contains("sedan")) { filters.setBodyType("SEDAN"); matches++; }
        else if (q.contains("hatchback")) { filters.setBodyType("HATCHBACK"); matches++; }
        else if (q.contains("muv") || q.contains("mpv")) { filters.setBodyType("MUV"); matches++; }

        if (q.contains("petrol")) { filters.setFuelType("PETROL"); matches++; }
        else if (q.contains("diesel")) { filters.setFuelType("DIESEL"); matches++; }
        else if (q.contains("cng")) { filters.setFuelType("CNG"); matches++; }
        else if (q.contains("electric") || q.contains("ev")) { filters.setFuelType("ELECTRIC"); matches++; }

        if (q.contains("automatic") || q.contains("auto") || q.contains("cvt") || q.contains("amt")) {
            filters.setTransmission("AUTOMATIC");
            matches++;
        } else if (q.contains("manual") || q.contains("mt")) {
            filters.setTransmission("MANUAL");
            matches++;
        }

        // 1. Range parser: "between 5 and 15 lakhs" or "5 to 15 lakh"
        Pattern rangePattern = Pattern.compile("(?:between|from)?\\s*₹?\\s*(\\d+(?:\\.\\d+)?)\\s*(?:lakh|lakhs|lac|lacs|l|cr|crore|crores)?\\s*(?:to|and|-)\\s*₹?\\s*(\\d+(?:\\.\\d+)?)\\s*(lakh|lakhs|lac|lacs|l|cr|crore|crores)?", Pattern.CASE_INSENSITIVE);
        Matcher rangeMatcher = rangePattern.matcher(q);
        if (rangeMatcher.find()) {
            double minVal = Double.parseDouble(rangeMatcher.group(1));
            double maxVal = Double.parseDouble(rangeMatcher.group(2));
            String unit = rangeMatcher.group(3);
            filters.setMinPrice(parsePriceAmount(minVal, unit));
            filters.setMaxPrice(parsePriceAmount(maxVal, unit));
            matches += 2;
        } else {
            // 2. Max price parser: "under 10L", "below 15 Lakh", "up to 1.5 Cr"
            Pattern maxPattern = Pattern.compile("(?:under|below|less than|max|up to|within|budget)\\s*₹?\\s*(\\d+(?:\\.\\d+)?)\\s*(lakh|lakhs|lac|lacs|l|cr|crore|crores)?", Pattern.CASE_INSENSITIVE);
            Matcher maxMatcher = maxPattern.matcher(q);
            if (maxMatcher.find()) {
                double val = Double.parseDouble(maxMatcher.group(1));
                String unit = maxMatcher.group(2);
                filters.setMaxPrice(parsePriceAmount(val, unit));
                matches++;
            }

            // 3. Min price parser: "above 5L", "over 10 Lakh"
            Pattern minPattern = Pattern.compile("(?:above|over|more than|min|at least)\\s*₹?\\s*(\\d+(?:\\.\\d+)?)\\s*(lakh|lakhs|lac|lacs|l|cr|crore|crores)?", Pattern.CASE_INSENSITIVE);
            Matcher minMatcher = minPattern.matcher(q);
            if (minMatcher.find()) {
                double val = Double.parseDouble(minMatcher.group(1));
                String unit = minMatcher.group(2);
                filters.setMinPrice(parsePriceAmount(val, unit));
                matches++;
            }
        }

        double confidence = matches > 0 ? Math.min(1.0, 0.4 + matches * 0.2) : 0.0;
        String explanation = matches > 0 ? "Parsed filters from search query." : "No filters matched.";

        Map<String, Object> result = new HashMap<>();
        result.put("filters", filters);
        result.put("confidence", confidence);
        result.put("explanation", explanation);
        return result;
    }

    private BigDecimal parsePriceAmount(double val, String unit) {
        if (unit != null && !unit.isBlank()) {
            String u = unit.toLowerCase();
            if (u.startsWith("cr")) {
                return BigDecimal.valueOf(val * 10_000_000);
            } else if (u.startsWith("l") || u.startsWith("lac")) {
                return BigDecimal.valueOf(val * 100_000);
            }
        }
        if (val <= 200) {
            return BigDecimal.valueOf(val * 100_000);
        }
        return BigDecimal.valueOf(val);
    }

    private boolean isAllFiltersNull(ExtractedFiltersDto filters) {
        return filters.getBrand() == null &&
                filters.getBodyType() == null &&
                filters.getFuelType() == null &&
                filters.getTransmission() == null &&
                filters.getMinPrice() == null &&
                filters.getMaxPrice() == null;
    }
}
