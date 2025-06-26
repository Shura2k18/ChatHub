//Express
import Router from "express"
const router = new Router()

//Controllers
import userController from "../controllers/user-controller.js"

//Middlewares
import authMiddleware from "../middlewares/auth-middleware.js"
import { upload } from "../middlewares/file-middleware.js"
import { body } from "express-validator"

router.get("/getContacts", authMiddleware, userController.getContacts)
router.get("/me", authMiddleware, userController.getMe)
router.get("/:id", authMiddleware, userController.getUser)
router.get("/", authMiddleware, userController.getUsers)
router.get("/findUsers/:text", authMiddleware, userController.findUsers)
router.patch(
  "/updateImage",
  authMiddleware,
  upload.single("imageUrl"),
  userController.updateImage,
)
// router.patch('/updateName', body('name').isLength({min: 1}), authMiddleware, userController.updateName);
router.patch("/updateData", authMiddleware, userController.updateData)
router.post("/addContact", authMiddleware, userController.addContact)
router.delete("/deleteContact", authMiddleware, userController.deleteContact)

export default router
