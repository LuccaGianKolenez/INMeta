CREATE INDEX IF NOT EXISTS idx_employee_documents_employee_id ON employee_documents(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_documents_document_type_id ON employee_documents(document_type_id);
CREATE INDEX IF NOT EXISTS idx_employee_documents_status ON employee_documents(status);

CREATE UNIQUE INDEX IF NOT EXISTS uq_document_types_name_nocase
  ON document_types (LOWER(name));

CREATE UNIQUE INDEX IF NOT EXISTS uq_employees_cpf_not_null
  ON employees (cpf) WHERE cpf IS NOT NULL;
