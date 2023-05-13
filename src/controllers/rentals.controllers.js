import { db } from "../database/database.js"

export async function getRentals(req, res) {
  res.send("getRentals")
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

    if (gameInStock.rowCount === gameInStock.rows[0].stockTotal) {
      return res.sendStatus(400)
    }

    const originalPrice = gameExist.rows[0].pricePerDay * daysRented
    await db.query(
      `INSERT INTO rentals 
    ("customerId","gameId","daysRented","originalPrice","rentDate")
    VALUES ($1,$2,$3,$4,now());`,
      [customerId, gameId, daysRented, originalPrice]
    )

    res.sendStatus(200)
  } catch (err) {
    res.status(500).send(err.message)
  }
}

export async function finishRentals(req, res) {
  res.send("finishRentals")
}

export async function deleteRentals(req, res) {
  res.send("deleteRentals")
}
