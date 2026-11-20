import { Router } from "express";
import type { EventController } from "./event.controller.js";

export function createEventRouter(controller: EventController): Router {
  const router = Router();
  router.get("/", controller.list);
  router.get("/:id", controller.getById);
  return router;
}
