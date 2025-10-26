import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { checkConnection } from './config/db.config.js'; 
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import pedidoRoutes from './routes/pedido.routes.js';
import panelRoutes from './routes/panel.routes.js';
import uploadRoutes from './routes/upload.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001; 

// Middlewares
app.use(cors()); 
app.use(express.json()); 

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api', productRoutes);
app.use('/api', pedidoRoutes);
app.use('/api', panelRoutes);
app.use('/api', uploadRoutes);

app.get('/', (req, res) => {
    res.status(200).json({ 
        message: "API SGIP Mimbres Cochabamba está funcionando!"
    });
});

// Comprobar la conexión antes de iniciar el servidor
checkConnection(); 

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});