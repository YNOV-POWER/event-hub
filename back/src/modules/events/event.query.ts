import { z } from "zod";
import { EventCategory } from "../../../generated/prisma/enums.js";
import { InvalidQueryParamError } from "../../errors/app-error.js";
import type { FieldError } from "../../errors/app-error.js";
import type { EventSort } from "./event.model.js";
import type { ListPublishedEventsParams } from "./event.service.js";

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
/** Keeps `(page - 1) * pageSize` an exact integer that PostgreSQL accepts as OFFSET. */
const MAX_PAGE = 1_000_000_000;

const SORT_VALUES = ["startsAt", "-startsAt", "createdAt", "-createdAt", "title", "-title"] as const;
type SortValue = (typeof SORT_VALUES)[number];

/** A leading "-" means descending order (contract §4.3). */
const SORTS: Record<SortValue, EventSort> = {
  startsAt: { field: "startsAt", direction: "asc" },
  "-startsAt": { field: "startsAt", direction: "desc" },
  createdAt: { field: "createdAt", direction: "asc" },
  "-createdAt": { field: "createdAt", direction: "desc" },
  title: { field: "title", direction: "asc" },
  "-title": { field: "title", direction: "desc" },
};

const CATEGORY_VALUES = Object.values(EventCategory);

const singleValue = (name: string) => z.string({ error: `${name} must be provided once.` });

const integerParam = (name: string, min: number, max: number) =>
  singleValue(name)
    .regex(/^\d+$/, { error: `${name} must be an integer.` })
    .transform(Number)
    .pipe(
      z
        .number()
        .min(min, { error: `${name} must be >= ${min}.` })
        .max(max, { error: `${name} must be <= ${max}.` }),
    );

const dateTimeParam = (name: string) =>
  z.iso
    .datetime({ error: `${name} must be an ISO 8601 UTC date-time, e.g. 2026-12-10T18:00:00Z.` })
    .transform((value) => new Date(value));

const listEventsQuerySchema = z
  .strictObject({
    page: integerParam("page", 1, MAX_PAGE).optional(),
    pageSize: integerParam("pageSize", 1, MAX_PAGE_SIZE).optional(),
    from: dateTimeParam("from").optional(),
    to: dateTimeParam("to").optional(),
    category: singleValue("category")
      .transform((value) => value.split(","))
      .pipe(z.array(z.enum(EventCategory, { error: `category values must be among ${CATEGORY_VALUES.join(", ")}.` })))
      .optional(),
    q: singleValue("q")
      .trim()
      .min(2, { error: "q must contain at least 2 characters." })
      .max(100, { error: "q must contain at most 100 characters." })
      .optional(),
    sort: z.enum(SORT_VALUES, { error: `sort must be one of ${SORT_VALUES.join(", ")}.` }).optional(),
  })
  .refine((query) => query.from === undefined || query.to === undefined || query.from <= query.to, {
    path: ["to"],
    error: "to must be greater than or equal to from.",
    params: { code: "INVALID_RANGE" },
  });

const SIZE_CODES: Record<string, { min: string; max: string }> = {
  string: { min: "MIN_LENGTH", max: "MAX_LENGTH" },
  number: { min: "MIN_VALUE", max: "MAX_VALUE" },
};

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

function toFieldErrors(error: z.ZodError): FieldError[] {
  return error.issues.flatMap((issue): FieldError[] => {
    if (issue.code === "unrecognized_keys") {
      return issue.keys.map((key) => ({
        field: key,
        code: "UNKNOWN_PARAMETER",
        message: `${key} is not a supported query parameter.`,
      }));
    }
    return [{ field: String(issue.path[0] ?? ""), code: issueCode(issue), message: issue.message }];
  });
}

/** Parses `GET /events` query parameters. Unknown or invalid parameters raise `400 INVALID_QUERY_PARAM`. */
export function parseListEventsQuery(query: unknown): ListPublishedEventsParams {
  const result = listEventsQuerySchema.safeParse(query);
  if (!result.success) {
    throw new InvalidQueryParamError(toFieldErrors(result.error));
  }
  const { page, pageSize, from, to, category, q, sort } = result.data;
  return {
    page: page ?? 1,
    pageSize: pageSize ?? DEFAULT_PAGE_SIZE,
    from,
    to,
    categories: category === undefined ? undefined : [...new Set(category)],
    search: q,
    sort: SORTS[sort ?? "startsAt"],
  };
}
