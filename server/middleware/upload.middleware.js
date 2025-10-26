import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url'; // Para obtener __dirname en ES Modules

// Obtenemos la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Definimos la ruta de destino (IMPORTANTE: Relativa al archivo actual)
// Va a: server/middleware -> ../ -> server/ -> ../ -> (raíz del proyecto) -> client/public/products
const destinationPath = path.join(__dirname, '../../client/public/products');

// Asegurarnos de que el directorio de destino exista
if (!fs.existsSync(destinationPath)) {
    fs.mkdirSync(destinationPath, { recursive: true });
    console.log(`Directorio creado: ${destinationPath}`);
} else {
     console.log(`Directorio ya existe: ${destinationPath}`);
}


// Configuración de almacenamiento de Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, destinationPath); // Usamos la ruta calculada
    },
    filename: function (req, file, cb) {
        // Generar un nombre de archivo único para evitar colisiones
        // Ej: product-1729729812345.jpg
        const uniqueSuffix = `product-${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueSuffix);
    }
});

// Filtro para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true); // Aceptar archivo
    } else {
        cb(new Error('¡Solo se permiten archivos de imagen!'), false); // Rechazar archivo
    }
};

// Crear la instancia de multer
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5 // Límite de 5MB por archivo
    }
});

// Exportamos el middleware configurado para UNA sola imagen llamada 'imagenProducto'
export const uploadSingleImage = upload.single('imagenProducto');