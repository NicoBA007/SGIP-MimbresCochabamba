import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import authApi from '../api/authApi.js';
import { Edit, PlusCircle, Trash2, Loader2, X, AlertTriangle, Layers } from 'lucide-react'; // Added Layers, AlertTriangle

// --- COMPONENTE FORMULARIO REFACTORIZADO CON TAILWIND ---
const CategoriaForm = ({ categoria, onSave, onCancel, isLoading }) => {
    const [nombre, setNombre] = useState(categoria?.nombre_categoria || '');
    const [descripcion, setDescripcion] = useState(categoria?.descripcion || '');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!nombre.trim()) {
            setError('El nombre es requerido.');
            return;
        }
        setError('');
        // Ensure description is null if empty, matching backend expectations
        const data = { nombre_categoria: nombre.trim(), descripcion: descripcion?.trim() || null };
        await onSave(data); // onSave handles the API call and loading state
    };

    return (
        // Form structure with spacing
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="nombreCatForm" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre Categoría <span className="text-red-500">*</span>
                </label>
                {/* Input styling consistent with other forms */}
                <input
                    id="nombreCatForm"
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:bg-white focus:border-[#e3a45c] focus:ring-1 focus:ring-[#e3a45c]/50 transition-colors duration-200"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    autoFocus
                    disabled={isLoading} // Disable input while loading
                />
                {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
            </div>
            <div>
                <label htmlFor="descCatForm" className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción (Opcional)
                </label>
                {/* Textarea styling */}
                <textarea
                    id="descCatForm"
                    rows="3" // Give it a bit more default height
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:bg-white focus:border-[#e3a45c] focus:ring-1 focus:ring-[#e3a45c]/50 transition-colors duration-200"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    disabled={isLoading} // Disable textarea while loading
                />
            </div>
            {/* Buttons section */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                {/* Cancel button */}
                <button
                    type="button"
                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors disabled:opacity-50"
                    onClick={onCancel}
                    disabled={isLoading}
                >
                    Cancelar
                </button>
                {/* Save/Update button - using primary color */}
                <button
                    type="submit"
                    className={`inline-flex items-center justify-center px-5 py-2 rounded-lg text-sm font-medium text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#a4544c] disabled:opacity-50 disabled:cursor-not-allowed
                    ${isLoading ? 'bg-gray-400' : 'bg-[#a4544c] hover:bg-[#644c44]'}`} // Use primary and dark colors
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Guardando...
                        </>
                    ) : (
                        categoria ? 'Actualizar' : 'Crear'
                    )}
                </button>
            </div>
        </form>
    );
};


function CategoriasPage() {
    // --- Lógica de React (Sin Cambios) ---
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingCategoria, setEditingCategoria] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false); // Used only by the modal form

    const fetchCategorias = async () => {
        try {
            setLoading(true);
            const response = await authApi.get('/panel/categorias');
             // Sort categories alphabetically by name for better usability
            const sortedCategorias = response.data.sort((a, b) => 
                a.nombre_categoria.localeCompare(b.nombre_categoria)
            );
            setCategorias(sortedCategorias);
        } catch (err) {
            console.error("Error al cargar categorías:", err);
            setError(err.response?.data?.message || "No se pudieron cargar las categorías.");
            if (err.response?.status === 401) toast.error("Sesión expirada.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCategorias(); }, []);

    const openCreateForm = () => {
        setEditingCategoria(null);
        setShowForm(true);
    };

    const openEditForm = (categoria) => {
        setEditingCategoria(categoria);
        setShowForm(true);
    };

    const handleSave = async (formData) => {
        setIsSubmitting(true);
        const isEditing = !!editingCategoria;
        const id = editingCategoria?.id_categoria;

        try {
            if (isEditing) {
                await authApi.put(`/panel/categorias/${id}`, formData);
                toast.success(`Categoría #${id} actualizada.`);
            } else {
                await authApi.post('/panel/categorias', formData);
                toast.success(`Categoría "${formData.nombre_categoria}" creada.`);
            }
            setShowForm(false);
            fetchCategorias(); // Reload data after save
        } catch (err) {
            console.error("Error guardando categoría:", err);
            toast.error(err.response?.data?.message || 'No se pudo guardar la categoría.');
        } finally {
            setIsSubmitting(false); // Ensure this resets even on error
        }
    };

    const handleEliminar = async (id, nombre) => {
        if (!window.confirm(`¿Seguro que quieres eliminar la categoría "${nombre}"? Podría fallar si tiene productos asociados.`)) {
            return;
        }
        try {
            await authApi.delete(`/panel/categorias/${id}`);
            toast.success(`Categoría #${id} eliminada.`);
            // Optimistic update: remove from local state immediately
            setCategorias(prev => prev.filter(c => c.id_categoria !== id));
        } catch (err) {
            console.error("Error al eliminar categoría:", err);
            toast.error(err.response?.data?.message || "No se pudo eliminar la categoría.");
        }
    };
    // --- Fin de la Lógica ---

    // --- Renderizado (Estilos Refactorizados) ---
    if (loading) return (
        // Estado de carga consistente
        <div className="flex items-center justify-center p-24 text-lg text-gray-600">
            <Loader2 className="w-8 h-8 mr-3 animate-spin text-[#a4544c]" />
            Cargando categorías...
        </div>
    );
    
    if (error) return (
        // Estado de error consistente
        <div className="flex flex-col items-center justify-center p-24 text-lg text-[#a4544c] font-medium">
            <AlertTriangle className="w-10 h-10 mb-4" />
            Error: {error}
        </div>
    );

    return (
        // --- LAYOUT PRINCIPAL REFACTORIZADO ---
        <div>
            {/* --- CABECERA REFACTORIZADA --- */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold text-[#a4544c]">Gestión de Categorías</h1>
                {/* --- BOTÓN CREAR REFACTORIZADO --- */}
                {/* Using a distinct color for categories */}
                <button
                    className="flex items-center justify-center space-x-2 py-2.5 px-5 rounded-lg font-semibold text-white bg-cyan-600 hover:bg-cyan-700 transition-all duration-300 ease-out shadow-lg shadow-cyan-600/30 hover:-translate-y-0.5" // Cyan color
                    onClick={openCreateForm}
                >
                    <PlusCircle size={20} />
                    <span>Crear Nueva Categoría</span>
                </button>
            </div>

            {/* --- TARJETA CONTENEDORA DE TABLA REFACTORIZADA --- */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl">
                <div className="overflow-x-auto">
                    {/* --- TABLA REFACTORIZADA --- */}
                    <table className="w-full text-sm">
                        {/* Cabecera minimalista */}
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="py-3 px-3 text-left text-gray-500 font-medium uppercase tracking-wider w-16">ID</th>
                                <th className="py-3 px-3 text-left text-gray-500 font-medium uppercase tracking-wider">Nombre</th>
                                <th className="py-3 px-3 text-left text-gray-500 font-medium uppercase tracking-wider">Descripción</th>
                                <th className="py-3 px-3 text-left text-gray-500 font-medium uppercase tracking-wider w-32">Acciones</th>
                            </tr>
                        </thead>
                        {/* Cuerpo con divisiones sutiles y hover */}
                        <tbody className="divide-y divide-gray-100">
                            {categorias.map(cat => (
                                <tr key={cat.id_categoria} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-4 px-3 text-gray-700 font-medium align-middle">
                                        {cat.id_categoria}
                                    </td>
                                    <td className="py-4 px-3 text-gray-800 font-semibold align-middle">
                                        {cat.nombre_categoria}
                                    </td>
                                    <td className="py-4 px-3 text-gray-600 align-middle text-xs">
                                        {/* Truncate long descriptions visually */}
                                        <span className="line-clamp-2" title={cat.descripcion || ''}>
                                             {cat.descripcion || '-'}
                                        </span>
                                    </td>
                                    {/* --- BOTONES DE ACCIÓN REFACTORIZADOS --- */}
                                    <td className="py-4 px-3 align-middle">
                                        <div className="flex items-center space-x-1">
                                            {/* Botón Editar */}
                                            <button
                                                className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Editar Categoría"
                                                onClick={() => openEditForm(cat)}
                                            >
                                                <Edit size={18} />
                                            </button>
                                            {/* Botón Eliminar */}
                                            <button
                                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Eliminar Categoría"
                                                onClick={() => handleEliminar(cat.id_categoria, cat.nombre_categoria)}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {categorias.length === 0 && !loading && (
                        <p className="text-center text-gray-500 py-12">No hay categorías registradas.</p>
                    )}
                </div>
            </div>

            {/* --- MODAL REFACTORIZADO CON TAILWIND --- */}
            {showForm && (
                // Overlay
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 transition-opacity duration-300 ease-out">
                    {/* Contenido del Modal */}
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 ease-out">
                         {/* Cabecera del Modal */}
                        <div className="flex items-center justify-between p-5 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-[#644c44] flex items-center">
                               <Layers className="w-6 h-6 mr-3 text-[#a4544c]"/> {/* Added Icon */}
                                {editingCategoria ? `Editar Categoría #${editingCategoria.id_categoria}` : 'Crear Nueva Categoría'}
                            </h2>
                            <button
                                className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                                onClick={() => setShowForm(false)}
                                disabled={isSubmitting} // Disable close button while submitting
                                title="Cerrar"
                            >
                                <X size={24}/>
                            </button>
                        </div>
                         {/* Cuerpo del Modal (Formulario) */}
                        <div className="p-6">
                            <CategoriaForm
                                categoria={editingCategoria}
                                onSave={handleSave}
                                onCancel={() => setShowForm(false)}
                                isLoading={isSubmitting}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CategoriasPage;