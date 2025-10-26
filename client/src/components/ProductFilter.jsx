import React from 'react';
import { Filter } from 'lucide-react';

const mockCategories = [
    { id: 0, name: 'Todas las Categorías' },
    { id: 1, name: 'MUEBLES Y ALMACENAMIENTO GRANDE' },
    { id: 2, name: 'DECORACIÓN Y USO DOMÉSTICO' },
    { id: 3, name: 'ACCESORIOS Y CONTENEDORES PEQUEÑOS' },
];

function ProductFilter({ onFilterChange }) {
    return (
        <div className="bg-white p-4 border-b shadow-sm mb-6">
            <div className="max-w-7xl mx-auto flex items-center space-x-4">
                <Filter className="w-5 h-5 text-mimbres-terracota" />
                <label className="text-sm font-medium text-gray-700">Filtrar por Categoría:</label>
                
                {/* Menú Desplegable por Categoría */}
                <select 
                    onChange={(e) => onFilterChange(e.target.value)}
                    className="border border-gray-300 rounded-md p-2 text-sm focus:ring-mimbres-orange focus:border-mimbres-orange"
                >
                    {mockCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </select>
                
                {/* Puedes añadir aquí el botón de Aplicar Filtro si quieres más lógica */}
            </div>
        </div>
    );
}

export default ProductFilter;