import { pool } from '../config/db.config.js';
import bcrypt from 'bcrypt';

// --- FUNCIONES DE PEDIDOS Y VENTAS (EXISTENTES) ---

export async function findPedidosNuevos() {
    const query = `
        SELECT 
            id_pedido_web, fecha_pedido, monto_estimado, telefono_whatsapp, estado
        FROM PEDIDO_WEB
        WHERE estado = 'INICIADO'
        ORDER BY fecha_pedido DESC;
    `;
    try {
        const [rows] = await pool.query(query);
        return rows;
    } catch (error) {
        console.error("Error en findPedidosNuevos:", error);
        throw new Error("Error al consultar los pedidos nuevos.");
    }
}

export async function findPedidoDetalleById(idPedido) {
    const query = `
        SELECT 
            d.cantidad_solicitada, d.precio_unitario_registro,
            p.nombre_producto, p.id_producto
        FROM DETALLE_PEDIDO_WEB d
        JOIN PRODUCTO p ON d.id_producto = p.id_producto
        WHERE d.id_pedido_web = ?;
    `;
    try {
        const [rows] = await pool.query(query, [idPedido]);
        return rows;
    } catch (error) {
        console.error("Error en findPedidoDetalleById:", error);
        throw new Error("Error al consultar el detalle del pedido.");
    }
}

export async function updatePedidoEstado(idPedido, nuevoEstado) {
    if (!['CONCRETADO', 'CANCELADO'].includes(nuevoEstado)) {
        throw new Error("Estado no válido.");
    }
    const query = 'UPDATE PEDIDO_WEB SET estado = ? WHERE id_pedido_web = ?;';
    try {
        const [result] = await pool.query(query, [nuevoEstado, idPedido]);
        return result.affectedRows > 0;
    } catch (error) {
        console.error("Error en updatePedidoEstado:", error);
        throw new Error("Error al actualizar el estado del pedido.");
    }
}

export async function searchClientes(searchTerm) {
    const query = `
        SELECT id_cliente, nombre_pila_cliente, apellido_paterno_cliente, telefono_whatsapp 
        FROM CLIENTE 
        WHERE nombre_pila_cliente LIKE ? OR apellido_paterno_cliente LIKE ? OR telefono_whatsapp LIKE ?
        LIMIT 10;
    `;
    const searchTermLike = `%${searchTerm}%`;
    try {
        const [rows] = await pool.query(query, [searchTermLike, searchTermLike, searchTermLike]);
        return rows;
    } catch (error) {
        console.error("Error en searchClientes:", error);
        throw new Error("Error al buscar clientes.");
    }
}

export async function searchProductosParaVenta(searchTerm) {
    const query = `
        SELECT id_producto, nombre_producto, precio_unitario, stock_actual
        FROM PRODUCTO 
        WHERE nombre_producto LIKE ? AND estado = 'ACTIVO'
        LIMIT 10;
    `;
    const searchTermLike = `%${searchTerm}%`;
    try {
        const [rows] = await pool.query(query, [searchTermLike]);
        return rows.map(p => ({ ...p, precio_unitario: parseFloat(p.precio_unitario) }));
    } catch (error) {
        console.error("Error en searchProductosParaVenta:", error);
        throw new Error("Error al buscar productos para la venta.");
    }
}

export async function registrarVenta(idCliente, idUsuario, items, descuento = 0) {
    let connection;
    try {
        const montoTotalBruto = items.reduce((total, item) => total + (item.precio_venta_unitario * item.cantidad_vendida), 0);
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const ventaQuery = `INSERT INTO VENTA (id_cliente, id_usuario_reg, monto_total, descuento_aplicado) VALUES (?, ?, ?, ?)`;
        const montoTotalNeto = montoTotalBruto - descuento;
        const [ventaResult] = await connection.query(ventaQuery, [idCliente, idUsuario, montoTotalNeto, descuento]);
        const idVenta = ventaResult.insertId;

        const detalleData = items.map(item => [idVenta, item.id_producto, item.cantidad_vendida, item.precio_venta_unitario]);
        const detalleQuery = `INSERT INTO DETALLE_VENTA (id_venta, id_producto, cantidad_vendida, precio_venta_unitario) VALUES ?`;
        await connection.query(detalleQuery, [detalleData]);

        const updateStockQuery = `UPDATE PRODUCTO SET stock_actual = stock_actual - ? WHERE id_producto = ?`;
        const movimientoQuery = `INSERT INTO MOVIMIENTO_INVENTARIO (id_producto, id_usuario_reg, tipo_movimiento, cantidad, referencia_doc) VALUES (?, ?, 'SALIDA', ?, ?)`;
        const referenciaDoc = `Venta #${idVenta}`;

        for (const item of items) {
            await connection.query(updateStockQuery, [item.cantidad_vendida, item.id_producto]);
            await connection.query(movimientoQuery, [item.id_producto, idUsuario, item.cantidad_vendida, referenciaDoc]);
        }

        await connection.commit();
        return { idVenta, montoTotalNeto };
    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Error en la transacción de venta:", error);
        throw new Error("No se pudo registrar la venta en la base de datos.");
    } finally {
        if (connection) connection.release();
    }
}

