import dayjs from "dayjs"
import { db } from "../database/database.js"

export async function getRentals(req, res) {
  try {
    const rentals =
      await db.query(`SELECT rentals.*,games.name as "gameName",customers.name AS "customerName" FROM rentals
    JOIN games ON  games.id = rentals."gameId"
    JOIN customers ON customers.id = rentals."customerId";`)
    const resp = rentals.rows.map((r) => {
      const newObj = {
        ...r,
        rentDate: dayjs(r.rentDate).format("YYYY-MM-DD"),
        customer: {
          name: r.customerName,
          id: r.customerId,
        },
        game: {
          name: r.gameName,
          id: r.gameId,
        },
      }
      delete newObj.gameName
      delete newObj.customerName
      return newObj
    })
    res.send(resp)
  } catch (err) {
    res.status(500).send(err.message)
  }
}

export async function postRentals(req, res) {
  const { customerId, gameId, daysRented } = req.body

  try {
    const customerExist = await db.query(
      `SELECT * FROM customers WHERE id=$1`,
      [customerId]
    )
    const gameExist = await db.query(`SELECT * FROM games WHERE id=$1`, [
      gameId,
    ])
    if (!customerExist.rowCount || !gameExist.rowCount) {
      return res.sendStatus(400)
    }

    const gameInStock = await db.query(
      `SELECT rentals.*,games."stockTotal" FROM rentals 
    JOIN games ON rentals."gameId" = games.id
    WHERE "gameId"=$1 AND "returnDate" is null;`,
      [gameId]
    )

    if (
      gameInStock.rowCount > 0 &&
      gameInStock.rowCount === gameInStock.rows[0].stockTotal
    ) {
      return res.sendStatus(400)
    }

    const originalPrice = gameExist.rows[0].pricePerDay * daysRented
    await db.query(
      `INSERT INTO rentals 
    ("customerId","gameId","daysRented","originalPrice","rentDate")
    VALUES ($1,$2,$3,$4,now());`,
      [customerId, gameId, daysRented, originalPrice]
    )

    res.sendStatus(201)
  } catch (err) {
    res.status(500).send(err.message)
  }
}

export async function finishRentals(req, res) {
  const { id } = req.params

  try {
    const idExist = await db.query(
      `SELECT rentals.*,games."pricePerDay" FROM rentals 
    JOIN games ON rentals."gameId" = games.id
    WHERE rentals.id=$1;`,
      [id]
    )
    const rental = idExist.rows[0]

    if (!rental) return res.sendStatus(404)
    if (rental.returnDate !== null) return res.sendStatus(400)

    const rentDate = rental.rentDate
    const daysPassed = dayjs().diff(rentDate, "day")
    const delayFee = (daysPassed - rental.daysRented) * rental.pricePerDay
    const finalDelayFee = delayFee <= 0 ? 0 : delayFee

    await db.query(
      `
    UPDATE rentals SET "returnDate" = now() , "delayFee" = $1
    WHERE id=$2`,
      [finalDelayFee, id]
    )

    res.sendStatus(200)
  } catch (err) {
    res.status(500).send(err.message)
  }
}

export async function deleteRentals(req, res) {
  const { id } = req.params

  try {
    const idExist = await db.query(`SELECT * FROM rentals WHERE id=$1`, [id])

    if (idExist.rowCount === 0) return res.sendStatus(404)
    if (idExist.rows[0].returnDate === null) return res.sendStatus(400)

    await db.query(`DELETE FROM rentals WHERE id=$1`, [id])

    res.sendStatus(200)
  } catch (err) {
    res.status(500).send(err.message)
  }
}
