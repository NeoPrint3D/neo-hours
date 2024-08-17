import { convertToCamelCase } from "~/utils/convertToCamelCase";

export default defineEventHandler({
  handler: async () => {
    const rawDb = hubDatabase();

    const res = await rawDb
      .prepare(
        /*sql*/ `

        SELECT additional_info from organization_members
            
            `
      )
      .run();
    console.log(res);

    return {
      res: res.results.map((obj) =>
        convertToCamelCase({
          ...obj,
          additional_info: JSON.parse(obj.additional_info),
        })
      ),
    };
  },
});
