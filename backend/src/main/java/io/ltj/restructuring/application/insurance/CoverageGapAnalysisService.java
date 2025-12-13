package io.ltj.restructuring.application.insurance;

import io.ltj.restructuring.api.dto.insurance.CoverageGapAnalysisRequest;
import io.ltj.restructuring.api.dto.insurance.CoverageGapAnalysisResponse;
import io.ltj.restructuring.domain.insurance.InsuranceProduct;
import io.ltj.restructuring.domain.insurance.InsuranceProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CoverageGapAnalysisService {

    private final InsuranceProductRepository productRepository;

    public CoverageGapAnalysisService(InsuranceProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public CoverageGapAnalysisResponse analyze(CoverageGapAnalysisRequest request) {

        // Eksempel: mangler privat uføre / inntektssikring
        if (!request.hasPrivateDisability()) {

            List<InsuranceProduct> products =
                    productRepository.findByCategory("Inntektssikring")
                            .stream()
                            .limit(3)
                            .toList();

            List<CoverageGapAnalysisResponse.RecommendedProduct> recommended =
                    products.stream()
                            .map(p -> new CoverageGapAnalysisResponse.RecommendedProduct(
                                    p.getId(),
                                    p.getName(),
                                    p.getProvider().getName()
                            ))
                            .toList();

            CoverageGapAnalysisResponse.CoverageGap gap =
                    new CoverageGapAnalysisResponse.CoverageGap(
                            "Inntekt ved sykdom/uførhet",
                            CoverageGapAnalysisResponse.Severity.CRITICAL,
                            "Du mangler privat inntektssikring ved sykdom eller uførhet.",
                            "Kun NAV-dekning.",
                            "Vurder privat inntektssikring.",
                            recommended
                    );

            return new CoverageGapAnalysisResponse(List.of(gap));
        }

        return new CoverageGapAnalysisResponse(List.of());
    }
}
