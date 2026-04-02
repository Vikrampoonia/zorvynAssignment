import express from "express";
import userController from "../controllers/userController.js";
const router = express.Router();

router.get("/create-user", async function (req, res) {
    const data = await userController.createUser();
    res.status(data.status).send(data);
});

router.put("/update-user", async function (req, res) {
    const data = await userController.updateUser();
    res.status(data.status).send(data);
});

router.delete("/delete-user", async function (req, res) {
    const data = await userController.deleteUser();
    res.status(data.status).send(data);
});

router.get("get-user", async function (req, res) {
    const data = await userController.getUser();
    res.status(data.status).send(data);
});

export default router;