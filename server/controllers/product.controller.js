// Esta es la ÚNICA línea de importación que necesitas para el servicio
import { 
    findPublicProducts, 
    findCategories, 
    findProductById 
} from '../services/product.service.js';

/**
 * Endpoint: GET /api/productos
 * Obtiene todos los productos públicos para el catálogo.
 */
export async function getPublicProducts(req, res) {
    try {
        // Llama a la función del servicio
        const products = await findPublicProducts();
        res.status(200).json(products);
    } catch (error) {
        console.error("Error en getPublicProducts:", error.message);
        res.status(500).json({ message: "Error interno al obtener los productos." });
    }
}

/**
 * Endpoint: GET /api/categorias
 * Obtiene todas las categorías para los filtros.
 */
export async function getCategories(req, res) {
    try {
        // Llama a la función del servicio
        const categories = await findCategories();
        res.status(200).json(categories);
    } catch (error) {
        console.error("Error en getCategories:", error.message);
        res.status(500).json({ message: "Error interno al obtener las categorías." });
    }
}

/**
 * Endpoint: GET /api/productos/:id
 * Obtiene un producto por su ID.
 */
export async function getProductById(req, res) {
    try {
        const { id } = req.params;
        const product = await findProductById(id);

        if (!product) {
            return res.status(404).json({ message: "Producto no encontrado." });
        }

        res.status(200).json(product);
    } catch (error) {
        console.error("Error en getProductById:", error.message);
        res.status(500).json({ message: "Error interno al obtener el producto." });
    }
}