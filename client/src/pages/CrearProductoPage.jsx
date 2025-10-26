import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import authApi from '../api/authApi.js';
import ProductoForm from '../components/admin/ProductoForm.jsx';
import { ArrowLeft, Loader2 } from 'lucide-react';
import axios from 'axios';

function CrearProductoPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [categorias, setCategorias] = useState([]);

    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/categorias');
                setCategorias(response.data.filter(cat => cat.id !== 0));
            } catch (error) {
                console.error("Error cargando categorías:", error);
                toast.error("No se pudieron cargar las categorías.");
            }
        };
        fetchCategorias();
    }, []);

    const handleCreateSubmit = async (formData, selectedFile) => {
        setIsLoading(true);
        let imageUrl = null;

        try {
            if (selectedFile) {
                const imageFormData = new FormData();
                imageFormData.append('imagenProducto', selectedFile);

                try {
                    const uploadResponse = await authApi.post('/panel/upload', imageFormData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    });
                    imageUrl = uploadResponse.data.imageUrl;
                } catch (uploadError) {
                    console.error("Error al subir imagen:", uploadError);
                    toast.error(uploadError.response?.data?.message || 'Error al subir la imagen.');
                    setIsLoading(false);
                    return;
                }
            }

            const finalProductData = {
                ...formData,
                url_imagen: imageUrl
            };

            await authApi.post('/panel/productos', finalProductData);
            toast.success('¡Producto creado con éxito!');
            navigate('/panel/inventario');

        } catch (error) {
            console.error("Error al crear producto:", error);
            toast.error(error.response?.data?.message || 'No se pudo crear el producto.');
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-full">
            <div className="mb-8">
                <Link
                    to="/panel/inventario"
                    className="group inline-flex items-center text-[#644c44] hover:text-[#a4544c] transition-colors duration-200 font-medium"
                >
                    <ArrowLeft className="w-5 h-5 mr-2 transition-transform duration-300 ease-out group-hover:-translate-x-1" />
                    Volver al Inventario
                </Link>
            </div>

            <h1 className="text-4xl font-bold text-[#a4544c] mb-8">Crear Nuevo Producto</h1>

            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-gray-100">
                <ProductoForm
                    onSubmit={handleCreateSubmit}
                    isLoading={isLoading}
                    categorias={categorias}
                    // No pasamos initialData, así ProductoForm sabe que es modo "Crear"
                />
            </div>
        </div>
    );
}

export default CrearProductoPage;