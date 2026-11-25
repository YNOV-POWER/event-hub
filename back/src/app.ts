import express from "express";
import type { Express } from "express";
import swaggerUi from "swagger-ui-express";
import type { PrismaClient } from "../generated/prisma/client.js";
import { loadOpenApiDocument } from "./docs/openapi.js";
import { errorHandler } from "./http/middlewares/error-handler.js";
import { notFoundHandler } from "./http/middlewares/not-found.js";
import { requestId } from "./http/middlewares/request-id.js";
import { EventController } from "./modules/events/event.controller.js";
import { PrismaEventRepository } from "./modules/events/event.repository.js";
import { createEventRouter } from "./modules/events/event.routes.js";
import { EventService } from "./modules/events/event.service.js";
import { AuthController } from "./modules/auth/auth.controller.js";
import { createAuthRouter } from "./modules/auth/auth.routes.js";
import { AuthService } from "./modules/auth/auth.service.js";

export const API_BASE_PATH = "/api";

export interface AppDependencies {
  prisma: PrismaClient;
}

export function createApp({ prisma }: AppDependencies): Express {
  const app = express();
  app.disable("x-powered-by");

  app.use(requestId);
  app.use(express.json());

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(loadOpenApiDocument()));

  const eventController = new EventController(new EventService(new PrismaEventRepository(prisma)));
  app.use(`${API_BASE_PATH}/events`, createEventRouter(eventController));

  const authController = new AuthController(new AuthService(prisma));
  app.use(`${API_BASE_PATH}/auth`, createAuthRouter(authController));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
