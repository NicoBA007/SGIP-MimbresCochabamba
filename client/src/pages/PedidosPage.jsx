import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import authApi from '../api/authApi.js';
// 1. Importamos los iconos necesarios
import { Loader2, AlertTriangle, Eye, CheckCircle, XCircle } from 'lucide-react';

// 2. Eliminamos todo el objeto 'styles'
// const styles = { ... };

function PedidosPage() {
    // --- Lógica de React (Sin Cambios) ---
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPedidos = async () => {
        try {
            setLoading(true);
            const response = await authApi.get('/panel/pedidos');
            setPedidos(response.data);
        } catch (err) {
            console.error("Error al cargar pedidos:", err);
            const msg = err.response?.data?.message || "No se pudieron cargar los pedidos.";
            setError(msg);
            if (err.response?.status === 401) {
                toast.error("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPedidos();
    }, []);

    const handleActualizarEstado = async (id, nuevoEstado) => {
        if (!window.confirm(`¿Seguro que quieres marcar este pedido como '${nuevoEstado}'?`)) {
            return;
        }
        try {
            await authApi.put(`/panel/pedidos/${id}/estado`, { nuevoEstado });
            toast.success(`Pedido #${id} marcado como ${nuevoEstado}.`);
            setPedidos(pedidos.filter(p => p.id_pedido_web !== id));
        } catch (err) {
            console.error("Error al actualizar estado:", err);
            const msg = err.response?.data?.message || "No se pudo actualizar el pedido.";
            toast.error(msg);
        }
    };

    const verDetalles = async (id) => {
        try {
            const response = await authApi.get(`/panel/pedidos/${id}`);
            const detallesString = response.data.map(item => 
                `${item.cantidad_solicitada}x ${item.nombre_producto} (Bs. ${item.precio_unitario_registro})`
            ).join('\n');
            alert(`Detalles del Pedido #${id}:\n\n${detallesString}`);
        } catch (err) {
            toast.error("No se pudo cargar el detalle.");
        }
    };
    // --- Fin de la Lógica ---


    // --- Renderizado (Estilos Refactorizados) ---
    if (loading) return (
        // Estado de carga consistente con el Dashboard
        <div className="flex items-center justify-center p-24 text-lg text-gray-600">
            <Loader2 className="w-8 h-8 mr-3 animate-spin text-[#a4544c]" />
            Cargando pedidos...
        </div>
    );
    
    if (error) return (
        // Estado de error consistente con el Dashboard
        <div className="flex flex-col items-center justify-center p-24 text-lg text-[#a4544c] font-medium">
            <AlertTriangle className="w-10 h-10 mb-4" />
            Error: {error}
        </div>
    );

    return (
        // --- LAYOUT PRINCIPAL REFACTORIZADO ---
        <div>
            {/* Título de la página */}
            <h1 className="text-4xl font-bold text-[#a4544c] mb-8">Panel de Pedidos Web (Nuevos)</h1>

            {/* Tarjeta contenedora de la tabla */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl">
                {pedidos.length === 0 ? (
                    // --- ESTADO VACÍO REFACTORIZADO ---
                    <p className="text-center text-gray-500 py-12">
                        No hay pedidos nuevos pendientes.
                    </p>
                ) : (
                    // --- TABLA REFACTORIZADA (con Tailwind) ---
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            {/* Cabecera minimalista */}
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="py-3 px-3 text-left text-gray-500 font-medium uppercase tracking-wider">ID</th>
                                    <th className="py-3 px-3 text-left text-gray-500 font-medium uppercase tracking-wider">Fecha</th>
                                    <th className="py-3 px-3 text-left text-gray-500 font-medium uppercase tracking-wider">Monto (Bs.)</th>
                                    <th className="py-3 px-3 text-left text-gray-500 font-medium uppercase tracking-wider">WhatsApp</th>
                                    <th className="py-3 px-3 text-left text-gray-500 font-medium uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            {/* Cuerpo de tabla con divisiones sutiles */}
                            <tbody className="divide-y divide-gray-100">
                                {pedidos.map(pedido => (
                                    <tr key={pedido.id_pedido_web} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-3 text-gray-700 font-medium">#{pedido.id_pedido_web}</td>
                                        <td className="py-4 px-3 text-gray-700">{new Date(pedido.fecha_pedido).toLocaleString()}</td>
                                        <td className="py-4 px-3 text-gray-800 font-semibold">{parseFloat(pedido.monto_estimado).toFixed(2)}</td>
                                        <td className="py-4 px-3 text-gray-700">{pedido.telefono_whatsapp}</td>
                                        <td className="py-4 px-3">
                                            {/* --- BOTONES DE ACCIÓN REFACTORIZADOS --- */}
                                            <div className="flex items-center space-x-2">
                                                {/* Botón "Ver" (Neutral) */}
                                                <button 
                                                    className="flex items-center space-x-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-medium py-1.5 px-3 rounded-md transition-colors"
                                                    onClick={() => verDetalles(pedido.id_pedido_web)}
                                                >
                                                    <Eye size={14} />
                                                    <span>Ver</span>
                                                </button>
                                                {/* Botón "Concretar" (Éxito) */}
                                                <button 
                                                    className="flex items-center space-x-1.5 bg-green-100 text-green-700 hover:bg-green-200 text-xs font-medium py-1.5 px-3 rounded-md transition-colors"
                                                    onClick={() => handleActualizarEstado(pedido.id_pedido_web, 'CONCRETADO')}
                                                >
                                                    <CheckCircle size={14} />
                                                    <span>Concretar</span>
                                                </button>
                                                {/* Botón "Cancelar" (Peligro) */}
                                                <button 
                                                    className="flex items-center space-x-1.5 bg-red-100 text-red-700 hover:bg-red-200 text-xs font-medium py-1.5 px-3 rounded-md transition-colors"
                                                    onClick={() => handleActualizarEstado(pedido.id_pedido_web, 'CANCELADO')}
                                                >
                                                    <XCircle size={14} />
                                                    <span>Cancelar</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PedidosPage;