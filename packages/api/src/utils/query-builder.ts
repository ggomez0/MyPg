import postgres from "postgres";

export function sanitizeIdentifier(identifier: string): string {
  return identifier.replace(/[^a-zA-Z0-9_]/g, "");
}

export function buildQuery(
  sql: postgres.Sql,
  tableName: string,
  query: Record<string, any>,
  allowedColumns: string[]
) {
  const safeTable = sql(sanitizeIdentifier(tableName));
  let selectCols: any = sql`*`;

  if (query.fields && typeof query.fields === "string") {
    const fields = query.fields.split(",").filter((f: string) => allowedColumns.includes(f));
    if (fields.length > 0) {
      selectCols = sql(fields.map(sanitizeIdentifier));
    }
  }

  let whereClause = sql`1=1`;
  if (query.filter) {
    for (const [key, value] of Object.entries(query.filter)) {
      if (!allowedColumns.includes(key)) continue;
      const safeCol = sql(sanitizeIdentifier(key));
      if (typeof value === "object" && value !== null) {
        const vObj = value as Record<string, string>;
        if (vObj.gt) whereClause = sql`${whereClause} AND ${safeCol} > ${vObj.gt}`;
        if (vObj.lt) whereClause = sql`${whereClause} AND ${safeCol} < ${vObj.lt}`;
        if (vObj.like) whereClause = sql`${whereClause} AND ${safeCol} ILIKE ${vObj.like}`;
        if (vObj.in) {
          const inVals = vObj.in.split(",");
          whereClause = sql`${whereClause} AND ${safeCol} IN ${sql(inVals)}`;
        }
      } else {
        whereClause = sql`${whereClause} AND ${safeCol} = ${value as string}`;
      }
    }
  }

  let orderBy = sql``;
  if (query.sort && typeof query.sort === "string") {
    const sorts = query.sort.split(",");
    const validSorts = sorts.filter((s: string) => {
      const [col] = s.split(":");
      return allowedColumns.includes(col);
    });
    if (validSorts.length > 0) {
      const orderParts = validSorts.map((s: string) => {
        const [col, dir] = s.split(":");
        const safeCol = sql(sanitizeIdentifier(col));
        return dir === "desc" ? sql`${safeCol} DESC` : sql`${safeCol} ASC`;
      });
      orderBy = sql`ORDER BY ${orderParts.reduce((acc: any, curr: any, i: number) => i === 0 ? curr : sql`${acc}, ${curr}`, sql``)}`;
    }
  }

  const page = Math.max(1, parseInt(query.page as string) || 1);
  const perPage = Math.min(500, Math.max(1, parseInt(query.perPage as string) || 20));
  const offset = (page - 1) * perPage;

  const limitOffset = sql`LIMIT ${perPage} OFFSET ${offset}`;

  return {
    dataQuery: sql`SELECT ${selectCols} FROM ${safeTable} WHERE ${whereClause} ${orderBy} ${limitOffset}`,
    countQuery: sql`SELECT COUNT(*) FROM ${safeTable} WHERE ${whereClause}`,
    page,
    perPage
  };
}
