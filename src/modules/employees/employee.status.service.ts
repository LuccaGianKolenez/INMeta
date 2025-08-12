import * as Repo from './employee.status.repository.js';
export const EmployeeStatusService = {
  status: (employeeId: number) => Repo.employeeStatus(employeeId)
};
