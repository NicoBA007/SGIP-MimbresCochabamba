import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { findUserByUsername } from '../services/auth.service.js';

const JWT_SECRET = process.env.JWT_SECRET || 'mi_secreto_por_defecto';

/**
 * Endpoint POST /api/auth/login
 */
export async function login(req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Se requieren usuario y contraseña." });
    }

    try {
        const user = await findUserByUsername(username);

        if (!user) {
            return res.status(401).json({ message: "Credenciales inválidas." });
        }

        // Comparar contraseña hasheada
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: "Credenciales inválidas." });
        }

        // Generar Token de Autenticación
        const token = jwt.sign(
            { id: user.id_usuario, rol: user.rol },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.status(200).json({
            message: "Login exitoso",
            user: {
                id: user.id_usuario,
                username: user.username,
                rol: user.rol,
            },
            token: token
        });

    } catch (error) {
        console.error("Error en el login:", error.message);
        res.status(500).json({ message: "Error interno del servidor." });
    }
}