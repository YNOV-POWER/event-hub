import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "yaml";

type OpenApiDocument = Record<string, unknown>;

function isOpenApiDocument(value: unknown): value is OpenApiDocument {
  return typeof value === "object" && value !== null && !Array.isArray(value) && "openapi" in value;
}

/** Loads `openapi.yaml` from the working directory (the `back/` folder, `/app` in the container). */
export function loadOpenApiDocument(path: string = resolve(process.cwd(), "openapi.yaml")): OpenApiDocument {
  const document: unknown = parse(readFileSync(path, "utf8"));
  if (!isOpenApiDocument(document)) {
    throw new Error(`${path} is not an OpenAPI document.`);
  }
  return document;
}
