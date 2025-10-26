import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const emptyFormData = {
    nombre_pila_cliente: '',
    apellido_paterno_cliente: '',
    apellido_materno_cliente: '',
    telefono_whatsapp: '',
    email: '',
};

function ClienteForm({ onSubmit, initialData = null, isLoading }) {
    const [formData, setFormData] = useState(emptyFormData);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const isEditMode = initialData && initialData.id_cliente;
        if (isEditMode) {
            setFormData({ ...emptyFormData, ...initialData });
        } else {
            setFormData(emptyFormData);
        }
        setErrors({});
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.telefono_whatsapp.trim()) {
            newErrors.telefono_whatsapp = "El número de WhatsApp es requerido.";
        } else if (!/^\d+$/.test(formData.telefono_whatsapp.trim())) {
             newErrors.telefono_whatsapp = "El WhatsApp solo debe contener números.";
        }
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
             newErrors.email = "El formato del email no es válido.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
             const dataToSend = {
                 ...formData,
                 nombre_pila_cliente: formData.nombre_pila_cliente?.trim() || null,
                 apellido_paterno_cliente: formData.apellido_paterno_cliente?.trim() || null,
                 apellido_materno_cliente: formData.apellido_materno_cliente?.trim() || null,
                 email: formData.email?.trim() || null,
                 telefono_whatsapp: formData.telefono_whatsapp.trim(),
             };
            onSubmit(dataToSend);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="telefono_whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
                    WhatsApp <span className="text-red-500">*</span>
                </label>
                <input
                    type="tel"
                    id="telefono_whatsapp"
                    name="telefono_whatsapp"
                    className={`w-full px-4 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:bg-white focus:border-[#e3a45c] focus:ring-1 focus:ring-[#e3a45c]/50 transition-colors duration-200 ${errors.telefono_whatsapp ? 'border-red-500' : 'border-gray-300'}`}
                    value={formData.telefono_whatsapp}
                    onChange={handleChange}
                    placeholder="Ej: 76543210"
                    disabled={isLoading}
                />
                {errors.telefono_whatsapp && <p className="mt-1 text-xs text-red-600">{errors.telefono_whatsapp}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="nombre_pila_cliente" className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre(s)
                    </label>
                    <input
                        type="text"
                        id="nombre_pila_cliente"
                        name="nombre_pila_cliente"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:bg-white focus:border-[#e3a45c] focus:ring-1 focus:ring-[#e3a45c]/50 transition-colors duration-200"
                        value={formData.nombre_pila_cliente || ''}
                        onChange={handleChange}
                        disabled={isLoading}
                    />
                </div>
                <div>
                    <label htmlFor="apellido_paterno_cliente" className="block text-sm font-medium text-gray-700 mb-1">
                        Apellido Paterno
                    </label>
                    <input
                        type="text"
                        id="apellido_paterno_cliente"
                        name="apellido_paterno_cliente"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:bg-white focus:border-[#e3a45c] focus:ring-1 focus:ring-[#e3a45c]/50 transition-colors duration-200"
                        value={formData.apellido_paterno_cliente || ''}
                        onChange={handleChange}
                        disabled={isLoading}
                    />
                </div>
            </div>

            <div>
                 <label htmlFor="apellido_materno_cliente" className="block text-sm font-medium text-gray-700 mb-1">
                     Apellido Materno
                 </label>
                 <input
                     type="text"
                     id="apellido_materno_cliente"
                     name="apellido_materno_cliente"
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:bg-white focus:border-[#e3a45c] focus:ring-1 focus:ring-[#e3a45c]/50 transition-colors duration-200"
                     value={formData.apellido_materno_cliente || ''}
                     onChange={handleChange}
                     disabled={isLoading}
                 />
            </div>

            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email (Opcional)
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    className={`w-full px-4 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:bg-white focus:border-[#e3a45c] focus:ring-1 focus:ring-[#e3a45c]/50 transition-colors duration-200 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                    value={formData.email || ''}
                    onChange={handleChange}
                    disabled={isLoading}
                />
                 {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            <div className="pt-5 border-t border-gray-200">
                <div className="flex justify-end">
                    <button
                        type="submit"
                        className={`inline-flex items-center justify-center px-6 py-2.5 rounded-lg text-base font-medium text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#a4544c] disabled:opacity-50 disabled:cursor-not-allowed
                        ${isLoading ? 'bg-gray-400' : 'bg-[#a4544c] hover:bg-[#644c44] shadow-lg shadow-[#a4544c]/30 hover:-translate-y-0.5'}`}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            initialData?.id_cliente ? 'Actualizar Cliente' : 'Crear Cliente'
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
}

export default ClienteForm;