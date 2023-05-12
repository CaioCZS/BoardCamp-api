import { db } from "../database/database.js"

export async function getCustomers(req, res) {
  try {
    const customers = await db.query(`SELECT * FROM customers`)
    res.send(customers.rows)
  } catch (err) {
    res.status(500).send(err.message)
  }
}

export async function getCustomersById(req, res) {
  const { id } = req.params
  try {
    const customer = await db.query(`SELECT * FROM customers WHERE id=$1`, [id])
    if (!customer.rowCount) return res.sendStatus(404)
    res.send(customer.rows[0])
  } catch (err) {
    res.status(500).send(err.message)
  }
}

export async function postCustomers(req, res) {
  const { name, phone, cpf, birthday } = req.body

  try {
    const customerExist = await db.query(
      `SELECT * FROM customers WHERE cpf=$1`,
      [cpf]
    )
    if (customerExist.rowCount !== 0) return res.sendStatus(409)

    await db.query(
      `INSERT INTO customers (name,phone,cpf,birthday) VALUES ($1,$2,$3,$4)`,
      [name, phone, cpf, birthday]
    )
    res.sendStatus(201)
  } catch (err) {
    res.status(500).send(err.message)
  }
}

export async function putCustomers(req, res) {
  res.send("putCustomers")
}
