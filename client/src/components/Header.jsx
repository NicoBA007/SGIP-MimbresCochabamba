import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Search, Eye } from 'lucide-react'; 
import Logo from '../assets/SEGUNDO USO.png';
import { useCartStore } from '../store/cart.store.js';
import '../index.css';

function Header({ onSearch }) {
    const location = useLocation();
    const totalItems = useCartStore(state => state.getTotalItems());
    const [user, setUser] = React.useState(null);

    React.useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) { setUser(JSON.parse(userData)); } else { setUser(null); }
    }, [location.pathname]);

    const isPanelPage = location.pathname.startsWith('/panel');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    return (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-md h-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">

                    <Link to={user ? "/panel/dashboard" : "/"} className="flex-shrink-0">
                        <img 
                            className="h-14 w-auto transition-transform duration-300 ease-out hover:scale-105" 
                            src={Logo} 
                            alt="Mimbres Cochabamba Logo" 
                        />
                    </Link>

                    {!isPanelPage && (
                        <div className="flex items-center space-x-4 sm:space-x-6">

                            {typeof onSearch === 'function' && (
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Search className="h-5 w-5 text-gray-500" />
                                    </div>
                                    <input
                                        className="block w-full max-w-xs pl-11 pr-4 py-2.5 border border-gray-200 rounded-full leading-5 bg-gray-100 text-sm placeholder-gray-500 focus:outline-none focus:bg-white focus:border-[#e3a45c] focus:ring-2 focus:ring-[#e3a45c]/50 transition-all duration-300 ease-out"
                                        placeholder="Buscar productos..." type="search"
                                        onChange={(e) => onSearch(e.target.value)}
                                    />
                                </div>
                            )}

                            {/* Carrito */}
                            <Link 
                                to="/carrito" 
                                className="p-2 rounded-full text-[#644c44] hover:text-[#a4544c] hover:bg-gray-100 relative transition-colors duration-200" 
                                aria-label="Carrito de Compras"
                            >
                                <ShoppingCart className="h-6 w-6" />
                                {totalItems > 0 && (
                                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-[#a4544c] rounded-full">{totalItems}</span>
                                )}
                            </Link>
                        </div>
                    )}

                    {isPanelPage && user && (
                        <div className="flex items-center space-x-4 md:space-x-6">
                            
                            <Link 
                                to="/" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="group hidden sm:flex items-center text-sm font-medium text-[#644c44] hover:text-[#a4544c] transition-colors duration-200"
                            >
                                <Eye className="w-4 h-4 mr-1.5 transition-transform duration-300 ease-out group-hover:scale-110" /> 
                                Ver sitio
                            </Link>
                            
                           
                        </div>
                    )}

                </div>
            </div>
        </header>
    );
}

export default Header;