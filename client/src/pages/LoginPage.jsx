import React from 'react';
import axios from 'axios';
import { LogIn, Loader2 } from 'lucide-react';
import Logo from '../assets/TERCER USO.png'; 

const API_URL = 'http://localhost:3001/api/auth/login'; 

function LoginPage() {
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    
    const handleLogin = async (e) => {
        e.preventDefault();
        setError(''); 
        if (!username || !password) {
            setError('Por favor, ingrese su usuario y contraseña.');
            return;
        }
        setIsLoading(true); 
        try {
            const response = await axios.post(API_URL, { username, password });
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            if (user.rol === 'ADMIN' || user.rol === 'VENDEDOR') {
                window.location.href = '/panel/dashboard'; 
            }
        } catch (err) {
            const message = err.response?.data?.message || "Error de red. Asegúrese que el servidor de Node.js esté activo.";
            setError(message);
        } finally {
            setIsLoading(false); 
        }
    };

    return (
        // --- LA CORRECCIÓN ESTÁ AQUÍ ---
        // 'h-20' es la altura de tu Header (5rem)
        // 'min-h-[calc(100vh-5rem)]' le dice a este div que ocupe
        // el 100% de la altura MENOS los 5rem (80px) del header.
        <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-gray-50 p-4">
            
            {/* El resto del código es idéntico */}
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-10 transform transition-all duration-300">
                
                <div className="text-center mb-10">
                    <img className="mx-auto w-64 h-auto mb-4" src={Logo} alt="Mimbres Cochabamba" />
                    <h2 className="text-3xl font-bold text-[#644c44] mt-4">
                        Acceso al Panel
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                        {isLoading ? 'Verificando...' : 'Vendedor o Administrador'}
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-600">
                            Nombre de Usuario
                        </label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#e3a45c] focus:ring-2 focus:ring-[#e3a45c]/50 transition-colors duration-200"
                            placeholder="ej: dixie.a o nicolas.b"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-600">
                            Contraseña
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#e3a45c] focus:ring-2 focus:ring-[#e3a45c]/50 transition-colors duration-200"
                        />
                    </div>

                    {error && (
                        <div className="p-3 text-sm font-medium text-white bg-[#a4544c] rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent rounded-lg text-base font-medium text-white transition-all duration-300 transform 
                            ${isLoading 
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                : 'bg-[#644c44] hover:bg-[#a4544c] hover:-translate-y-0.5 shadow-lg shadow-[#644c44]/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e3a45c]'
                            }`}
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <LogIn className="h-5 w-5" />
                            )}
                            <span>{isLoading ? 'Cargando...' : 'Iniciar Sesión'}</span>
                        </button>
                    </div>
                </form>
                
            </div>
        </div>
    );
}

export default LoginPage;