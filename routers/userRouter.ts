import express from "express";
import type { Request, Response } from "express";
import userController from "../controllers/userController.js";
import auth from "../middlewares/auth.js";
import authorize from "../middlewares/authorize.js";
import type { UserCreateRequest, UserDeleteRequest, UserGetRequest, UserUpdateRequest } from "../types/userTypes.js";
const router = express.Router();

router.post("/create-user", auth, authorize("admin"), async function (req: Request<{}, unknown, unknown, UserCreateRequest>, res: Response) {
    const { name, phoneNumber, role } = req.query;
    const data = await userController.createUser({ name, phoneNumber, role });
    res.status(data.status).send(data);
});

router.put("/update-user", auth, authorize("admin"), async function (req: Request<{}, unknown, unknown, UserUpdateRequest>, res: Response) {
    const { id, name, phoneNumber, role } = req.query;
    const data = await userController.updateUser({ id, name, phoneNumber, role });
    res.status(data.status).send(data);
});

router.delete("/delete-user", auth, authorize("admin"), async function (req: Request<{}, unknown, unknown, UserDeleteRequest>, res: Response) {
    const { id } = req.query;
    const data = await userController.deleteUser({ id });
    res.status(data.status).send(data);
});

router.get("/get-user", auth, authorize("admin", "analyst"), async function (req: Request<{}, unknown, unknown, UserGetRequest>, res: Response) {
    const { id, name, phoneNumber, role, pageSize, pageNumber } = req.query;
    const data = await userController.getUser({ id, name, phoneNumber, role, pageSize, pageNumber });
    res.status(data.status).send(data);
});

export default router;