package io.ltj.restructuring.application.insurance;

import io.ltj.restructuring.api.dto.insurance.InsuranceProductDto;
import io.ltj.restructuring.domain.insurance.InsuranceProduct;
import io.ltj.restructuring.domain.insurance.InsuranceProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class InsuranceCatalogService {

    private final InsuranceProductRepository productRepository;

    public InsuranceCatalogService(InsuranceProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    /**
     * Hent hele forsikringskatalogen
     */
    @Transactional(readOnly = true)
    public List<InsuranceProductDto> getAllProducts() {
        return productRepository.findAllWithCategories()
                .stream()
                .map(this::toDto)
                .toList();
    }

    /**
     * Hent produkter filtrert på kategori (brukes av gap/loss-analyse)
     */
    @Transactional(readOnly = true)
    public List<InsuranceProductDto> getProductsByCategory(String category) {
        return productRepository.findByCategory(category)
                .stream()
                .map(this::toDto)
                .toList();
    }

    private InsuranceProductDto toDto(InsuranceProduct product) {
        return new InsuranceProductDto(
                product.getId(),
                product.getName(),
                product.getDescription(),
                Boolean.TRUE.equals(product.getCanBuyPrivately()),
                product.getProvider().getName(),     // providerName
                null,                                // providerCode (kan legges til senere)
                product.getCategories()
                        .stream()
                        .map(c -> c.getName())
                        .toList()
        );
    }
}
