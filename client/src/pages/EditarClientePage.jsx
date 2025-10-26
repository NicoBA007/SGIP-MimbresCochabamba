import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import authApi from '../api/authApi.js';
import ClienteForm from '../components/admin/ClienteForm.jsx';
import { ArrowLeft, Loader2, AlertTriangle } from 'lucide-react'; // Added AlertTriangle

function EditarClientePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [initialData, setInitialData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCliente = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await authApi.get(`/panel/clientes/${id}`);
                setInitialData(response.data);
            } catch (err) {
                console.error("Error cargando datos del cliente:", err);
                const msg = err.response?.data?.message || "No se pudo cargar la información del cliente.";
                setError(msg);
                toast.error(msg);
                if (err.response?.status === 404) {
                    navigate('/panel/clientes');
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchCliente();
    }, [id, navigate]);

    const handleEditSubmit = async (formData) => {
        setIsSubmitting(true);
        try {
            await authApi.put(`/panel/clientes/${id}`, formData);
            toast.success('¡Cliente actualizado con éxito!');
            navigate('/panel/clientes');
        } catch (error) {
            console.error("Error al actualizar cliente:", error);
            toast.error(error.response?.data?.message || 'No se pudo actualizar el cliente.');
            setIsSubmitting(false);
        }
    };

    if (isLoading) return (
        <div className="flex items-center justify-center p-24 text-lg text-gray-600">
            <Loader2 className="w-8 h-8 mr-3 animate-spin text-[#a4544c]" />
            Cargando datos del cliente...
        </div>
    );
    
    if (error) return (
        <div className="flex flex-col items-center justify-center p-24 text-lg text-[#a4544c] font-medium">
            <AlertTriangle className="w-10 h-10 mb-4" />
            Error: {error}
        </div>
    );
    
    if (!initialData && !isLoading) return ( // Handle case where loading finished but no data (e.g., direct access with bad ID)
         <div className="flex flex-col items-center justify-center p-24 text-lg text-gray-500 font-medium">
             <AlertTriangle className="w-10 h-10 mb-4 text-orange-400" />
             No se encontraron datos para el cliente ID: {id}.
              <Link to="/panel/clientes" className="mt-4 text-sm text-[#644c44] hover:text-[#a4544c] underline">
                   Volver a Clientes
              </Link>
         </div>
    );


    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-full">
            <div className="mb-8">
                <Link
                    to="/panel/clientes"
                    className="group inline-flex items-center text-[#644c44] hover:text-[#a4544c] transition-colors duration-200 font-medium"
                >
                    <ArrowLeft className="w-5 h-5 mr-2 transition-transform duration-300 ease-out group-hover:-translate-x-1" />
                    Volver a Clientes
                </Link>
            </div>

            <h1 className="text-4xl font-bold text-[#a4544c] mb-8">Editar Cliente #{id}</h1>

            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-gray-100">
                {/* Render form only when initialData is available */}
                {initialData && (
                     <ClienteForm
                         onSubmit={handleEditSubmit}
                         initialData={initialData}
                         isLoading={isSubmitting}
                     />
                )}
            </div>
        </div>
    );
}

export default EditarClientePage;