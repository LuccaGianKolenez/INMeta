CREATE OR REPLACE VIEW v_pending_documents AS
SELECT
  ed.id             AS link_id,
  e.id              AS employee_id,
  e.name            AS employee_name,
  dt.id             AS document_type_id,
  dt.name           AS document_type_name,
  ed.created_at     AS linked_at
FROM employee_documents ed
JOIN employees e       ON e.id = ed.employee_id
JOIN document_types dt ON dt.id = ed.document_type_id
WHERE ed.status = 'PENDING';
