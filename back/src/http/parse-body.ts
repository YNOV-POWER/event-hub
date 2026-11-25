import type { z } from "zod";
import { ValidationError } from "../errors/app-error.js";
import type { FieldError } from "../errors/app-error.js";

export function parseBody<T extends z.ZodType>(schema: T, body: unknown): z.infer<T> {
    const result = schema.safeParse(body);
    if (result.success) {
        return result.data;
    }
    const errors: FieldError[] = result.error.issues.flatMap((issue) =>
        issue.code === "unrecognized_keys"
            ? issue.keys.map((key) => ({
                field: [...issue.path, key].join("."),
                code: "UNKNOWN_FIELD",
                message: `${key} is not allowed.`,
            }))
            : [{ field: issue.path.join("."), code: issue.code, message: issue.message }],
    );
    throw new ValidationError(errors);
}