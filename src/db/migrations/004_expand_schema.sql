ALTER TABLE employees
ADD COLUMN document TEXT,
ADD COLUMN hired_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();

ALTER TABLE employee_documents
ALTER COLUMN status SET DEFAULT 'PENDING',
ALTER COLUMN status SET NOT NULL,
ADD CONSTRAINT status_check CHECK (status IN ('PENDING', 'SENT')),
ADD COLUMN created_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();

ALTER TABLE documents
ADD COLUMN name TEXT;

CREATE INDEX IF NOT EXISTS idx_employee_documents_employee_id
    ON employee_documents(employee_id);

CREATE INDEX IF NOT EXISTS idx_employee_documents_document_type_id
    ON employee_documents(document_type_id);
