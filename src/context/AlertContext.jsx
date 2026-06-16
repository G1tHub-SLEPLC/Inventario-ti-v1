import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertCircle, Check, MessageSquare } from 'lucide-react';

const AlertContext = createContext();

export function useAlert() {
  return useContext(AlertContext);
}

export function AlertProvider({ children }) {
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    type: 'confirm', // 'confirm' | 'prompt'
    title: '',
    message: '',
    placeholder: '',
    inputType: 'textarea',
    resolve: null,
  });

  const [promptValue, setPromptValue] = useState('');

  const showAlertConfirm = useCallback((title, message) => {
    return new Promise((resolve) => {
      setAlertConfig({
        isOpen: true,
        type: 'confirm',
        title,
        message,
        resolve,
      });
    });
  }, []);

  const showAlertPrompt = useCallback((title, message, placeholder = '', inputType = 'textarea', defaultValue = '') => {
    return new Promise((resolve) => {
      setPromptValue(defaultValue);
      setAlertConfig({
        isOpen: true,
        type: 'prompt',
        title,
        message,
        placeholder,
        inputType,
        resolve,
      });
    });
  }, []);

  const handleConfirm = () => {
    const res = alertConfig.resolve;
    const value = alertConfig.type === 'prompt' ? promptValue : true;
    setAlertConfig(prev => ({ ...prev, isOpen: false }));
    if (res) res(value);
  };

  const handleCancel = () => {
    const res = alertConfig.resolve;
    const value = alertConfig.type === 'prompt' ? null : false;
    setAlertConfig(prev => ({ ...prev, isOpen: false }));
    if (res) res(value);
  };

  return (
    <AlertContext.Provider value={{ showAlertConfirm, showAlertPrompt }}>
      {children}
      {alertConfig.isOpen && (
        <>
          {alertConfig.type === 'confirm' && (
            <div className="fixed inset-0 bg-slate-800/60 flex items-center justify-center z-[9999] p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
                <div className="flex items-start p-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mr-4">
                    <AlertCircle className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">{alertConfig.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed" dangerouslySetInnerHTML={{ __html: alertConfig.message }}></p>
                  </div>
                </div>
                <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-100">
                  <button onClick={handleCancel} className="px-5 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition">Cancelar</button>
                  <button onClick={handleConfirm} className="px-5 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition shadow-sm flex items-center gap-2">
                    <Check size={16} /> Continuar
                  </button>
                </div>
              </div>
            </div>
          )}

          {alertConfig.type === 'prompt' && (
            <div className="fixed inset-0 bg-slate-800/60 flex items-center justify-center z-[9999] p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-lg bg-[#006BB9]/10 flex items-center justify-center text-[#006BB9]">
                      <MessageSquare size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-[#25306B]">{alertConfig.title}</h3>
                  </div>
                  <p className="text-sm text-slate-500 mb-4" dangerouslySetInnerHTML={{ __html: alertConfig.message }}></p>
                  <div className="relative">
                    {alertConfig.inputType === 'textarea' ? (
                      <textarea 
                        autoFocus
                        value={promptValue}
                        onChange={(e) => setPromptValue(e.target.value)}
                        placeholder={alertConfig.placeholder || "Ingrese la información aquí..."}
                        className="w-full pl-3 pr-3 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#006BB9] focus:border-[#006BB9] outline-none transition-all resize-none h-28"
                      ></textarea>
                    ) : (
                      <input
                        type={alertConfig.inputType}
                        value={promptValue}
                        onChange={(e) => setPromptValue(e.target.value)}
                        placeholder={alertConfig.placeholder}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#006BB9] focus:outline-none text-sm transition shadow-sm"
                        autoFocus
                      />
                    )}
                  </div>
                </div>
                <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-100">
                  <button onClick={handleCancel} className="px-5 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition">Cancelar</button>
                  <button onClick={handleConfirm} className="px-5 py-2 text-sm font-medium text-white bg-[#006BB9] hover:bg-[#25306B] rounded-lg transition shadow-sm">Confirmar y Guardar</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </AlertContext.Provider>
  );
}
