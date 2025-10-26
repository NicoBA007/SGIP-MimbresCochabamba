import { 
    // Pedido y venta
    findPedidosNuevos, 
    findPedidoDetalleById, 
    updatePedidoEstado,
    searchClientes,         
    searchProductosParaVenta,
    registrarVenta,
    // Funciones de Inventario

    findAllProductos,       
    findProductoByIdForEdit,
    createProducto,         
    updateProducto,         
    updateProductoEstado,

    // Nuevas funciones de Cliente
    findAllClientes,        // NUEVO
    findClienteById,        // NUEVO
    createCliente,          // NUEVO
    updateCliente,          // NUEVO
    deleteCliente,

    // Nuevas funciones de Proveedor
    findAllProveedores,     // NUEVO
    findProveedorById,    // NUEVO
    createProveedor,        // NUEVO
    updateProveedor,        // NUEVO
    deleteProveedor,
    registrarCompra,
    
    findAllUsuarios,        // NUEVO
    findUsuarioById,      // NUEVO
    createUsuario,          // NUEVO
    updateUsuario,          // NUEVO
    deleteUsuario,

    findAllCategorias,      // NUEVO
    findCategoriaById,    // NUEVO
    createCategoria,        // NUEVO
    updateCategoria,        // NUEVO
    deleteCategoria,

    getDashboardMetrics,
    
    getSalesDataForChart, // NUEVO
    getRecentActivity// NUEVO
} from '../services/panel.service.js';

/**
 * Endpoint: GET /api/panel/pedidos
 * Obtiene la lista de pedidos en estado 'INICIADO'.
 */
export async function getPedidosNuevos(req, res) {
    try {
        const pedidos = await findPedidosNuevos();
        res.status(200).json(pedidos);
    } catch (error) {
        console.error("Error en getPedidosNuevos:", error.message);
        res.status(500).json({ message: "Error interno al obtener los pedidos." });
    }
}

/**
 * Endpoint: GET /api/panel/pedidos/:id
 * Obtiene el detalle (productos) de un pedido específico.
 */
export async function getPedidoDetalle(req, res) {
    try {
        const { id } = req.params;
        const detalles = await findPedidoDetalleById(id);
        
        if (detalles.length === 0) {
            return res.status(404).json({ message: "No se encontró detalle para este pedido." });
        }
        
        res.status(200).json(detalles);
    } catch (error) {
        console.error("Error en getPedidoDetalle:", error.message);
        res.status(500).json({ message: "Error interno al obtener el detalle." });
    }
}

/**
 * Endpoint: PUT /api/panel/pedidos/:id/estado
 * Actualiza el estado de un pedido (ej: 'CONCRETADO' o 'CANCELADO')
 */
export async function cambiarEstadoPedido(req, res) {
    try {
        const { id } = req.params;
        const { nuevoEstado } = req.body; // Ej: { "nuevoEstado": "CONCRETADO" }

        if (!nuevoEstado) {
            return res.status(400).json({ message: "Se requiere un 'nuevoEstado'." });
        }

        const exito = await updatePedidoEstado(id, nuevoEstado);

        if (!exito) {
            return res.status(404).json({ message: "Pedido no encontrado o estado no válido." });
        }
        
        res.status(200).json({ message: `Pedido ${id} actualizado a ${nuevoEstado}.` });
    } catch (error) {
        console.error("Error en cambiarEstadoPedido:", error.message);
        res.status(500).json({ message: "Error interno al actualizar el pedido." });
    }
}

export async function buscarClientes(req, res) {
    const { term } = req.query; // Ej: /buscar?term=Juan

    if (!term || term.length < 2) {
        return res.status(400).json({ message: "Se requiere un término de búsqueda de al menos 2 caracteres." });
    }

    try {
        const clientes = await searchClientes(term);
        res.status(200).json(clientes);
    } catch (error) {
        console.error("Error en buscarClientes:", error.message);
        res.status(500).json({ message: "Error interno al buscar clientes." });
    }
}

/**
 * Endpoint: GET /api/panel/productos/buscar
 * Busca productos activos por término de búsqueda (query param 'term').
 */
export async function buscarProductosParaVenta(req, res) {
    const { term } = req.query; // Ej: /buscar?term=Cama

    if (!term || term.length < 2) {
        return res.status(400).json({ message: "Se requiere un término de búsqueda de al menos 2 caracteres." });
    }

    try {
        const productos = await searchProductosParaVenta(term);
        res.status(200).json(productos);
    } catch (error) {
        console.error("Error en buscarProductosParaVenta:", error.message);
        res.status(500).json({ message: "Error interno al buscar productos." });
    }
}

