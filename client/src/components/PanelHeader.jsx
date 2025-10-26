import React from 'react';
import Logo from '../assets/TERCER USO.png'; // Importa tu logo

function PanelHeader() {
  return (
    // Header simple para el panel
    <header className="bg-white shadow-md h-16 flex items-center justify-center sticky top-0 z-40">
      {/* Contenedor para centrar el logo */}
      <div className="flex-shrink-0">
        {/* Logo, puedes ajustar el tamaño (ej: h-8) si h-10 es muy grande */}
        <img className="h-8 md:h-10 w-auto" src={Logo} alt="Mimbres Cochabamba Logo Panel" />
      </div>
      {/* Puedes añadir otros elementos aquí si cambias de opinión, 
          ej: Nombre de usuario o un botón de notificaciones */}
    </header>
  );
}

export default PanelHeader;