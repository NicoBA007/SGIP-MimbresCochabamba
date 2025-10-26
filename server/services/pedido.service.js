import { pool } from '../config/db.config.js';

/**
 * Crea un nuevo Pedido Web (usando una transacción).
 */
export async function createPedidoWeb(telefono, items) {
    let connection;

    try {
        // 1. Calcular el monto total (lo necesitamos para la tabla PEDIDO_WEB)
        const montoEstimado = items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);

        // 2. Obtener una conexión del pool
        connection = await pool.getConnection();

        // 3. Iniciar la transacción
        await connection.beginTransaction();

        // 4. Insertar en la tabla principal 'PEDIDO_WEB'
        const pedidoQuery = `
            INSERT INTO PEDIDO_WEB (telefono_whatsapp, monto_estimado, estado) 
            VALUES (?, ?, 'INICIADO')
        `;
        const [pedidoResult] = await connection.query(pedidoQuery, [telefono, montoEstimado]);
        
        // Obtenemos el ID del pedido que acabamos de crear
        const idPedidoWeb = pedidoResult.insertId;

        // 5. Preparar los datos para 'DETALLE_PEDIDO_WEB'
        // Mapeamos los 'items' del carrito al formato que la DB espera
        const detalleData = items.map(item => [
            idPedidoWeb,
            item.id,         // id_producto
            item.quantity,   // cantidad_solicitada
            item.price       // precio_unitario_registro
        ]);

        // 6. Insertar todos los detalles en la tabla 'DETALLE_PEDIDO_WEB'
        const detalleQuery = `
            INSERT INTO DETALLE_PEDIDO_WEB (id_pedido_web, id_producto, cantidad_solicitada, precio_unitario_registro) 
            VALUES ?
        `;
        // Usamos '?' (singular) para un 'bulk insert' (inserción múltiple)
        await connection.query(detalleQuery, [detalleData]);

        // 7. Si todo salió bien, confirmamos la transacción
        await connection.commit();
        
        return { idPedidoWeb, montoEstimado, itemsRegistrados: items.length };

    } catch (error) {
        // 8. Si algo falló, revertimos la transacción
        if (connection) {
            await connection.rollback();
        }
        console.error("Error en la transacción del pedido:", error);
        throw new Error("No se pudo registrar el pedido en la base de datos.");

    } finally {
        // 9. Siempre liberamos la conexión al final
        if (connection) {
            connection.release();
        }
    }
}