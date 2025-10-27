import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

function DashboardLayout() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!localStorage.getItem('token') || !user.rol) {
        window.location.href = '/login';
        return null;
    }

    return (
        <div className="flex h-[calc(100vh-5rem)] bg-gray-100">
            
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