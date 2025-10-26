import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import authApi from '../api/authApi.js';
import { Edit, PlusCircle, ToggleLeft, ToggleRight, Trash2, Loader2, AlertTriangle, Image as ImageIcon } from 'lucide-react';

function InventarioPage() {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchProductos = async () => {
        try {
            setLoading(true);
            const response = await authApi.get('/panel/productos');
            const sortedProductos = response.data.sort((a, b) => a.id_producto - b.id_producto);
            setProductos(sortedProductos);
        } catch (err) {
            console.error("Error al cargar productos:", err);
            const msg = err.response?.data?.message || "No se pudieron cargar los productos.";
            setError(msg);
            if (err.response?.status === 401) {
                toast.error("Sesión expirada.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProductos();
    }, []);

    const handleToggleEstado = async (id, estadoActual) => {
        const nuevoEstado = estadoActual === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
        if (!window.confirm(`¿Seguro que quieres cambiar el estado a '${nuevoEstado}'?`)) {
            return;
        }
        try {
            await authApi.put(`/panel/productos/${id}/estado`, { nuevoEstado });
            toast.success(`Estado del producto #${id} cambiado a ${nuevoEstado}.`);
            setProductos(prev => prev.map(p => p.id_producto === id ? { ...p, estado: nuevoEstado } : p));
        } catch (err) {
            console.error("Error al cambiar estado:", err);
            toast.error(err.response?.data?.message || "No se pudo cambiar el estado.");
        }
    };

    const handleEdit = (id) => {
        navigate(`/panel/inventario/editar/${id}`);
    };

    const handleCreate = () => {
        navigate('/panel/inventario/crear');
    };

    if (loading) return (
        <div className="flex items-center justify-center p-24 text-lg text-gray-600">
            <Loader2 className="w-8 h-8 mr-3 animate-spin text-[#a4544c]" />
            Cargando inventario...
        </div>
    );
    
    if (error) return (
        <div className="flex flex-col items-center justify-center p-24 text-lg text-[#a4544c] font-medium">
            <AlertTriangle className="w-10 h-10 mb-4" />
            Error: {error}
        </div>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold text-[#a4544c]">Gestión de Inventario</h1>
                <button 
                    className="flex items-center justify-center space-x-2 py-2.5 px-5 rounded-lg font-semibold text-white bg-green-600 hover:bg-green-700 transition-all duration-300 ease-out shadow-lg shadow-green-600/30 hover:-translate-y-0.5"
                    onClick={handleCreate}
                >
                    <PlusCircle size={20} />
                    <span>Crear Nuevo Producto</span>
                </button>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="py-3 px-3 text-left text-gray-500 font-medium uppercase tracking-wider">ID</th>
                                <th className="py-3 px-3 text-left text-gray-500 font-medium uppercase tracking-wider">Imagen</th>
                                <th className="py-3 px-3 text-left text-gray-500 font-medium uppercase tracking-wider">Nombre</th>
                                <th className="py-3 px-3 text-left text-gray-500 font-medium uppercase tracking-wider">Categoría</th>
                                <th className="py-3 px-3 text-left text-gray-500 font-medium uppercase tracking-wider">Precio (Bs.)</th>
                                <th className="py-3 px-3 text-left text-gray-500 font-medium uppercase tracking-wider">Stock</th>
                                <th className="py-3 px-3 text-left text-gray-500 font-medium uppercase tracking-wider">Estado</th>
                                <th className="py-3 px-3 text-left text-gray-500 font-medium uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {productos.map(prod => (
                                <tr key={prod.id_producto} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-4 px-3 text-gray-700 font-medium align-middle">
                                        {prod.id_producto}
                                    </td>
                                    <td className="py-2 px-3 align-middle">
                                        {prod.url_imagen ? (
                                            <img 
                                                src={prod.url_imagen} 
                                                alt={prod.nombre_producto}
                                                className="w-12 h-12 object-contain rounded-md bg-gray-50 p-1"
                                                onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/48x48/EEE/31343C?text=Error"; e.target.alt="Error al cargar imagen" }} // Fallback
                                            />
                                        ) : (
                                            <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-md text-gray-400">
                                                <ImageIcon size={20} />
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-4 px-3 text-gray-800 font-semibold align-middle">
                                        {prod.nombre_producto}
                                    </td>
                                    <td className="py-4 px-3 text-gray-600 align-middle">
                                        {prod.nombre_categoria}
                                    </td>
                                    <td className="py-4 px-3 text-gray-700 align-middle font-mono">
                                        {prod.precio_unitario.toFixed(2)}
                                    </td>
                                    <td className="py-4 px-3 text-gray-700 align-middle font-mono font-medium">
                                        {prod.stock_actual}
                                    </td>
                                    <td className="py-4 px-3 align-middle">
                                        <span className={`font-semibold px-2.5 py-1 rounded-full text-xs ${
                                            prod.estado === 'ACTIVO' 
                                            ? 'bg-green-100 text-green-700' 
                                            : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {prod.estado}
                                        </span>
                                    </td>
                                    <td className="py-4 px-3 align-middle">
                                        <div className="flex items-center space-x-1">
                                            <button
                                                className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Editar Producto"
                                                onClick={() => handleEdit(prod.id_producto)}
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                className="p-2 rounded-lg transition-colors"
                                                title={prod.estado === 'ACTIVO' ? 'Marcar como INACTIVO' : 'Marcar como ACTIVO'}
                                                onClick={() => handleToggleEstado(prod.id_producto, prod.estado)}
                                            >
                                                {prod.estado === 'ACTIVO' ?
                                                    <ToggleRight size={18} className="text-green-500 hover:text-green-700" /> :
                                                    <ToggleLeft size={18} className="text-gray-400 hover:text-gray-600" />
                                                }
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default InventarioPage;