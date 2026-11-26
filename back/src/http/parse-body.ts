import type { z } from "zod";
import { ValidationError } from "../errors/app-error.js";
import type { FieldError } from "../errors/app-error.js";

const SIZE_CODES: Record<string, { min: string; max: string }> = {
    string: { min: "MIN_LENGTH", max: "MAX_LENGTH" },
    number: { min: "MIN_VALUE", max: "MAX_VALUE" },
};

/** Maps a Zod issue to the stable field-level code of the contract (§5), e.g. `MIN_LENGTH`. */
function issueCode(issue: z.core.$ZodIssue): string {
    switch (issue.code) {
        case "invalid_type":
            return "INVALID_TYPE";
        case "invalid_format":
            return "INVALID_FORMAT";
        case "invalid_value":
            return "INVALID_VALUE";
        case "too_small":
            return SIZE_CODES[issue.origin]?.min ?? "TOO_SMALL";
        case "too_big":
            return SIZE_CODES[issue.origin]?.max ?? "TOO_BIG";
        case "custom": {
            const code: unknown = issue.params?.["code"];
            return typeof code === "string" ? code : "INVALID_VALUE";
        }
        default:
            return "INVALID_VALUE";
    }
}

/** Validates a request body against a Zod schema. Invalid or unknown fields raise `422 VALIDATION_FAILED`. */
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
            : [{ field: issue.path.join("."), code: issueCode(issue), message: issue.message }],
    );
    throw new ValidationError(errors);
}
