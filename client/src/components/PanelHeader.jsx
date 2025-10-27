import React from 'react';
import Logo from '../assets/TERCER USO.png';

function PanelHeader() {
  return (
    <header className="bg-white shadow-md h-16 flex items-center justify-center sticky top-0 z-40">
      <div className="flex-shrink-0">
        <img className="h-8 md:h-10 w-auto" src={Logo} alt="Mimbres Cochabamba Logo Panel" />
      </div>
    </header>
  );
}

export default PanelHeader;