// --- FUNCIONES DE GESTIÓN DE INVENTARIO (CORREGIDAS) ---

export async function findAllProductos() {
    const query = `
        SELECT 
            p.id_producto, p.nombre_producto, p.stock_actual, 
            p.precio_unitario, p.estado, c.nombre_categoria,
            p.url_imagen -- Incluye la URL de la imagen
        FROM PRODUCTO p
        JOIN CATEGORIA c ON p.id_categoria = c.id_categoria
        ORDER BY p.nombre_producto;
    `;
    try {
        const [rows] = await pool.query(query);
        return rows.map(p => ({ ...p, precio_unitario: parseFloat(p.precio_unitario) }));
    } catch (error) {
        console.error("Error in findAllProductos:", error);
        throw new Error("Error al consultar todos los productos.");
    }
}

export async function findProductoByIdForEdit(idProducto) {
    const query = `
        SELECT 
            id_producto, nombre_producto, descripcion, stock_actual, 
            precio_unitario, dimensiones, material, color, 
            unidad_medida, estado, id_categoria,
            url_imagen -- Incluye la URL de la imagen
        FROM PRODUCTO 
        WHERE id_producto = ?;
    `;
    try {
        const [rows] = await pool.query(query, [idProducto]);
        if (rows.length === 0) return null;
        const product = rows[0];
        return { ...product, precio_unitario: parseFloat(product.precio_unitario) };
    } catch (error) {
        console.error("Error in findProductoByIdForEdit:", error);
        throw new Error("Error al consultar el producto para editar.");
    }
}

export async function createProducto(productData, idUsuario) {
    const { 
        nombre_producto, descripcion, stock_actual = 0, precio_unitario, 
        dimensiones, material, color, unidad_medida, estado = 'ACTIVO', id_categoria,
        url_imagen // Acepta la URL de la imagen
    } = productData;
    
    if (!nombre_producto || precio_unitario === undefined || !id_categoria) {
        throw new Error("Nombre, precio unitario y categoría son requeridos.");
    }

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const productQuery = `
            INSERT INTO PRODUCTO (
                nombre_producto, descripcion, stock_actual, precio_unitario, 
                dimensiones, material, color, unidad_medida, estado, id_categoria,
                url_imagen -- Añade la columna
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?); -- Añade un placeholder
        `;
        const [productResult] = await connection.query(productQuery, [
            nombre_producto, descripcion, stock_actual, precio_unitario, 
            dimensiones, material, color, unidad_medida, estado, id_categoria,
            url_imagen // Pasa el valor
        ]);
        const idProducto = productResult.insertId;

        if (stock_actual > 0) {
            const movimientoQuery = `
                INSERT INTO MOVIMIENTO_INVENTARIO (id_producto, id_usuario_reg, tipo_movimiento, cantidad, referencia_doc) 
                VALUES (?, ?, 'ENTRADA', ?, ?); 
            `;
            const referencia = `Stock inicial producto #${idProducto}`;
            await connection.query(movimientoQuery, [idProducto, idUsuario, stock_actual, referencia]);
        }

        await connection.commit();
        return { id_producto: idProducto, ...productData, stock_actual: stock_actual, estado: estado }; 

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Error creating product:", error);
        throw new Error("Error al crear el producto.");
    } finally {
        if (connection) connection.release();
    }
}

/**
 * Actualiza un producto existente.
 * ¡ESTA ES LA VERSIÓN CORREGIDA ASEGURADA!
 */
