import React from 'react';
import { Phone, Mail, MapPin, Facebook, MessageSquare, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../assets/TERCER USO.png';

function Footer() {
    const contactInfo = [
        { icon: Phone, text: '641-754-0072' },
        { icon: Mail, text: 'info@mimbrescochabamba.com' },
        { icon: MapPin, text: '1718 Park Boulevard, Cochabamba, BO' },
    ];

    const socialLinks = [
        { icon: MessageSquare, link: 'https://wa.me/59163418018', label: 'WhatsApp' },
        { icon: Facebook, link: 'https://facebook.com/mimbres', label: 'Facebook' },
    ];

    const internalLinks = [
        { name: 'Inicio', path: '/' },
        { name: 'Nosotros', path: '/nosotros' },
        { name: 'Contacto', path: '/contacto' },
    ];

    return (
        // --- AJUSTES CLAVE EN ESTILOS DEL FOOTER ---
        // Aumentamos el padding vertical considerablemente para darle más "aire".
        // py-24 (6rem arriba y abajo)
        <footer className="bg-[#644c44] text-gray-300 py-24 md:py-28">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">

                    {/* Columna 1: Logo, Slogan y Contacto (con Login Oculto) */}
                    <div className="md:col-span-2 lg:col-span-1 space-y-6">

                        {/* === LOGIN OCULTO (FUNCIONALIDAD PRESERVADA) === */}
                        <Link
                            to="/login"
                            title="Acceso al Panel de Gestión (Vendedor/Admin)"
                            className="inline-block cursor-pointer group"
                        >
                            {/* --- AJUSTE DE TAMAÑO --- */}
                            {/* Aumentamos el tamaño de h-20 (80px) a h-28 (112px) */}
                            {/* para que el logo tenga una presencia adecuada. */}
                            <img
                                className="h-28 w-auto transition-transform duration-300 ease-out group-hover:scale-105"
                                src={Logo}
                                alt="Mimbres Cochabamba Logo"
                            />
                            {/* Mantenemos el texto oculto como indicaste */}
                            <span className="text-xs font-normal text-[#a4544c] opacity-0 block mt-2 group-hover:opacity-100 transition-opacity duration-300">
                                Acceder al SGIP
                            </span>
                        </Link>
                        {/* === FIN DE LOGIN OCULTO === */}

                        {/* Slogan (manteniendo el estilo, pero ahora en un footer más grande) */}
                        <p className="text-md italic text-[#e3a45c]">
                            "Tu hogar es donde tú lo creas"
                        </p>
                    </div>

                    {/* Columna 2: Navegación (Enlaces) */}
                    <div>
                        <h3 className="text-xl font-semibold text-white mb-6">Navegación</h3> {/* Título más grande y con más margen */}
                        <ul className="space-y-4 text-base"> {/* Espacio y tamaño de texto ajustados */}
                            {internalLinks.map(link => (
                                <li key={link.name}>
                                    <Link
                                        to={link.path}
                                        className="text-gray-300 hover:text-[#e3a45c] hover:translate-x-1 transition-all duration-300 ease-out block"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Columna 3: Contacto */}
                    <div>
                        <h3 className="text-xl font-semibold text-white mb-6">Contacto</h3> {/* Título más grande y con más margen */}
                        <div className="space-y-4"> {/* Más espacio entre elementos de contacto */}
                            {contactInfo.map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <div key={index} className="flex items-start space-x-3 text-base"> {/* Icono y texto más grandes */}
                                        <Icon className="w-5 h-5 text-[#a4544c] flex-shrink-0 mt-0.5" />
                                        <span>{item.text}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Columna 4: Redes Sociales */}
                    <div>
                        <h3 className="text-xl font-semibold text-white mb-6">Redes Sociales</h3> {/* Título más grande y con más margen */}
                        <div className="flex space-x-4"> {/* Más espacio entre íconos */}
                            {socialLinks.map(social => {
                                const Icon = social.icon;
                                return (
                                    <a
                                        key={social.label}
                                        href={social.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center h-12 w-12 bg-white/10 rounded-full text-white hover:bg-[#a4544c] hover:scale-110 transition-all duration-300 ease-out" // Íconos más grandes
                                        aria-label={social.label}
                                    >
                                        <Icon className="w-6 h-6" /> {/* Icono interno también más grande */}
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* --- BARRA DE COPYRIGHT --- */}
                {/* Más espacio antes del copyright, texto más legible */}
                <div className="border-t border-white/10 mt-20 pt-8 text-center text-sm text-gray-400"> {/* mt-20 (más margen superior) */}
                    &copy; {new Date().getFullYear()} Mimbres Cochabamba. Todos los derechos reservados.
                </div>
            </div>
        </footer>
    );
}

export default Footer;