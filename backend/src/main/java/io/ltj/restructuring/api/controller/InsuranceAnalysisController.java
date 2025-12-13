package io.ltj.restructuring.api.controller;

import io.ltj.restructuring.api.dto.insurance.CoverageGapAnalysisRequest;
import io.ltj.restructuring.api.dto.insurance.CoverageGapAnalysisResponse;
import io.ltj.restructuring.api.dto.insurance.CoverageLossAnalysisResponse;
import io.ltj.restructuring.application.insurance.CoverageGapAnalysisService;
import io.ltj.restructuring.application.insurance.CoverageLossAnalysisService;
import io.ltj.restructuring.security.JwtUserDetails;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/insurance/analysis")
public class InsuranceAnalysisController {

    private final CoverageGapAnalysisService gapAnalysisService;
    private final CoverageLossAnalysisService lossAnalysisService;

    public InsuranceAnalysisController(
            CoverageGapAnalysisService gapAnalysisService,
            CoverageLossAnalysisService lossAnalysisService
    ) {
        this.gapAnalysisService = gapAnalysisService;
        this.lossAnalysisService = lossAnalysisService;
    }

    @PostMapping("/gaps")
    public CoverageGapAnalysisResponse analyzeGaps(
            @RequestBody CoverageGapAnalysisRequest request
    ) {
        return gapAnalysisService.analyze(request);
    }

    @PostMapping("/loss")
    public CoverageLossAnalysisResponse analyzeLoss(
            @AuthenticationPrincipal JwtUserDetails principal
    ) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        return lossAnalysisService.analyze(principal.getId());
    }
}
