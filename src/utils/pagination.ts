export function getPagination(page = 1, pageSize = 10) {
  const p = Math.max(1, page);
  const ps = Math.min(100, Math.max(1, pageSize));
  return { limit: ps, offset: (p - 1) * ps };
}
