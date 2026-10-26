package com.autocart.aiservice.dto;

public class QuickReplyChipDto {

    private String label;
    private String query;

    public QuickReplyChipDto() {
    }

    public QuickReplyChipDto(String label, String query) {
        this.label = label;
        this.query = query;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }
}
