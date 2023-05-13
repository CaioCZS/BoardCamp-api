import { Router } from "express"
import gamesRouter from "./games.routes.js"
import customersRouter from "./customers.routes.js"
import rentalRouter from "./rentals.routes.js"

const router = Router()

router.use(gamesRouter)
router.use(customersRouter)
router.use(rentalRouter)

export default router
