import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import authApi from '../api/authApi.js';
import { Search, UserPlus, Trash2, Plus, Minus, Loader2, DollarSign } from 'lucide-react'; // Añadido DollarSign

// El objeto 'styles' ya no es necesario, lo eliminamos.

function RegistroVentaPage() {
    // --- Lógica de React (Sin Cambios) ---
    const navigate = useNavigate();
    const [selectedClient, setSelectedClient] = useState(null);
    const [saleItems, setSaleItems] = useState([]);
    const [descuento, setDescuento] = useState(0);
    const [clientSearchTerm, setClientSearchTerm] = useState('');
    const [clientResults, setClientResults] = useState([]);
    const [productSearchTerm, setProductSearchTerm] = useState('');
    const [productResults, setProductResults] = useState([]);
    const [isSearchingClient, setIsSearchingClient] = useState(false);
    const [isSearchingProduct, setIsSearchingProduct] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Búsqueda de Clientes (Sin Cambios)
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (clientSearchTerm.length >= 2) {
                setIsSearchingClient(true);
                try {
                    const response = await authApi.get(`/panel/clientes/buscar?term=${clientSearchTerm}`);
                    setClientResults(response.data);
                } catch (error) {
                    console.error("Error buscando clientes:", error);
                    setClientResults([]);
                } finally {
                    setIsSearchingClient(false);
                }
            } else {
                setClientResults([]);
            }
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [clientSearchTerm]);

    // Búsqueda de Productos (Sin Cambios)
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (productSearchTerm.length >= 2) {
                setIsSearchingProduct(true);
                try {
                    const response = await authApi.get(`/panel/productos/buscar?term=${productSearchTerm}`);
                    setProductResults(response.data);
                } catch (error) {
                    console.error("Error buscando productos:", error);
                    setProductResults([]);
                } finally {
                    setIsSearchingProduct(false);
                }
            } else {
                setProductResults([]);
            }
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [productSearchTerm]);

    // Lógica de Items (Sin Cambios)
    const addItemToSale = (product) => {
        if (!selectedClient) {
            toast.error("Seleccione un cliente primero.");
            return;
        }
        setSaleItems(prevItems => {
            const existingItem = prevItems.find(item => item.id_producto === product.id_producto);
            if (existingItem) {
                return prevItems.map(item =>
                    item.id_producto === product.id_producto
                        ? { ...item, cantidad_vendida: item.cantidad_vendida + 1 }
                        : item
                );
            } else {
                return [...prevItems, { 
                    id_producto: product.id_producto, 
                    nombre_producto: product.nombre_producto,
                    cantidad_vendida: 1, 
                    precio_venta_unitario: product.precio_unitario,
                    stock_disponible: product.stock_actual
                }];
            }
        });
        setProductSearchTerm('');
        setProductResults([]);
    };
    const updateItemQuantity = (productId, delta) => {
        setSaleItems(prevItems => prevItems.map(item => {
            if (item.id_producto === productId) {
                const newQuantity = item.cantidad_vendida + delta;
                return newQuantity > 0 ? { ...item, cantidad_vendida: newQuantity } : null;
            }
            return item;
        }).filter(item => item !== null));
    };
    const removeItemFromSale = (productId) => {
        setSaleItems(prevItems => prevItems.filter(item => item.id_producto !== productId));
    };

    // Calcular Total (Sin Cambios)
    const calculateTotal = () => {
        const subtotal = saleItems.reduce((sum, item) => sum + (item.cantidad_vendida * item.precio_venta_unitario), 0);
        return subtotal - (parseFloat(descuento) || 0);
    };

    // Registrar Venta (Sin Cambios)
    const handleRegisterSale = async () => {
        if (!selectedClient || saleItems.length === 0) {
            toast.error("Debe seleccionar un cliente y añadir al menos un producto.");
            return;
        }
        for (const item of saleItems) {
            if (item.cantidad_vendida > item.stock_disponible) {
                toast.error(`Stock insuficiente para '${item.nombre_producto}'. Disponible: ${item.stock_disponible}`);
                return;
            }
        }
        setIsSubmitting(true);
        const ventaData = {
            idCliente: selectedClient.id_cliente,
            items: saleItems.map(({ stock_disponible, nombre_producto, ...rest }) => rest),
            descuento: parseFloat(descuento) || 0
        };
        try {
            await authApi.post('/panel/ventas', ventaData);
            toast.success("¡Venta registrada con éxito!");
            setSelectedClient(null);
            setSaleItems([]);
            setDescuento(0);
            setClientSearchTerm('');
        } catch (error) {
            console.error("Error al registrar la venta:", error);
            toast.error(error.response?.data?.message || "No se pudo registrar la venta.");
        } finally {
            setIsSubmitting(false);
        }
    };
    // --- Fin de la Lógica ---


    return (
        // --- LAYOUT PRINCIPAL REFACTORIZADO ---
        // Separamos las tarjetas con 'space-y-8'
        <div className="space-y-8">
            <h1 className="text-4xl font-bold text-[#a4544c] mb-8">Registrar Nueva Venta</h1>

            {/* --- TARJETA 1: CLIENTE --- */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl">
                <label className="block text-xl font-semibold text-[#644c44] mb-4">
                    1. Buscar Cliente (Nombre/Apellido/WhatsApp)
                </label>
                
                {/* Vista de Cliente Seleccionado */}
                {selectedClient ? (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                        <span className="font-semibold text-green-800">
                            Cliente: {selectedClient.nombre_pila_cliente} {selectedClient.apellido_paterno_cliente} ({selectedClient.telefono_whatsapp})
                        </span>
                        <button 
                            onClick={() => setSelectedClient(null)}
                            className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
                        >
                            Cambiar
                        </button>
                    </div>
                ) : (
                    // Vista de Búsqueda
                    <>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input 
                                type="text"
                                className="w-full px-4 py-3 pl-11 border border-gray-200 rounded-lg bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#e3a45c] focus:ring-2 focus:ring-[#e3a45c]/50 transition-colors duration-200"
                                placeholder="Escriba 2+ letras para buscar..."
                                value={clientSearchTerm}
                                onChange={(e) => setClientSearchTerm(e.target.value)}
                                disabled={!!selectedClient}
                            />
                            {isSearchingClient && (
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                                    <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                                </div>
                            )}
                        </div>
                    
                        {clientResults.length > 0 && (
                            <ul className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto divide-y divide-gray-100">
                                {clientResults.map(client => (
                                    <li 
                                        key={client.id_cliente} 
                                        className="p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                                        onClick={() => {
                                            setSelectedClient(client);
                                            setClientSearchTerm('');
                                            setClientResults([]);
                                        }}
                                    >
                                        {client.nombre_pila_cliente} {client.apellido_paterno_cliente} ({client.telefono_whatsapp})
                                    </li>
                                ))}
                            </ul>
                        )}
                    </>
                )}
                {/* TODO: Botón "Nuevo Cliente" (funcionalidad futura) */}
            </div>

            {/* --- TARJETA 2: PRODUCTOS --- */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl">
                <label className="block text-xl font-semibold text-[#644c44] mb-4">
                    2. Buscar Productos
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input 
                        type="text"
                        className="w-full px-4 py-3 pl-11 border border-gray-200 rounded-lg bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#e3a45c] focus:ring-2 focus:ring-[#e3a45c]/50 transition-colors duration-200"
                        placeholder="Escriba 2+ letras para buscar..."
                        value={productSearchTerm}
                        onChange={(e) => setProductSearchTerm(e.target.value)}
                        disabled={!selectedClient} // Deshabilitar si no hay cliente
                    />
                    {isSearchingProduct && (
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                            <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                        </div>
                    )}
                </div>

                {productResults.length > 0 && (
                    <ul className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto divide-y divide-gray-100">
                        {productResults.map(product => (
                            <li 
                                key={product.id_producto} 
                                className="p-3 hover:bg-gray-50 transition-colors cursor-pointer flex justify-between"
                                onClick={() => addItemToSale(product)}
                            >
                                <span>{product.nombre_producto}</span>
                                <span className="font-medium text-gray-800">
                                    Bs. {product.precio_unitario.toFixed(2)} 
                                    <span className="ml-4 text-sm text-gray-500">(Stock: {product.stock_actual})</span>
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* --- TARJETA 3: ITEMS EN VENTA --- */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl">
                <h2 className="text-xl font-semibold text-[#644c44] mb-4">3. Productos en Venta</h2>
                {saleItems.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">Añada productos buscándolos arriba.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="border-b border-gray-200 text-gray-500 uppercase tracking-wider">
                                <tr>
                                    <th className="py-3 px-2 font-medium">Producto</th>
                                    <th className="py-3 px-2 font-medium">Cantidad</th>
                                    <th className="py-3 px-2 font-medium">Precio Unit.</th>
                                    <th className="py-3 px-2 font-medium text-right">Subtotal</th>
                                    <th className="py-3 px-2 font-medium text-center">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {saleItems.map(item => (
                                    <tr key={item.id_producto} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-2 text-gray-700 font-medium">{item.nombre_producto}</td>
                                        <td className="py-3 px-2 text-gray-700">
                                            <div className="flex items-center space-x-2">
                                                <button className="p-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors" onClick={() => updateItemQuantity(item.id_producto, -1)}><Minus size={14} /></button>
                                                <span className="font-semibold w-6 text-center">{item.cantidad_vendida}</span>
                                                <button className="p-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors" onClick={() => updateItemQuantity(item.id_producto, 1)}><Plus size={14} /></button>
                                            </div>
                                        </td>
                                        <td className="py-3 px-2 text-gray-700">Bs. {item.precio_venta_unitario.toFixed(2)}</td>
                                        <td className="py-3 px-2 text-gray-800 font-semibold text-right">Bs. {(item.cantidad_vendida * item.precio_venta_unitario).toFixed(2)}</td>
                                        <td className="py-3 px-2 text-center">
                                            <button className="text-gray-400 hover:text-red-600 hover:scale-110 transition-all p-2" onClick={() => removeItemFromSale(item.id_producto)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* --- SECCIÓN TOTAL Y REGISTRO --- */}
            {saleItems.length > 0 && (
                <div className="flex justify-end mt-8">
                    <div className="w-full max-w-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700">Descuento (Bs.):</label>
                            <input 
                                type="number"
                                className="w-32 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:bg-white focus:border-[#e3a45c] focus:ring-2 focus:ring-[#e3a45c]/50 text-right"
                                value={descuento}
                                onChange={(e) => setDescuento(e.target.value)}
                                min="0"
                                step="0.01"
                            />
                        </div>
                        <div className="flex items-center justify-between border-t pt-4">
                            <span className="text-2xl font-bold text-[#644c44]">Total a Pagar:</span>
                            <span className="text-2xl font-bold text-[#644c44]">Bs. {calculateTotal().toFixed(2)}</span>
                        </div>
                        <button 
                            onClick={handleRegisterSale}
                            disabled={isSubmitting}
                            // Usamos el color terracota como primario
                            className={`w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent rounded-lg text-base font-medium text-white transition-all duration-300 transform 
                            ${isSubmitting 
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                : 'bg-[#a4544c] hover:bg-[#644c44] hover:-translate-y-0.5 shadow-lg shadow-[#a4544c]/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e3a45c]'
                            }`}
                        >
                            {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <DollarSign size={20} />}
                            <span>{isSubmitting ? 'Registrando...' : 'Registrar Venta'}</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default RegistroVentaPage;