export async function postRegistrarVenta(req, res) {
    // 1. Obtenemos datos del body y del usuario autenticado
    const { idCliente, items, descuento } = req.body;
    const idUsuario = req.user.id; // Viene del middleware 'checkAuth'

    // 2. Validación básica
    if (!idCliente || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Datos incompletos. Se requiere 'idCliente' y un array 'items'." });
    }
    // Validar cada item (puedes hacer esto más robusto)
    for (const item of items) {
        if (!item.id_producto || !item.cantidad_vendida || !item.precio_venta_unitario) {
            return res.status(400).json({ message: "Cada item debe tener 'id_producto', 'cantidad_vendida' y 'precio_venta_unitario'." });
        }
    }

    try {
        // 3. Llamar al servicio que maneja la transacción
        const nuevaVenta = await registrarVenta(idCliente, idUsuario, items, descuento);

        // 4. Responder con éxito
        res.status(201).json({ 
            message: "Venta registrada con éxito.", 
            venta: nuevaVenta 
        });

    } catch (error) {
        // 5. Manejar errores (ej: stock insuficiente si lo implementáramos)
        console.error("Error en postRegistrarVenta:", error.message);
        res.status(500).json({ message: error.message || "Error interno al registrar la venta." });
    }
}

export async function getAllProductos(req, res) {
    try {
        const productos = await findAllProductos();
        res.status(200).json(productos);
    } catch (error) {
        console.error("Error en getAllProductos:", error.message);
        res.status(500).json({ message: "Error interno al obtener los productos." });
    }
}

/**
 * Endpoint: GET /api/panel/productos/:id
 */
export async function getProductoForEdit(req, res) {
    try {
        const { id } = req.params;
        const producto = await findProductoByIdForEdit(id);
        if (!producto) {
            return res.status(404).json({ message: "Producto no encontrado." });
        }
        res.status(200).json(producto);
    } catch (error) {
        console.error("Error en getProductoForEdit:", error.message);
        res.status(500).json({ message: "Error interno al obtener el producto." });
    }
}

/**
 * Endpoint: POST /api/panel/productos
 */
export async function postCreateProducto(req, res) {
    try {
        const productData = req.body;
        const idUsuario = req.user.id; 
        const nuevoProducto = await createProducto(productData, idUsuario);
        res.status(201).json({ message: "Producto creado.", producto: nuevoProducto });
    } catch (error) {
        console.error("Error en postCreateProducto:", error.message);
        res.status(400).json({ message: error.message || "Error al crear el producto." });
    }
}

/**
 * Endpoint: PUT /api/panel/productos/:id
 */
export async function putUpdateProducto(req, res) {
    try {
        const { id } = req.params;
        const productData = req.body;
        
        // El servicio devuelve el número de filas afectadas
        const affectedRows = await updateProducto(id, productData); 
        
        if (affectedRows === 0) {
            return res.status(404).json({ message: "Producto no encontrado o datos inválidos." });
        }
        if (affectedRows > 0) {
             res.status(200).json({ message: `Producto ${id} actualizado.` });
        } else {
             // Si affectedRows es undefined o null, puede indicar un problema, aunque debería ser 0 o >0
             res.status(400).json({ message: "No se realizaron cambios." });
        }

    } catch (error) {
        console.error("Error en putUpdateProducto:", error.message);
        res.status(400).json({ message: error.message || "Error al actualizar el producto." });
    }
}


/**
 * Endpoint: PUT /api/panel/productos/:id/estado
 */
export async function putUpdateProductoEstado(req, res) {
    try {
        const { id } = req.params;
        const { nuevoEstado } = req.body;
        if (!nuevoEstado) {
            return res.status(400).json({ message: "Se requiere 'nuevoEstado'." });
        }
        const exito = await updateProductoEstado(id, nuevoEstado);
        if (!exito) {
            return res.status(404).json({ message: "Producto no encontrado o estado no válido." });
        }
        res.status(200).json({ message: `Estado del producto ${id} actualizado a ${nuevoEstado}.` });
    } catch (error) {
        console.error("Error en putUpdateProductoEstado:", error.message);
        res.status(400).json({ message: error.message || "Error al actualizar estado del producto." });
    }
}

export async function getAllClientes(req, res) {
    try {
        const clientes = await findAllClientes();
        res.status(200).json(clientes);
    } catch (error) {
        console.error("Error en getAllClientes:", error.message);
        res.status(500).json({ message: "Error interno al obtener los clientes." });
    }
}

