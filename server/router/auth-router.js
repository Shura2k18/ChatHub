//Express
import Router from "express"
const router = new Router()

//Controllers
import authController from "../controllers/auth-controller.js"

import { body } from "express-validator"

router.post(
  "/reg",
  body("email").isEmail(),
  body("password").isLength({ min: 3, max: 32 }),
  body("name").isLength({ min: 1 }),
  body("tag").isLength({ min: 5 }),
  authController.registration,
)
router.post("/login", authController.login)
router.get("/activate/:link", authController.activate)

export default router
