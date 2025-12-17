-- Creates a reusable view that assembles the user profile with plan, journal, insurance requests,
-- insurance profile entries and the latest insurance snapshot.
CREATE OR REPLACE VIEW user_profile_view AS
WITH latest_plan AS (
    SELECT p.*,
           ROW_NUMBER() OVER (PARTITION BY p.user_id ORDER BY COALESCE(p.updated_at, p.created_at) DESC) AS rn
    FROM res_user_plans p
),
journal AS (
    SELECT j.user_id,
           jsonb_agg(
               jsonb_build_object(
                   'id', j.id,
                   'phase', j.phase,
                   'content', j.content,
                   'created_at', j.created_at
               )
               ORDER BY j.created_at DESC
           ) AS journal_entries
    FROM res_journal_entry j
    GROUP BY j.user_id
),
insurance_requests AS (
    SELECT i.user_id,
           jsonb_agg(
               jsonb_build_object(
                   'id', i.id,
                   'xml_content', i.xml_content,
                   'status', i.status,
                   'created_at', i.created_at
               )
               ORDER BY i.created_at DESC
           ) AS requests
    FROM res_insurance_request i
    GROUP BY i.user_id
),
user_insurances AS (
    SELECT up.user_id,
           jsonb_agg(
               jsonb_build_object(
                   'id', up.id,
                   'source', up.source,
                   'provider_name', up.provider_name,
                   'product_name', up.product_name,
                   'notes', up.notes,
                   'active', up.active,
                   'valid_from', up.valid_from,
                   'valid_to', up.valid_to
               )
               ORDER BY up.id DESC
           ) AS insurances
    FROM res_user_insurance_profile up
    GROUP BY up.user_id
),
snapshot AS (
    SELECT s.user_id,
           jsonb_build_object(
               'id', s.id,
               'source', s.source,
               'uncertain', s.uncertain,
               'created_at', s.created_at,
               'types', (
                   SELECT array_agg(t.type ORDER BY t.type)
                   FROM res_insurance_snapshot_types t
                   WHERE t.snapshot_id = s.id
               )
           ) AS snapshot,
           ROW_NUMBER() OVER (PARTITION BY s.user_id ORDER BY s.created_at DESC) AS rn
    FROM res_insurance_snapshot s
)
SELECT
    u.id            AS user_id,
    u.email         AS user_email,
    u.created_at    AS user_created,
    lp.id           AS plan_id,
    lp.phase        AS plan_phase,
    lp.persona      AS plan_persona,
    lp.needs        AS plan_needs,
    lp.diary        AS plan_diary,
    lp.created_at   AS plan_created,
    lp.updated_at   AS plan_updated,
    j.journal_entries,
    ir.requests,
    ui.insurances,
    sn.snapshot
FROM res_users u
LEFT JOIN latest_plan lp ON lp.user_id = u.id AND lp.rn = 1
LEFT JOIN journal j ON j.user_id = u.id
LEFT JOIN insurance_requests ir ON ir.user_id = u.id
LEFT JOIN user_insurances ui ON ui.user_id = u.id
LEFT JOIN snapshot sn ON sn.user_id = u.id AND sn.rn = 1;

