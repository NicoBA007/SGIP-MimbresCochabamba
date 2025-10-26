import jwt from 'jsonwebtoken';

// Usamos el mismo secreto que en auth.controller.js
const JWT_SECRET = process.env.JWT_SECRET || 'mi_secreto_por_defecto';

/**
 * Middleware para verificar el Token (JWT).
 * Protegerá todas las rutas del panel.
 */
export function checkAuth(req, res, next) {
    try {
        // 1. Buscar el token en los headers
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({ message: "Acceso denegado. No se proporcionó token." });
        }

        // 2. El token viene en formato "Bearer <token>"
        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: "Acceso denegado. Token mal formado." });
        }

        // 3. Verificar el token
        const payload = jwt.verify(token, JWT_SECRET);

        // 4. Si es válido, adjuntamos los datos del usuario (id, rol) al objeto 'req'
        // para que las siguientes funciones (controladores) puedan usarlo.
        req.user = payload; // Ej: req.user = { id: 1, rol: 'VENDEDOR' }

        // 5. Dejamos pasar la petición
        next();

    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token inválido o expirado." });
        }
        console.error("Error en middleware de autenticación:", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
}