export async function updateProducto(idProducto, productData) {
    // Desestructura los campos, asegurando que 'url_imagen' aparezca UNA SOLA VEZ.
    const { 
        nombre_producto, 
        descripcion, 
        stock_actual, 
        precio_unitario, 
        dimensiones, 
        material, 
        color, 
        unidad_medida, 
        estado, 
        id_categoria,
        url_imagen // <-- Solo una vez aquí
    } = productData;

    // Construcción dinámica de la consulta UPDATE
    const fieldsToUpdate = [];
    const values = [];
    
    if (nombre_producto !== undefined) { fieldsToUpdate.push('nombre_producto = ?'); values.push(nombre_producto); }
    if (descripcion !== undefined) { fieldsToUpdate.push('descripcion = ?'); values.push(descripcion === null ? null : descripcion); }
    if (stock_actual !== undefined) { fieldsToUpdate.push('stock_actual = ?'); values.push(stock_actual); }
    if (precio_unitario !== undefined) { fieldsToUpdate.push('precio_unitario = ?'); values.push(precio_unitario); }
    if (dimensiones !== undefined) { fieldsToUpdate.push('dimensiones = ?'); values.push(dimensiones === null ? null : dimensiones); }
    if (material !== undefined) { fieldsToUpdate.push('material = ?'); values.push(material === null ? null : material); }
    if (color !== undefined) { fieldsToUpdate.push('color = ?'); values.push(color === null ? null : color); }
    if (unidad_medida !== undefined) { fieldsToUpdate.push('unidad_medida = ?'); values.push(unidad_medida === null ? null : unidad_medida); }
    if (estado !== undefined) { fieldsToUpdate.push('estado = ?'); values.push(estado); }
    if (id_categoria !== undefined) { fieldsToUpdate.push('id_categoria = ?'); values.push(id_categoria); }
    if (url_imagen !== undefined) { fieldsToUpdate.push('url_imagen = ?'); values.push(url_imagen); } 

    if (fieldsToUpdate.length === 0) {
        console.warn(`No fields to update for product ID: ${idProducto}`);
        return 0; 
    }

    const query = `
        UPDATE PRODUCTO 
        SET ${fieldsToUpdate.join(', ')} 
        WHERE id_producto = ?;
    `;
    values.push(idProducto); 

    try {
        const [result] = await pool.query(query, values);
        return result.affectedRows; 
    } catch (error) {
        console.error("Error updating product:", error);
        throw new Error("Error al actualizar el producto."); 
    }
}

export async function updateProductoEstado(idProducto, nuevoEstado) {
    const validStates = ['ACTIVO', 'INACTIVO', 'AGOTADO'];
    if (!validStates.includes(nuevoEstado)) {
        throw new Error("Estado no válido.");
    }
    const query = `UPDATE PRODUCTO SET estado = ? WHERE id_producto = ?;`;
    try {
        const [result] = await pool.query(query, [nuevoEstado, idProducto]);
        return result.affectedRows > 0;
    } catch (error) {
        console.error("Error updating product state:", error);
        throw new Error("Error al actualizar el estado del producto.");
    }
}

export async function findAllClientes() {
    const query = `
        SELECT 
            id_cliente, nombre_pila_cliente, apellido_paterno_cliente, 
            apellido_materno_cliente, telefono_whatsapp, email, fecha_registro 
        FROM CLIENTE 
        ORDER BY apellido_paterno_cliente, nombre_pila_cliente;
    `;
    try {
        const [rows] = await pool.query(query);
        return rows;
    } catch (error) {
        console.error("Error en findAllClientes:", error);
        throw new Error("Error al consultar todos los clientes.");
    }
}

/**
 * Encuentra un cliente por su ID.
 */
export async function findClienteById(idCliente) {
    const query = `
        SELECT 
            id_cliente, nombre_pila_cliente, apellido_paterno_cliente, 
            apellido_materno_cliente, telefono_whatsapp, email, fecha_registro 
        FROM CLIENTE 
        WHERE id_cliente = ?;
    `;
    try {
        const [rows] = await pool.query(query, [idCliente]);
        // Devuelve el primer cliente encontrado o null si no existe
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error("Error en findClienteById:", error);
        throw new Error("Error al consultar el cliente por ID.");
    }
}

/**
 * Crea un nuevo cliente.
 */
export async function createCliente(clienteData) {
    const { 
        nombre_pila_cliente, 
        apellido_paterno_cliente, 
        apellido_materno_cliente, 
        telefono_whatsapp, 
        email 
    } = clienteData;

    // Validación básica (WhatsApp es obligatorio en la DB)
    if (!telefono_whatsapp) {
        throw new Error("El teléfono WhatsApp es requerido.");
    }

    const query = `
        INSERT INTO CLIENTE (
            nombre_pila_cliente, apellido_paterno_cliente, apellido_materno_cliente, 
            telefono_whatsapp, email
        ) VALUES (?, ?, ?, ?, ?);
    `;
    try {
        const [result] = await pool.query(query, [
            nombre_pila_cliente || null, // Permite nulos para nombres/apellidos
            apellido_paterno_cliente || null,
            apellido_materno_cliente || null,
            telefono_whatsapp,
            email || null // Permite nulo para email
        ]);
        // Devuelve el ID del nuevo cliente junto con los datos
        return { id_cliente: result.insertId, ...clienteData };
    } catch (error) {
        // Maneja el error si el teléfono ya existe (por la restricción UNIQUE)
        if (error.code === 'ER_DUP_ENTRY') {
             throw new Error(`El número de WhatsApp '${telefono_whatsapp}' ya está registrado.`);
        }
        console.error("Error creando cliente:", error);
        throw new Error("Error al crear el cliente.");
    }
}

