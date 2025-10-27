import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { useCartStore } from '../store/cart.store.js';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingCart, Frown, Loader2 } from 'lucide-react';

const API_PEDIDOS_URL = 'http://localhost:3001/api/pedidos';

const SELLER_WHATSAPP_NUMBER = '59163418018';

const CartItemRow = ({ item, addProduct, decrementProduct, removeProduct }) => (
    <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between py-6 border-b border-gray-200 gap-4">
        
        {/* Producto (Imagen y Texto) */}
        <div className="flex items-center space-x-4">
            <img 
                src={item.imageUrl} 
                alt={item.name} 
                className="w-24 h-24 object-contain rounded-lg bg-gray-50 p-2" 
            />
            <div>
                {/* --- ESTILOS DE TEXTO --- */}
                <h3 className="text-lg font-semibold text-[#644c44]">{item.name}</h3>
                <p className="text-sm text-gray-500">Precio: Bs. {item.price.toFixed(2)}</p>
            </div>
        </div>

        {/* Controles (Agrupados a la derecha en móvil) */}
        <div className="flex flex-row-reverse sm:flex-row items-center justify-between sm:justify-end w-full sm:w-auto gap-4 sm:space-x-6">
            
            {/* Controles de Cantidad */}
            <div className="flex items-center space-x-2 sm:space-x-3">
                {/* --- ESTILOS DE BOTONES +/- --- */}
                <button 
                    onClick={() => decrementProduct(item.id)}
                    className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-200"
                >
                    <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center text-lg font-semibold text-gray-800">{item.quantity}</span>
                <button 
                    onClick={() => addProduct(item)} 
                    className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-200"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            {/* Subtotal y Eliminar */}
            <div className="flex items-center space-x-2 sm:space-x-6">
                <span className="text-lg font-semibold text-[#644c44] w-28 text-right">
                    Bs. {(item.price * item.quantity).toFixed(2)}
                </span>
                {/* --- ESTILOS BOTÓN ELIMINAR --- */}
                <button 
                    onClick={() => removeProduct(item.id)}
                    className="text-gray-400 hover:text-red-600 hover:scale-110 transition-all duration-200 p-2"
                    title="Eliminar producto"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>
        </div>
    </div>
);

// (Función generateWhatsAppMessage
const generateWhatsAppMessage = (pedidoId, items, total, telefonoCliente) => {
    let message = `¡Hola! Acabo de registrar el Pedido Web *#${pedidoId}*.\n\n`;
    message += `*Mi Resumen de Pedido:*\n`;
    items.forEach(item => {
        message += `• ${item.quantity}x ${item.name}\n`;
    });
    message += `\n*Total Estimado: Bs. ${total.toFixed(2)}*\n\n`;
    message += `Mi número de contacto es: ${telefonoCliente}\n\n`;
    message += `Quedo atento a la confirmación para el pago y la entrega. ¡Gracias!`;
    return encodeURIComponent(message);
};


/**
 * Componente Principal: CartPage
 */
