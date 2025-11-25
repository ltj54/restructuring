package io.ltj.restructuring.application.plan;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.ltj.restructuring.api.dto.plan.UserPlanDto;
import io.ltj.restructuring.api.dto.plan.UserPlanUpdateRequestDto;
import io.ltj.restructuring.domain.user.UserPlanEntity;
import io.ltj.restructuring.domain.user.UserPlanRepository;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserPlanApplicationService {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private static final TypeReference<Map<String, String>> DIARY_MAP_TYPE =
            new TypeReference<Map<String, String>>() { };

    private final UserPlanRepository userPlanRepository;

    public UserPlanApplicationService(UserPlanRepository userPlanRepository) {
        this.userPlanRepository = userPlanRepository;
    }

    @Transactional(readOnly = true)
    public Optional<UserPlanDto> getPlanForUser(Long userId) {
        return userPlanRepository.findByUserId(userId).map(this::toDto);
    }

    @Transactional
    public UserPlanDto upsertPlanForUser(Long userId, UserPlanUpdateRequestDto request) {
        UserPlanEntity entity = userPlanRepository
                .findByUserId(userId)
                .orElseGet(() -> new UserPlanEntity(userId, "", null, null, null));

        Map<String, String> diaries = parseDiaryMap(entity.getDiary(), entity.getPhase());

        String requestedPhase = request.phase();
        String requestedDiary = request.diary();

        if (requestedPhase != null && !requestedPhase.isBlank() && requestedDiary != null) {
            diaries.put(requestedPhase, requestedDiary);
        }

        entity.setPhase(requestedPhase);
        entity.setPersona(request.persona());
        entity.setNeeds(joinNeeds(request.needs()));
        entity.setDiary(serializeDiaryMap(diaries));

        UserPlanEntity saved = userPlanRepository.save(entity);
        return toDto(saved);
    }

    private UserPlanDto toDto(UserPlanEntity entity) {
        List<String> needs = splitNeeds(entity.getNeeds());
        Instant createdAt = entity.getCreatedAt();
        Instant updatedAt = entity.getUpdatedAt();

        Map<String, String> diaries = parseDiaryMap(entity.getDiary(), entity.getPhase());
        String diaryForPhase = diaries.get(entity.getPhase());

        return new UserPlanDto(
                entity.getPersona(),
                entity.getPhase(),
                needs,
                diaryForPhase,
                diaries,
                createdAt,
                updatedAt
        );
    }

    private String joinNeeds(List<String> needs) {
        if (needs == null || needs.isEmpty()) {
            return null;
        }
        return needs.stream()
                .map(s -> s.replace(",", " "))
                .collect(Collectors.joining(","));
    }

    private List<String> splitNeeds(String needs) {
        if (needs == null || needs.isBlank()) {
            return List.of();
        }
        return List.of(needs.split(","))
                .stream()
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }

    private Map<String, String> parseDiaryMap(String rawDiary, String currentPhase) {
        if (rawDiary == null || rawDiary.isBlank()) {
            return new HashMap<>();
        }

        try {
            Map<String, String> parsed = OBJECT_MAPPER.readValue(rawDiary, DIARY_MAP_TYPE);
            if (parsed == null) {
                return new HashMap<>();
            }
            return new HashMap<>(parsed);
        } catch (Exception ex) {
            Map<String, String> fallback = new HashMap<>();
            if (currentPhase != null && !currentPhase.isBlank()) {
                fallback.put(currentPhase, rawDiary);
            }
            return fallback;
        }
    }

    private String serializeDiaryMap(Map<String, String> diaries) {
        if (diaries == null || diaries.isEmpty()) {
            return null;
        }

        try {
            return OBJECT_MAPPER.writeValueAsString(diaries);
        } catch (JsonProcessingException e) {
            return diaries.values()
                    .stream()
                    .filter(value -> value != null && !value.isBlank())
                    .findFirst()
                    .orElse(null);
        }
    }
}