/**
 * Endpoint: GET /api/panel/clientes/:id
 * Obtiene un cliente por ID.
 */
export async function getClienteById(req, res) {
    try {
        const { id } = req.params;
        const cliente = await findClienteById(id);
        if (!cliente) {
            // Si el servicio devuelve null, enviamos 404
            return res.status(404).json({ message: "Cliente no encontrado." });
        }
        res.status(200).json(cliente);
    } catch (error) {
        console.error("Error en getClienteById:", error.message);
        res.status(500).json({ message: "Error interno al obtener el cliente." });
    }
}

/**
 * Endpoint: POST /api/panel/clientes
 * Crea un nuevo cliente.
 */
export async function postCreateCliente(req, res) {
    try {
        const clienteData = req.body; // Los datos vienen en el cuerpo de la petición
        const nuevoCliente = await createCliente(clienteData);
        // Respondemos con 201 (Creado) y los datos del nuevo cliente
        res.status(201).json({ message: "Cliente creado con éxito.", cliente: nuevoCliente });
    } catch (error) {
        console.error("Error en postCreateCliente:", error.message);
        // Enviamos el mensaje específico del servicio (ej: teléfono duplicado)
        res.status(400).json({ message: error.message || "Error al crear el cliente." });
    }
}

/**
 * Endpoint: PUT /api/panel/clientes/:id
 * Actualiza un cliente existente.
 */
export async function putUpdateCliente(req, res) {
    try {
        const { id } = req.params; // El ID viene de la URL
        const clienteData = req.body; // Los nuevos datos vienen del cuerpo
        
        // El servicio devuelve 0 si no encontró el ID, o >0 si actualizó
        const affectedRows = await updateCliente(id, clienteData); 
        
        if (affectedRows === 0) {
            return res.status(404).json({ message: "Cliente no encontrado o no hubo cambios." });
        }
        // Si affectedRows > 0, fue exitoso
        res.status(200).json({ message: `Cliente ${id} actualizado con éxito.` });
       
    } catch (error) {
        console.error("Error en putUpdateCliente:", error.message);
        // Enviamos mensaje específico (ej: teléfono duplicado)
        res.status(400).json({ message: error.message || "Error al actualizar el cliente." });
    }
}

/**
 * Endpoint: DELETE /api/panel/clientes/:id
 * Elimina un cliente.
 */
export async function deleteClienteById(req, res) {
    try {
        const { id } = req.params; // El ID viene de la URL
        const exito = await deleteCliente(id); // El servicio devuelve true o false
        if (!exito) {
            return res.status(404).json({ message: "Cliente no encontrado." });
        }
        res.status(200).json({ message: `Cliente ${id} eliminado con éxito.` });
    } catch (error) {
        console.error("Error en deleteClienteById:", error.message);
        // Enviamos mensaje específico (ej: no se puede borrar por ventas asociadas)
        res.status(400).json({ message: error.message || "Error al eliminar el cliente." });
    }
}

export async function getAllProveedores(req, res) {
    try {
        const proveedores = await findAllProveedores();
        res.status(200).json(proveedores);
    } catch (error) {
        console.error("Error en getAllProveedores:", error.message);
        res.status(500).json({ message: "Error interno al obtener los proveedores." });
    }
}

/**
 * Endpoint: GET /api/panel/proveedores/:id
 * Obtiene un proveedor por ID.
 */
export async function getProveedorById(req, res) {
    try {
        const { id } = req.params;
        const proveedor = await findProveedorById(id);
        if (!proveedor) {
            return res.status(404).json({ message: "Proveedor no encontrado." });
        }
        res.status(200).json(proveedor);
    } catch (error) {
        console.error("Error en getProveedorById:", error.message);
        res.status(500).json({ message: "Error interno al obtener el proveedor." });
    }
}

/**
 * Endpoint: POST /api/panel/proveedores
 * Crea un nuevo proveedor.
 */
export async function postCreateProveedor(req, res) {
    try {
        const proveedorData = req.body;
        const nuevoProveedor = await createProveedor(proveedorData);
        res.status(201).json({ message: "Proveedor creado con éxito.", proveedor: nuevoProveedor });
    } catch (error) {
        console.error("Error en postCreateProveedor:", error.message);
        res.status(400).json({ message: error.message || "Error al crear el proveedor." });
    }
}

/**
 * Endpoint: PUT /api/panel/proveedores/:id
 * Actualiza un proveedor existente.
 */
