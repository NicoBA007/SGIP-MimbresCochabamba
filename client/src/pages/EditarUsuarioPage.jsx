import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import authApi from '../api/authApi.js';
import UsuarioForm from '../components/admin/UsuarioForm.jsx';
import { ArrowLeft, Loader2, AlertTriangle } from 'lucide-react'; // Added AlertTriangle

function EditarUsuarioPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [initialData, setInitialData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUsuario = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await authApi.get(`/panel/usuarios/${id}`);
                setInitialData(response.data);
            } catch (err) {
                console.error("Error cargando datos del usuario:", err);
                const msg = err.response?.data?.message || "No se pudo cargar la información del usuario.";
                setError(msg);
                toast.error(msg);
                if (err.response?.status === 404) {
                    navigate('/panel/usuarios');
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsuario();
    }, [id, navigate]);

    const handleEditSubmit = async (formData) => {
        setIsSubmitting(true);
        try {
            await authApi.put(`/panel/usuarios/${id}`, formData);
            toast.success('¡Usuario actualizado con éxito!');
            navigate('/panel/usuarios');
        } catch (error) {
            console.error("Error al actualizar usuario:", error);
            toast.error(error.response?.data?.message || 'No se pudo actualizar el usuario.');
            setIsSubmitting(false);
        }
    };

    if (isLoading) return (
        <div className="flex items-center justify-center p-24 text-lg text-gray-600">
            <Loader2 className="w-8 h-8 mr-3 animate-spin text-[#a4544c]" />
            Cargando datos del usuario...
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center p-24 text-lg text-[#a4544c] font-medium">
            <AlertTriangle className="w-10 h-10 mb-4" />
            Error: {error}
        </div>
    );

    if (!initialData && !isLoading) return (
         <div className="flex flex-col items-center justify-center p-24 text-lg text-gray-500 font-medium">
             <AlertTriangle className="w-10 h-10 mb-4 text-orange-400" />
             No se encontraron datos para el usuario ID: {id}.
              <Link to="/panel/usuarios" className="mt-4 text-sm text-[#644c44] hover:text-[#a4544c] underline">
                   Volver a Usuarios
              </Link>
         </div>
    );


    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-full">
            <div className="mb-8">
                 <Link to="/panel/usuarios" className="group inline-flex items-center text-[#644c44] hover:text-[#a4544c] transition-colors duration-200 font-medium">
                     <ArrowLeft className="w-5 h-5 mr-2 transition-transform duration-300 ease-out group-hover:-translate-x-1" />
                     Volver a Usuarios
                 </Link>
            </div>
            <h1 className="text-4xl font-bold text-[#a4544c] mb-8">Editar Usuario #{id}</h1>

            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-gray-100">
                 {initialData && (
                      <UsuarioForm
                          onSubmit={handleEditSubmit}
                          initialData={initialData}
                          isLoading={isSubmitting}
                      />
                 )}
            </div>
        </div>
    );
}

export default EditarUsuarioPage;