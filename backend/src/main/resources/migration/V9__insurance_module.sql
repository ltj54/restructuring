-- ================================================
-- V9__insurance_module.sql
-- Adds res_user_insurance_profile and refreshes catalog seed data (idempotent-friendly)
-- ================================================

-- --------------------------
-- USER INSURANCE PROFILE (hva har brukeren fra før?)
-- --------------------------
CREATE TABLE IF NOT EXISTS res_user_insurance_profile (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    source VARCHAR(50) NOT NULL, -- 'EMPLOYER', 'PRIVATE', 'OTHER'
    provider_name VARCHAR(255),
    product_name VARCHAR(255),
    notes TEXT,
    active BOOLEAN DEFAULT TRUE,
    valid_from DATE,
    valid_to DATE
);

CREATE INDEX IF NOT EXISTS idx_user_insurance_profile_user_id
    ON res_user_insurance_profile (user_id);

-- --------------------------
-- SEEDING - Providers (skip if already present)
-- --------------------------
INSERT INTO res_insurance_provider (name, website) VALUES
  ('Gjensidige', 'https://www.gjensidige.no'),
  ('If Skadeforsikring', 'https://www.if.no'),
  ('Frende Forsikring', 'https://www.frende.no'),
  ('Storebrand', 'https://www.storebrand.no'),
  ('Nordea Liv', 'https://www.nordealiv.no'),
  ('DNB Liv', 'https://www.dnb.no')
ON CONFLICT (name) DO NOTHING;

-- --------------------------
-- SEEDING - Categories (adds a few extras)
-- --------------------------
INSERT INTO res_insurance_category (name) VALUES
  ('Inntektssikring'),
  ('Uførepensjon'),
  ('Arbeidsavklaringsforsikring'),
  ('Behandlingsforsikring'),
  ('Helserelatert'),
  ('Personforsikring'),
  ('Barneforsikring'),
  ('Reiseforsikring')
ON CONFLICT (name) DO NOTHING;

-- --------------------------
-- SEEDING - Products
-- --------------------------
INSERT INTO res_insurance_product (provider_id, name, description, can_buy_privately)
SELECT id, 'Inntektssikring / Arbeidsavklaringsforsikring',
       'Månedlige utbetalinger ved sykdom, ulykke eller redusert arbeidsevne. Helserelatert inntektssikring - dekker ikke jobbtap.',
       TRUE
FROM res_insurance_provider WHERE name = 'Gjensidige'
ON CONFLICT (provider_id, name) DO NOTHING;

INSERT INTO res_insurance_product (provider_id, name, description, can_buy_privately)
SELECT id, 'Inntektssikring',
       'Gir månedlige utbetalinger ved helserelatert arbeidstap etter karenstid. Dekker ikke oppsigelse/omstilling.',
       TRUE
FROM res_insurance_provider WHERE name = 'If Skadeforsikring'
ON CONFLICT (provider_id, name) DO NOTHING;

INSERT INTO res_insurance_product (provider_id, name, description)
SELECT id, 'Uførepensjon med inntektssikring',
       'Fleksibel uføredekning. Utbetaling ved 20-40 % arbeidsuførhet.'
FROM res_insurance_provider WHERE name = 'Frende Forsikring'
ON CONFLICT (provider_id, name) DO NOTHING;

INSERT INTO res_insurance_product (provider_id, name, description)
SELECT id, 'Inntektssikring',
       'Dekker inntektstap fra lavere uføregrad enn NAV. Helserelatert risiko.'
FROM res_insurance_provider WHERE name = 'Storebrand'
ON CONFLICT (provider_id, name) DO NOTHING;

INSERT INTO res_insurance_product (provider_id, name, description)
SELECT id, 'Inntektssikring ved uførhet',
       'Knyttet til uførepensjon eller uførekapital. Dekker varig helserelatert inntektstap.'
FROM res_insurance_provider WHERE name = 'Nordea Liv'
ON CONFLICT (provider_id, name) DO NOTHING;

INSERT INTO res_insurance_product (provider_id, name, description)
SELECT id, 'Inntektssikring (tilvalg)',
       'Tilvalg i forsikringspakken som gir månedlige ytelser ved varig helserelatert inntektstap.'
