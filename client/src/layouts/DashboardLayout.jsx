import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
// El Header/Navbar no se renderiza aquí, sino en el padre (App.jsx),
// por lo que no necesitamos importarlo aquí.
// import Navbar from '../components/Header.jsx'; 

function DashboardLayout() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Protección (sin cambios)
    if (!localStorage.getItem('token') || !user.rol) {
        window.location.href = '/login';
        return null;
    }

    return (
        // --- CORRECCIÓN AQUÍ ---
        // Cambiamos 'h-full' por 'h-[calc(100vh-5rem)]'
        // Esto le da al layout la altura exacta restante debajo del header.
        <div className="flex h-[calc(100vh-5rem)] bg-gray-100">
            
            {/* El Sidebar ya tiene su altura calculada, lo cual está perfecto */}
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default DashboardLayout;