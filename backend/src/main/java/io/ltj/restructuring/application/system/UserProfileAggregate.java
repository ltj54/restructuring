package io.ltj.restructuring.application.system;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record UserProfileAggregate(
        @JsonProperty("user_id") Long userId,
        @JsonProperty("user_email") String userEmail,
        @JsonProperty("user_created") String userCreated,

        @JsonProperty("plan_id") Long planId,
        @JsonProperty("plan_phase") String planPhase,
        @JsonProperty("plan_persona") String planPersona,
        @JsonProperty("plan_needs") String planNeeds,
        @JsonProperty("plan_diary") String planDiary,
        @JsonProperty("plan_created") String planCreated,
        @JsonProperty("plan_updated") String planUpdated,

        @JsonProperty("journal_entries") List<JournalEntryItem> journalEntries,
        @JsonProperty("requests") List<InsuranceRequestItem> requests,
        @JsonProperty("insurances") List<UserInsuranceItem> insurances,
        @JsonProperty("snapshot") InsuranceSnapshotItem snapshot
) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record JournalEntryItem(
            Long id,
            Integer phase,
            String content,
            @JsonProperty("created_at") String createdAt
    ) { }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record InsuranceRequestItem(
            Long id,
            String status,
            @JsonProperty("xml_content") String xmlContent,
            @JsonProperty("created_at") String createdAt
    ) { }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record UserInsuranceItem(
            Long id,
            String source,
            @JsonProperty("provider_name") String providerName,
            @JsonProperty("product_name") String productName,
            String notes,
            Boolean active,
            @JsonProperty("valid_from") String validFrom,
            @JsonProperty("valid_to") String validTo
    ) { }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record InsuranceSnapshotItem(
            Long id,
            String source,
            Boolean uncertain,
            @JsonProperty("created_at") String createdAt,
            List<String> types
    ) { }
}
