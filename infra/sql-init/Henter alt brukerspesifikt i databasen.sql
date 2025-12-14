WITH u AS (
  SELECT *
  FROM users
  WHERE id = :id
),
plan AS (
  SELECT p.*
  FROM user_plans p
  WHERE p.user_id = :id
  ORDER BY COALESCE(p.updated_at, p.created_at) DESC
  LIMIT 1
),
journal AS (
  SELECT jsonb_agg(
             jsonb_build_object(
                 'id', j.id,
                 'phase', j.phase,
                 'content', j.content,
                 'created_at', j.created_at
             )
             ORDER BY j.created_at DESC
         ) AS journal_entries
  FROM journal_entry j
  WHERE j.user_id = :id
),
insurance_requests AS (
  SELECT jsonb_agg(
             jsonb_build_object(
                 'id', i.id,
                 'xml_content', i.xml_content,
                 'status', i.status,
                 'created_at', i.created_at
             )
             ORDER BY i.created_at DESC
         ) AS requests
  FROM insurance_request i
  WHERE i.user_id = :id
),
user_insurances AS (
  SELECT jsonb_agg(
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
  FROM user_insurance_profile up
  WHERE up.user_id = :id
),
snapshot AS (
  SELECT jsonb_build_object(
             'id', s.id,
             'source', s.source,
             'uncertain', s.uncertain,
             'created_at', s.created_at,
             'types', (
                 SELECT array_agg(t.type ORDER BY t.type)
                 FROM insurance_snapshot_types t
                 WHERE t.snapshot_id = s.id
             )
         ) AS snapshot
  FROM insurance_snapshot s
  WHERE s.user_id = :id
  ORDER BY s.created_at DESC
  LIMIT 1
)
SELECT
  u.id            AS user_id,
  u.email         AS user_email,
  u.created_at    AS user_created,

  plan.id         AS plan_id,
  plan.phase      AS plan_phase,
  plan.persona    AS plan_persona,
  plan.needs      AS plan_needs,
  plan.diary      AS plan_diary,
  plan.created_at AS plan_created,
  plan.updated_at AS plan_updated,

  journal.journal_entries,
  insurance_requests.requests,
  user_insurances.insurances,
  snapshot.snapshot
FROM u
LEFT JOIN plan ON TRUE
LEFT JOIN journal ON TRUE
LEFT JOIN insurance_requests ON TRUE
LEFT JOIN user_insurances ON TRUE
LEFT JOIN snapshot ON TRUE;
