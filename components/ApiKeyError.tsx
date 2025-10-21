import React from 'react';

const ApiKeyError: React.FC = () => (
    <div className="h-screen w-screen bg-red-50 flex flex-col justify-center items-center p-8 text-center font-sans">
        <div className="max-w-md">
            <h1 className="text-3xl font-bold text-red-700 mb-4">Erro de Configuração</h1>
            <h2 className="text-xl font-semibold text-red-600 mb-6">Configuration Error</h2>
            <div className="text-left bg-white p-6 rounded-lg shadow-md border border-red-200">
                <p className="text-gray-800 mb-4">
                    <strong>Português:</strong> O aplicativo não pode funcionar porque a chave da API do Gemini (API Key) não foi configurada corretamente para esta implantação.
                </p>
                <p className="text-gray-800">
                    <strong>English:</strong> The application cannot function because the Gemini API Key has not been configured correctly for this deployment.
                </p>
                <p className="text-sm text-gray-500 mt-6">
                    Por favor, certifique-se de que a variável de ambiente `API_KEY` esteja definida no ambiente de execução.
                    <br />
                    Please ensure the `API_KEY` environment variable is set in the execution environment.
                </p>
            </div>
        </div>
    </div>
);

export default ApiKeyError;
