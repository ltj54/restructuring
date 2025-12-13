package io.ltj.restructuring.application.insurance;

import io.ltj.restructuring.api.dto.insurance.CoverageGapAnalysisResponse;
import io.ltj.restructuring.api.dto.insurance.CoverageLossAnalysisResponse;
import io.ltj.restructuring.domain.insurance.InsuranceSnapshotEntity;
import io.ltj.restructuring.domain.insurance.InsuranceSource;
import io.ltj.restructuring.domain.insurance.InsuranceType;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class CoverageLossAnalysisService {

    private final InsuranceSnapshotService snapshotService;

    public CoverageLossAnalysisService(InsuranceSnapshotService snapshotService) {
        this.snapshotService = snapshotService;
    }

    /**
     * Heuristic loss analysis based on the snapshot the user registered.
     */
    public CoverageLossAnalysisResponse analyze(Long userId) {
        InsuranceSnapshotEntity snapshot = snapshotService.getSnapshot(userId);

        if (snapshot == null) {
            return new CoverageLossAnalysisResponse(List.of(
                    new CoverageLossAnalysisResponse.Loss(
                            "Forsikringer ved jobbslutt",
                            "Ingen data registrert. Legg inn hurtigregistrering for å se hva som kan falle bort.",
                            CoverageGapAnalysisResponse.Severity.MEDIUM
                    )
            ));
        }

        List<CoverageLossAnalysisResponse.Loss> losses = new ArrayList<>();

        if (snapshot.getSource() == InsuranceSource.PRIVATE) {
            // Private forsikringer påvirkes normalt ikke av jobbslutt
            losses.add(new CoverageLossAnalysisResponse.Loss(
                    "Private forsikringer",
                    "Du har registrert at dekningene er private. De påvirkes normalt ikke av jobbslutt.",
                    CoverageGapAnalysisResponse.Severity.LOW
            ));
        } else {
            // Arbeidsgiver/ukjent: gå gjennom typer
            if (snapshot.getTypes() == null || snapshot.getTypes().isEmpty()) {
                losses.add(new CoverageLossAnalysisResponse.Loss(
                        "Forsikringer ved jobbslutt",
                        "Du er usikker på hvilke dekninger du har gjennom arbeidsgiver. Sjekk arbeidsavtale eller HR for detaljer.",
                        CoverageGapAnalysisResponse.Severity.MEDIUM
                ));
            } else {
                Map<InsuranceType, CoverageLossAnalysisResponse.Loss> mapped = lossMap();
                snapshot.getTypes().forEach(type -> {
                    CoverageLossAnalysisResponse.Loss loss = mapped.get(type);
                    if (loss != null) {
                        losses.add(loss);
                    }
                });
            }

            if (snapshot.isUncertain()) {
                losses.add(new CoverageLossAnalysisResponse.Loss(
                        "Usikkerhet",
                        "Du markerte at du er usikker. Bekreft med arbeidsgiver hvilke forsikringer du har, og om de opphører.",
                        CoverageGapAnalysisResponse.Severity.MEDIUM
                ));
            }
        }

        if (losses.isEmpty()) {
            losses.add(new CoverageLossAnalysisResponse.Loss(
                    "Forsikringer ved jobbslutt",
                    "Ingen tap identifisert basert på opplysningene.",
                    CoverageGapAnalysisResponse.Severity.LOW
            ));
        }

        return new CoverageLossAnalysisResponse(losses);
    }

    private Map<InsuranceType, CoverageLossAnalysisResponse.Loss> lossMap() {
        return Map.of(
                InsuranceType.TREATMENT, new CoverageLossAnalysisResponse.Loss(
                        "Behandlingsforsikring",
                        "Behandlingsforsikring via arbeidsgiver opphører normalt når du slutter.",
                        CoverageGapAnalysisResponse.Severity.HIGH
                ),
                InsuranceType.INCOME, new CoverageLossAnalysisResponse.Loss(
                        "Inntektsforsikring",
                        "Inntektsforsikring knyttet til arbeidsforholdet opphører når arbeidsforholdet avsluttes.",
                        CoverageGapAnalysisResponse.Severity.CRITICAL
                ),
                InsuranceType.DISABILITY, new CoverageLossAnalysisResponse.Loss(
                        "Uføreforsikring",
                        "Gruppeliv/uføredekninger fra arbeidsgiver opphører vanligvis ved jobbslutt.",
                        CoverageGapAnalysisResponse.Severity.HIGH
                ),
                InsuranceType.LIFE, new CoverageLossAnalysisResponse.Loss(
                        "Livsforsikring",
                        "Gruppelivsforsikring knyttet til ansettelse opphører når du slutter.",
                        CoverageGapAnalysisResponse.Severity.HIGH
                ),
                InsuranceType.PENSION, new CoverageLossAnalysisResponse.Loss(
                        "Tjenestepensjon",
                        "Innskudd stopper ved jobbslutt; du beholder opptjent saldo, men må sikre videre sparing.",
                        CoverageGapAnalysisResponse.Severity.MEDIUM
                ),
                InsuranceType.UNKNOWN, new CoverageLossAnalysisResponse.Loss(
                        "Ukjente dekninger",
                        "Du er usikker på hvilke dekninger du har. Bekreft med arbeidsgiver eller forsikringsselskap.",
                        CoverageGapAnalysisResponse.Severity.MEDIUM
                )
        );
    }
}