/**
 * Actualiza un cliente existente.
 */
export async function updateCliente(idCliente, clienteData) {
    const { 
        nombre_pila_cliente, 
        apellido_paterno_cliente, 
        apellido_materno_cliente, 
        telefono_whatsapp, 
        email 
    } = clienteData;

    // Construye la parte SET dinámicamente
    const fieldsToUpdate = [];
    const values = [];

    if (nombre_pila_cliente !== undefined) { fieldsToUpdate.push('nombre_pila_cliente = ?'); values.push(nombre_pila_cliente); }
    if (apellido_paterno_cliente !== undefined) { fieldsToUpdate.push('apellido_paterno_cliente = ?'); values.push(apellido_paterno_cliente); }
    if (apellido_materno_cliente !== undefined) { fieldsToUpdate.push('apellido_materno_cliente = ?'); values.push(apellido_materno_cliente); }
    if (telefono_whatsapp !== undefined) { fieldsToUpdate.push('telefono_whatsapp = ?'); values.push(telefono_whatsapp); }
    if (email !== undefined) { fieldsToUpdate.push('email = ?'); values.push(email); }
   
    // Si no se envió ningún campo para actualizar
    if (fieldsToUpdate.length === 0) {
        // Puedes devolver 0 o lanzar un error si prefieres
        console.warn(`No fields to update for customer ID: ${idCliente}`);
        return 0; 
        // throw new Error("No hay campos válidos para actualizar.");
    }

    const query = `
        UPDATE CLIENTE 
        SET ${fieldsToUpdate.join(', ')} 
        WHERE id_cliente = ?;
    `;
    values.push(idCliente); // Añade el ID para el WHERE

    try {
        const [result] = await pool.query(query, values);
        return result.affectedRows; // Devuelve cuántas filas se actualizaron (0 o 1)
    } catch (error) {
         // Maneja error de teléfono duplicado al actualizar
         if (error.code === 'ER_DUP_ENTRY') {
             throw new Error(`El número de WhatsApp '${telefono_whatsapp}' ya está registrado.`);
        }
        console.error("Error updating cliente:", error);
        throw new Error("Error al actualizar el cliente.");
    }
}

export async function deleteCliente(idCliente) {
    const query = `DELETE FROM CLIENTE WHERE id_cliente = ?;`;
    try {
        const [result] = await pool.query(query, [idCliente]);
        return result.affectedRows > 0; // true si se borró, false si no se encontró
    } catch (error) {
         // Maneja el error si no se puede borrar por tener ventas
         if (error.code === 'ER_ROW_IS_REFERENCED_2') {
             throw new Error("No se puede eliminar el cliente porque tiene ventas asociadas.");
         }
        console.error("Error deleting cliente:", error);
        throw new Error("Error al eliminar el cliente.");
    }
}

export async function findAllProveedores() {
    const query = `
        SELECT id_proveedor, nombre_proveedor, telefono_contacto, direccion 
        FROM PROVEEDOR 
        ORDER BY nombre_proveedor;
    `;
    try {
        const [rows] = await pool.query(query);
        return rows;
    } catch (error) {
        console.error("Error en findAllProveedores:", error);
        throw new Error("Error al consultar todos los proveedores.");
    }
}

/**
 * Encuentra un proveedor por su ID.
 */
export async function findProveedorById(idProveedor) {
    const query = `
        SELECT id_proveedor, nombre_proveedor, telefono_contacto, direccion 
        FROM PROVEEDOR 
        WHERE id_proveedor = ?;
    `;
    try {
        const [rows] = await pool.query(query, [idProveedor]);
        return rows.length > 0 ? rows[0] : null; // Devuelve el primero o null
    } catch (error) {
        console.error("Error en findProveedorById:", error);
        throw new Error("Error al consultar el proveedor por ID.");
    }
}

/**
 * Crea un nuevo proveedor.
 */
export async function createProveedor(proveedorData) {
    const { nombre_proveedor, telefono_contacto, direccion } = proveedorData;

    // Validación básica (nombre es obligatorio en la DB)
    if (!nombre_proveedor) {
        throw new Error("El nombre del proveedor es requerido.");
    }

    const query = `
        INSERT INTO PROVEEDOR (nombre_proveedor, telefono_contacto, direccion) 
        VALUES (?, ?, ?);
    `;
    try {
        const [result] = await pool.query(query, [
            nombre_proveedor,
            telefono_contacto || null, // Permite nulos
            direccion || null         // Permite nulos
        ]);
        return { id_proveedor: result.insertId, ...proveedorData };
    } catch (error) {
        // Podríamos manejar errores de duplicados si hubiera restricciones UNIQUE
        console.error("Error creando proveedor:", error);
        throw new Error("Error al crear el proveedor.");
    }
}

