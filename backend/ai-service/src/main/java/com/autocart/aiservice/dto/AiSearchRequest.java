package com.autocart.aiservice.dto;

import java.util.List;

public class AiSearchRequest {

    private String query;
    private List<ChatMessageDto> history;
    private ExtractedFiltersDto lastFilters;

    public AiSearchRequest() {
    }

    public AiSearchRequest(String query) {
        this.query = query;
    }

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }

    public List<ChatMessageDto> getHistory() {
        return history;
    }

    public void setHistory(List<ChatMessageDto> history) {
        this.history = history;
    }

    public ExtractedFiltersDto getLastFilters() {
        return lastFilters;
    }

    public void setLastFilters(ExtractedFiltersDto lastFilters) {
        this.lastFilters = lastFilters;
    }
}