export async function putUpdateProveedor(req, res) {
    try {
        const { id } = req.params;
        const proveedorData = req.body;
        const affectedRows = await updateProveedor(id, proveedorData);
        if (affectedRows === 0) {
            return res.status(404).json({ message: "Proveedor no encontrado o no hubo cambios." });
        }
        res.status(200).json({ message: `Proveedor ${id} actualizado con éxito.` });
    } catch (error) {
        console.error("Error en putUpdateProveedor:", error.message);
        res.status(400).json({ message: error.message || "Error al actualizar el proveedor." });
    }
}

/**
 * Endpoint: DELETE /api/panel/proveedores/:id
 * Elimina un proveedor.
 */
export async function deleteProveedorById(req, res) {
    try {
        const { id } = req.params;
        const exito = await deleteProveedor(id);
        if (!exito) {
            return res.status(404).json({ message: "Proveedor no encontrado." });
        }
        res.status(200).json({ message: `Proveedor ${id} eliminado con éxito.` });
    } catch (error) {
        console.error("Error en deleteProveedorById:", error.message);
        res.status(400).json({ message: error.message || "Error al eliminar el proveedor." });
    }
}

export async function postRegistrarCompra(req, res) {
    // 1. Obtenemos datos del body y del usuario autenticado
    const { idProveedor, items } = req.body;
    const idUsuario = req.user.id; // Del middleware 'checkAuth'

    // 2. Validación básica
    if (!idProveedor || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Datos incompletos. Se requiere 'idProveedor' y un array 'items'." });
    }
    // Validar cada item
    for (const item of items) {
        if (!item.id_producto || !item.cantidad_comprada || item.costo_unitario === undefined) {
            return res.status(400).json({ message: "Cada item debe tener 'id_producto', 'cantidad_comprada' y 'costo_unitario'." });
        }
        if (item.cantidad_comprada <= 0 || item.costo_unitario < 0) {
             return res.status(400).json({ message: "Cantidades y costos deben ser positivos." });
        }
    }

    try {
        // 3. Llamar al servicio que maneja la transacción
        const nuevaCompra = await registrarCompra(idProveedor, idUsuario, items);

        // 4. Responder con éxito
        res.status(201).json({ 
            message: "Compra registrada con éxito.", 
            compra: nuevaCompra 
        });

    } catch (error) {
        // 5. Manejar errores
        console.error("Error en postRegistrarCompra:", error.message);
        res.status(500).json({ message: error.message || "Error interno al registrar la compra." });
    }
}

export async function getAllUsuarios(req, res) {
    try {
        const usuarios = await findAllUsuarios();
        res.status(200).json(usuarios);
    } catch (error) {
        console.error("Error en getAllUsuarios:", error.message);
        res.status(500).json({ message: "Error interno al obtener los usuarios." });
    }
}

/**
 * Endpoint: GET /api/panel/usuarios/:id
 * Obtiene un usuario por ID (sin contraseña).
 */
export async function getUsuarioById(req, res) {
    try {
        const { id } = req.params;
        const usuario = await findUsuarioById(id);
        if (!usuario) {
            return res.status(404).json({ message: "Usuario no encontrado." });
        }
        res.status(200).json(usuario);
    } catch (error) {
        console.error("Error en getUsuarioById:", error.message);
        res.status(500).json({ message: "Error interno al obtener el usuario." });
    }
}

/**
 * Endpoint: POST /api/panel/usuarios
 * Crea un nuevo usuario.
 */
export async function postCreateUsuario(req, res) {
    try {
        const usuarioData = req.body;
        // La contraseña viene en texto plano aquí
        const nuevoUsuario = await createUsuario(usuarioData);
        // Devolvemos el usuario SIN la contraseña o el hash
        res.status(201).json({ message: "Usuario creado con éxito.", usuario: nuevoUsuario });
    } catch (error) {
        console.error("Error en postCreateUsuario:", error.message);
        res.status(400).json({ message: error.message || "Error al crear el usuario." });
    }
}

/**
 * Endpoint: PUT /api/panel/usuarios/:id
 * Actualiza un usuario existente.
 */
export async function putUpdateUsuario(req, res) {
    try {
        const { id } = req.params;
        const usuarioData = req.body; // Puede incluir 'password' para cambiarla
        const affectedRows = await updateUsuario(id, usuarioData);
        if (affectedRows === 0) {
            return res.status(404).json({ message: "Usuario no encontrado o no hubo cambios." });
        }
        res.status(200).json({ message: `Usuario ${id} actualizado con éxito.` });
    } catch (error) {
        console.error("Error en putUpdateUsuario:", error.message);
        res.status(400).json({ message: error.message || "Error al actualizar el usuario." });
    }
}

