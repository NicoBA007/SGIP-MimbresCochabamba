/**
 * Endpoint: POST /api/panel/upload
 * Maneja la subida de una imagen de producto.
 */
export function handleImageUpload(req, res) {
    // 'uploadSingleImage' (el middleware) ya procesó el archivo.
    // Si hubo un error (ej: no es imagen, tamaño excede), multer ya lo manejó.

    if (!req.file) {
        // Esto no debería pasar si el middleware funcionó, pero por si acaso.
        return res.status(400).json({ message: "No se subió ningún archivo o el tipo no es válido." });
    }

    // El archivo se guardó correctamente. Devolvemos la URL relativa.
    // req.file.filename contiene el nombre único generado (ej: product-1729...).
    const imageUrl = `/products/${req.file.filename}`; 

    res.status(200).json({ 
        message: "Imagen subida con éxito.",
        imageUrl: imageUrl // Esta es la URL que guardaremos en la DB
    });
}

// Middleware de manejo de errores específico para Multer (opcional pero recomendado)
export function handleUploadError(err, req, res, next) {
    if (err instanceof multer.MulterError) {
        // Errores de Multer (ej: tamaño de archivo)
        return res.status(400).json({ message: `Error de subida: ${err.message}` });
    } else if (err) {
        // Otros errores (ej: filtro de tipo de archivo)
        return res.status(400).json({ message: err.message });
    }
    // Si no hay error, continuar
    next();
}