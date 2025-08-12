CREATE TABLE IF NOT EXISTS employees (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  document TEXT,
  hired_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_employees_touch_updated ON employees;
CREATE TRIGGER trg_employees_touch_updated
BEFORE UPDATE ON employees
FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