/**
 * Actualiza un proveedor existente.
 */
export async function updateProveedor(idProveedor, proveedorData) {
    const { nombre_proveedor, telefono_contacto, direccion } = proveedorData;

    // Construcción dinámica
    const fieldsToUpdate = [];
    const values = [];

    if (nombre_proveedor !== undefined) { fieldsToUpdate.push('nombre_proveedor = ?'); values.push(nombre_proveedor); }
    if (telefono_contacto !== undefined) { fieldsToUpdate.push('telefono_contacto = ?'); values.push(telefono_contacto); }
    if (direccion !== undefined) { fieldsToUpdate.push('direccion = ?'); values.push(direccion); }
   
    if (fieldsToUpdate.length === 0) {
        console.warn(`No fields to update for supplier ID: ${idProveedor}`);
        return 0; 
    }

    const query = `
        UPDATE PROVEEDOR 
        SET ${fieldsToUpdate.join(', ')} 
        WHERE id_proveedor = ?;
    `;
    values.push(idProveedor);

    try {
        const [result] = await pool.query(query, values);
        return result.affectedRows; // Filas afectadas
    } catch (error) {
        console.error("Error updating proveedor:", error);
        throw new Error("Error al actualizar el proveedor.");
    }
}

/**
 * Elimina un proveedor.
 * ¡Ojo! Si tiene compras asociadas, la DB podría impedirlo.
 * Considera añadir estado 'activo'/'inactivo' en lugar de borrar.
 */
export async function deleteProveedor(idProveedor) {
    const query = `DELETE FROM PROVEEDOR WHERE id_proveedor = ?;`;
    try {
        const [result] = await pool.query(query, [idProveedor]);
        return result.affectedRows > 0; // true si borró
    } catch (error) {
         // Manejar error si tiene compras
         if (error.code === 'ER_ROW_IS_REFERENCED_2') {
             throw new Error("No se puede eliminar el proveedor porque tiene compras asociadas.");
         }
        console.error("Error deleting proveedor:", error);
        throw new Error("Error al eliminar el proveedor.");
    }
}

export async function registrarCompra(idProveedor, idUsuario, items) {
    let connection;

    try {
        // 1. Calcular Monto Total de la Compra
        const montoTotalCompra = items.reduce((total, item) => {
            // El costo viene en 'costo_unitario' del frontend
            return total + (item.costo_unitario * item.cantidad_comprada);
        }, 0);
        
        // 2. Obtener conexión e iniciar transacción
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // 3. Insertar en COMPRA
        const compraQuery = `
            INSERT INTO COMPRA (id_proveedor, id_usuario_reg, monto_total) 
            VALUES (?, ?, ?)
        `;
        const [compraResult] = await connection.query(compraQuery, [
            idProveedor, 
            idUsuario, 
            montoTotalCompra
        ]);
        const idCompra = compraResult.insertId;

        // 4. Preparar datos e insertar en DETALLE_COMPRA
        const detalleData = items.map(item => [
            idCompra,
            item.id_producto,
            item.cantidad_comprada,
            item.costo_unitario // Guardamos el costo al que se compró
        ]);
        const detalleQuery = `
            INSERT INTO DETALLE_COMPRA (id_compra, id_producto, cantidad_comprada, costo_unitario) 
            VALUES ? 
        `;
        await connection.query(detalleQuery, [detalleData]);

        // 5. Actualizar stock en PRODUCTO (+) y registrar MOVIMIENTO_INVENTARIO (+)
        const updateStockQuery = `
            UPDATE PRODUCTO SET stock_actual = stock_actual + ? 
            WHERE id_producto = ?
        `;
        const movimientoQuery = `
            INSERT INTO MOVIMIENTO_INVENTARIO (id_producto, id_usuario_reg, tipo_movimiento, cantidad, referencia_doc) 
            VALUES (?, ?, 'ENTRADA', ?, ?)
        `;
        const referenciaDoc = `Compra #${idCompra}`;

        for (const item of items) {
            // Actualizar stock (+)
            await connection.query(updateStockQuery, [item.cantidad_comprada, item.id_producto]);
            
            // Registrar movimiento (+)
            await connection.query(movimientoQuery, [
                item.id_producto, 
                idUsuario, 
                item.cantidad_comprada, 
                referenciaDoc
            ]);
        }

        // 6. Si todo fue exitoso, confirmar transacción
        await connection.commit();
        
        return { idCompra, montoTotalCompra };

    } catch (error) {
        // 7. Si algo falló, revertir transacción
        if (connection) {
            await connection.rollback();
        }
        console.error("Error en la transacción de compra:", error);
        throw new Error("No se pudo registrar la compra en la base de datos.");

    } finally {
        // 8. Liberar conexión
        if (connection) {
            connection.release();
        }
    }
}

