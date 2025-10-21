import React from 'react';

const ApiKeyError: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans text-slate-800">
      <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-200/80 p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
          <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="mt-4 text-2xl font-bold text-gray-800">Configuração Necessária</h2>
        <p className="mt-4 text-gray-600">
          O serviço de tradução não pode ser iniciado. Parece que o aplicativo não foi configurado corretamente pelo proprietário.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Para que o tradutor funcione, é necessária uma chave de API do Google Gemini. Se você for o desenvolvedor, adicione a chave de API como uma variável de ambiente `API_KEY` no seu projeto.
        </p>
      </div>
    </div>
  );
};

export default ApiKeyError;
