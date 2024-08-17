import { convertToCamelCase } from "~/utils/convertToCamelCase";

const activitySearchQuerySchema = z.object({
  q: z.string().optional(),
});

export default defineEventHandler({
  onRequest: [
    middlewareAuth({
      role: "member",
    }),
  ],
  handler: async (event) => {
    const organization = event.context.organization!;
    const query = await getValidatedQuery(
      event,
      activitySearchQuerySchema.parse
    );

    console.log(query);

    const rawDb = hubDatabase();

    const preparedSql = /*sql*/ `
    WITH name_matches AS (
        SELECT rowid FROM activity_name_fts WHERE activity_name_fts MATCH ?1
    ),
    desc_matches AS (
        SELECT rowid FROM activity_description_fts WHERE activity_description_fts MATCH ?1
    )
    SELECT DISTINCT a.*
    FROM activities AS a
    WHERE (a.rowid IN (SELECT rowid FROM name_matches)
       OR a.rowid IN (SELECT rowid FROM desc_matches))
       AND a.organization_id = ?2
    LIMIT 3
    `;

    const res = await rawDb
      .prepare(preparedSql)
      .bind(query.q, organization.id)
      .all();

    return res.results.map((obj) =>
      convertToCamelCase({
        ...obj,
        contact_verification_info: JSON.parse(
          obj.contact_verification_info as string
        ),
      })
    );
  },
});
