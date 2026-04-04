import express from "express";
import type { Request, Response } from "express";
import recordController from "../controllers/recordController.js";
import auth from "../middlewares/auth.js";
import authorize from "../middlewares/authorize.js";
import type { DashboardSummaryRequest, RecordCreateRequest, RecordDeleteRequest, RecordGetRequest, RecordUpdateRequest } from "../types/recordTypes.js";
const router = express.Router();


router.post("/create-record", auth, authorize("admin", "analyst"), async function (req: Request<{}, unknown, unknown, RecordCreateRequest>, res: Response) {
    const { userId, amount, type, category, date, notes } = req.query;
    const data = await recordController.createRecord({ userId, amount, type, category, date, notes });
    res.status(data.status).send(data);
});

router.put("/update-record", auth, authorize("admin", "analyst"), async function (req: Request<{}, unknown, unknown, RecordUpdateRequest>, res: Response) {
    const { id, userId, amount, type, category, date, notes } = req.query;
    const data = await recordController.updateRecord({ id, userId, amount, type, category, date, notes });
    res.status(data.status).send(data);
});

router.delete("/delete-record", auth, authorize("admin"), async function (req: Request<{}, unknown, unknown, RecordDeleteRequest>, res: Response) {
    const { id } = req.query;
    const data = await recordController.deleteRecord({ id });
    res.status(data.status).send(data);
});

router.get("/get-record", auth, authorize("admin", "analyst", "viewer"), async function (req: Request<{}, unknown, unknown, RecordGetRequest>, res: Response) {
    const { id, date, category, type, pageSize, pageNumber } = req.query;
    const data = await recordController.getRecord({ id, date, category, type, pageSize, pageNumber });
    res.status(data.status).send(data);
});

router.get("/get-dashboard-summary", auth, authorize("admin", "analyst", "viewer"), async function (req: Request<{}, unknown, unknown, DashboardSummaryRequest>, res: Response) {
    const { startDate, endDate, trend } = req.query;
    const data = await recordController.getDashBoardSummary({ startDate, endDate, trend });
    res.status(data.status).send(data);
});

export default router;