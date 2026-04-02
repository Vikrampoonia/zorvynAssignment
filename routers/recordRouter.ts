import express from "express";
import recordController from "../controllers/recordController.js";
const router = express.Router();


router.get("/create-record", async function (req, res) {
    const data = await recordController.createRecord();
    res.status(data.status).send(data);
});

router.put("/update-record", async function (req, res) {
    const data = await recordController.updateRecord();
    res.status(data.status).send(data);
});

router.delete("/delete-record", async function (req, res) {
    const data = await recordController.deleteRecord();
    res.status(data.status).send(data);
});

router.get("get-record", async function (req, res) {
    const data = await recordController.getRecord();
    res.status(data.status).send(data);
});

router.get("get-dashboard-summary", async function (req, res) {
    const data = await recordController.getDashBoardSummary();
    res.status(data.status).send(data);
});

export default router;