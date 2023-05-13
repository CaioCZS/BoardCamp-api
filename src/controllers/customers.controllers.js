import dayjs from "dayjs"
import { db } from "../database/database.js"

export async function getCustomers(req, res) {
  try {
    const customers = await db.query(`SELECT * FROM customers`)
    const fixDate = customers.rows.map((c) => {
      const { birthday } = c
      const fixBrth = dayjs(birthday).format("YYYY-MM-DD")
      return { ...c, birthday: fixBrth }
    })

    res.send(fixDate)
  } catch (err) {
    res.status(500).send(err.message)
  }
}

export async function getCustomersById(req, res) {
  const { id } = req.params
  try {
    const customer = await db.query(`SELECT * FROM customers WHERE id=$1`, [id])
    if (!customer.rowCount) return res.sendStatus(404)
    const fixDate = {
      ...customer.rows[0],
      birthday: dayjs(customer.rows[0].birthday).format("YYYY-MM-DD"),
    }
    res.send(fixDate)
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
  const { name, phone, cpf, birthday } = req.body
  const { id } = req.params
  try {
    const cpfExist = await db.query(
      `SELECT * FROM customers WHERE cpf=$1 AND id <> $2`,
      [cpf, id]
    )
    if (cpfExist.rowCount !== 0) return res.sendStatus(409)
    await db.query(
      `UPDATE customers SET name=$1, phone=$2, cpf=$3, birthday=$4 WHERE id=$5`,
      [name, phone, cpf, birthday, id]
    )
    res.sendStatus(200)
  } catch (err) {
    res.status(500).send(err.message)
  }
}
