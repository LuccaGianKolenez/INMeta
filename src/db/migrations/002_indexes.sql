CREATE INDEX IF NOT EXISTS idx_employee_documents_status ON employee_documents(status);
CREATE INDEX IF NOT EXISTS idx_employee_documents_emp ON employee_documents(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_documents_type ON employee_documents(document_type_id);
