import { readFileSync, readdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { load } from "js-yaml";
import { env } from "../config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

type OpenApiDoc = {
  paths?: Record<string, unknown>;
  components?: {
    schemas?: Record<string, unknown>;
    securitySchemes?: Record<string, unknown>;
  };
  tags?: Array<{ name: string }>;
};

const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Attendance Management System API",
    version: "1.0.0",
    description: "API documentation for the AMS backend.",
  },
  servers: [
    {
      url: `http://localhost:${env.PORT}`,
      description: "Development server",
    },
  ],
  paths: {} as Record<string, unknown>,
  components: {
    schemas: {} as Record<string, unknown>,
    securitySchemes: {} as Record<string, unknown>,
  },
  tags: [] as Array<{ name: string }>,
};

const docFiles = readdirSync(__dirname).filter(
  (file) => file.endsWith(".yaml") || file.endsWith(".yml"),
);

for (const file of docFiles) {
  const content = readFileSync(resolve(__dirname, file), "utf8");
  const doc = load(content) as OpenApiDoc;

  if (doc.paths) {
    Object.assign(swaggerSpec.paths, doc.paths);
  }

  if (doc.components?.schemas) {
    Object.assign(swaggerSpec.components.schemas, doc.components.schemas);
  }

  if (doc.components?.securitySchemes) {
    Object.assign(
      swaggerSpec.components.securitySchemes,
      doc.components.securitySchemes,
    );
  }

  if (doc.tags) {
    swaggerSpec.tags.push(...doc.tags);
  }
}

export default swaggerSpec;