FROM res_insurance_provider WHERE name = 'DNB Liv'
ON CONFLICT (provider_id, name) DO NOTHING;

-- --------------------------
-- SEEDING - Features
-- --------------------------
INSERT INTO res_insurance_product_feature (product_id, label, description)
SELECT p.id, 'Sykdom', 'Månedlig kompensasjon ved sykdom.'
FROM res_insurance_product p WHERE p.name LIKE 'Inntektssikring / Arbeidsavklaringsforsikring'
ON CONFLICT (product_id, label) DO NOTHING;

INSERT INTO res_insurance_product_feature (product_id, label, description)
SELECT p.id, 'Ulykke', 'Månedlig kompensasjon ved ulykke.'
FROM res_insurance_product p WHERE p.name LIKE 'Inntektssikring / Arbeidsavklaringsforsikring'
ON CONFLICT (product_id, label) DO NOTHING;

INSERT INTO res_insurance_product_feature (product_id, label, description)
SELECT p.id, 'Redusert arbeidsevne', 'Månedlig kompensasjon ved redusert arbeidsevne (helserelatert).'
FROM res_insurance_product p WHERE p.name LIKE 'Inntektssikring / Arbeidsavklaringsforsikring'
ON CONFLICT (product_id, label) DO NOTHING;

INSERT INTO res_insurance_product_feature (product_id, label, description)
SELECT p.id, 'Karenstid', 'Utbetaling starter etter avtalt karenstid.'
FROM res_insurance_product p WHERE p.name = 'Inntektssikring'
ON CONFLICT (product_id, label) DO NOTHING;

INSERT INTO res_insurance_product_feature (product_id, label, description)
SELECT p.id, 'Lav uføregrad', 'Utbetaling kan starte ved 20-40 % uførhet.'
FROM res_insurance_product p WHERE p.name = 'Uførepensjon med inntektssikring'
ON CONFLICT (product_id, label) DO NOTHING;

-- --------------------------
-- SEEDING - Product Categories Link
-- --------------------------
INSERT INTO res_insurance_product_category (product_id, category_id)
SELECT p.id, c.id
FROM res_insurance_product p, res_insurance_category c
WHERE p.name LIKE 'Inntektssikring / Arbeidsavklaringsforsikring'
  AND c.name IN ('Inntektssikring', 'Arbeidsavklaringsforsikring', 'Helserelatert')
ON CONFLICT DO NOTHING;

INSERT INTO res_insurance_product_category (product_id, category_id)
SELECT p.id, c.id
FROM res_insurance_product p, res_insurance_category c
WHERE p.name = 'Inntektssikring'
  AND c.name IN ('Inntektssikring', 'Helserelatert')
ON CONFLICT DO NOTHING;

INSERT INTO res_insurance_product_category (product_id, category_id)
SELECT p.id, c.id
FROM res_insurance_product p, res_insurance_category c
WHERE p.name = 'Uførepensjon med inntektssikring'
  AND c.name IN ('Uførepensjon', 'Inntektssikring', 'Helserelatert')
ON CONFLICT DO NOTHING;

INSERT INTO res_insurance_product_category (product_id, category_id)
SELECT p.id, c.id
FROM res_insurance_product p, res_insurance_category c
WHERE p.name = 'Inntektssikring'
  AND c.name IN ('Inntektssikring', 'Helserelatert')
ON CONFLICT DO NOTHING;

INSERT INTO res_insurance_product_category (product_id, category_id)
SELECT p.id, c.id
FROM res_insurance_product p, res_insurance_category c
WHERE p.name = 'Inntektssikring ved uførhet'
  AND c.name IN ('Inntektssikring', 'Uførepensjon', 'Helserelatert')
ON CONFLICT DO NOTHING;

INSERT INTO res_insurance_product_category (product_id, category_id)
SELECT p.id, c.id
FROM res_insurance_product p, res_insurance_category c
WHERE p.name = 'Inntektssikring (tilvalg)'
  AND c.name IN ('Inntektssikring', 'Helserelatert')
ON CONFLICT DO NOTHING;

