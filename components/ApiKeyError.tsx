import React, { useState } from 'react';

interface ApiKeyErrorProps {
  onApiKeySubmit: (key: string) => void;
  error: string;
}

const ApiKeyError: React.FC<ApiKeyErrorProps> = ({ onApiKeySubmit, error }) => {
    const [apiKey, setApiKey] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (apiKey.trim()) {
            onApiKeySubmit(apiKey.trim());
        }
    };

    return (
        <div className="h-screen w-screen bg-red-50 flex flex-col justify-center items-center p-4 font-sans">
            <div className="max-w-xl w-full">
                <h1 className="text-3xl font-bold text-red-700 mb-2 text-center">Erro de Configuração</h1>
                <h2 className="text-lg text-red-600 mb-6 text-center">A Chave da API Gemini não foi encontrada</h2>
                
                <div className="bg-white p-6 rounded-lg shadow-md border border-red-200">
                    <p className="text-gray-700 mb-4">
                        O aplicativo não conseguiu encontrar a chave da API nas variáveis de ambiente da Vercel.
                    </p>
                    
                    <form onSubmit={handleSubmit} className="mb-6">
                        <label htmlFor="apiKeyInput" className="block text-sm font-medium text-gray-700 mb-2">
                           Para usar o app agora, insira sua chave temporariamente:
                        </label>
                        <div className="flex gap-2">
                             <input
                                id="apiKeyInput"
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="Cole sua chave da API aqui"
                                className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                                aria-label="API Key Input"
                            />
                            <button 
                                type="submit"
                                className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300"
                                disabled={!apiKey.trim()}
                            >
                                Usar Chave
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Esta chave é usada apenas para esta sessão e não será armazenada.</p>
                    </form>

                    {error && !error.includes("not configured") && (
                        <div className="p-3 bg-red-100 text-red-800 rounded-md text-sm mb-4">
                           <strong>Erro:</strong> {error}
                        </div>
                    )}
                    
                    <div className="text-sm text-gray-600 border-t pt-4">
                        <p className="font-semibold mb-2">Para uma solução permanente:</p>
                        <ol className="list-decimal list-inside space-y-1">
                            <li>Vá para o seu projeto na <strong>Vercel</strong>.</li>
                            <li>Acesse <strong>Settings</strong> &rarr; <strong>Environment Variables</strong>.</li>
                            <li>Crie uma variável com o nome <code className="bg-gray-200 p-1 rounded">API_KEY</code> e cole sua chave no valor.</li>
                            <li>**Importante:** Faça um novo "deploy" (implantação) para aplicar a alteração.</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApiKeyError;