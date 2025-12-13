CREATE TABLE insurance_snapshot (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    source VARCHAR(30) NOT NULL,
    uncertain BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE insurance_snapshot_types (
    snapshot_id BIGINT NOT NULL,
    type VARCHAR(30) NOT NULL,
    CONSTRAINT fk_snapshot
        FOREIGN KEY (snapshot_id)
        REFERENCES insurance_snapshot (id)
        ON DELETE CASCADE
);
