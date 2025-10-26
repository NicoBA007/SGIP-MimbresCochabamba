import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import authApi from '../api/authApi.js';
import { Edit, UserPlus, Trash2, Loader2, AlertTriangle } from 'lucide-react'; // Added AlertTriangle

function UsuariosPage() {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchUsuarios = async () => {
        try {
            setLoading(true);
            const response = await authApi.get('/panel/usuarios');
            setUsuarios(response.data);
        } catch (err) {
            console.error("Error al cargar usuarios:", err);
            const msg = err.response?.data?.message || "No se pudieron cargar los usuarios.";
            setError(msg);
            if (err.response?.status === 401) toast.error("Sesión expirada.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsuarios();
    }, []);

    const handleCrear = () => {
        navigate('/panel/usuarios/crear');
    };

    const handleEditar = (id) => {
        navigate(`/panel/usuarios/editar/${id}`);
    };

    const handleEliminar = async (id, username) => {
        if (!window.confirm(`¿Seguro que quieres eliminar al usuario "${username || `ID: ${id}`}"?`)) {
            return;
        }
        try {
            await authApi.delete(`/panel/usuarios/${id}`);
            toast.success(`Usuario #${id} eliminado.`);
            setUsuarios(prev => prev.filter(u => u.id_usuario !== id));
        } catch (err) {
            console.error("Error al eliminar usuario:", err);
            toast.error(err.response?.data?.message || "No se pudo eliminar el usuario.");
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center p-24 text-lg text-gray-600">
            <Loader2 className="w-8 h-8 mr-3 animate-spin text-[#a4544c]" />
            Cargando usuarios...
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
                <h1 className="text-4xl font-bold text-[#a4544c]">Gestión de Usuarios</h1>
                <button
                    className="flex items-center justify-center space-x-2 py-2.5 px-5 rounded-lg font-semibold text-white bg-teal-600 hover:bg-teal-700 transition-all duration-300 ease-out shadow-lg shadow-teal-600/30 hover:-translate-y-0.5" // Teal color
                    onClick={handleCrear}
                >
                    <UserPlus size={20} />
                    <span>Crear Nuevo Usuario</span>
                </button>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="py-3 px-3 text-left text-gray-500 font-medium uppercase tracking-wider">ID</th>
                                <th className="py-3 px-3 text-left text-gray-500 font-medium uppercase tracking-wider">Nombre</th>
                                <th className="py-3 px-3 text-left text-gray-500 font-medium uppercase tracking-wider">Apellidos</th>
                                <th className="py-3 px-3 text-left text-gray-500 font-medium uppercase tracking-wider">Username</th>
                                <th className="py-3 px-3 text-left text-gray-500 font-medium uppercase tracking-wider">Rol</th>
                                <th className="py-3 px-3 text-left text-gray-500 font-medium uppercase tracking-wider">Registro</th>
                                <th className="py-3 px-3 text-left text-gray-500 font-medium uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {usuarios.map(user => (
                                <tr key={user.id_usuario} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-4 px-3 text-gray-700 font-medium align-middle">
                                        {user.id_usuario}
                                    </td>
                                    <td className="py-4 px-3 text-gray-800 font-semibold align-middle">
                                        {user.nombre_pila}
                                    </td>
                                    <td className="py-4 px-3 text-gray-600 align-middle">
                                        {`${user.apellido_paterno} ${user.apellido_materno || ''}`.trim()}
                                    </td>
                                    <td className="py-4 px-3 text-gray-700 align-middle font-mono">
                                        {user.username}
                                    </td>
                                    <td className="py-4 px-3 align-middle">
                                        <span className={`font-bold px-2.5 py-1 rounded-full text-xs ${
                                            user.rol === 'ADMIN' 
                                            ? 'bg-red-100 text-red-700' 
                                            : 'bg-blue-100 text-blue-700' // Assuming VENDEDOR uses blue
                                        }`}>
                                            {user.rol}
                                        </span>
                                    </td>
                                    <td className="py-4 px-3 text-gray-500 align-middle text-xs">
                                        {new Date(user.fecha_creacion).toLocaleDateString()}
                                    </td>
                                    <td className="py-4 px-3 align-middle">
                                        <div className="flex items-center space-x-1">
                                            <button
                                                className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Editar Usuario"
                                                onClick={() => handleEditar(user.id_usuario)}
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Eliminar Usuario"
                                                onClick={() => handleEliminar(user.id_usuario, user.username)}
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

export default UsuariosPage;