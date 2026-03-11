import cors from "@fastify/cors";
import Fastify from "fastify";

import { openApiDocument, renderSwaggerHtml } from "./lib/openapi";
import { examsRoute } from "./routes/exams";

export async function buildApp() {
  const app = Fastify({
    logger: true
  });

  await app.register(cors, {
    origin: true
  });

  app.get("/openapi.json", async () => openApiDocument);
  app.get("/swagger", async (_, reply) => {
    reply.type("text/html");
    return renderSwaggerHtml();
  });

  await app.register(examsRoute, {
    prefix: "/api/exams"
  });

  return app;
}
