import { Router } from "express"
import { commentsController } from "../controllers/index.js"

const router = Router()



router.get("/", commentsController.find)
router.get("/:id", commentsController.findOne)
router.post("/", commentsController.create)
router.put("/:id", commentsController.update)
router.delete("/:id", commentsController.delete)



export { router as  commentRoutes }