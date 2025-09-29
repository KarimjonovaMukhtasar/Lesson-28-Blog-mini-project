import { Router } from "express"
import { postsController } from "../controllers/index.js"

const router = Router()


router.get("/", postsController.find)
router.get("/:id", postsController.findOne)
router.post("/", postsController.create)
router.put("/:id", postsController.update)
router.delete("/:id", postsController.delete)
router.post("/:id/:userId", postsController.liked_by)

export { router as postsRoutes }