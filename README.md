# SGIP Mimbres Cochabamba

Sistema de Gestión de Inventario y Pedidos (SGIP) para Mimbres Cochabamba.

## Stack Tecnológico
* **Frontend:** React, Vite, Tailwind CSS, Zustand, Recharts
* **Backend:** Node.js, Express, MySQL
* **Auth:** JWT (Tokens JSON Web)

## Instalación

1.  **Clonar el repositorio:**
    ```bash
    git clone [URL_DE_TU_REPOSITORIO_GIT]
    cd mimbres-cochabamba-sgip-FINAL
    ```

2.  **Instalar Backend:**
    ```bash
    cd server
    npm install
    ```

3.  **Instalar Frontend:**
    ```bash
    cd ../client
    npm install
    ```

4.  **Configurar Base de Datos:**
    * Asegúrate de tener MySQL instalado y corriendo.
    * Crea una base de datos (ej. `sgip_mimbrescochabamba`).
    * Importa el esquema y los datos desde la carpeta `database/`:
        ```bash
        mysql -u tu_usuario -p sgip_mimbrescochabamba < database/Dump20251026.sql
        ```

5.  **Configurar Entorno (Backend):**
    * En la carpeta `server/`, copia `.env.example` a un nuevo archivo llamado `.env`.
    * Edita `.env` con tus credenciales de base de datos y un `JWT_SECRET`.

## Ejecución

1.  **Iniciar Backend (desde `server/`):**
    ```bash
    npm run dev
    ```
2.  **Iniciar Frontend (desde `client/`):**
    ```bash
    npm run dev
    ```