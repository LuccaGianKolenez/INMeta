CREATE TABLE IF NOT EXISTS document_types (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE CHECK (length(btrim(name)) > 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_document_types_touch_updated ON document_types;
CREATE TRIGGER trg_document_types_touch_updated
BEFORE UPDATE ON document_types
FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
