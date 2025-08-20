import React, { useState } from 'react';

const AdministrationSimple: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'therapists' | 'settings'>('users');

  console.log('🏛️ AdministrationSimple: Renderizado, aba ativa:', activeTab);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Administração Simples</h1>
        <p className="text-gray-600 mt-2">Teste simplificado de navegação por abas</p>
      </div>

      {/* Debug Info */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">Debug Info:</h3>
        <p className="text-blue-800">Aba ativa: <strong>{activeTab}</strong></p>
        <p className="text-blue-800">Timestamp: <strong>{new Date().toLocaleTimeString()}</strong></p>
      </div>

      {/* Tabs - Versão 1: onClick direto */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Versão 1: onClick Direto</h3>
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => {
                console.log('🎯 CLIQUE DIRETO: users');
                setActiveTab('users');
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              👥 Usuários
            </button>
            <button
              onClick={() => {
                console.log('🎯 CLIQUE DIRETO: therapists');
                setActiveTab('therapists');
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'therapists'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              👨‍⚕️ Terapeutas
            </button>
            <button
              onClick={() => {
                console.log('🎯 CLIQUE DIRETO: settings');
                setActiveTab('settings');
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              ⚙️ Configurações
            </button>
          </nav>
        </div>
      </div>

      {/* Tabs - Versão 2: com preventDefault */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Versão 2: Com preventDefault</h3>
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                console.log('🛡️ CLIQUE COM PREVENT: users');
                setActiveTab('users');
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              👥 Usuários (v2)
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                console.log('🛡️ CLIQUE COM PREVENT: therapists');
                setActiveTab('therapists');
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'therapists'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              👨‍⚕️ Terapeutas (v2)
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                console.log('🛡️ CLIQUE COM PREVENT: settings');
                setActiveTab('settings');
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              ⚙️ Configurações (v2)
            </button>
          </nav>
        </div>
      </div>

      {/* Botões de Teste Forçado */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Teste Forçado (sem onClick nos tabs)</h3>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              console.log('🔴 FORÇA USERS');
              setActiveTab('users');
            }}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Força Users
          </button>
          <button
            onClick={() => {
              console.log('🟢 FORÇA THERAPISTS');
              setActiveTab('therapists');
            }}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Força Therapists
          </button>
          <button
            onClick={() => {
              console.log('🔵 FORÇA SETTINGS');
              setActiveTab('settings');
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Força Settings
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Conteúdo da Aba: {activeTab}</h2>
        
        {activeTab === 'users' && (
          <div className="text-green-700 bg-green-50 p-4 rounded">
            <h3 className="font-bold">👥 Gerenciamento de Usuários</h3>
            <p>Se você está vendo isso, a aba de usuários está funcionando!</p>
          </div>
        )}
        
        {activeTab === 'therapists' && (
          <div className="text-blue-700 bg-blue-50 p-4 rounded">
            <h3 className="font-bold">👨‍⚕️ Gerenciamento de Terapeutas</h3>
            <p>Se você está vendo isso, a aba de terapeutas está funcionando!</p>
          </div>
        )}
        
        {activeTab === 'settings' && (
          <div className="text-purple-700 bg-purple-50 p-4 rounded">
            <h3 className="font-bold">⚙️ Configurações do Sistema</h3>
            <p>Se você está vendo isso, a aba de configurações está funcionando!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdministrationSimple;