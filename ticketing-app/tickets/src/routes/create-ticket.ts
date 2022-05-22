import express, { Request, Response } from "express";
import { requireAuth } from "@oetickets/common";

const router = express.Router();

router.post(
  "/api/tickets",
  requireAuth,

  async (req: Request, res: Response) => {
    const { title, price } = req.body;

    return res.status(201).send({});
  }
);

export { router as CreateTicketRouter };
