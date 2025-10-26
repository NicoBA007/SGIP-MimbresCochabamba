import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { Loader2, ShoppingCart, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useCartStore } from '../store/cart.store.js';
import { toast } from 'react-hot-toast';

const API_PRODUCT_URL = 'http://localhost:3001/api/productos/';

/**
 * Componente Principal: ProductDetailPage
 */
function ProductDetailPage() {
    // --- Lógica de React (Sin Cambios) ---
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const addProductToCart = useCartStore(state => state.addProduct);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(`${API_PRODUCT_URL}${id}`);
                setProduct(response.data);
            } catch (err) {
                console.error("Error al cargar el producto:", err);
                const message = err.response?.data?.message || "No se pudo encontrar el producto.";
                setError(message);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        if (product) {
            const itemsInCart = useCartStore.getState().cartItems;
            const productInCart = itemsInCart.find(item => item.id === product.id);
            const currentQty = productInCart ? productInCart.quantity : 0;
            
            addProductToCart(product);
            
            const newQty = useCartStore.getState().cartItems.find(item => item.id === product.id)?.quantity || 0;
            
            if (newQty > currentQty) {
                toast.success(`'${product.name}' añadido al carrito`);
            }
        }
    };
    // --- Fin de la Lógica ---

    
    // --- Renderizado Condicional (Estilos Refactorizados) ---
    const renderContent = () => {
        if (loading) {
            return (
                // --- ESTADO DE CARGA REFACTORIZADO ---
                <div className="flex justify-center items-center h-96 text-lg text-gray-600">
                    <Loader2 className="w-10 h-10 animate-spin mr-4 text-[#a4544c]" />
                    Cargando detalles del producto...
                </div>
            );
        }

        if (error) {
            return (
                // --- ESTADO DE ERROR REFACTORIZADO ---
                <div className="flex flex-col justify-center items-center h-96 text-center text-[#a4544c]">
                    <AlertTriangle className="w-16 h-16 mb-4" />
                    <h2 className="text-3xl font-bold mb-2">Error</h2>
                    <p className="text-lg">{error}</p>
                    <Link 
                        to="/" 
                        className="mt-6 text-base font-medium text-[#644c44] hover:text-[#a4544c] underline transition-colors"
                    >
                        Volver al Catálogo
                    </Link>
                </div>
            );
        }

        if (!product) {
            return null;
        }

        // --- Renderizado del Producto (Estilos Refactorizados) ---
        return (
            // Más 'gap' (espacio) entre columnas
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">

                {/* Columna Izquierda: Imagen */}
                {/* --- ESTILO DE TARJETA DE IMAGEN REFACTORIZADO --- */}
                {/* Más padding, redondeo, sombra sutil, y efecto de zoom en hover */}
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 flex items-center justify-center h-[450px] md:h-[500px] group overflow-hidden">
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-contain transition-transform duration-300 ease-out group-hover:scale-105"
                    />
                </div>

                {/* Columna Derecha: Detalles */}
                <div className="flex flex-col justify-center">

                    {/* Categoría (usando tu paleta) */}
                    <span className="text-sm font-semibold text-[#a4544c] uppercase mb-2">
                        {product.category}
                    </span>

                    {/* Nombre (más grande, color de tu paleta) */}
                    <h1 className="text-4xl lg:text-5xl font-bold text-[#644c44] mb-4">
                        {product.name}
                    </h1>

                    {/* Precio (más grande, color de tu paleta) */}
                    <span className="text-5xl font-bold text-[#e3a45c] mb-6">
                        Bs. {product.price.toFixed(2)}
                    </span>

                    {/* Descripción (más legible) */}
                    <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                        {product.descripcion || "Este producto no tiene una descripción detallada."}
                    </p>

                    {/* --- ESTILO DE BOTÓN REFACTORIZADO --- */}
                    {/* Botón grande con tu paleta, sombra y micro-interacción */}
                    <button
                        onClick={handleAddToCart}
                        className="w-full bg-[#a4544c] text-white font-semibold py-3.5 px-6 rounded-lg shadow-lg shadow-[#a4544c]/30 hover:bg-[#644c44] transition-all duration-300 ease-out flex items-center justify-center space-x-2 text-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e3a45c]"
                    >
                        <ShoppingCart className="w-6 h-6" />
                        <span>Añadir al Carrito</span>
                    </button>

                    {/* --- ESTILO DE DETALLES ADICIONALES REFACTORIZADO --- */}
                    {/* Borde sutil, tipografía más clara */}
                    <div className="mt-8 border-t border-gray-200 pt-6">
                        <h3 className="text-xl font-semibold text-[#644c44] mb-3">Detalles Adicionales</h3>
                        <ul className="list-disc list-inside text-gray-600 space-y-2 text-base">
                            {product.dimensiones && <li><strong>Dimensiones:</strong> {product.dimensiones}</li>}
                            {product.material && <li><strong>Material:</strong> {product.material}</li>}
                            {product.color && <li><strong>Color:</strong> {product.color}</li>}
                        </ul>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            {/* --- ESTILO DE PÁGINA REFACTORIZADO --- */}
            {/* Más padding vertical para más "aire" */}
            <div className="bg-gray-50 py-16 md:py-24">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* --- ESTILO "VOLVER" REFACTORIZADO --- */}
                    {/* Con micro-interacción en el icono */}
                    <div className="mb-8">
                        <Link
                            to="/"
                            className="group flex items-center text-[#644c44] hover:text-[#a4544c] transition-colors duration-200 font-medium"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2 transition-transform duration-300 ease-out group-hover:-translate-x-1" />
                            Volver al Catálogo
                        </Link>
                    </div>

                    {/* Contenido principal */}
                    {renderContent()}

                </div>
            </div>

            <Footer />
        </>
    );
}

export default ProductDetailPage;