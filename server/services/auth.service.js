import { pool } from '../config/db.config.js';

/**
 * Busca un usuario por su nombre de usuario.
 */
export async function findUserByUsername(username) {
    const query = 'SELECT id_usuario, username, password_hash, rol FROM USUARIO WHERE username = ?';
    
    try {
        const [rows] = await pool.query(query, [username]);
        return rows.length ? rows[0] : null;

    } catch (error) {
        console.error("Error en findUserByUsername:", error);
        throw new Error("Error al consultar la base de datos para el login.");
    }
}