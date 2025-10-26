import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import authApi from '../api/authApi.js';
import { Edit, UserPlus, Trash2, Loader2, AlertTriangle } from 'lucide-react';

// Eliminamos el objeto 'styles'

function ClientesPage() {
    // --- Lógica de React (Sin Cambios) ---
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchClientes = async () => {
        try {
            setLoading(true);
            const response = await authApi.get('/panel/clientes');
            setClientes(response.data);
        } catch (err) {
            console.error("Error al cargar clientes:", err);
            const msg = err.response?.data?.message || "No se pudieron cargar los clientes.";
            setError(msg);
            if (err.response?.status === 401) toast.error("Sesión expirada.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClientes();
    }, []);

    const handleCrear = () => {
        navigate('/panel/clientes/crear');
    };

    const handleEditar = (id) => {
        navigate(`/panel/clientes/editar/${id}`);
    };

    const handleEliminar = async (id, nombre) => {
        if (!window.confirm(`¿Seguro que quieres eliminar al cliente "${nombre || `ID: ${id}`}"? Esta acción podría fallar si tiene ventas asociadas.`)) {
            return;
        }
        try {
            await authApi.delete(`/panel/clientes/${id}`);
            toast.success(`Cliente #${id} eliminado.`);
            setClientes(prev => prev.filter(c => c.id_cliente !== id));
        } catch (err) {
            console.error("Error al eliminar cliente:", err);
            toast.error(err.response?.data?.message || "No se pudo eliminar el cliente.");
        }
    };
    // --- Fin de la Lógica ---

    // --- Renderizado (Estilos Refactorizados) ---
    if (loading) return (
        // Estado de carga consistente
        <div className="flex items-center justify-center p-24 text-lg text-gray-600">
            <Loader2 className="w-8 h-8 mr-3 animate-spin text-[#a4544c]" />
            Cargando clientes...
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
                <h1 className="text-4xl font-bold text-[#a4544c]">Gestión de Clientes</h1>
                {/* --- BOTÓN CREAR REFACTORIZADO --- */}
                {/* Estilo consistente con otros botones "Crear" */}
                <button 
                    className="flex items-center justify-center space-x-2 py-2.5 px-5 rounded-lg font-semibold text-white bg-green-600 hover:bg-green-700 transition-all duration-300 ease-out shadow-lg shadow-green-600/30 hover:-translate-y-0.5"
                    onClick={handleCrear}
                >
                    <UserPlus size={20} />
                    <span>Registrar Nuevo Cliente</span>
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
                                <th className="py-3 px-3 text-left text-gray-500 font-medium uppercase tracking-wider">ID</th>
                                <th className="py-3 px-3 text-left text-gray-500 font-medium uppercase tracking-wider">Nombre</th>
                                <th className="py-3 px-3 text-left text-gray-500 font-medium uppercase tracking-wider">Apellidos</th>
                                <th className="py-3 px-3 text-left text-gray-500 font-medium uppercase tracking-wider">WhatsApp</th>
                                <th className="py-3 px-3 text-left text-gray-500 font-medium uppercase tracking-wider">Email</th>
                                <th className="py-3 px-3 text-left text-gray-500 font-medium uppercase tracking-wider">Registro</th>
                                <th className="py-3 px-3 text-left text-gray-500 font-medium uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        {/* Cuerpo con divisiones sutiles y hover */}
                        <tbody className="divide-y divide-gray-100">
                            {clientes.map(cli => (
                                <tr key={cli.id_cliente} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-4 px-3 text-gray-700 font-medium align-middle">
                                        {cli.id_cliente}
                                    </td>
                                    <td className="py-4 px-3 text-gray-800 font-semibold align-middle">
                                        {cli.nombre_pila_cliente || '-'}
                                    </td>
                                    <td className="py-4 px-3 text-gray-600 align-middle">
                                        {`${cli.apellido_paterno_cliente || ''} ${cli.apellido_materno_cliente || ''}`.trim() || '-'}
                                    </td>
                                    <td className="py-4 px-3 text-gray-700 align-middle font-mono">
                                        {cli.telefono_whatsapp}
                                    </td>
                                    <td className="py-4 px-3 text-gray-600 align-middle">
                                        {cli.email || '-'}
                                    </td>
                                    <td className="py-4 px-3 text-gray-500 align-middle text-xs">
                                        {new Date(cli.fecha_registro).toLocaleDateString()}
                                    </td>
                                    {/* --- BOTONES DE ACCIÓN REFACTORIZADOS --- */}
                                    <td className="py-4 px-3 align-middle">
                                        <div className="flex items-center space-x-1">
                                            {/* Botón Editar */}
                                            <button
                                                className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Editar Cliente"
                                                onClick={() => handleEditar(cli.id_cliente)}
                                            >
                                                <Edit size={18} />
                                            </button>
                                            {/* Botón Eliminar */}
                                            <button
                                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Eliminar Cliente"
                                                onClick={() => handleEliminar(cli.id_cliente, cli.nombre_pila_cliente)}
                                            >
                                                <Trash2 size={18} />
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

export default ClientesPage;