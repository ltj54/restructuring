-- V900__test_baseline.sql
-- Test-only Flyway baseline
--
-- Denne migreringen finnes kun for å:
-- 1) Tvinge Flyway til å kjøre i test
-- 2) Bryte sirkulær avhengighet mellom Flyway og JPA
-- 3) Sikre stabil init-rekkefølge i H2

-- Ingen schema-endringer her med vilje.
-- Alle reelle endringer ligger i ordinære migreringer.

