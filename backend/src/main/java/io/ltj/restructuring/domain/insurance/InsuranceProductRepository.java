package io.ltj.restructuring.domain.insurance;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface InsuranceProductRepository
        extends JpaRepository<InsuranceProduct, Long> {

    @Query("""
                select distinct p
                from InsuranceProduct p
                join fetch p.provider
                left join fetch p.categories c
            """)
    List<InsuranceProduct> findAllWithCategories();

    @Query("""
                select distinct p
                from InsuranceProduct p
                join fetch p.provider
                join fetch p.categories c
                where c.name = :category
            """)
    List<InsuranceProduct> findByCategory(@Param("category") String category);
}
