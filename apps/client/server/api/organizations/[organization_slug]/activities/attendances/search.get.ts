import { convertToCamelCase } from "~/utils/convertToCamelCase";

export default defineEventHandler({
  onRequest: [
    // middlewareAuth({
    //   role: "member",
    // }),
  ],
  handler: async (event) => {
    // prevent unauthorized access for other organizations
    const organization = event.context.organization!;
    const validatedQuery = await getValidatedQuery(event, (query) =>
      z
        .object({
          q: z.string().optional(),
          status: z.enum(["pending", "approved", "rejected"]),
        })
        .parse(query)
    );

    console.log(validatedQuery);

    const rawDb = hubDatabase();

    const preparedSql = /*sql*/ `
  WITH name_matches AS (
    SELECT rowid FROM activity_name_fts WHERE activity_name_fts MATCH ?1
),
member_name_matches AS (
    SELECT om.rowid 
    FROM organization_members om 
    JOIN member_name_fts mnft ON om.rowid = mnft.rowid 
    WHERE mnft.member_name_fts MATCH ?1
)
SELECT aa.*, 
JSON_OBJECT(
    'id', a.id, 
    'name', a.name
) as activity
FROM activities AS a
JOIN activity_attendances AS aa ON a.id = aa.activity_id
WHERE (a.rowid IN (SELECT rowid FROM name_matches)
   OR aa.organization_member_id IN (SELECT rowid FROM member_name_matches))
   AND a.organization_id = ?2
   AND aa.status = ?3
LIMIT 3;
    `;

    const res = await rawDb
      .prepare(preparedSql)
      .bind(validatedQuery.q, organization.id, validatedQuery.status)
      .all();

    return res.results.map((obj) =>
      convertToCamelCase({
        ...obj,
        activity: JSON.parse(obj.activity as string),
      })
    );
  },
});
