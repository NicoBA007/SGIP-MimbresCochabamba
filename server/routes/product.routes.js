import { Router } from 'express';

// Esta es la ÚNICA línea de importación que necesitas para el controlador
import { 
    getPublicProducts, 
    getCategories, 
    getProductById 
} from '../controllers/product.controller.js';

const router = Router();

// Define el endpoint: GET /api/productos
router.get('/productos', getPublicProducts);

// Define el endpoint: GET /api/categorias
router.get('/categorias', getCategories);

// Define el endpoint: GET /api/productos/:id
router.get('/productos/:id', getProductById);

export default router;