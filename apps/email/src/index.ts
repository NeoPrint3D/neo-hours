import { render } from "@react-email/render";
import { Env, Hono, Input, MiddlewareHandler, ValidationTargets } from "hono";
import { validator } from "hono/validator";
import { ZodSchema, z } from "zod";
import { ReminderEmail, ReminderEmailSchema } from "../emails/Reminder";
import {
  VerificatonEmail,
  VerificatonEmailSchema,
} from "../emails/Verifcation";

const emails = {
  VerificatonEmail,
  ReminderEmail,
};

const schemas = {
  VerificatonEmailSchema,
  ReminderEmailSchema,
};

type HasUndefined<T> = undefined extends T ? true : false;

export const zValidator = <
  T extends ZodSchema,
  Target extends keyof ValidationTargets,
  E extends Env,
  P extends string,
  In = z.input<T>,
  Out = z.output<T>,
  I extends Input = {
    in: HasUndefined<In> extends true
      ? {
          [K in Target]?: K extends "json"
            ? In
            : HasUndefined<keyof ValidationTargets[K]> extends true
              ? { [K2 in keyof In]?: ValidationTargets[K][K2] }
              : { [K2 in keyof In]: ValidationTargets[K][K2] };
        }
      : {
          [K in Target]: K extends "json"
            ? In
            : HasUndefined<keyof ValidationTargets[K]> extends true
              ? { [K2 in keyof In]?: ValidationTargets[K][K2] }
              : { [K2 in keyof In]: ValidationTargets[K][K2] };
        };
    out: { [K in Target]: Out };
  },
  V extends I = I,
>(
  target: Target,
  schemas: Record<string, T>,
  emails: Record<string, React.FC<z.infer<T>>>,
): MiddlewareHandler<E, P, V> => {
  // @ts-expect-error - This is a hack to get around the fact that the type of the validator function is not correct
  return validator(target, async (value, c) => {
    const routeName = value.type as string;
    const schema = schemas[`${routeName}Schema` as keyof typeof schemas] as
      | ZodSchema
      | undefined;

    if (!schema) {
      return c.json({ error: `No schema found for route '${routeName}'` }, 400);
    }

    const result = await schema.safeParseAsync(value);

    if (!result.success) {
      return c.json(result, 400);
    }

    const Email = emails[routeName];

    if (!Email) {
      return c.text("Email not found", 404);
    }
    // @ts-expect-error | Ignored
    const html = render(Email({ ...result.data }));
    return c.json({ html });
  });
};

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello World");
});

// app.get("/email", (c) => {
//   const emails = Object.values

//  return   c.html
// }
const renderEmailRoute = app.post(
  "/render",
  // @ts-expect-error - This is a hack to get around the fact that the type of the validator function is not correct
  zValidator("json", schemas, emails),
  async (c) => {
    return c.json({
      html: "",
    });
  },
);

export type EmailApiType = typeof renderEmailRoute;
export default app;
