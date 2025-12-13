-- ================================================
-- Insurance Product Catalog (idempotent-friendly)
-- ================================================

-- --------------------------
-- 1. PROVIDERS
-- --------------------------
CREATE TABLE IF NOT EXISTS insurance_provider (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    website VARCHAR(500),
    UNIQUE (name)
);

-- --------------------------
-- 2. PRODUCT
-- --------------------------
CREATE TABLE IF NOT EXISTS insurance_product (
    id SERIAL PRIMARY KEY,
    provider_id INTEGER NOT NULL REFERENCES insurance_provider(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    can_buy_privately BOOLEAN DEFAULT TRUE,
    url VARCHAR(500),
    UNIQUE (provider_id, name)
);

-- --------------------------
-- 3. CATEGORY (uforhet, inntektssikring, etc.)
-- --------------------------
CREATE TABLE IF NOT EXISTS insurance_category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- Many-to-many link
CREATE TABLE IF NOT EXISTS insurance_product_category (
    product_id INTEGER NOT NULL REFERENCES insurance_product(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES insurance_category(id),
    PRIMARY KEY (product_id, category_id)
);

-- --------------------------
-- 4. FEATURES / COVERAGE DETAILS
-- --------------------------
CREATE TABLE IF NOT EXISTS insurance_product_feature (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES insurance_product(id) ON DELETE CASCADE,
    label VARCHAR(255) NOT NULL,
    description TEXT,
    UNIQUE (product_id, label)
);

-- --------------------------------------------------
-- 5. SEEDING - Providers
-- --------------------------------------------------
INSERT INTO insurance_provider (name, website) VALUES
  ('Gjensidige', 'https://www.gjensidige.no'),
  ('If Skadeforsikring', 'https://www.if.no'),
  ('Frende Forsikring', 'https://www.frende.no'),
  ('Storebrand', 'https://www.storebrand.no'),
  ('Nordea Liv', 'https://www.nordealiv.no'),
  ('DNB Liv', 'https://www.dnb.no')
ON CONFLICT (name) DO NOTHING;

-- --------------------------------------------------
-- 6. SEEDING - Categories
-- --------------------------------------------------
INSERT INTO insurance_category (name) VALUES
  ('Inntektssikring'),
  ('Uforepensjon'),
  ('Arbeidsavklaringsforsikring'),
  ('Behandlingsforsikring'),
  ('Helserelatert'),
  ('Personforsikring')
ON CONFLICT (name) DO NOTHING;

-- --------------------------------------------------
-- 7. SEEDING - Products
-- --------------------------------------------------

-- 1. Gjensidige
INSERT INTO insurance_product (provider_id, name, description, can_buy_privately)
SELECT id, 'Inntektssikring / Arbeidsavklaringsforsikring',
       'Månedlige utbetalinger ved sykdom, ulykke eller redusert arbeidsevne.',
       TRUE
FROM insurance_provider WHERE name = 'Gjensidige'
ON CONFLICT (provider_id, name) DO NOTHING;

-- 2. If
INSERT INTO insurance_product (provider_id, name, description, can_buy_privately)
SELECT id, 'Inntektssikring',
       'Gir månedlige utbetalinger etter karenstid. Sterk på helse- og arbeidsdekninger.',
       TRUE
FROM insurance_provider WHERE name = 'If Skadeforsikring'
ON CONFLICT (provider_id, name) DO NOTHING;

-- 3. Frende
INSERT INTO insurance_product (provider_id, name, description)
SELECT id, 'Uførepensjon med inntektssikring',
       'Fleksibel uføredekning. Utbetaling ved 20-40% arbeidsuførhet.'
FROM insurance_provider WHERE name = 'Frende Forsikring'
ON CONFLICT (provider_id, name) DO NOTHING;

-- 4. Storebrand
INSERT INTO insurance_product (provider_id, name, description)
SELECT id, 'Inntektssikring',
       'Dekker inntektstap fra lavere uføregrad enn NAV.'
FROM insurance_provider WHERE name = 'Storebrand'
ON CONFLICT (provider_id, name) DO NOTHING;

-- 5. Nordea Liv
INSERT INTO insurance_product (provider_id, name, description)
SELECT id, 'Inntektssikring ved uførhet',
       'Knyttet til uførepensjon eller uførekapital.'
FROM insurance_provider WHERE name = 'Nordea Liv'
ON CONFLICT (provider_id, name) DO NOTHING;

-- 6. DNB Liv
INSERT INTO insurance_product (provider_id, name, description)
SELECT id, 'Inntektssikring (tilvalg)',
       'Betaler månedlige ytelser ved varig sykdom eller skade.'
FROM insurance_provider WHERE name = 'DNB Liv'
ON CONFLICT (provider_id, name) DO NOTHING;

-- --------------------------------------------------
-- 8. SEEDING - Features
-- --------------------------------------------------

-- Gjensidige
INSERT INTO insurance_product_feature (product_id, label, description)
SELECT p.id, 'Sykdom', 'Utbetaling ved sykdom.'
FROM insurance_product p WHERE p.name LIKE 'Inntektssikring / Arbeidsavklaringsforsikring'
ON CONFLICT (product_id, label) DO NOTHING;

INSERT INTO insurance_product_feature (product_id, label, description)
SELECT p.id, 'Ulykke', 'Utbetaling ved ulykke.'
FROM insurance_product p WHERE p.name LIKE 'Inntektssikring / Arbeidsavklaringsforsikring'
ON CONFLICT (product_id, label) DO NOTHING;

INSERT INTO insurance_product_feature (product_id, label, description)
SELECT p.id, 'Redusert arbeidsevne', 'Månedlig kompensasjon.'
FROM insurance_product p WHERE p.name LIKE 'Inntektssikring / Arbeidsavklaringsforsikring'
ON CONFLICT (product_id, label) DO NOTHING;

-- If
INSERT INTO insurance_product_feature (product_id, label, description)
SELECT p.id, 'Karenstid', 'Utbetaling starter etter definert karenstid.'
FROM insurance_product p WHERE p.name = 'Inntektssikring'
ON CONFLICT (product_id, label) DO NOTHING;

-- Frende
INSERT INTO insurance_product_feature (product_id, label, description)
SELECT p.id, 'Uførehetsgrad', 'Utbetaling mulig allerede ved 20-40 % uførhet.'
FROM insurance_product p WHERE p.name = 'Uførepensjon med inntektssikring'
ON CONFLICT (product_id, label) DO NOTHING;

-- --------------------------------------------------
-- 9. SEEDING - Product Categories Link
-- --------------------------------------------------

-- Gjensidige
INSERT INTO insurance_product_category (product_id, category_id)
SELECT p.id, c.id
FROM insurance_product p, insurance_category c
WHERE p.name LIKE 'Inntektssikring / Arbeidsavklaringsforsikring'
  AND c.name IN ('Inntektssikring', 'Arbeidsavklaringsforsikring', 'Helserelatert')
ON CONFLICT DO NOTHING;

-- If
INSERT INTO insurance_product_category (product_id, category_id)
SELECT p.id, c.id
FROM insurance_product p, insurance_category c
WHERE p.name = 'Inntektssikring'
  AND c.name IN ('Inntektssikring', 'Helserelatert')
ON CONFLICT DO NOTHING;

-- Frende
INSERT INTO insurance_product_category (product_id, category_id)
SELECT p.id, c.id
FROM insurance_product p, insurance_category c
WHERE p.name = 'Uførepensjon med inntektssikring'
  AND c.name IN ('Uforepensjon', 'Inntektssikring')
ON CONFLICT DO NOTHING;

-- Storebrand
INSERT INTO insurance_product_category (product_id, category_id)
SELECT p.id, c.id
FROM insurance_product p, insurance_category c
WHERE p.name = 'Inntektssikring'
  AND c.name = 'Inntektssikring'
ON CONFLICT DO NOTHING;

-- Nordea Liv
INSERT INTO insurance_product_category (product_id, category_id)
SELECT p.id, c.id
FROM insurance_product p, insurance_category c
WHERE p.name = 'Inntektssikring ved uførhet'
  AND c.name IN ('Inntektssikring', 'Uforepensjon')
ON CONFLICT DO NOTHING;

-- DNB Liv
INSERT INTO insurance_product_category (product_id, category_id)
SELECT p.id, c.id
FROM insurance_product p, insurance_category c
WHERE p.name = 'Inntektssikring (tilvalg)'
  AND c.name = 'Inntektssikring'
ON CONFLICT DO NOTHING;
