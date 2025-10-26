import React, { useState, useEffect } from 'react';
import authApi from '../api/authApi.js';
import { ShoppingCart, Package, Users, AlertTriangle, ListOrdered, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { toast } from 'react-hot-toast';

// --- MetricCard (Sin cambios) ---
const MetricCard = ({ title, value, icon: Icon, borderColor, iconColor }) => {
    return (
        <div className={`bg-white p-6 rounded-2xl shadow-xl border-l-4 ${borderColor} transition-all duration-300 ease-out hover:shadow-2xl hover:-translate-y-1`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="text-3xl font-bold text-[#644c44] mt-1">{value}</p>
                </div>
                <Icon className={`w-8 h-8 ${iconColor}`} />
            </div>
        </div>
    );
};
// --- Fin de MetricCard ---


function DashboardPage() {
    // --- Lógica de React (Sin cambios) ---
    const [metrics, setMetrics] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);
                const [metricsRes, chartRes, activityRes] = await Promise.all([
                    authApi.get('/panel/dashboard-metrics'),
                    authApi.get('/panel/sales-chart-data'),
                    authApi.get('/panel/recent-activity')
                ]);
                setMetrics(metricsRes.data);
                setChartData(chartRes.data);
                setRecentActivity(activityRes.data);
            } catch (err) {
                console.error("Fallo al cargar datos del dashboard:", err);
                const msg = err.response?.data?.message || "No se pudieron cargar los datos.";
                setError(msg);
                if (err.response?.status === 401) toast.error("Sesión expirada.");
            } finally {
                setLoading(false);
            }
        };
        loadDashboardData();
    }, []);
    // --- Fin de la Lógica ---

    // --- Estados de Carga (Sin cambios) ---
    if (loading) return (
        <div className="flex items-center justify-center p-24 text-lg text-gray-600">
            <Loader2 className="w-8 h-8 mr-3 animate-spin text-[#a4544c]" />
            Cargando dashboard...
        </div>
    );
    
    if (error) return (
        <div className="flex flex-col items-center justify-center p-24 text-lg text-[#a4544c] font-medium">
            <AlertTriangle className="w-10 h-10 mb-4" />
            Error: {error}
        </div>
    );

    if (!metrics) return (
        <div className="flex items-center justify-center p-24 text-lg text-gray-500">
            No se pudieron cargar las métricas.
        </div>
    );

    return (
        // --- LA CORRECCIÓN ESTÁ AQUÍ ---
        // Eliminamos 'h-[calc(100vh-5rem)]' y 'overflow-y-auto'.
        // Dejamos que sea un contenedor simple. El layout se encargará del scroll.
        <div className="p-4 md:p-8 bg-gray-50">
            
            {/* Título (Sin cambios) */}
            <h1 className="text-4xl font-bold text-[#a4544c] mb-8">Estadísticas del Sitio</h1>

            {/* Fila de Métricas (Sin cambios) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard title="Pedidos Web Pendientes" value={metrics.pedidosPendientes} icon={ListOrdered} borderColor="border-[#e3a45c]" iconColor="text-[#e3a45c]"/>
                <MetricCard title="Productos Bajo Stock (<=5)" value={metrics.productosBajoStock} icon={AlertTriangle} borderColor="border-[#a4a45c]" iconColor="text-[#a4544c]"/>
                <MetricCard title="Ventas (Últimos 7 días)" value={metrics.ventasRecientesCount} icon={ShoppingCart} borderColor="border-[#644c44]" iconColor="text-[#644c44]"/>
                <MetricCard title="Nuevos Clientes (Últimos 7 días)" value={metrics.nuevosClientes} icon={Users} borderColor="border-gray-400" iconColor="text-gray-400"/>
            </div>

            {/* Gráfico y Actividad Reciente (Sin cambios) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
                
                {/* Gráfico */}
                <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-2xl shadow-xl">
                    <h2 className="text-2xl font-semibold text-[#644c44] mb-6">Ventas (Bs.) Últimos 7 Días</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="date" stroke="#9e9e9e" />
                            <YAxis stroke="#9e9e9e" />
                            <Tooltip formatter={(value) => [`Bs. ${value.toFixed(2)}`, "Ventas"]} />
                            <Legend />
                            <Bar dataKey="sales" fill="#a4544c" name="Ventas Diarias (Bs.)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Actividad */}
                <div className="lg:col-span-1 bg-white p-6 md:p-8 rounded-2xl shadow-xl h-fit">
                    <h2 className="text-2xl font-semibold text-[#644c44] mb-6">Últimas Ventas Registradas</h2>
                    
                    {recentActivity.length > 0 ? (
                        <div className="flow-root"> 
                            <table className="w-full text-sm">
                                <thead>
                                    <tr>
                                        <th className="text-left py-3 border-b border-gray-200 text-gray-500 font-medium uppercase tracking-wider">Fecha</th>
                                        <th className="text-left py-3 border-b border-gray-200 text-gray-500 font-medium uppercase tracking-wider">Cliente</th>
                                        <th className="text-right py-3 border-b border-gray-200 text-gray-500 font-medium uppercase tracking-wider">Monto</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {recentActivity.map(activity => (
                                        <tr key={activity.id_venta} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-3 text-gray-700">{new Date(activity.fecha_venta).toLocaleTimeString()}</td>
                                            <td className="py-3 text-gray-700">{`${activity.nombre_pila_cliente || ''} ${activity.apellido_paterno_cliente || ''}`.trim() || 'Desconocido'}</td>
                                            <td className="py-3 text-gray-800 font-medium text-right">{activity.monto_total.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 py-8">No hay ventas recientes.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default DashboardPage;