import { Router } from "express"
import {
  getCustomers,
  getCustomersById,
  postCustomers,
  putCustomers,
} from "../controllers/customers.controllers.js"
import schemaValidation from "../middlewares/schemaValidation.js"
import { customerSchema } from "../schemas/customer.Schema.js"

const customersRouter = Router()

customersRouter.get("/customers", getCustomers)
customersRouter.get("/customers/:id", getCustomersById)
customersRouter.post(
  "/customers",
  schemaValidation(customerSchema),
  postCustomers
)
customersRouter.put(
  "/customers/:id",
  schemaValidation(customerSchema),
  putCustomers
)

export default customersRouter
