import React from 'react';
import { LayoutDashboard, Users, ShoppingCart, Package, DollarSign, LogOut, Settings, ListOrdered, Factory, Layers } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';


const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/panel/dashboard', roles: ['ADMIN', 'VENDEDOR'] },
    { name: 'Registro de Venta', icon: DollarSign, path: '/panel/ventas/registro', roles: ['ADMIN', 'VENDEDOR'] },
    { name: 'Pedidos Web', icon: ListOrdered, path: '/panel/pedidos', roles: ['ADMIN', 'VENDEDOR'] },
    { name: 'Inventario', icon: Package, path: '/panel/inventario', roles: ['ADMIN'] },
    { name: 'Categorías', icon: Layers, path: '/panel/categorias', roles: ['ADMIN'] },
    { name: 'Clientes', icon: Users, path: '/panel/clientes', roles: ['ADMIN'] },
    { name: 'Proveedores/Compras', icon: Factory, path: '/panel/compras', roles: ['ADMIN'] },
    { name: 'Gestión de Usuarios', icon: Users, path: '/panel/usuarios', roles: ['ADMIN'] },
];

function Sidebar() {
    // --- Lógica de React (sin cambios) ---
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userRole = user.rol;

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    const filteredItems = navItems.filter(item => item.roles.includes(userRole));
    // --- Fin de la Lógica ---

    return (
        // --- CAMBIO 1: h-screen por h-[calc(100vh-5rem)] ---
        // 'h-20' (5rem) es la altura de tu Header.
        <div className="relative w-64 flex-shrink-0 h-[calc(100vh-5rem)] bg-mimbres-cream flex flex-col justify-between shadow-lg">

            {/* Div para el borde gradiente (sin cambios) */}
            <div className="absolute top-0 bottom-0 left-0 w-6 bg-gradient-to-b from-mimbres-primary to-mimbres-tertiary"></div>

            {/* Contenido principal (con padding izquierdo) */}
            {/* --- CAMBIO 2: Añadido overflow-hidden aquí --- */}
            <div className="flex flex-col pl-6 flex-1 overflow-hidden"> {/* 'flex-1' y 'overflow-hidden' para contener la nav */}

                
                {/* Navegación */}
                {/* --- CAMBIO 3: Añadido overflow-y-auto aquí --- */}
                {/* Esto permite que SÓLO la lista de enlaces haga scroll si es muy larga */}
                <nav className="mt-5 flex-1 pr-3 space-y-2 overflow-y-auto"> 
                    {filteredItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                // Clases (sin cambios)
                                className={`group flex items-center px-4 py-3 text-sm rounded-md transition-colors duration-150 ease-in-out
                                    ${isActive
                                        ? 'bg-mimbres-peach text-mimbres-primary font-semibold shadow-inner' 
                                        : 'text-gray-600 hover:bg-mimbres-peach/50 hover:text-mimbres-primary'
                                    }`
                                }
                            >
                                <Icon
                                    // Clases (sin cambios)
                                    className={`mr-3 flex-shrink-0 h-5 w-5 ${isActive ? 'text-mimbres-primary' : 'text-gray-500 group-hover:text-mimbres-primary'}`}
                                    aria-hidden="true"
                                />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Sección Inferior: Usuario y Logout (sin cambios) */}
            <div className="pl-3 pr-3 pb-4"> 
                <div className="border-t border-gray-200 pt-4">
                    <div className="text-center mb-3">
                            <p className="text-xs text-gray-500">Bienvenido,</p>
                            <p className="text-sm font-medium text-gray-700">{user.username} ({userRole})</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium rounded-md text-mimbres-primary bg-mimbres-peach/50 hover:bg-mimbres-peach hover:text-mimbres-primary transition duration-150 ease-in-out"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Sidebar;