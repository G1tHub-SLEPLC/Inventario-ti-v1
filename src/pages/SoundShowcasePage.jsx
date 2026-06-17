import React, { useState, useEffect } from 'react';
import { Volume2, CheckCircle, Music } from 'lucide-react';
import { SOUND_OPTIONS, playSpecificSound } from '../utils/audioUtils';
import { useInventario } from '../context/InventarioContext';

export default function SoundShowcasePage() {
  const [selectedSound, setSelectedSound] = useState('');
  const { showToast } = useInventario();

  useEffect(() => {
    const current = localStorage.getItem('notificationSound') || 'classic_ding';
    setSelectedSound(current);
  }, []);

  const handlePlay = (id) => {
    playSpecificSound(id);
  };

  const handleSelect = (id) => {
    localStorage.setItem('notificationSound', id);
    setSelectedSound(id);
    playSpecificSound(id);
    showToast('Sonido Actualizado', 'El sonido de notificaciones ha sido guardado exitosamente.', 'success');
  };

  return (
    <div className="p-8 max-w-5xl mx-auto pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Music className="w-8 h-8 text-[#006BB9]" />
          Galería de Sonidos de Notificación
        </h1>
        <p className="text-gray-600 mt-2">
          Elige el tono que prefieres escuchar cuando recibas una nueva solicitud de insumo o préstamo. 
          Esta configuración se guarda localmente en este navegador.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {SOUND_OPTIONS.map((sound) => {
          const isSelected = selectedSound === sound.id;
          return (
            <div 
              key={sound.id} 
              className={`p-5 rounded-2xl border-2 transition-all duration-200 shadow-sm flex flex-col
                ${isSelected ? 'border-[#006BB9] bg-blue-50/50' : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'}`}
            >
              <div className="flex justify-between items-start mb-3 flex-1">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{sound.name}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2 min-h-[40px]">{sound.desc}</p>
                </div>
                {isSelected && <CheckCircle className="w-6 h-6 text-[#006BB9] shrink-0" />}
              </div>

              <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handlePlay(sound.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gray-100 text-gray-800 font-bold hover:bg-gray-200 transition-colors shadow-sm"
                >
                  <Volume2 className="w-4 h-4" />
                  Probar
                </button>
                
                {!isSelected && (
                  <button
                    onClick={() => handleSelect(sound.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#006BB9] text-white font-bold hover:bg-[#005a9e] transition-colors shadow-sm"
                  >
                    Seleccionar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
