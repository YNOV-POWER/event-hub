import type { Request, Response } from "express";
import { toEventResponse } from "./event.presenter.js";
import { parseListEventsQuery } from "./event.query.js";
import type { EventService } from "./event.service.js";

export class EventController {
  constructor(private readonly events: EventService) {}

  /** E1 — `GET /events` (US09). */
  readonly list = async (req: Request, res: Response): Promise<void> => {
    const params = parseListEventsQuery(req.query);
    const result = await this.events.listPublished(params);
    res.status(200).json({
      data: result.items.map(toEventResponse),
      meta: {
        page: result.page,
        pageSize: result.pageSize,
        totalItems: result.totalItems,
        totalPages: result.totalPages,
      },
    });
  };

  /** E2 — `GET /events/{id}` (US10). */
  readonly getById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    // Authentication (US02/US03) is not implemented yet: every caller is anonymous, so a DRAFT event is always a 404.
    const viewerId = null;
    const event = await this.events.getVisibleById(req.params.id, viewerId);
    res.status(200).json({ data: toEventResponse(event) });
  };
}