export async function findAllUsuarios() {
    // Excluimos password_hash por seguridad
    const query = `
        SELECT 
            id_usuario, nombre_pila, apellido_paterno, apellido_materno, 
            username, rol, fecha_creacion 
        FROM USUARIO 
        ORDER BY apellido_paterno, nombre_pila;
    `;
    try {
        const [rows] = await pool.query(query);
        return rows;
    } catch (error) {
        console.error("Error en findAllUsuarios:", error);
        throw new Error("Error al consultar todos los usuarios.");
    }
}

/**
 * Encuentra un usuario por ID (sin la contraseña).
 */
export async function findUsuarioById(idUsuario) {
    const query = `
        SELECT 
            id_usuario, nombre_pila, apellido_paterno, apellido_materno, 
            username, rol, fecha_creacion 
        FROM USUARIO 
        WHERE id_usuario = ?;
    `;
    try {
        const [rows] = await pool.query(query, [idUsuario]);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error("Error en findUsuarioById:", error);
        throw new Error("Error al consultar el usuario por ID.");
    }
}

/**
 * Crea un nuevo usuario. Hashea la contraseña.
 */
export async function createUsuario(usuarioData) {
    const { 
        nombre_pila, 
        apellido_paterno, 
        apellido_materno, 
        username, 
        password, // Recibimos la contraseña en texto plano
        rol 
    } = usuarioData;

    // Validación básica
    if (!nombre_pila || !apellido_paterno || !username || !password || !rol) {
        throw new Error("Nombre, apellido paterno, username, contraseña y rol son requeridos.");
    }
    if (!['ADMIN', 'VENDEDOR'].includes(rol)) {
        throw new Error("Rol inválido. Debe ser ADMIN o VENDEDOR.");
    }

    // Hashear la contraseña
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const query = `
        INSERT INTO USUARIO (
            nombre_pila, apellido_paterno, apellido_materno, 
            username, password_hash, rol
        ) VALUES (?, ?, ?, ?, ?, ?);
    `;
    try {
        const [result] = await pool.query(query, [
            nombre_pila,
            apellido_paterno,
            apellido_materno || null,
            username,
            password_hash, // Guardamos el hash
            rol
        ]);
        // Devolvemos los datos SIN la contraseña
        return { 
            id_usuario: result.insertId, 
            nombre_pila, apellido_paterno, apellido_materno, username, rol 
        };
    } catch (error) {
        // Manejar error de username duplicado
        if (error.code === 'ER_DUP_ENTRY') {
             throw new Error(`El nombre de usuario '${username}' ya existe.`);
        }
        console.error("Error creando usuario:", error);
        throw new Error("Error al crear el usuario.");
    }
}

/**
 * Actualiza un usuario existente. Opcionalmente actualiza la contraseña si se provee.
 */
export async function updateUsuario(idUsuario, usuarioData) {
    const { 
        nombre_pila, 
        apellido_paterno, 
        apellido_materno, 
        username, 
        password, // Contraseña nueva (opcional)
        rol 
    } = usuarioData;

    // Construcción dinámica
    const fieldsToUpdate = [];
    const values = [];

    if (nombre_pila !== undefined) { fieldsToUpdate.push('nombre_pila = ?'); values.push(nombre_pila); }
    if (apellido_paterno !== undefined) { fieldsToUpdate.push('apellido_paterno = ?'); values.push(apellido_paterno); }
    if (apellido_materno !== undefined) { fieldsToUpdate.push('apellido_materno = ?'); values.push(apellido_materno); }
    if (username !== undefined) { fieldsToUpdate.push('username = ?'); values.push(username); }
    if (rol !== undefined) { 
        if (!['ADMIN', 'VENDEDOR'].includes(rol)) throw new Error("Rol inválido.");
        fieldsToUpdate.push('rol = ?'); values.push(rol); 
    }
    
    // Si se proporcionó una nueva contraseña, hashearla y añadirla
    if (password) {
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);
        fieldsToUpdate.push('password_hash = ?'); 
        values.push(password_hash);
    }
   
    if (fieldsToUpdate.length === 0) {
        console.warn(`No fields to update for user ID: ${idUsuario}`);
        return 0; 
    }

    const query = `
        UPDATE USUARIO 
        SET ${fieldsToUpdate.join(', ')} 
        WHERE id_usuario = ?;
    `;
    values.push(idUsuario);

    try {
        const [result] = await pool.query(query, values);
        return result.affectedRows; // Filas afectadas
    } catch (error) {
         if (error.code === 'ER_DUP_ENTRY') {
             throw new Error(`El nombre de usuario '${username}' ya existe.`);
        }
        console.error("Error updating usuario:", error);
        throw new Error("Error al actualizar el usuario.");
    }
}

