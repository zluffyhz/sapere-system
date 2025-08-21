"use client";

import React, { useState } from 'react';

const SimpleTabTest: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tab1' | 'tab2' | 'tab3'>('tab1');

  console.log('🔍 SimpleTabTest renderizado, activeTab:', activeTab);

  const handleTabClick = (tabId: 'tab1' | 'tab2' | 'tab3', tabName: string) => {
    console.log('🎯 CLIQUE DETECTADO!');
    console.log('📍 Tab atual ANTES:', activeTab);
    console.log('📍 Mudando para:', tabId);
    console.log('📍 Nome da tab:', tabName);
    
    setActiveTab(tabId);
    
    console.log('✅ setActiveTab chamado');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Teste Simples de Abas</h2>
      
      {/* Informações de Debug */}
      <div className="mb-4 p-3 bg-gray-100 rounded">
        <p><strong>Aba Ativa:</strong> {activeTab}</p>
        <p><strong>Timestamp:</strong> {new Date().toLocaleTimeString()}</p>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="flex space-x-4">
          <button
            onClick={() => handleTabClick('tab1', 'Tab 1')}
            className={`py-2 px-4 border-b-2 font-medium text-sm ${
              activeTab === 'tab1'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            style={{ cursor: 'pointer' }}
          >
            Tab 1 - Simples
          </button>
          
          <button
            onClick={() => handleTabClick('tab2', 'Tab 2')}
            className={`py-2 px-4 border-b-2 font-medium text-sm ${
              activeTab === 'tab2'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            style={{ cursor: 'pointer' }}
          >
            Tab 2 - Simples
          </button>
          
          <button
            onClick={() => handleTabClick('tab3', 'Tab 3')}
            className={`py-2 px-4 border-b-2 font-medium text-sm ${
              activeTab === 'tab3'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            style={{ cursor: 'pointer' }}
          >
            Tab 3 - Simples
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-4 bg-gray-50 rounded">
        {activeTab === 'tab1' && (
          <div>
            <h3 className="font-bold text-lg mb-2">Conteúdo da Tab 1</h3>
            <p>Esta é a primeira aba. Se você está vendo isso, a aba 1 está funcionando!</p>
          </div>
        )}
        
        {activeTab === 'tab2' && (
          <div>
            <h3 className="font-bold text-lg mb-2">Conteúdo da Tab 2</h3>
            <p>Esta é a segunda aba. Se você está vendo isso, a aba 2 está funcionando!</p>
          </div>
        )}
        
        {activeTab === 'tab3' && (
          <div>
            <h3 className="font-bold text-lg mb-2">Conteúdo da Tab 3</h3>
            <p>Esta é a terceira aba. Se você está vendo isso, a aba 3 está funcionando!</p>
          </div>
        )}
      </div>

      {/* Botões de Teste Direto */}
      <div className="mt-4 flex space-x-2">
        <button
          onClick={() => setActiveTab('tab1')}
          className="px-3 py-1 bg-red-500 text-white rounded text-sm"
        >
          Força Tab 1
        </button>
        <button
          onClick={() => setActiveTab('tab2')}
          className="px-3 py-1 bg-green-500 text-white rounded text-sm"
        >
          Força Tab 2
        </button>
        <button
          onClick={() => setActiveTab('tab3')}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
        >
          Força Tab 3
        </button>
      </div>
    </div>
  );
};

export default SimpleTabTest;