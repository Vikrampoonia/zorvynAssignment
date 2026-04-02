import express from "express";
import authController from "../controllers/authController.js";
const router = express.Router();

router.get("/login", async function (req, res) {
    const data = new authController.login();
    res.status(data.status).send(data);
});

router.get("/logout", async function (req, res) {
    const data = new authController.logout();
    res.status(data.status).send(data);
});

export default router;