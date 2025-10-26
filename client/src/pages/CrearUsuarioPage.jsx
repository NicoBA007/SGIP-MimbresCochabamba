import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import authApi from '../api/authApi.js';
import UsuarioForm from '../components/admin/UsuarioForm.jsx';
import { ArrowLeft } from 'lucide-react';

function CrearUsuarioPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleCreateSubmit = async (formData) => {
        setIsLoading(true);
        try {
            await authApi.post('/panel/usuarios', formData);
            toast.success('¡Usuario creado con éxito!');
            navigate('/panel/usuarios');
        } catch (error) {
            console.error("Error al crear usuario:", error);
            toast.error(error.response?.data?.message || 'No se pudo crear el usuario.');
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-full">
            <div className="mb-8">
                <Link
                    to="/panel/usuarios"
                    className="group inline-flex items-center text-[#644c44] hover:text-[#a4544c] transition-colors duration-200 font-medium"
                >
                    <ArrowLeft className="w-5 h-5 mr-2 transition-transform duration-300 ease-out group-hover:-translate-x-1" />
                    Volver a Usuarios
                </Link>
            </div>

            <h1 className="text-4xl font-bold text-[#a4544c] mb-8">Crear Nuevo Usuario</h1>

            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-gray-100">
                <UsuarioForm
                    onSubmit={handleCreateSubmit}
                    isLoading={isLoading}
                    // No pasamos initialData, UsuarioForm sabrá que es modo Crear
                />
            </div>
        </div>
    );
}

export default CrearUsuarioPage;