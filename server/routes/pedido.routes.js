import { Router } from 'express';
import { registrarPedido } from '../controllers/pedido.controller.js';

const router = Router();

// Define el endpoint: POST /api/pedidos
router.post('/pedidos', registrarPedido);

export default router;