// Opcional: Función para "desactivar" en lugar de borrar
// export async function deactivateUsuario(idUsuario) { ... }

// Opcional: Función para borrar (¡Cuidado! Podría tener registros asociados)
export async function deleteUsuario(idUsuario) {
     // Añadir comprobación: ¿Es el último admin? ¿Es el usuario actual?
     const currentUserCheck = await findUsuarioById(idUsuario);
     if (!currentUserCheck) return false; // No encontrado
     // Podrías añadir lógica para prevenir borrar el único admin o a sí mismo

    const query = `DELETE FROM USUARIO WHERE id_usuario = ?;`;
    try {
        const [result] = await pool.query(query, [idUsuario]);
        return result.affectedRows > 0; 
    } catch (error) {
         // Manejar error si tiene ventas/compras asociadas
         if (error.code === 'ER_ROW_IS_REFERENCED_2') {
             throw new Error("No se puede eliminar el usuario porque tiene registros asociados (ventas/compras). Considere desactivarlo.");
         }
        console.error("Error deleting usuario:", error);
        throw new Error("Error al eliminar el usuario.");
    }
}

export async function findAllCategorias() {
    const query = `
        SELECT id_categoria, nombre_categoria, descripcion 
        FROM CATEGORIA 
        ORDER BY nombre_categoria;
    `;
    try {
        const [rows] = await pool.query(query);
        return rows;
    } catch (error) {
        console.error("Error en findAllCategorias:", error);
        throw new Error("Error al consultar todas las categorías.");
    }
}

/**
 * Encuentra una categoría por su ID.
 */
export async function findCategoriaById(idCategoria) {
    const query = `
        SELECT id_categoria, nombre_categoria, descripcion 
        FROM CATEGORIA 
        WHERE id_categoria = ?;
    `;
    try {
        const [rows] = await pool.query(query, [idCategoria]);
        return rows.length > 0 ? rows[0] : null; // Devuelve la primera o null
    } catch (error) {
        console.error("Error en findCategoriaById:", error);
        throw new Error("Error al consultar la categoría por ID.");
    }
}

/**
 * Crea una nueva categoría.
 */
export async function createCategoria(categoriaData) {
    const { nombre_categoria, descripcion } = categoriaData;

    // Validación básica (nombre es obligatorio y único)
    if (!nombre_categoria) {
        throw new Error("El nombre de la categoría es requerido.");
    }

    const query = `
        INSERT INTO CATEGORIA (nombre_categoria, descripcion) 
        VALUES (?, ?);
    `;
    try {
        const [result] = await pool.query(query, [
            nombre_categoria,
            descripcion || null // Permite descripción nula
        ]);
        return { id_categoria: result.insertId, ...categoriaData };
    } catch (error) {
        // Manejar error de nombre duplicado
        if (error.code === 'ER_DUP_ENTRY') {
             throw new Error(`La categoría '${nombre_categoria}' ya existe.`);
        }
        console.error("Error creando categoría:", error);
        throw new Error("Error al crear la categoría.");
    }
}

/**
 * Actualiza una categoría existente.
 */
export async function updateCategoria(idCategoria, categoriaData) {
    const { nombre_categoria, descripcion } = categoriaData;

    // Construcción dinámica
    const fieldsToUpdate = [];
    const values = [];

    if (nombre_categoria !== undefined) { fieldsToUpdate.push('nombre_categoria = ?'); values.push(nombre_categoria); }
    if (descripcion !== undefined) { fieldsToUpdate.push('descripcion = ?'); values.push(descripcion); }
   
    if (fieldsToUpdate.length === 0) {
        console.warn(`No fields to update for category ID: ${idCategoria}`);
        return 0; 
    }

    const query = `
        UPDATE CATEGORIA 
        SET ${fieldsToUpdate.join(', ')} 
        WHERE id_categoria = ?;
    `;
    values.push(idCategoria);

    try {
        const [result] = await pool.query(query, values);
        return result.affectedRows; // Filas afectadas
    } catch (error) {
         if (error.code === 'ER_DUP_ENTRY') {
             throw new Error(`La categoría '${nombre_categoria}' ya existe.`);
        }
        console.error("Error updating categoría:", error);
        throw new Error("Error al actualizar la categoría.");
    }
}

/**
 * Elimina una categoría.
 * ¡Ojo! Si la categoría tiene productos asociados, la DB podría impedirlo.
 * Sería mejor desactivarla o reasignar productos.
 */
