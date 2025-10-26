import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import authApi from '../api/authApi.js';
import { Edit, UserPlus, Trash2, Loader2, Search, Plus, Minus, Factory, AlertTriangle, PackagePlus } from 'lucide-react'; // Added Factory, AlertTriangle, PackagePlus

function ComprasPage() {
    // Estados para Proveedores
    const [proveedores, setProveedores] = useState([]);
    const [loadingProveedores, setLoadingProveedores] = useState(true);
    const [errorProveedores, setErrorProveedores] = useState(null);
    const navigate = useNavigate();

    // Estados para Registrar Compra
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [supplierSearchTerm, setSupplierSearchTerm] = useState('');
    const [supplierResults, setSupplierResults] = useState([]);
    const [isSearchingSupplier, setIsSearchingSupplier] = useState(false);
    const [productSearchTerm, setProductSearchTerm] = useState('');
    const [productResults, setProductResults] = useState([]);
    const [isSearchingProduct, setIsSearchingProduct] = useState(false);
    const [purchaseItems, setPurchaseItems] = useState([]);
    const [isSubmittingPurchase, setIsSubmittingPurchase] = useState(false);

    // Lógica Fetch Proveedores
    const fetchProveedores = async () => {
        try {
            setLoadingProveedores(true);
            const response = await authApi.get('/panel/proveedores');
            setProveedores(response.data);
            setSupplierResults(response.data); 
        } catch (err) { 
            console.error("Error cargando proveedores:", err);
            setErrorProveedores(err.response?.data?.message || "No se pudieron cargar los proveedores.");
            if (err.response?.status === 401) toast.error("Sesión expirada.");
        } 
        finally { setLoadingProveedores(false); }
    };
    useEffect(() => { fetchProveedores(); }, []);

    // Handlers Proveedor CRUD
    const handleCrearProveedor = () => navigate('/panel/proveedores/crear');
    const handleEditarProveedor = (id) => navigate(`/panel/proveedores/editar/${id}`);
    const handleEliminarProveedor = async (id, nombre) => {
        if (!window.confirm(`¿Seguro que quieres eliminar al proveedor "${nombre || `ID: ${id}`}"?`)) return;
        try {
            await authApi.delete(`/panel/proveedores/${id}`);
            toast.success(`Proveedor #${id} eliminado.`);
            setProveedores(prev => prev.filter(p => p.id_proveedor !== id));
            // Also update supplierResults if the deleted supplier was in the search results
            setSupplierResults(prev => prev.filter(p => p.id_proveedor !== id));
        } catch (err) {
            console.error("Error al eliminar proveedor:", err);
            toast.error(err.response?.data?.message || "No se pudo eliminar el proveedor.");
        }
     };

    // Búsqueda Proveedor (Filtro simple)
    useEffect(() => {
        setIsSearchingSupplier(true); // Indicate searching briefly
        const lowerSearchTerm = supplierSearchTerm.toLowerCase();
        if (lowerSearchTerm.length > 0) {
            setSupplierResults(
                proveedores.filter(p => 
                    p.nombre_proveedor.toLowerCase().includes(lowerSearchTerm) ||
                    (p.telefono_contacto && p.telefono_contacto.includes(lowerSearchTerm)) // Also search by phone
                )
            );
        } else {
            setSupplierResults(proveedores);
        }
        // Use a small timeout to avoid flickering "Buscando..."
        const timer = setTimeout(() => setIsSearchingSupplier(false), 100); 
        return () => clearTimeout(timer);
    }, [supplierSearchTerm, proveedores]);

    // Búsqueda Producto (API)
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
                 } 
                finally { setIsSearchingProduct(false); }
            } else {
                setProductResults([]);
            }
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [productSearchTerm]);

    // Lógica Items de Compra
    const addItemToPurchase = (product) => {
        if (!selectedSupplier) {
            toast.error("Seleccione un proveedor primero.");
            return;
        }
        setPurchaseItems(prevItems => {
            const existingItem = prevItems.find(item => item.id_producto === product.id_producto);
            if (existingItem) {
                toast.error(`'${product.nombre_producto}' ya está en la lista. Modifique la cantidad o costo directamente.`);
                return prevItems;
            } else {
                return [...prevItems, { 
                    id_producto: product.id_producto, 
                    nombre_producto: product.nombre_producto,
                    cantidad_comprada: 1, 
                    costo_unitario: 0.00 
                }];
            }
        });
        setProductSearchTerm(''); 
        setProductResults([]);
    };

    const updatePurchaseItem = (productId, field, value) => {
        setPurchaseItems(prevItems => prevItems.map(item => {
            if (item.id_producto === productId) {
                let numericValue = field === 'cantidad_comprada' ? parseInt(value) : parseFloat(value);
                if (isNaN(numericValue) || numericValue < 0) {
                    numericValue = 0; 
                }
                // Si la cantidad llega a 0, eliminar el item en lugar de actualizar
                if (field === 'cantidad_comprada' && numericValue <= 0) {
                    return null; // Marcar para eliminar
                }
                return { ...item, [field]: numericValue };
            }
            return item;
        }).filter(item => item !== null)); // Filtrar los marcados para eliminar
    };

    const removeItemFromPurchase = (productId) => {
        setPurchaseItems(prevItems => prevItems.filter(item => item.id_producto !== productId));
    };

    // Calcular Total Compra
    const calculatePurchaseTotal = () => {
        return purchaseItems.reduce((sum, item) => sum + (item.cantidad_comprada * item.costo_unitario), 0);
    };

    // Registrar Compra
    const handleRegisterPurchase = async () => {
        if (!selectedSupplier || purchaseItems.length === 0) {
            toast.error("Debe seleccionar un proveedor y añadir al menos un producto.");
            return;
        }
        for (const item of purchaseItems) {
            if (item.cantidad_comprada <= 0 || item.costo_unitario < 0) {
                toast.error(`Verifique la cantidad (>0) y costo (>=0) para '${item.nombre_producto}'.`);
                return;
            }
        }
        setIsSubmittingPurchase(true);
        const compraData = {
            idProveedor: selectedSupplier.id_proveedor,
            items: purchaseItems 
        };
        try {
            await authApi.post('/panel/compras', compraData);
            toast.success("¡Compra registrada con éxito! Stock actualizado.");
            setSelectedSupplier(null);
            setPurchaseItems([]);
            setSupplierSearchTerm('');
            // Optional: Re-fetch suppliers if needed, though not strictly necessary here
            // fetchProveedores(); 
        } catch (error) {
            console.error("Error al registrar la compra:", error);
            toast.error(error.response?.data?.message || "No se pudo registrar la compra.");
        } finally {
            setIsSubmittingPurchase(false);
        }
    };

    // Estados de Carga/Error para Proveedores
    if (loadingProveedores) return (
        <div className="flex items-center justify-center p-24 text-lg text-gray-600">
            <Loader2 className="w-8 h-8 mr-3 animate-spin text-[#a4544c]" />
            Cargando proveedores...
        </div>
    );
    if (errorProveedores) return (
        <div className="flex flex-col items-center justify-center p-24 text-lg text-[#a4544c] font-medium">
            <AlertTriangle className="w-10 h-10 mb-4" />
            Error: {errorProveedores}
        </div>
    );


    return (
        <div className="space-y-12"> {/* Increased space between sections */}
            
            {/* --- SECCIÓN GESTIÓN DE PROVEEDORES --- */}
            <div>
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-[#a4544c]">Gestión de Proveedores</h1>
                    <button 
                        className="flex items-center justify-center space-x-2 py-2.5 px-5 rounded-lg font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-all duration-300 ease-out shadow-lg shadow-purple-600/30 hover:-translate-y-0.5" // Purple color
                        onClick={handleCrearProveedor}
                    >
                        <Factory size={20} /> {/* Changed Icon */}
                        <span>Registrar Nuevo Proveedor</span>
                    </button>
                </div>
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="py-3 px-3 text-left text-gray-500 font-medium uppercase tracking-wider">ID</th>
                                    <th className="py-3 px-3 text-left text-gray-500 font-medium uppercase tracking-wider">Nombre</th>
                                    <th className="py-3 px-3 text-left text-gray-500 font-medium uppercase tracking-wider">Teléfono</th>
                                    <th className="py-3 px-3 text-left text-gray-500 font-medium uppercase tracking-wider">Dirección</th>
                                    <th className="py-3 px-3 text-left text-gray-500 font-medium uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {proveedores.map(prov => (
                                    <tr key={prov.id_proveedor} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-3 text-gray-700 font-medium align-middle">{prov.id_proveedor}</td>
                                        <td className="py-4 px-3 text-gray-800 font-semibold align-middle">{prov.nombre_proveedor}</td>
                                        <td className="py-4 px-3 text-gray-600 align-middle font-mono">{prov.telefono_contacto || '-'}</td>
                                        <td className="py-4 px-3 text-gray-600 align-middle">{prov.direccion || '-'}</td>
                                        <td className="py-4 px-3 align-middle">
                                            <div className="flex items-center space-x-1">
                                                <button className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors" title="Editar" onClick={() => handleEditarProveedor(prov.id_proveedor)}><Edit size={18} /></button>
                                                <button className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar" onClick={() => handleEliminarProveedor(prov.id_proveedor, prov.nombre_proveedor)}><Trash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                         {proveedores.length === 0 && <p className="text-center text-gray-500 py-8">No hay proveedores registrados.</p>}
                    </div>
                </div>
            </div>

            {/* --- SECCIÓN REGISTRAR COMPRA --- */}
            <div>
                 <h1 className="text-4xl font-bold text-[#a4544c] mb-8">Registrar Nueva Compra</h1>

                {/* Card for Supplier and Product Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                     {/* Supplier Search Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-xl">
                        <label className="block text-xl font-semibold text-[#644c44] mb-4">
                            1. Buscar Proveedor
                        </label>
                        {selectedSupplier ? (
                            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                                <span className="font-semibold text-blue-800">
                                    Proveedor: {selectedSupplier.nombre_proveedor}
                                </span>
                                <button onClick={() => setSelectedSupplier(null)} className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors">Cambiar</button>
                            </div>
                        ) : (
                             <>
                                <div className="relative">
                                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Search className="h-5 w-5 text-gray-400" /></div>
                                     <input 
                                         type="text"
                                         className="w-full px-4 py-3 pl-11 border border-gray-200 rounded-lg bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#e3a45c] focus:ring-2 focus:ring-[#e3a45c]/50"
                                         placeholder="Buscar por nombre o teléfono..."
                                         value={supplierSearchTerm}
                                         onChange={(e) => setSupplierSearchTerm(e.target.value)}
                                     />
                                     {isSearchingSupplier && <div className="absolute inset-y-0 right-0 pr-4 flex items-center"><Loader2 className="h-5 w-5 text-gray-400 animate-spin" /></div>}
                                </div>
                                {supplierResults.length > 0 && supplierSearchTerm && ( // Only show results when searching
                                     <ul className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto divide-y divide-gray-100">
                                         {supplierResults.map(prov => (
                                             <li key={prov.id_proveedor} className="p-3 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => { setSelectedSupplier(prov); setSupplierSearchTerm(''); }}>
                                                 {prov.nombre_proveedor} {prov.telefono_contacto ? `(${prov.telefono_contacto})` : ''}
                                             </li>
                                         ))}
                                     </ul>
                                )}
                             </>
                        )}
                    </div>
                     {/* Product Search Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-xl">
                        <label className="block text-xl font-semibold text-[#644c44] mb-4">
                           2. Buscar Productos
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Search className="h-5 w-5 text-gray-400" /></div>
                            <input 
                                type="text"
                                className="w-full px-4 py-3 pl-11 border border-gray-200 rounded-lg bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#e3a45c] focus:ring-2 focus:ring-[#e3a45c]/50"
                                placeholder="Escriba 2+ letras..."
                                value={productSearchTerm}
                                onChange={(e) => setProductSearchTerm(e.target.value)}
                                disabled={!selectedSupplier} // Disable if no supplier selected
                            />
                            {isSearchingProduct && <div className="absolute inset-y-0 right-0 pr-4 flex items-center"><Loader2 className="h-5 w-5 text-gray-400 animate-spin" /></div>}
                        </div>
                        {productResults.length > 0 && (
                            <ul className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto divide-y divide-gray-100">
                                {productResults.map(prod => (
                                    <li key={prod.id_producto} className="p-3 hover:bg-gray-50 transition-colors cursor-pointer flex justify-between items-center" onClick={() => addItemToPurchase(prod)}>
                                        <span>{prod.nombre_producto}</span>
                                        <span className="text-xs text-gray-500">(Stock: {prod.stock_actual})</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Purchase Items Card */}
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl">
                    <h2 className="text-xl font-semibold text-[#644c44] mb-4">3. Productos en Compra</h2>
                    {purchaseItems.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">Añada productos buscándolos arriba.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="py-3 px-2 text-left text-gray-500 font-medium uppercase tracking-wider">Producto</th>
                                        <th className="py-3 px-2 text-left text-gray-500 font-medium uppercase tracking-wider w-32">Cantidad</th>
                                        <th className="py-3 px-2 text-left text-gray-500 font-medium uppercase tracking-wider w-36">Costo Unit. (Bs.)</th>
                                        <th className="py-3 px-2 text-right text-gray-500 font-medium uppercase tracking-wider">Subtotal</th>
                                        <th className="py-3 px-2 text-center text-gray-500 font-medium uppercase tracking-wider">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {purchaseItems.map(item => (
                                        <tr key={item.id_producto} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-2 text-gray-800 font-semibold align-middle">{item.nombre_producto}</td>
                                            <td className="py-3 px-2 align-middle">
                                                 <input 
                                                     type="number" 
                                                     min="1" 
                                                     step="1" 
                                                     value={item.cantidad_comprada} 
                                                     onChange={(e) => updatePurchaseItem(item.id_producto, 'cantidad_comprada', e.target.value)}
                                                     className="w-20 px-2 py-1.5 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:bg-white focus:border-[#e3a45c] focus:ring-1 focus:ring-[#e3a45c]/50"
                                                 />
                                            </td>
                                            <td className="py-3 px-2 align-middle">
                                                <input 
                                                     type="number" 
                                                     min="0" 
                                                     step="0.01" 
                                                     value={item.costo_unitario.toFixed(2)} // Format to 2 decimals for input
                                                     onChange={(e) => updatePurchaseItem(item.id_producto, 'costo_unitario', e.target.value)}
                                                      className="w-24 px-2 py-1.5 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:bg-white focus:border-[#e3a45c] focus:ring-1 focus:ring-[#e3a45c]/50 text-right"
                                                 />
                                            </td>
                                            <td className="py-3 px-2 text-gray-800 font-semibold text-right align-middle font-mono">
                                                {(item.cantidad_comprada * item.costo_unitario).toFixed(2)}
                                            </td>
                                            <td className="py-3 px-2 text-center align-middle">
                                                <button className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors" onClick={() => removeItemFromPurchase(item.id_producto)} title="Quitar">
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

                {/* Total and Submit Section */}
                {purchaseItems.length > 0 && selectedSupplier && (
                    <div className="flex justify-end mt-8">
                         <div className="w-full max-w-sm space-y-4 bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
                             <div className="flex items-center justify-between border-b pb-4">
                                 <span className="text-2xl font-bold text-[#644c44]">Costo Total:</span>
                                 <span className="text-2xl font-bold text-[#644c44] font-mono">
                                     Bs. {calculatePurchaseTotal().toFixed(2)}
                                 </span>
                             </div>
                             <button 
                                 onClick={handleRegisterPurchase}
                                 disabled={isSubmittingPurchase}
                                 className={`w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent rounded-lg text-base font-medium text-white transition-all duration-300 transform 
                                 ${isSubmittingPurchase 
                                     ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                     : 'bg-[#e3a45c] hover:bg-[#cf9351] hover:-translate-y-0.5 shadow-lg shadow-[#e3a45c]/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e3a45c]' // Orange color
                                 }`}
                             >
                                 {isSubmittingPurchase ? <Loader2 size={20} className="animate-spin" /> : <PackagePlus size={20} />} 
                                 <span>{isSubmittingPurchase ? 'Registrando...' : 'Registrar Compra'}</span>
                             </button>
                         </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ComprasPage;