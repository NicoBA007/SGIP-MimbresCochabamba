import { pool } from '../config/db.config.js';


export async function findPublicProducts() {

    // 1. Consulta SQL corregida con TUS nombres de columna
    const query = `
        SELECT 
            p.id_producto AS id,
            p.nombre_producto AS name,
            p.precio_unitario AS price,
            p.stock_actual AS stock,
            p.id_categoria AS categoryId,
            c.nombre_categoria AS category,
            p.url_imagen AS imageUrl
        FROM 
            PRODUCTO p
        JOIN 
            CATEGORIA c ON p.id_categoria = c.id_categoria
        WHERE 
            p.estado = 'ACTIVO';
    `;

    try {
        const [rows] = await pool.query(query);
        // Convertimos precio a número
        return rows.map(product => ({
            ...product,
            price: parseFloat(product.price),
            // La imageUrl ahora viene directamente de la DB
        }));
    } catch (error) {
        console.error("Error en findPublicProducts:", error);
        throw new Error("Error al consultar los productos.");
    }
}

/**
 * Busca todas las categorías para los filtros.
 */
export async function findCategories() {
    // Corregimos el nombre de la columna
    const query = 'SELECT id_categoria AS id, nombre_categoria AS name FROM CATEGORIA;';

    try {
        const [rows] = await pool.query(query);
        // Añadimos "Todas las Categorías" para el filtro del frontend
        return [
            { id: 0, name: 'Todas las Categorías' },
            ...rows
        ];
    } catch (error) {
        console.error("Error en findCategories:", error);
        throw new Error("Error al consultar las categorías.");
    }
}

/**
 * Busca un producto específico por su ID para la página de detalles.
 */
export async function findProductById(productId) {
    // Traemos todos los detalles del producto
    const query = `
        SELECT 
            p.id_producto AS id,
            p.nombre_producto AS name,
            p.descripcion,
            p.precio_unitario AS price,
            p.stock_actual AS stock,
            p.dimensiones,
            p.material,
            p.color,
            p.estado,
            c.nombre_categoria AS category,
            p.url_imagen AS imageUrl
        FROM 
            PRODUCTO p
        JOIN 
            CATEGORIA c ON p.id_categoria = c.id_categoria
        WHERE 
            p.id_producto = ?;
    `;

    try {
        const [rows] = await pool.query(query, [productId]);
        if (rows.length === 0) return null;
        const product = rows[0];
        // Convertimos precio a número
        return {
            ...product,
            price: parseFloat(product.price),
            // La imageUrl viene de la DB
        };
    } catch (error) {
        console.error("Error en findProductById:", error);
        throw new Error("Error al consultar el producto por ID.");
    }
}