export async function deleteCategoria(idCategoria) {
    const query = `DELETE FROM CATEGORIA WHERE id_categoria = ?;`;
    try {
        const [result] = await pool.query(query, [idCategoria]);
        return result.affectedRows > 0; // true si borró
    } catch (error) {
         // Manejar error si tiene productos asociados
         if (error.code === 'ER_ROW_IS_REFERENCED_2') {
             throw new Error("No se puede eliminar la categoría porque tiene productos asociados.");
         }
        console.error("Error deleting categoría:", error);
        throw new Error("Error al eliminar la categoría.");
    }
}

export async function getDashboardMetrics() {
    // Definimos las consultas SQL
    const pedidosPendientesQuery = `SELECT COUNT(*) AS total FROM PEDIDO_WEB WHERE estado = 'INICIADO';`;
    // Ventas de los últimos 7 días (ajusta el intervalo si quieres)
    const ventasRecientesQuery = `
        SELECT COUNT(*) AS count, SUM(monto_total) AS total_amount 
        FROM VENTA 
        WHERE fecha_venta >= DATE_SUB(CURDATE(), INTERVAL 7 DAY);
    `; 
    // Productos con stock bajo (ej: <= 5)
    const stockBajoQuery = `SELECT COUNT(*) AS total FROM PRODUCTO WHERE stock_actual <= 5 AND estado = 'ACTIVO';`;
    // Nuevos clientes (ej: registrados en los últimos 7 días)
    const nuevosClientesQuery = `
        SELECT COUNT(*) AS total 
        FROM CLIENTE 
        WHERE fecha_registro >= DATE_SUB(CURDATE(), INTERVAL 7 DAY);
    `;

   try {
        const [
            pedidosQueryResult, // Cambiamos nombre para claridad
            ventasQueryResult, 
            stockQueryResult, 
            clientesQueryResult
        ] = await Promise.all([
            pool.query(pedidosPendientesQuery),
            pool.query(ventasRecientesQuery),
            pool.query(stockBajoQuery),
            pool.query(nuevosClientesQuery)
        ]);


        // Extraer la primera fila (que contiene el COUNT/SUM)
        const pedidosResult = pedidosQueryResult[0][0]; 
        const ventasResult = ventasQueryResult[0][0]; 
        const stockResult = stockQueryResult[0][0]; 
        const clientesResult = clientesQueryResult[0][0]; 

        const metrics = {
            pedidosPendientes: pedidosResult?.total || 0, // Usar optional chaining por si acaso
            ventasRecientesCount: ventasResult?.count || 0,
            ventasRecientesAmount: parseFloat(ventasResult?.total_amount || 0),
            productosBajoStock: stockResult?.total || 0,
            nuevosClientes: clientesResult?.total || 0
        };

        return metrics;

    } catch (error) {
        console.error("Error en getDashboardMetrics:", error);
        throw new Error("Error al calcular las métricas del dashboard.");
    }
}

export async function getSalesDataForChart(days = 7) {
    // Consulta que agrupa las ventas por fecha y suma los montos
    const query = `
        SELECT 
            DATE(fecha_venta) AS sale_date, 
            SUM(monto_total) AS total_sales
        FROM VENTA
        WHERE fecha_venta >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        GROUP BY DATE(fecha_venta)
        ORDER BY sale_date ASC;
    `;
    try {
        const [rows] = await pool.query(query, [days]);
        // Formatear para que sea fácil de usar en librerías de gráficos
        return rows.map(row => ({
            date: row.sale_date.toISOString().split('T')[0], // Formato YYYY-MM-DD
            sales: parseFloat(row.total_sales)
        }));
    } catch (error) {
        console.error("Error en getSalesDataForChart:", error);
        throw new Error("Error al obtener datos de ventas para el gráfico.");
    }
}

/**
 * Obtiene las últimas N actividades (ej: últimas 5 ventas registradas).
 */
export async function getRecentActivity(limit = 5) {
    // Podríamos combinar ventas y pedidos web, pero empecemos con ventas
    const query = `
        SELECT 
            v.id_venta, 
            v.fecha_venta, 
            v.monto_total, 
            c.nombre_pila_cliente, 
            c.apellido_paterno_cliente
        FROM VENTA v
        JOIN CLIENTE c ON v.id_cliente = c.id_cliente
        ORDER BY v.fecha_venta DESC
        LIMIT ?;
    `;
    try {
        const [rows] = await pool.query(query, [limit]);
        return rows.map(row => ({
             ...row,
             monto_total: parseFloat(row.monto_total) // Asegurar que sea número
        }));
    } catch (error) {
        console.error("Error en getRecentActivity:", error);
        throw new Error("Error al obtener la actividad reciente.");
    }
}