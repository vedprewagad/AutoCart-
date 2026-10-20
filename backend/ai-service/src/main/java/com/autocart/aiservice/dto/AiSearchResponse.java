package com.autocart.aiservice.dto;

import java.util.List;
import java.util.Map;

public class AiSearchResponse {

    private String status; // SUCCESS, INVALID_QUERY, AI_FAILURE, NO_RESULTS
    private String message;
    private Double confidence;
    private String explanation;
    private ExtractedFiltersDto extractedFilters;
    private List<Map<String, Object>> vehicles;
    private Map<String, Object> pageResponse;

    public AiSearchResponse() {
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Double getConfidence() {
        return confidence;
    }

    public void setConfidence(Double confidence) {
        this.confidence = confidence;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public ExtractedFiltersDto getExtractedFilters() {
        return extractedFilters;
    }

    public void setExtractedFilters(ExtractedFiltersDto extractedFilters) {
        this.extractedFilters = extractedFilters;
    }

    public List<Map<String, Object>> getVehicles() {
        return vehicles;
    }

    public void setVehicles(List<Map<String, Object>> vehicles) {
        this.vehicles = vehicles;
    }

    public Map<String, Object> getPageResponse() {
        return pageResponse;
    }

    public void setPageResponse(Map<String, Object> pageResponse) {
        this.pageResponse = pageResponse;
    }
}
