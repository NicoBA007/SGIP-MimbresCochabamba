import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer.jsx';
import { ArrowRight, Filter, Loader2, ShoppingCart } from 'lucide-react';
import { useCartStore } from '../store/cart.store.js';
import { toast } from 'react-hot-toast';

// NO importar Header aquí

const API_PRODUCTS_URL = 'http://localhost:3001/api/productos';
const API_CATEGORIES_URL = 'http://localhost:3001/api/categorias';

/**
 * Componente ProductCard (Rediseñado con Tailwind)
 */
const ProductCard = ({ product, onAddToCart }) => {
    const handleButtonClick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        onAddToCart(product);
    };
    return (
        <Link
            to={`/producto/${product.id}`}
            // --- ESTILOS DE TARJETA REFACTORIZADOS ---
            // 'group' activa 'group-hover' en los hijos
            // Sombra sutil por defecto, más grande en hover
            // Transición suave en la sombra y la posición (translate)
            // 'focus-within' aplica estilos cuando un hijo (como el botón) tiene foco
            className="group flex flex-col bg-white rounded-xl border border-gray-100 shadow-md hover:shadow-xl focus-within:shadow-xl hover:-translate-y-1.5 focus-within:-translate-y-1.5 transition-all duration-300 ease-out overflow-hidden"
        >
            <div className="relative overflow-hidden">
                {/* --- ESTILOS DE IMAGEN REFACTORIZADOS --- */}
                {/* Altura consistente, 'object-contain' para ver el producto, padding para 'aire' */}
                <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-52 object-contain p-4 bg-gray-50 transition-transform duration-300 ease-out group-hover:scale-105" 
                />
                {/* --- ESTILOS DE OVERLAY REFACTORIZADOS --- */}
                {/* Usamos el color marrón oscuro de tu paleta con opacidad */}
                {/* 'backdrop-blur-sm' para un efecto "frosty" moderno */}
                <span className="absolute inset-0 bg-[#644c44] bg-opacity-80 backdrop-blur-sm flex items-center justify-center space-x-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out">
                    <span>Ver Detalles</span><ArrowRight className="w-4 h-4 ml-1" />
                </span>
            </div>
            
            {/* --- ESTILOS DE CUERPO DE TARJETA REFACTORIZADOS --- */}
            {/* Más padding (p-5) para más espacio en blanco */}
            <div className="p-5 flex flex-col flex-grow">
                {/* Color de texto oscuro de tu paleta. 'truncate' es bueno, lo mantenemos. */}
                <h3 className="text-lg font-semibold text-[#644c44] truncate mb-3">{product.name}</h3>
                
                {/* Color naranja de tu paleta. Más grande y llamativo. */}
                {/* 'mt-auto' empuja este bloque hacia abajo, antes del botón. */}
                <div className="mt-auto mb-4">
                    <span className="text-3xl font-bold text-[#e3a45c]">Bs. {parseFloat(product.price).toFixed(2)}</span>
                </div>
                
                <div className="mt-auto">
                    {/* --- ESTILOS DE BOTÓN REFACTORIZADOS --- */}
                    {/* Color primario (terracota) por defecto */}
                    {/* Color oscuro (marrón) en hover */}
                    {/* Estados de foco claros para accesibilidad usando el color primario */}
                    <button 
                        onClick={handleButtonClick} 
                        className="add-to-cart-btn w-full bg-[#a4544c] text-white py-2.5 px-4 rounded-lg font-semibold transition duration-200 ease-out flex items-center justify-center space-x-2 hover:bg-[#644c44] focus:outline-none focus:ring-2 focus:ring-[#a4544c] focus:ring-offset-2"
                    >
                        <ShoppingCart className="w-4 h-4" /><span>Añadir al carrito</span>
                    </button>
                </div>
            </div>
        </Link>
    );
};


/**
 * Componente Principal: CatalogoPage (Recibe searchTerm como prop)
 */
