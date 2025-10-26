import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import authApi from '../api/authApi.js';
import ProveedorForm from '../components/admin/ProveedorForm.jsx';
import { ArrowLeft } from 'lucide-react';

function CrearProveedorPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleCreateSubmit = async (formData) => {
        setIsLoading(true);
        try {
            await authApi.post('/panel/proveedores', formData);
            toast.success('¡Proveedor creado con éxito!');
            navigate('/panel/compras'); // Volver a la página principal de proveedores/compras
        } catch (error) {
            console.error("Error al crear proveedor:", error);
            toast.error(error.response?.data?.message || 'No se pudo crear el proveedor.');
            setIsLoading(false);
        }
    };

    return (
        // Aplicamos padding y fondo consistentes
        <div className="p-4 md:p-8 bg-gray-50 min-h-full">
            {/* Enlace "Volver" con estilo consistente */}
            <div className="mb-8">
                <Link
                    to="/panel/compras" // Asegúrate que esta es la ruta correcta
                    className="group inline-flex items-center text-[#644c44] hover:text-[#a4544c] transition-colors duration-200 font-medium"
                >
                    <ArrowLeft className="w-5 h-5 mr-2 transition-transform duration-300 ease-out group-hover:-translate-x-1" />
                    Volver a Proveedores
                </Link>
            </div>

            {/* Título con estilo consistente */}
            <h1 className="text-4xl font-bold text-[#a4544c] mb-8">Registrar Nuevo Proveedor</h1>

            {/* Tarjeta contenedora con estilo consistente */}
            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-gray-100">
                <ProveedorForm
                    onSubmit={handleCreateSubmit}
                    isLoading={isLoading}
                    // No pasamos initialData, ProveedorForm sabrá que es modo Crear
                />
            </div>
        </div>
    );
}

export default CrearProveedorPage;