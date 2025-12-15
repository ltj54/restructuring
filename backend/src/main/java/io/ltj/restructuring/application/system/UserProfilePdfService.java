package io.ltj.restructuring.application.system;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfWriter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserProfilePdfService {

    private static final Logger log = LoggerFactory.getLogger(UserProfilePdfService.class);
    private static final DateTimeFormatter FILE_TIMESTAMP = DateTimeFormatter.ofPattern("yyyyMMddHHmm");
    private static final DateTimeFormatter DISPLAY_TIMESTAMP = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
    private static final TypeReference<Map<String, String>> DIARY_MAP_TYPE = new TypeReference<>() { };

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    public UserProfilePdfService(JdbcTemplate jdbcTemplate, ObjectMapper objectMapper) {
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
    }

    public GeneratedPdf generateUserProfilePdf(long userId) {
        UserProfileAggregate profile = fetchUserProfile(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Fant ikke brukerprofil."));

        try {
            byte[] pdfBytes = renderPdf(profile);
            String fileName = "user_profile_" + userId + "_" + FILE_TIMESTAMP.format(OffsetDateTime.now()) + ".pdf";
            return new GeneratedPdf(fileName, pdfBytes);
        } catch (DocumentException e) {
            throw new IllegalStateException("Kunne ikke generere PDF for bruker " + userId, e);
        }
    }

    private Optional<UserProfileAggregate> fetchUserProfile(long userId) {
        String sql = "SELECT get_user_profile(?)";
        try {
            String json = jdbcTemplate.queryForObject(sql, String.class, userId);
            if (json == null || json.isBlank()) {
                return Optional.empty();
            }
            return Optional.ofNullable(objectMapper.readValue(json, UserProfileAggregate.class));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        } catch (Exception e) {
            log.error("Kunne ikke hente brukerprofil fra databasen", e);
            throw new IllegalStateException("Feil ved henting av brukerprofil", e);
        }
    }

    private byte[] renderPdf(UserProfileAggregate profile) throws DocumentException {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 36, 36, 48, 48);
        PdfWriter.getInstance(document, output);

        document.open();

        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
        Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
        Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 10);

        document.add(new Paragraph("Omstillingsprofil", titleFont));
        document.add(new Paragraph("Generert: " + formatDate(OffsetDateTime.now().toString()), bodyFont));
        document.add(new Paragraph(" "));

        addUserSection(document, profile, headerFont, bodyFont);
        addPlanSection(document, profile, headerFont, bodyFont);
        addJournalSection(document, profile, headerFont, bodyFont);
        addRequestsSection(document, profile, headerFont, bodyFont);
        addInsurancesSection(document, profile, headerFont, bodyFont);
        addSnapshotSection(document, profile, headerFont, bodyFont);

        document.close();
        return output.toByteArray();
    }

    private void addUserSection(Document document, UserProfileAggregate profile, Font headerFont, Font bodyFont)
            throws DocumentException {
        document.add(new Paragraph("Bruker", headerFont));
        addBulletList(document, bodyFont, List.of(
                "Bruker-ID: " + orDash(profile.userId()),
                "E-post: " + orDash(profile.userEmail()),
                "Opprettet: " + formatDate(profile.userCreated())
        ));
        document.add(new Paragraph(" "));
    }

    private void addPlanSection(Document document, UserProfileAggregate profile, Font headerFont, Font bodyFont)
            throws DocumentException {
        document.add(new Paragraph("Plan", headerFont));

        List<String> needs = parseNeeds(profile.planNeeds());
        Map<String, String> diaries = parseDiaryMap(profile.planDiary());

        addBulletList(document, bodyFont, List.of(
                "Plan-ID: " + orDash(profile.planId()),
                "Persona: " + orDash(profile.planPersona()),
                "Fase: " + orDash(profile.planPhase()),
                "Behov: " + (needs.isEmpty() ? "-" : String.join(", ", needs)),
                "Opprettet: " + formatDate(profile.planCreated()),
                "Sist oppdatert: " + formatDate(profile.planUpdated())
        ));

        if (!diaries.isEmpty()) {
            document.add(new Paragraph("Dagbok", bodyFont));
            List<String> diaryLines = diaries.entrySet()
                    .stream()
                    .sorted(Map.Entry.comparingByKey())
                    .map(e -> e.getKey() + ": " + e.getValue())
                    .toList();
            addBulletList(document, bodyFont, diaryLines);
        }

        document.add(new Paragraph(" "));
    }

    private void addJournalSection(Document document, UserProfileAggregate profile, Font headerFont, Font bodyFont)
            throws DocumentException {
        document.add(new Paragraph("Journal", headerFont));

        List<UserProfileAggregate.JournalEntryItem> entries =
                Optional.ofNullable(profile.journalEntries()).orElse(List.of());

        if (entries.isEmpty()) {
            document.add(new Paragraph("Ingen journalinnslag.", bodyFont));
            document.add(new Paragraph(" "));
            return;
        }

        List<String> lines = entries.stream()
                .sorted(Comparator.comparing(
                        (UserProfileAggregate.JournalEntryItem e) -> e.createdAt() == null ? "" : e.createdAt()
                ).reversed())
                .map(entry -> {
                    String header = "ID " + entry.id() + " (fase " + orDash(entry.phase()) + ", " +
                            formatDate(entry.createdAt()) + ")";
                    String content = entry.content() == null ? "-" : entry.content();
                    return header + ":\n" + content;
                })
                .toList();

        addBulletList(document, bodyFont, lines);
        document.add(new Paragraph(" "));
    }

    private void addRequestsSection(Document document, UserProfileAggregate profile, Font headerFont, Font bodyFont)
            throws DocumentException {
        document.add(new Paragraph("Forsikringsforespørsler", headerFont));

        List<UserProfileAggregate.InsuranceRequestItem> requests =
                Optional.ofNullable(profile.requests()).orElse(List.of());

        if (requests.isEmpty()) {
            document.add(new Paragraph("Ingen forespørsler.", bodyFont));
            document.add(new Paragraph(" "));
            return;
        }

        List<String> lines = requests.stream()
                .sorted(Comparator.comparing(
                        (UserProfileAggregate.InsuranceRequestItem r) -> r.createdAt() == null ? "" : r.createdAt()
                ).reversed())
                .map(req -> "ID " + req.id() +
                        " [" + orDash(req.status()) + "] " +
                        formatDate(req.createdAt()))
                .toList();

        addBulletList(document, bodyFont, lines);
        document.add(new Paragraph(" "));
    }

    private void addInsurancesSection(Document document, UserProfileAggregate profile, Font headerFont, Font bodyFont)
            throws DocumentException {
        document.add(new Paragraph("Forsikringsprofil", headerFont));

        List<UserProfileAggregate.UserInsuranceItem> insurances =
                Optional.ofNullable(profile.insurances()).orElse(List.of());

        if (insurances.isEmpty()) {
            document.add(new Paragraph("Ingen registrerte forsikringer.", bodyFont));
            document.add(new Paragraph(" "));
            return;
        }

        List<String> lines = insurances.stream()
                .map(item -> {
                    String period = "Gyldig: " + formatDate(item.validFrom()) + " - " + formatDate(item.validTo());
                    return "ID " + item.id() +
                            " (" + orDash(item.source()) + "): " +
                            orDash(item.providerName()) + " - " + orDash(item.productName()) +
                            " | Aktiv: " + (item.active() != null && item.active() ? "Ja" : "Nei") +
                            " | " + period +
                            (item.notes() != null && !item.notes().isBlank() ? " | Notat: " + item.notes() : "");
                })
                .toList();

        addBulletList(document, bodyFont, lines);
        document.add(new Paragraph(" "));
    }

    private void addSnapshotSection(Document document, UserProfileAggregate profile, Font headerFont, Font bodyFont)
            throws DocumentException {
        document.add(new Paragraph("Siste forsikrings-snapshot", headerFont));

        UserProfileAggregate.InsuranceSnapshotItem snapshot = profile.snapshot();
        if (snapshot == null) {
            document.add(new Paragraph("Ingen snapshot registrert.", bodyFont));
            return;
        }

        List<String> lines = new ArrayList<>();
        lines.add("Snapshot-ID: " + orDash(snapshot.id()));
        lines.add("Kilde: " + orDash(snapshot.source()));
        lines.add("Usikker: " + (Boolean.TRUE.equals(snapshot.uncertain()) ? "Ja" : "Nei"));
        lines.add("Opprettet: " + formatDate(snapshot.createdAt()));

        List<String> types = Optional.ofNullable(snapshot.types()).orElse(List.of());
        if (!types.isEmpty()) {
            lines.add("Typer: " + types.stream().collect(Collectors.joining(", ")));
        }

        addBulletList(document, bodyFont, lines);
    }

    private Map<String, String> parseDiaryMap(String rawDiary) {
        if (rawDiary == null || rawDiary.isBlank()) {
            return Map.of();
        }
        try {
            Map<String, String> parsed = objectMapper.readValue(rawDiary, DIARY_MAP_TYPE);
            return parsed == null ? Map.of() : parsed;
        } catch (Exception e) {
            return Map.of("Notat", rawDiary);
        }
    }

    private List<String> parseNeeds(String planNeeds) {
        if (planNeeds == null || planNeeds.isBlank()) {
            return List.of();
        }
        return List.of(planNeeds.split(","))
                .stream()
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }

    private void addBulletList(Document document, Font bodyFont, List<String> lines) throws DocumentException {
        if (lines == null || lines.isEmpty()) {
            return;
        }

        com.lowagie.text.List pdfList = new com.lowagie.text.List(com.lowagie.text.List.UNORDERED);
        pdfList.setIndentationLeft(10);
        for (String line : lines) {
            pdfList.add(new com.lowagie.text.ListItem(new Phrase(line, bodyFont)));
        }
        document.add(pdfList);
    }

    private String orDash(Object value) {
        if (value == null) {
            return "-";
        }
        String s = String.valueOf(value);
        return s.isBlank() ? "-" : s;
    }

    private String formatDate(String input) {
        if (input == null || input.isBlank()) {
            return "-";
        }
        try {
            return DISPLAY_TIMESTAMP.format(OffsetDateTime.parse(input));
        } catch (Exception ignored) { }

        try {
            return DISPLAY_TIMESTAMP.format(LocalDateTime.parse(input));
        } catch (Exception ignored) { }

        return input.replace('T', ' ');
    }
}
