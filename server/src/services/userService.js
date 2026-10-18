import { pool } from '../db/pool.js';

// Throws the MySQL error ER_DUP_ENTRY when the email already exists (the UNIQUE index decides).
export async function createUser(email, passwordHash) {
  const [result] = await pool.query('INSERT INTO users (email, password_hash) VALUES (?, ?)', [
    email,
    passwordHash,
  ]);
  return { id: result.insertId, email };
}

// The only function that returns password_hash; used by login to check the password.
export async function findUserWithHashByEmail(email) {
  const [rows] = await pool.query('SELECT id, email, password_hash FROM users WHERE email = ?', [email]);
  return rows[0] ?? null;
}

export async function findUserById(id) {
  const [rows] = await pool.query('SELECT id, email FROM users WHERE id = ?', [id]);
  return rows[0] ?? null;
}