/**
 * Endpoint: DELETE /api/panel/usuarios/:id
 * Elimina un usuario.
 */
export async function deleteUsuarioById(req, res) {
    try {
        const { id } = req.params;
        // Podríamos añadir validación: no permitir borrar al usuario logueado
        if (parseInt(id) === req.user.id) {
             return res.status(403).json({ message: "No puedes eliminar tu propia cuenta." });
        }
        
        const exito = await deleteUsuario(id);
        if (!exito) {
            return res.status(404).json({ message: "Usuario no encontrado." });
        }
        res.status(200).json({ message: `Usuario ${id} eliminado con éxito.` });
    } catch (error) {
        console.error("Error en deleteUsuarioById:", error.message);
        res.status(400).json({ message: error.message || "Error al eliminar el usuario." });
    }
}

export async function getAllCategorias(req, res) {
    try {
        const categorias = await findAllCategorias();
        res.status(200).json(categorias);
    } catch (error) {
        console.error("Error en getAllCategorias:", error.message);
        res.status(500).json({ message: "Error interno al obtener las categorías." });
    }
}

/**
 * Endpoint: GET /api/panel/categorias/:id
 * Obtiene una categoría por ID.
 */
export async function getCategoriaById(req, res) {
    try {
        const { id } = req.params;
        const categoria = await findCategoriaById(id);
        if (!categoria) {
            return res.status(404).json({ message: "Categoría no encontrada." });
        }
        res.status(200).json(categoria);
    } catch (error) {
        console.error("Error en getCategoriaById:", error.message);
        res.status(500).json({ message: "Error interno al obtener la categoría." });
    }
}

/**
 * Endpoint: POST /api/panel/categorias
 * Crea una nueva categoría.
 */
export async function postCreateCategoria(req, res) {
    try {
        const categoriaData = req.body;
        const nuevaCategoria = await createCategoria(categoriaData);
        res.status(201).json({ message: "Categoría creada con éxito.", categoria: nuevaCategoria });
    } catch (error) {
        console.error("Error en postCreateCategoria:", error.message);
        res.status(400).json({ message: error.message || "Error al crear la categoría." });
    }
}

/**
 * Endpoint: PUT /api/panel/categorias/:id
 * Actualiza una categoría existente.
 */
export async function putUpdateCategoria(req, res) {
    try {
        const { id } = req.params;
        const categoriaData = req.body;
        const affectedRows = await updateCategoria(id, categoriaData);
        if (affectedRows === 0) {
            return res.status(404).json({ message: "Categoría no encontrada o no hubo cambios." });
        }
        res.status(200).json({ message: `Categoría ${id} actualizada con éxito.` });
    } catch (error) {
        console.error("Error en putUpdateCategoria:", error.message);
        res.status(400).json({ message: error.message || "Error al actualizar la categoría." });
    }
}

/**
 * Endpoint: DELETE /api/panel/categorias/:id
 * Elimina una categoría.
 */
export async function deleteCategoriaById(req, res) {
    try {
        const { id } = req.params;
        const exito = await deleteCategoria(id);
        if (!exito) {
            return res.status(404).json({ message: "Categoría no encontrada." });
        }
        res.status(200).json({ message: `Categoría ${id} eliminada con éxito.` });
    } catch (error) {
        console.error("Error en deleteCategoriaById:", error.message);
        res.status(400).json({ message: error.message || "Error al eliminar la categoría." });
    }
}
export async function getMetrics(req, res) {
    try {
        const metrics = await getDashboardMetrics();
        res.status(200).json(metrics);
    } catch (error) {
        console.error("Error en getMetrics:", error.message);
        res.status(500).json({ message: "Error interno al obtener las métricas." });
    }
}

export async function getSalesChart(req, res) {
    try {
        // Podríamos obtener el número de días de req.query si quisiéramos
        const days = parseInt(req.query.days) || 7;
        const data = await getSalesDataForChart(days);
        res.status(200).json(data);
    } catch (error) {
        console.error("Error en getSalesChart:", error.message);
        res.status(500).json({ message: "Error interno al obtener datos del gráfico." });
    }
}

/**
 * Endpoint: GET /api/panel/recent-activity
 * Devuelve las últimas actividades (ej: ventas).
 */
export async function getActivityFeed(req, res) {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const activity = await getRecentActivity(limit);
        res.status(200).json(activity);
    } catch (error) {
        console.error("Error en getActivityFeed:", error.message);
        res.status(500).json({ message: "Error interno al obtener actividad reciente." });
    }
}