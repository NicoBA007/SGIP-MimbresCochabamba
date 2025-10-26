import { Router } from 'express';
import { handleImageUpload, handleUploadError } from '../controllers/upload.controller.js';
import { uploadSingleImage } from '../middleware/upload.middleware.js'; // El middleware de Multer
import { checkAuth } from '../middleware/auth.middleware.js'; // Proteger la ruta

const router = Router();

// Aplicar autenticación a esta ruta
router.use(checkAuth);

// POST /api/panel/upload
// 1. 'uploadSingleImage': Procesa el archivo llamado 'imagenProducto'
// 2. 'handleUploadError': Maneja errores específicos de Multer
// 3. 'handleImageUpload': Si todo va bien, devuelve la URL
router.post('/panel/upload', uploadSingleImage, handleUploadError, handleImageUpload);

export default router;