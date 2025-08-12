CREATE TABLE IF NOT EXISTS document_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_document_types_touch_updated ON document_types;
CREATE TRIGGER trg_document_types_touch_updated
BEFORE UPDATE ON document_types
FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

