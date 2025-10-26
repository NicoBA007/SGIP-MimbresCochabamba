import React, { useState, useEffect } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';

const styles = {
    form: { maxWidth: '600px', margin: '0 auto', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' },
    label: { display: 'block', marginBottom: '5px', fontWeight: 'bold' },
    input: { width: 'calc(100% - 22px)', padding: '8px', marginBottom: '10px', border: '1px solid #ccc' },
    textarea: { width: 'calc(100% - 22px)', padding: '8px', marginBottom: '10px', border: '1px solid #ccc', minHeight: '80px' },
    select: { width: '100%', padding: '8px', marginBottom: '10px', border: '1px solid #ccc' },
    button: { padding: '10px 20px', cursor: 'pointer', background: 'blue', color: 'white', border: 'none', borderRadius: '3px' },
    error: { color: 'red', fontSize: '12px', marginBottom: '10px' },
    imagePreview: { maxWidth: '150px', maxHeight: '150px', marginTop: '10px', border: '1px solid #eee', objectFit: 'contain' },
    fileInputLabel: { border: '1px dashed #ccc', padding: '10px', display: 'block', textAlign: 'center', cursor: 'pointer', marginBottom: '10px' },
    fileInput: { display: 'none' },
    passwordHelp: { fontSize: '12px', color: 'gray', marginBottom: '10px' }, // Aunque no se use aquí, mantenido por si acaso
};

const emptyFormData = {
    nombre_producto: '',
    descripcion: '',
    stock_actual: 0,
    precio_unitario: 0,
    dimensiones: '',
    material: '',
    color: '',
    unidad_medida: '',
    estado: 'ACTIVO',
    id_categoria: '',
    url_imagen: null,
};

function ProductoForm({ onSubmit, initialData = null, isLoading, categorias = [] }) {
    const [formData, setFormData] = useState(emptyFormData);
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null); // Iniciar como null
    const [errors, setErrors] = useState({});
    const isEditing = initialData && initialData.id_producto;

    useEffect(() => {
        if (isEditing) {
            // Cargar datos solo si estamos editando y initialData existe
            const categoryIdStr = String(initialData.id_categoria || '');
            setFormData({ ...emptyFormData, ...initialData, id_categoria: categoryIdStr });
            setImagePreviewUrl(initialData.url_imagen || null);
        } else {
            // Resetear al estado vacío si no estamos editando
            setFormData(emptyFormData);
            setImagePreviewUrl(null);
        }
        // Resetear siempre archivo y errores al cambiar
        setSelectedFile(null);
        setErrors({});
        // Usar una dependencia más estable: solo el ID
    }, [initialData?.id_producto]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
            setImagePreviewUrl(URL.createObjectURL(file));
            setErrors(prev => ({ ...prev, imagenProducto: null }));
        } else if (file) {
            setSelectedFile(null);
            setImagePreviewUrl(isEditing ? initialData?.url_imagen : null); // Volver a la original (si existe) o a nada
            setErrors(prev => ({ ...prev, imagenProducto: 'Solo se permiten archivos de imagen.' }));
        } else {
            setSelectedFile(null);
            setImagePreviewUrl(isEditing ? initialData?.url_imagen : null); // Volver a la original si se cancela
            setErrors(prev => ({ ...prev, imagenProducto: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.nombre_producto.trim()) newErrors.nombre_producto = "El nombre es requerido.";
        if (isNaN(parseFloat(formData.precio_unitario)) || parseFloat(formData.precio_unitario) < 0) newErrors.precio_unitario = "El precio debe ser un número positivo.";
        if (isNaN(parseInt(formData.stock_actual)) || parseInt(formData.stock_actual) < 0) newErrors.stock_actual = "El stock debe ser un número entero positivo o cero.";
        if (!formData.id_categoria || formData.id_categoria === "") newErrors.id_categoria = "Debe seleccionar una categoría.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            const dataToSend = {
                ...formData,
                stock_actual: parseInt(formData.stock_actual) || 0,
                precio_unitario: parseFloat(formData.precio_unitario) || 0,
                id_categoria: parseInt(formData.id_categoria) || null // Asegurar envío como número o null
            };
            // No eliminamos url_imagen aquí, la lógica de subida en la página padre decidirá qué URL usar
            onSubmit(dataToSend, selectedFile);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="nombre_producto" className="block text-sm font-medium text-gray-700 mb-1">Nombre <span className="text-red-500">*</span></label>
                    <input
                        type="text" id="nombre_producto" name="nombre_producto"
                        className={`w-full px-3 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-mimbres-tertiary focus:border-mimbres-tertiary transition-colors ${errors.nombre_producto ? 'border-red-500' : 'border-gray-300'}`}
                        value={formData.nombre_producto} onChange={handleChange} disabled={isLoading}
                    />
                    {errors.nombre_producto && <p className="mt-1 text-xs text-red-600">{errors.nombre_producto}</p>}
                </div>
                <div>
                    <label htmlFor="id_categoria" className="block text-sm font-medium text-gray-700 mb-1">Categoría <span className="text-red-500">*</span></label>
                    <select
                        id="id_categoria" name="id_categoria"
                        className={`w-full px-3 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-mimbres-tertiary focus:border-mimbres-tertiary transition-colors appearance-none ${errors.id_categoria ? 'border-red-500' : 'border-gray-300'}`}
                        value={String(formData.id_categoria || '')} // Siempre string para el value del select
                        onChange={handleChange} disabled={isLoading}
                    >
                        <option value="">Seleccione...</option>
                        {categorias.map(cat => (
                            // Usar cat.id que viene de la API de categorías públicas
                            <option key={cat.id} value={String(cat.id)}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                    {errors.id_categoria && <p className="mt-1 text-xs text-red-600">{errors.id_categoria}</p>}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="precio_unitario" className="block text-sm font-medium text-gray-700 mb-1">Precio (Bs.) <span className="text-red-500">*</span></label>
                    <input
                        type="number" id="precio_unitario" name="precio_unitario"
                        className={`w-full px-3 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-mimbres-tertiary focus:border-mimbres-tertiary transition-colors ${errors.precio_unitario ? 'border-red-500' : 'border-gray-300'}`}
                        value={formData.precio_unitario} onChange={handleChange} step="0.01" min="0" disabled={isLoading}
                    />
                    {errors.precio_unitario && <p className="mt-1 text-xs text-red-600">{errors.precio_unitario}</p>}
                </div>
                <div>
                    <label htmlFor="stock_actual" className="block text-sm font-medium text-gray-700 mb-1">Stock <span className="text-red-500">*</span></label>
                    <input
                        type="number" id="stock_actual" name="stock_actual"
                        className={`w-full px-3 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-mimbres-tertiary focus:border-mimbres-tertiary transition-colors ${errors.stock_actual ? 'border-red-500' : 'border-gray-300'}`}
                        value={formData.stock_actual} onChange={handleChange} min="0" step="1" disabled={isLoading}
                    />
                    {errors.stock_actual && <p className="mt-1 text-xs text-red-600">{errors.stock_actual}</p>}
                </div>
            </div>
            <div>
                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                    id="descripcion" name="descripcion" rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-mimbres-tertiary focus:border-mimbres-tertiary transition-colors"
                    value={formData.descripcion || ''} onChange={handleChange} disabled={isLoading}
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div><label htmlFor="dimensiones" className="block text-sm font-medium text-gray-700 mb-1">Dimensiones</label><input type="text" id="dimensiones" name="dimensiones" className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-mimbres-tertiary focus:border-mimbres-tertiary" value={formData.dimensiones || ''} onChange={handleChange} disabled={isLoading} /></div>
                <div><label htmlFor="material" className="block text-sm font-medium text-gray-700 mb-1">Material</label><input type="text" id="material" name="material" className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-mimbres-tertiary focus:border-mimbres-tertiary" value={formData.material || ''} onChange={handleChange} disabled={isLoading} /></div>
                <div><label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">Color</label><input type="text" id="color" name="color" className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-mimbres-tertiary focus:border-mimbres-tertiary" value={formData.color || ''} onChange={handleChange} disabled={isLoading} /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label htmlFor="unidad_medida" className="block text-sm font-medium text-gray-700 mb-1">Unidad Medida</label><input type="text" id="unidad_medida" name="unidad_medida" className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-mimbres-tertiary focus:border-mimbres-tertiary" value={formData.unidad_medida || ''} onChange={handleChange} disabled={isLoading} /></div>
                <div>
                    <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                    <select id="estado" name="estado" className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-mimbres-tertiary focus:border-mimbres-tertiary appearance-none" value={formData.estado} onChange={handleChange} disabled={isLoading}>
                        <option value="ACTIVO">ACTIVO</option>
                        <option value="INACTIVO">INACTIVO</option>
                        <option value="AGOTADO">AGOTADO</option>
                    </select>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Imagen del Producto</label>
                <label
                    htmlFor="imagenProductoInput"
                    className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${errors.imagenProducto ? 'border-red-400' : 'border-gray-300'} border-dashed rounded-md cursor-pointer hover:border-gray-400 transition-colors bg-gray-50 hover:bg-gray-100`}
                >
                    <div className="space-y-1 text-center">
                        <UploadCloud className={`mx-auto h-12 w-12 ${errors.imagenProducto ? 'text-red-400' : 'text-gray-400'}`} />
                        <div className="flex text-sm text-gray-600 justify-center">
                            <span className="relative rounded-md font-medium text-mimbres-primary hover:text-mimbres-secondary focus-within:outline-none">
                                <span>{selectedFile ? 'Cambiar archivo' : (imagePreviewUrl ? 'Reemplazar imagen' : 'Subir un archivo')}</span>
                                <input id="imagenProductoInput" name="imagenProducto" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" disabled={isLoading} />
                            </span>
                            <p className="pl-1 hidden sm:block">o arrastrar y soltar</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 5MB</p>
                    </div>
                </label>
                {imagePreviewUrl && !selectedFile && ( // Mostrar imagen actual si no se ha seleccionado una nueva
                    <div className="mt-2 text-center">
                        <p className="text-sm text-gray-600 mb-1">Imagen actual:</p>
                        <img src={imagePreviewUrl} alt="Imagen actual" className="max-h-32 inline-block border rounded" />
                    </div>
                )}
                {selectedFile && ( // Mostrar previsualización del archivo nuevo
                    <div className="mt-2 text-center">
                        <p className="text-sm text-gray-600 mb-1">Nueva imagen seleccionada:</p>
                        <img src={URL.createObjectURL(selectedFile)} alt="Vista previa nueva" className="max-h-32 inline-block border rounded" />
                        <p className="text-xs text-gray-500 mt-1">{selectedFile.name}</p>
                    </div>
                )}
                {errors.imagenProducto && <p className="mt-1 text-xs text-red-600">{errors.imagenProducto}</p>}
            </div>
            <div className="pt-5 border-t border-gray-200">
                <div className="flex justify-end">
                    <button
                        type="submit"
                        className={`inline-flex items-center justify-center px-6 py-2 rounded-md text-base font-medium text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mimbres-primary disabled:opacity-50 disabled:cursor-not-allowed
                        ${isLoading ? 'bg-gray-400' : 'bg-mimbres-primary hover:bg-mimbres-secondary shadow-md hover:shadow-lg transform hover:-translate-y-0.5'}`}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Guardando...</>
                        ) : (
                            isEditing ? 'Actualizar Producto' : 'Crear Producto'
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
}

export default ProductoForm;