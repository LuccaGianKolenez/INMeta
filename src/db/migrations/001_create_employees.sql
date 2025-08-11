CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS employees (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL CHECK (length(btrim(name)) > 0),
  cpf         TEXT NOT NULL UNIQUE CHECK (cpf ~ '^[0-9]{11}$'),
  hired_at    DATE NOT NULL CHECK (hired_at <= CURRENT_DATE),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_employees_touch_updated ON employees;
CREATE TRIGGER trg_employees_touch_updated
BEFORE UPDATE ON employees
FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
