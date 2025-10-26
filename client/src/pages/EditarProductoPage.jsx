import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import authApi from '../api/authApi.js';
import ProductoForm from '../components/admin/ProductoForm.jsx';
import { ArrowLeft, Loader2, AlertTriangle } from 'lucide-react'; // Added AlertTriangle
import axios from 'axios';

// Eliminamos el objeto 'styles'

function EditarProductoPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [initialData, setInitialData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [categorias, setCategorias] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [productoRes, categoriasRes] = await Promise.all([
                    authApi.get(`/panel/productos/${id}`),
                    axios.get('http://localhost:3001/api/categorias') // Use axios directly for public endpoint
                ]);
                setInitialData(productoRes.data);
                setCategorias(categoriasRes.data.filter(cat => cat.id !== 0)); // Filter out "Todas" if ID is 0
            } catch (err) {
                console.error("Error cargando datos para editar:", err);
                const msg = err.response?.data?.message || "No se pudo cargar la información.";
                setError(msg);
                toast.error(msg);
                 if (err.response?.status === 404) {
                    toast.error(`Producto con ID ${id} no encontrado.`);
                    navigate('/panel/inventario'); // Redirect if product not found
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id, navigate]); // Add navigate to dependency array

    const handleEditSubmit = async (formData, selectedFile) => {
        setIsSubmitting(true);
        // Use initialData's image URL as the base, unless a new file is selected
        let finalImageUrl = initialData?.url_imagen || null;

        try {
            // Step 1: Upload NEW image IF selected
            if (selectedFile) {
                const imageFormData = new FormData();
                imageFormData.append('imagenProducto', selectedFile);
                try {
                    const uploadResponse = await authApi.post('/panel/upload', imageFormData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                    // Use the NEW URL if upload is successful
                    finalImageUrl = uploadResponse.data.imageUrl;
                    // Optional: Add logic here to delete the old image file from the server
                } catch (uploadError) {
                    console.error("Error al subir nueva imagen:", uploadError);
                    toast.error(uploadError.response?.data?.message || 'Error al subir la nueva imagen.');
                    setIsSubmitting(false);
                    return;
                }
            }

            // Step 2: Update product data with the final image URL
            const finalProductData = {
                ...formData,
                url_imagen: finalImageUrl // Use new URL if uploaded, otherwise the original one
            };

            await authApi.put(`/panel/productos/${id}`, finalProductData);
            toast.success('¡Producto actualizado con éxito!');
            navigate('/panel/inventario');

        } catch (error) {
            console.error("Error al actualizar producto:", error);
            toast.error(error.response?.data?.message || 'No se pudo actualizar el producto.');
            setIsSubmitting(false);
        }
    };

    // --- Renderizado con Tailwind ---
    if (isLoading) return (
        <div className="flex items-center justify-center p-24 text-lg text-gray-600">
            <Loader2 className="w-8 h-8 mr-3 animate-spin text-[#a4544c]" />
            Cargando datos del producto...
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center p-24 text-lg text-[#a4544c] font-medium">
            <AlertTriangle className="w-10 h-10 mb-4" />
            Error: {error}
        </div>
    );

     // Added explicit check for initialData after loading, before rendering form
     if (!initialData && !isLoading) return (
         <div className="flex flex-col items-center justify-center p-24 text-lg text-gray-500 font-medium">
             <AlertTriangle className="w-10 h-10 mb-4 text-orange-400" />
             No se encontraron datos iniciales para el producto ID: {id}.
              <Link to="/panel/inventario" className="mt-4 text-sm text-[#644c44] hover:text-[#a4544c] underline">
                   Volver al Inventario
              </Link>
         </div>
    );

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-full">
            <div className="mb-8">
                 <Link to="/panel/inventario" className="group inline-flex items-center text-[#644c44] hover:text-[#a4544c] transition-colors duration-200 font-medium">
                     <ArrowLeft className="w-5 h-5 mr-2 transition-transform duration-300 ease-out group-hover:-translate-x-1" />
                     Volver al Inventario
                 </Link>
            </div>
            <h1 className="text-4xl font-bold text-[#a4544c] mb-8">Editar Producto #{id}</h1>

            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-gray-100">
                 {/* Render form only when initialData is successfully loaded */}
                 {initialData && (
                    <ProductoForm
                        onSubmit={handleEditSubmit}
                        initialData={initialData}
                        isLoading={isSubmitting}
                        categorias={categorias}
                    />
                 )}
            </div>
        </div>
    );
}

export default EditarProductoPage;