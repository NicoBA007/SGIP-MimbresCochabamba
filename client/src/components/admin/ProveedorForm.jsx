import React, { useState, useEffect } from 'react';

// Estilos mínimos
const styles = {
    form: { maxWidth: '600px', margin: '0 auto', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' },
    label: { display: 'block', marginBottom: '5px', fontWeight: 'bold' },
    input: { width: 'calc(100% - 22px)', padding: '8px', marginBottom: '10px', border: '1px solid #ccc' },
    textarea: { width: 'calc(100% - 22px)', padding: '8px', marginBottom: '10px', border: '1px solid #ccc', minHeight: '80px' },
    button: { padding: '10px 20px', cursor: 'pointer', background: 'blue', color: 'white', border: 'none', borderRadius: '3px' },
    error: { color: 'red', fontSize: '12px', marginBottom: '10px' },
};

// Estado inicial vacío
const emptyFormData = {
    nombre_proveedor: '',
    telefono_contacto: '',
    direccion: '',
};

function ProveedorForm({ onSubmit, initialData = {}, isLoading }) {
    // Inicializar estado
    const [formData, setFormData] = useState({ ...emptyFormData, ...initialData });
    const [errors, setErrors] = useState({});

    // Efecto para actualizar/resetear el formulario
    useEffect(() => {
        if (initialData && initialData.id_proveedor) {
            setFormData({ ...emptyFormData, ...initialData });
        } else {
            setFormData(emptyFormData);
        }
        setErrors({});
    }, [initialData?.id_proveedor]); // Depender solo del ID

    // Manejador de cambios
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    // Validación
    const validateForm = () => {
        const newErrors = {};
        if (!formData.nombre_proveedor.trim()) {
            newErrors.nombre_proveedor = "El nombre del proveedor es requerido.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Manejador del envío
    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            // Prepara datos (null si están vacíos)
             const dataToSend = {
                ...formData,
                nombre_proveedor: formData.nombre_proveedor.trim(), // Nombre es requerido
                telefono_contacto: formData.telefono_contacto?.trim() || null,
                direccion: formData.direccion?.trim() || null,
            };
            onSubmit(dataToSend);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={styles.form}>
            {/* Nombre (Requerido) */}
            <div>
                <label style={styles.label} htmlFor="nombre_proveedor">Nombre del Proveedor:</label>
                <input
                    type="text"
                    id="nombre_proveedor"
                    name="nombre_proveedor"
                    style={styles.input}
                    value={formData.nombre_proveedor}
                    onChange={handleChange}
                />
                {errors.nombre_proveedor && <p style={styles.error}>{errors.nombre_proveedor}</p>}
            </div>

            {/* Teléfono (Opcional) */}
            <div>
                <label style={styles.label} htmlFor="telefono_contacto">Teléfono de Contacto:</label>
                <input
                    type="tel"
                    id="telefono_contacto"
                    name="telefono_contacto"
                    style={styles.input}
                    value={formData.telefono_contacto || ''}
                    onChange={handleChange}
                />
            </div>

            {/* Dirección (Opcional) */}
            <div>
                <label style={styles.label} htmlFor="direccion">Dirección:</label>
                <textarea
                    id="direccion"
                    name="direccion"
                    style={styles.textarea}
                    value={formData.direccion || ''}
                    onChange={handleChange}
                />
            </div>

            {/* Botón de Envío */}
            <button type="submit" style={styles.button} disabled={isLoading}>
                {isLoading ? 'Guardando...' : (initialData?.id_proveedor ? 'Actualizar Proveedor' : 'Crear Proveedor')}
            </button>
        </form>
    );
}

export default ProveedorForm;