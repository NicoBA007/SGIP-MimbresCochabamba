import React, { useState } from 'react'; // Importar useState
import ReactDOM from 'react-dom/client';
import './index.css'; // Asegúrate que la ruta sea correcta
// Importar useLocation junto con los demás de react-router-dom
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Importar Header (UNA SOLA VEZ)
import Header from './components/Header.jsx';

// Importar Páginas y Layouts
import CatalogoPage from './pages/CatalogoPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import CartPage from './pages/CartPage.jsx';
import PedidosPage from './pages/PedidosPage.jsx';
import RegistroVentaPage from './pages/RegistroVentaPage.jsx';
import InventarioPage from './pages/InventarioPage.jsx';
import CrearProductoPage from './pages/CrearProductoPage.jsx';
import EditarProductoPage from './pages/EditarProductoPage.jsx';
import ClientesPage from './pages/ClientesPage.jsx';
import CrearClientePage from './pages/CrearClientePage.jsx';
import EditarClientePage from './pages/EditarClientePage.jsx';
import ComprasPage from './pages/ComprasPage.jsx';
import CrearProveedorPage from './pages/CrearProveedorPage.jsx';
import EditarProveedorPage from './pages/EditarProveedorPage.jsx';
import UsuariosPage from './pages/UsuariosPage.jsx';
import CrearUsuarioPage from './pages/CrearUsuarioPage.jsx';
import EditarUsuarioPage from './pages/EditarUsuarioPage.jsx';
import CategoriasPage from './pages/CategoriasPage.jsx';

// --- Componente Wrapper ---
const AppWrapper = () => {
    // Estas funciones ahora están definidas porque se importaron arriba
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    // Pasar onSearch solo si estamos en la ruta '/'
    const passOnSearch = location.pathname === '/' ? handleSearch : undefined;

    return (
        // Contenedor principal flex column, altura pantalla
        <div className="flex flex-col h-screen">
            {/* Header global con prop condicional */}
            <Header onSearch={passOnSearch} />

            {/* Toaster */}
            <Toaster
              position="top-right"
              toastOptions={{
                className: 'shadow-lg',
                style: { background: '#333', color: '#fff', },
              }}
            />

            {/* Contenedor para el resto del contenido (rutas) */}
            <div className="flex-1 overflow-auto">
                {/* --- TODAS LAS RUTAS VAN AQUÍ DENTRO --- */}
                <Routes>
                    {/* Rutas Públicas */}
                    <Route path="/" element={<CatalogoPage searchTerm={searchTerm} />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/producto/:id" element={<ProductDetailPage />} />
                    <Route path="/carrito" element={<CartPage />} />

                    {/* Rutas Protegidas */}
                    <Route path="/panel" element={<ProtectedRoute element={<DashboardLayout />} />}>
                        <Route path="dashboard" element={<DashboardPage />} />
                        <Route path="pedidos" element={<PedidosPage />} />
                        <Route path="ventas/registro" element={<RegistroVentaPage />} />
                        <Route path="inventario" element={<InventarioPage />} />
                        <Route path="inventario/crear" element={<CrearProductoPage />} />
                        <Route path="inventario/editar/:id" element={<EditarProductoPage />} />
                        <Route path="clientes" element={<ClientesPage />} />
                        <Route path="clientes/crear" element={<CrearClientePage />} />
                        <Route path="clientes/editar/:id" element={<EditarClientePage />} />
                        <Route path="compras" element={<ComprasPage />} />
                        <Route path="proveedores/crear" element={<CrearProveedorPage />} />
                        <Route path="proveedores/editar/:id" element={<EditarProveedorPage />} />
                        <Route path="usuarios" element={<UsuariosPage />} />
                        <Route path="usuarios/crear" element={<CrearUsuarioPage />} />
                        <Route path="usuarios/editar/:id" element={<EditarUsuarioPage />} />
                        <Route path="categorias" element={<CategoriasPage />} />
                        <Route index element={<Navigate to="dashboard" />} />
                    </Route>
                </Routes>
                 {/* --- FIN DE LAS RUTAS --- */}
            </div>
        </div>
    );
};

// --- Funciones isAuthenticated y ProtectedRoute ---
const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};
const ProtectedRoute = ({ element }) => {
  return isAuthenticated() ? element : <Navigate to="/login" />;
};

// --- Renderizado Principal ---
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* --- 👇 Renderizar SÓLO el AppWrapper 👇 --- */}
      <AppWrapper />
      {/* --- 👆 --- */}
    </BrowserRouter>
  </React.StrictMode>,
);