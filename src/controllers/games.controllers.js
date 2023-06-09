import { db } from "../database/database.js"

export async function getGames(req, res) {
  const { limit, offset } = req.query

  try {
    const games = await db.query(`SELECT * FROM games OFFSET $1 LIMIT $2;`, [
      offset,
      limit,
    ])
    res.send(games.rows)
  } catch (err) {
    res.status(500).send(err.message)
  }
}
export async function postGames(req, res) {
  const { name, image, stockTotal, pricePerDay } = req.body
  try {
    const nameExist = await db.query(`SELECT * FROM games WHERE name=$1`, [
      name,
    ])
    if (nameExist.rowCount !== 0) return res.sendStatus(409)
    await db.query(
      `INSERT INTO games (name,image,"stockTotal","pricePerDay") 
    VALUES ($1,$2,$3,$4)`,
      [name, image, stockTotal, pricePerDay]
    )
    res.sendStatus(201)
  } catch (err) {
    res.status(55).send(err.message)
  }
}