function CartPage() {
    
    const { 
        cartItems, 
        addProduct, 
        decrementProduct, 
        removeProduct, 
        getTotalPrice, 
        clearCart 
    } = useCartStore(state => state);

    const totalPrice = getTotalPrice();
    const [telefono, setTelefono] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleCheckout = async (e) => {
        e.preventDefault();
        if (!telefono.trim()) {
            toast.error("Por favor, ingrese un número de WhatsApp.");
            return;
        }
        setIsSubmitting(true);
        const pedidoData = {
            telefono_whatsapp: telefono,
            items: cartItems
        };
        try {
            const response = await axios.post(API_PEDIDOS_URL, pedidoData);
            const nuevoPedido = response.data.pedido;
            toast.success("¡Pedido registrado! Te redirigimos a WhatsApp...");
            const whatsappMessage = generateWhatsAppMessage(
                nuevoPedido.idPedidoWeb,
                cartItems,
                totalPrice,
                telefono
            );
            const whatsappUrl = `https://wa.me/${SELLER_WHATSAPP_NUMBER}?text=${whatsappMessage}`;
            clearCart(); 
            setTimeout(() => {
                window.location.href = whatsappUrl;
            }, 1500);
        } catch (err) {
            console.error("Error al enviar el pedido:", err);
            const message = err.response?.data?.message || "No se pudo procesar el pedido.";
            toast.error(message);
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* --- ESTILOS DE CONTENEDOR PRINCIPAL --- */}
            <div className="bg-gray-50 min-h-screen py-16 md:py-24">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* --- ESTILOS BOTÓN "VOLVER" --- */}
                    <div className="mb-8">
                        <Link 
                            to="/" 
                            className="group flex items-center text-[#644c44] hover:text-[#a4544c] transition-colors duration-200 font-medium"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2 transition-transform duration-300 ease-out group-hover:-translate-x-1" />
                            Seguir comprando
                        </Link>
                    </div>

                    {/* --- ESTILOS DE TÍTULO --- */}
                    <h1 className="text-4xl md:text-5xl font-bold text-[#644c44] mb-10 tracking-tight">
                        Tu Carrito de Compras
                    </h1>

                    {cartItems.length === 0 ? (
                        // --- ESTILOS CARRITO VACÍO ---
                        <div className="text-center bg-white p-12 md:p-20 rounded-2xl shadow-xl border border-gray-100">
                            <Frown className="w-20 h-20 text-[#e3a45c] mx-auto mb-6" />
                            <h2 className="text-3xl font-semibold text-[#644c44]">Tu carrito está vacío</h2>
                            <p className="text-gray-500 mt-3 text-lg">
                                Parece que aún no has añadido productos.
                            </p>
                        </div>
                    ) : (
                        // --- ESTILOS CARRITO LLENO (GRID) ---
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                            
                            {/* --- ESTILOS DE TARJETA --- */}
                            <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-2xl shadow-xl">
                                <h2 className="text-2xl font-semibold text-[#644c44] mb-4">Productos en tu carrito</h2>
                                <div className="divide-y divide-gray-200">
                                    {cartItems.map(item => (
                                        <CartItemRow 
                                            key={item.id}
                                            item={item}
                                            addProduct={addProduct}
                                            decrementProduct={decrementProduct}
                                            removeProduct={removeProduct}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* --- ESTILOS DE TARJETA STICKY --- */}
                            <div className="lg:col-span-1 bg-white p-6 md:p-8 rounded-2xl shadow-xl h-fit sticky top-24">
                                <h2 className="text-2xl font-semibold text-[#644c44] mb-5 border-b border-gray-200 pb-4">Resumen del Pedido</h2>
                                
                                <div className="space-y-3 mb-5">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal:</span>
                                        <span className="font-semibold text-gray-800">Bs. {totalPrice.toFixed(2)}</span>
                                    </div>
                                    {/* --- ESTILOS DE TOTAL --- */}
                                    <div className="flex justify-between text-2xl font-bold text-[#644c44] pt-3">
                                        <span>Total Estimado:</span>
                                        <span>Bs. {totalPrice.toFixed(2)}</span>
                                    </div>
                                </div>
                                
                                <p className="text-sm text-gray-500 mb-6 pb-6 border-b border-gray-200">
                                    Este es un pedido web. Al confirmar, un vendedor se pondrá en contacto contigo por WhatsApp para coordinar el pago y la entrega.
                                </p>

                                <form onSubmit={handleCheckout} className="space-y-5">
                                    <div>
                                        <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-600 mb-2">
                                            Tu número de WhatsApp:
                                        </label>
                                        {/* --- ESTILOS DE INPUT --- */}
                                        <input 
                                            type="tel" 
                                            id="whatsapp"
                                            value={telefono}
                                            onChange={(e) => setTelefono(e.target.value)}
                                            className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e3a45c] focus:border-[#e3a45c] focus:bg-white transition-colors duration-200"
                                            placeholder="Ej: 76543210"
                                            required 
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    {/* --- ESTILOS BOTÓN PRINCIPAL --- */}
                                    <button 
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-[#a4544c] text-white font-semibold py-3.5 px-6 rounded-lg shadow-lg shadow-[#a4544c]/30 hover:bg-[#644c44] transition-all duration-300 ease-out flex items-center justify-center space-x-3 text-lg disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-0.5"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                        ) : (
                                            <ShoppingCart className="w-6 h-6" />
                                        )}
                                        <span>{isSubmitting ? "Enviando..." : "Confirmar Pedido Web"}</span>
                                    </button>
                                </form>

                                {/* --- ESTILOS BOTÓN "VACIAR" --- */}
                                <button 
                                    onClick={clearCart}
                                    disabled={isSubmitting}
                                    className="w-full text-center text-gray-500 hover:text-red-600 text-sm mt-6 transition-colors duration-200 disabled:opacity-50"
                                >
                                    Vaciar carrito
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </>
    );
}

export default CartPage;