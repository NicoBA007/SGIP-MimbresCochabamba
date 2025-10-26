import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
};

const pool = mysql.createPool(dbConfig);

async function checkConnection() {
    try {
        const connection = await pool.getConnection();
        console.log("✅ Conexión a MySQL exitosa.");
        connection.release();
    } catch (error) {
        console.error("❌ Error al conectar a MySQL:", error.message);
        process.exit(1);
    }
}

export { pool, checkConnection };