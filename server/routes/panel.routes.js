import { Router } from 'express';
import { 
    // Pedidos
    getPedidosNuevos, 
    getPedidoDetalle, 
    cambiarEstadoPedido,
    // Venta (Búsqueda y Registro)
    buscarClientes,         
    buscarProductosParaVenta,
    postRegistrarVenta,
    // Inventario (CRUD)
    getAllProductos,        
    getProductoForEdit,     
    postCreateProducto,     
    putUpdateProducto,      
    putUpdateProductoEstado,
    getAllClientes,         // NUEVO
    getClienteById,         // NUEVO
    postCreateCliente,      // NUEVO
    putUpdateCliente,       // NUEVO
    deleteClienteById,

    getAllProveedores,      // NUEVO
    getProveedorById,     // NUEVO
    postCreateProveedor,    // NUEVO
    putUpdateProveedor,     // NUEVO
    deleteProveedorById,
    postRegistrarCompra,

    getAllUsuarios,         // NUEVO
    getUsuarioById,         // NUEVO
    postCreateUsuario,      // NUEVO
    putUpdateUsuario,       // NUEVO
    deleteUsuarioById,

    getAllCategorias,       // NUEVO
    getCategoriaById,       // NUEVO
    postCreateCategoria,    // NUEVO
    putUpdateCategoria,     // NUEVO
    deleteCategoriaById,
    getMetrics,

    getSalesChart,     // NUEVO
    getActivityFeed
} from '../controllers/panel.controller.js';

import { checkAuth } from '../middleware/auth.middleware.js';

const router = Router();
router.use(checkAuth); // Middleware de autenticación para todas las rutas

// === RUTAS DE PEDIDOS ===
router.get('/panel/pedidos', getPedidosNuevos);
router.get('/panel/pedidos/:id', getPedidoDetalle);
router.put('/panel/pedidos/:id/estado', cambiarEstadoPedido);

// === RUTAS PARA REGISTRO DE VENTA ===
router.get('/panel/clientes/buscar', buscarClientes);
router.get('/panel/productos/buscar', buscarProductosParaVenta);
router.post('/panel/ventas', postRegistrarVenta);

// === RUTAS PARA GESTIÓN DE INVENTARIO ===
router.get('/panel/productos', getAllProductos);
router.get('/panel/productos/:id', getProductoForEdit);
router.post('/panel/productos', postCreateProducto);
router.put('/panel/productos/:id', putUpdateProducto);
router.put('/panel/productos/:id/estado', putUpdateProductoEstado);

router.get('/panel/clientes', getAllClientes);

// GET /api/panel/clientes/:id (Obtener uno por ID)
router.get('/panel/clientes/:id', getClienteById);

// POST /api/panel/clientes (Crear nuevo)
router.post('/panel/clientes', postCreateCliente);

// PUT /api/panel/clientes/:id (Actualizar)
router.put('/panel/clientes/:id', putUpdateCliente);

// DELETE /api/panel/clientes/:id (Eliminar)
router.delete('/panel/clientes/:id', deleteClienteById);

router.get('/panel/proveedores', getAllProveedores);

// GET /api/panel/proveedores/:id (Obtener uno)
router.get('/panel/proveedores/:id', getProveedorById);

// POST /api/panel/proveedores (Crear)
router.post('/panel/proveedores', postCreateProveedor);

// PUT /api/panel/proveedores/:id (Actualizar)
router.put('/panel/proveedores/:id', putUpdateProveedor);

// DELETE /api/panel/proveedores/:id (Eliminar)
router.delete('/panel/proveedores/:id', deleteProveedorById);

router.post('/panel/compras', postRegistrarCompra);

router.get('/panel/usuarios', getAllUsuarios);

// GET /api/panel/usuarios/:id (Obtener uno)
router.get('/panel/usuarios/:id', getUsuarioById);

// POST /api/panel/usuarios (Crear)
router.post('/panel/usuarios', postCreateUsuario);

// PUT /api/panel/usuarios/:id (Actualizar)
router.put('/panel/usuarios/:id', putUpdateUsuario);

// DELETE /api/panel/usuarios/:id (Eliminar)
router.delete('/panel/usuarios/:id', deleteUsuarioById);

router.get('/panel/categorias', getAllCategorias);

// GET /api/panel/categorias/:id (Obtener una)
router.get('/panel/categorias/:id', getCategoriaById);

// POST /api/panel/categorias (Crear)
router.post('/panel/categorias', postCreateCategoria);

// PUT /api/panel/categorias/:id (Actualizar)
router.put('/panel/categorias/:id', putUpdateCategoria);

// DELETE /api/panel/categorias/:id (Eliminar)
router.delete('/panel/categorias/:id', deleteCategoriaById);

router.get('/panel/dashboard-metrics', getMetrics);

router.get('/panel/sales-chart-data', getSalesChart);

// GET /api/panel/recent-activity?limit=X
router.get('/panel/recent-activity', getActivityFeed);
export default router;