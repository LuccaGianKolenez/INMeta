CREATE TABLE IF NOT EXISTS employee_documents (
  id                SERIAL PRIMARY KEY,
  employee_id       INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  document_type_id  INTEGER NOT NULL REFERENCES document_types(id) ON DELETE CASCADE,
  name              TEXT,
  status            TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','SENT')),
  sent_at           TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (employee_id, document_type_id),
  CHECK (
    (status = 'PENDING' AND sent_at IS NULL)
    OR
    (status = 'SENT' AND sent_at IS NOT NULL)
  )
);

DROP TRIGGER IF EXISTS trg_employee_documents_touch_updated ON employee_documents;
CREATE TRIGGER trg_employee_documents_touch_updated
BEFORE UPDATE ON employee_documents
FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE INDEX IF NOT EXISTS idx_employee_documents_status ON employee_documents(status);
CREATE INDEX IF NOT EXISTS idx_employee_documents_emp    ON employee_documents(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_documents_type   ON employee_documents(document_type_id);
