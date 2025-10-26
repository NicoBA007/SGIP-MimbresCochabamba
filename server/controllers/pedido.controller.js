import { createPedidoWeb } from '../services/pedido.service.js';

/**
 * Endpoint: POST /api/pedidos
 * Registra un nuevo pedido web desde el carrito del cliente.
 */
export async function registrarPedido(req, res) {
    // 1. Obtener los datos del 'body' de la petición
    const { telefono_whatsapp, items } = req.body;

    // 2. Validación básica de entrada
    if (!telefono_whatsapp || !items || items.length === 0) {
        return res.status(400).json({ 
            message: "Faltan datos. Se requiere un 'telefono_whatsapp' y 'items' en el carrito." 
        });
    }

    try {
        // 3. Llamar al servicio que contiene la transacción
        const nuevoPedido = await createPedidoWeb(telefono_whatsapp, items);

        // 4. Responder con éxito
        res.status(201).json({ 
            message: "Pedido registrado con éxito.", 
            pedido: nuevoPedido 
        });

    } catch (error) {
        // 5. Manejar errores del servicio
        console.error("Error en registrarPedido:", error.message);
        res.status(500).json({ message: "Error interno del servidor al registrar el pedido." });
    }
}