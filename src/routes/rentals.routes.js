import { Router } from "express"
import {
  deleteRentals,
  finishRentals,
  getRentals,
  postRentals,
} from "../controllers/rentals.controllers.js"
import schemaValidation from "../middlewares/schemaValidation.js"
import { rentalSchema } from "../schemas/rentals.schema.js"

const rentalRouter = Router()

rentalRouter.get("/rentals", getRentals)
rentalRouter.post("/rentals", schemaValidation(rentalSchema), postRentals)
rentalRouter.post("/rentals/:id/return", finishRentals)
rentalRouter.delete("/rentals/:id", deleteRentals)

export default rentalRouter
