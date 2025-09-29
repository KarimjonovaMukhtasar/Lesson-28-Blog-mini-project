import { Router } from "express"
import { usersController } from "../controllers/index.js"

const router = Router()



router.get("/", usersController.find)
router.get("/:id", usersController.findOne)
router.post("/", usersController.create)
router.put("/:id", usersController.update)
router.delete("/:id", usersController.delete)



export { router as userRoutes }