function CatalogoPage({ searchTerm }) {
    // ... (Lógica de React sin cambios) ...
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [categoryId, setCategoryId] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const addProductToCart = useCartStore(state => state.addProduct);

    useEffect(() => {
        const loadCatalogData = async () => {
            try {
                const [productsRes, categoriesRes] = await Promise.all([
                    axios.get(API_PRODUCTS_URL),
                    axios.get(API_CATEGORIES_URL)
                ]);
                setProducts(productsRes.data);
                setFilteredProducts(productsRes.data); 
                setCategories(categoriesRes.data);
            } catch (err) { console.error("Error al cargar el catálogo:", err); setError("No se pudieron cargar los productos."); }
            finally { setLoading(false); }
        };
        loadCatalogData();
    }, []);

    useEffect(() => {
        if (products.length === 0) {
            return; 
        }
        let results = [...products];
        if (categoryId > 0) {
            results = results.filter(p => p.categoryId === parseInt(categoryId));
        }
        if (searchTerm && searchTerm.trim().length > 0) {
            const lowerSearchTerm = searchTerm.toLowerCase();
            results = results.filter(p => p.name && p.name.toLowerCase().includes(lowerSearchTerm));
        }
        setFilteredProducts(results);
    }, [searchTerm, categoryId, products]);

    const handleFilterChange = (id) => { setCategoryId(id); };

    const handleAddToCart = (product) => {
        const itemsInCart = useCartStore.getState().cartItems;
        const productInCart = itemsInCart.find(item => item.id === product.id);
        const currentQty = productInCart ? productInCart.quantity : 0;
        addProductToCart(product);
        const newQty = useCartStore.getState().cartItems.find(item => item.id === product.id)?.quantity || 0;
        if (newQty > currentQty) { toast.success(`'${product.name}' añadido al carrito`); }
    };

    const renderContent = () => {
        // --- ESTILOS DE ESTADOS REFACTORIZADOS ---
        if (loading) { 
            return (
                <div className="text-center py-24 flex flex-col items-center justify-center text-[#644c44]">
                    {/* Icono de carga con tu color primario */}
                    <Loader2 className="w-10 h-10 animate-spin mb-4 text-[#a4544c]" />
                    Cargando productos...
                </div>
            ); 
        }
        if (error) { 
            return (
                // Texto de error con tu color primario
                <div className="text-center py-24 text-[#a4544c] font-medium">
                    Error: {error}
                </div>
            ); 
        }

        if (!loading && filteredProducts.length === 0) {
            if (products.length > 0) {
                return (<div className="text-center py-24 text-gray-500">No se encontraron productos con esos filtros.</div>);
            } else {
                return (<div className="text-center py-24 text-gray-500">No hay productos disponibles por el momento.</div>);
            }
        }
        
        return (
            // --- ESTILOS DE GRID REFACTORIZADOS ---
            // 'gap-4' en móvil para que no esté tan apretado, 'md:gap-6' en pantallas más grandes
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts.map(product => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={handleAddToCart}
                    />
                ))}
            </div>
        );
    };

    return (
        <>
            {/* --- ESTILOS DE BARRA DE FILTRO REFACTORIZADOS --- */}
            {/* Redondeada, con sombra sutil, y más margen inferior (mb-8) */}
            <div className="bg-white p-4 rounded-xl shadow-md mb-8">
                <div className="max-w-7xl mx-auto flex items-center space-x-4">
                    {/* Icono con tu color primario */}
                    <Filter className="w-5 h-5 text-[#a4544c]" />
                    {/* Texto con tu color oscuro */}
                    <label className="text-sm font-medium text-[#644c44]">Filtro por Categoría:</label>
                    {/* --- ESTILOS DE SELECT REFACTORIZADOS --- */}
                    {/* Bordes más suaves, fondo sutil, estado de foco con tu color naranja */}
                    <select 
                        onChange={(e) => handleFilterChange(e.target.value)} 
                        className="border border-gray-200 bg-gray-50 rounded-lg p-2.5 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#e3a45c] focus:border-[#e3a45c]" 
                        disabled={loading}
                    >
                        {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                    </select>
                </div>
            </div>

            {/* --- ESTILOS DE CONTENEDOR PRINCIPAL REFACTORIZADOS --- */}
            {/* Fondo 'bg-gray-50' es perfecto para minimalismo. Más padding inferior (pb-16) */}
            <div className="bg-gray-50 min-h-screen pt-4 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Título más grande y con más margen inferior */}
                    <h1 className="text-4xl font-bold text-[#644c44] mb-8">Catálogo de Productos</h1>
                    <main>
                        {!loading && !error && (
                            // Separador más sutil y con más espacio
                            <div className="mb-8 border-b border-gray-200 pb-4">
                                <p className="text-gray-500">
                                    { searchTerm || categoryId > 0
                                        ? `Mostrando ${filteredProducts.length} artículos encontrados.`
                                        : `Mostrando ${filteredProducts.length} artículos disponibles.`
                                    }
                                </p>
                            </div>
                        )}
                        
                        {renderContent()}
                    </main>
                </div>
            </div>

            <Footer />
        </>
    );
}

export default CatalogoPage;