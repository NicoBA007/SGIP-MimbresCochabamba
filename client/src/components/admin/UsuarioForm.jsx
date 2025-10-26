import React, { useState, useEffect } from 'react';

// Estilos mínimos
const styles = {
    form: { maxWidth: '600px', margin: '0 auto', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' },
    label: { display: 'block', marginBottom: '5px', fontWeight: 'bold' },
    input: { width: 'calc(100% - 22px)', padding: '8px', marginBottom: '10px', border: '1px solid #ccc' },
    select: { width: '100%', padding: '8px', marginBottom: '10px', border: '1px solid #ccc' },
    button: { padding: '10px 20px', cursor: 'pointer', background: 'blue', color: 'white', border: 'none', borderRadius: '3px' },
    error: { color: 'red', fontSize: '12px', marginBottom: '10px' },
    passwordHelp: { fontSize: '12px', color: 'gray', marginBottom: '10px' },
};

// Estado inicial vacío
const emptyFormData = {
    nombre_pila: '',
    apellido_paterno: '',
    apellido_materno: '',
    username: '',
    password: '', // Contraseña (texto plano)
    rol: 'VENDEDOR', // Rol por defecto
};

function UsuarioForm({ onSubmit, initialData = {}, isLoading }) {
    // Inicializar estado (excluimos password_hash)
    const [formData, setFormData] = useState({
        ...emptyFormData,
        ...initialData,
        password: '' // Siempre empezamos con el campo password vacío
    });
    const [errors, setErrors] = useState({});
    const isEditing = !!initialData?.id_usuario; // Detectar si estamos editando

    // Efecto para actualizar/resetear el formulario
    useEffect(() => {
        if (initialData && initialData.id_usuario) {
            // Cargar datos, pero mantener password vacío
            setFormData({ ...emptyFormData, ...initialData, password: '' });
        } else {
            // Asegurar que esté vacío al crear
            setFormData(emptyFormData);
        }
        setErrors({});
    }, [initialData?.id_usuario]); // Depender del ID

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
        if (!formData.nombre_pila.trim()) newErrors.nombre_pila = "El nombre es requerido.";
        if (!formData.apellido_paterno.trim()) newErrors.apellido_paterno = "El apellido paterno es requerido.";
        if (!formData.username.trim()) newErrors.username = "El nombre de usuario es requerido.";
        if (!formData.rol) newErrors.rol = "El rol es requerido.";

        // Contraseña requerida SOLO al crear
        if (!isEditing && !formData.password) {
            newErrors.password = "La contraseña es requerida al crear un usuario.";
        }
        // Validación opcional de longitud de contraseña
        if (formData.password && formData.password.length < 6) {
             newErrors.password = "La contraseña debe tener al menos 6 caracteres.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Manejador del envío
    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            // Prepara datos: NO enviar password si está vacío (al editar)
             const dataToSend = { ...formData };
             if (isEditing && !dataToSend.password) {
                 delete dataToSend.password; // No enviar campo vacío para no cambiarla
             }
             // Asegurar valores null para opcionales si están vacíos
             dataToSend.apellido_materno = dataToSend.apellido_materno?.trim() || null;

            onSubmit(dataToSend);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={styles.form}>
            {/* Nombre (Requerido) */}
            <div>
                <label style={styles.label} htmlFor="nombre_pila">Nombre(s):</label>
                <input type="text" id="nombre_pila" name="nombre_pila" style={styles.input} value={formData.nombre_pila} onChange={handleChange} />
                {errors.nombre_pila && <p style={styles.error}>{errors.nombre_pila}</p>}
            </div>

            {/* Apellido Paterno (Requerido) */}
            <div>
                <label style={styles.label} htmlFor="apellido_paterno">Apellido Paterno:</label>
                <input type="text" id="apellido_paterno" name="apellido_paterno" style={styles.input} value={formData.apellido_paterno} onChange={handleChange} />
                {errors.apellido_paterno && <p style={styles.error}>{errors.apellido_paterno}</p>}
            </div>

            {/* Apellido Materno (Opcional) */}
            <div>
                <label style={styles.label} htmlFor="apellido_materno">Apellido Materno:</label>
                <input type="text" id="apellido_materno" name="apellido_materno" style={styles.input} value={formData.apellido_materno || ''} onChange={handleChange} />
            </div>

            {/* Username (Requerido) */}
            <div>
                <label style={styles.label} htmlFor="username">Nombre de Usuario:</label>
                <input type="text" id="username" name="username" style={styles.input} value={formData.username} onChange={handleChange} />
                {errors.username && <p style={styles.error}>{errors.username}</p>}
            </div>

            {/* Contraseña (Requerida al crear, opcional al editar) */}
            <div>
                <label style={styles.label} htmlFor="password">Contraseña:</label>
                <input type="password" id="password" name="password" style={styles.input} value={formData.password} onChange={handleChange} placeholder={isEditing ? 'Dejar vacío para no cambiar' : ''}/>
                {isEditing && <p style={styles.passwordHelp}>Deje este campo vacío si no desea cambiar la contraseña.</p>}
                {errors.password && <p style={styles.error}>{errors.password}</p>}
            </div>

             {/* Rol (Requerido) */}
            <div>
                <label style={styles.label} htmlFor="rol">Rol:</label>
                <select id="rol" name="rol" style={styles.select} value={formData.rol} onChange={handleChange}>
                    <option value="VENDEDOR">VENDEDOR</option>
                    <option value="ADMIN">ADMIN</option>
                </select>
                {errors.rol && <p style={styles.error}>{errors.rol}</p>}
            </div>

            {/* Botón de Envío */}
            <button type="submit" style={styles.button} disabled={isLoading}>
                {isLoading ? 'Guardando...' : (isEditing ? 'Actualizar Usuario' : 'Crear Usuario')}
            </button>
        </form>
    );
}

export default UsuarioForm;