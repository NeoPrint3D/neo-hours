import { convertToCamelCase } from "~/utils/convertToCamelCase";

const memberSearchQuery = z.object({
  q: z.string().optional(),
  status: z.enum(["pending", "active", "inactive"]),
});

export default defineEventHandler({
  onRequest: [
    middlewareAuth({
      role: "admin",
    }),
  ],
  handler: async (event) => {
    const organization = event.context.organization!;
    const query = await getValidatedQuery(event, memberSearchQuery.parse);

    console.log({
      ...query,
      id: organization.id,
    });

    const rawDb = hubDatabase();

    const preparedSql = /*sql*/ `
    WITH name_matches AS (
        SELECT rowid FROM member_name_fts WHERE member_name_fts MATCH ?1
    )
    SELECT DISTINCT om.*, u.email
    FROM organization_members AS om
    LEFT JOIN users AS u ON om.user_id = u.id
    WHERE om.rowid IN (SELECT rowid FROM name_matches)
       AND om.organization_id = ?2
       AND om.status = ?3
    LIMIT 3
    `;

    const res = await rawDb
      .prepare(preparedSql)
      .bind(query.q, organization.id, query.status)
      .all();

    console.log(res);

    return res.results.map((obj) =>
      convertToCamelCase({
        ...obj,
        additional_info: JSON.parse(obj.additional_info as string),
      })
    );
  },
});
