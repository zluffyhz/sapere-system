import { useState } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Database, Mail, Clock } from 'lucide-react';

export default function Settings() {
  const [activeSection, setActiveSection] = useState('profile');
  const [notifications, setNotifications] = useState({
    email: true,
    whatsapp: true,
    appointments: true,
    reports: false
  });

  const settingSections = [
    { key: 'profile', label: 'Perfil', icon: User },
    { key: 'notifications', label: 'Notificações', icon: Bell },
    { key: 'security', label: 'Segurança', icon: Shield },
    { key: 'appearance', label: 'Aparência', icon: Palette },
    { key: 'system', label: 'Sistema', icon: Database },
    { key: 'integrations', label: 'Integrações', icon: Mail }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Configurações</h2>
        <p className="text-sm text-gray-600 mt-1">
          Gerencie as configurações do sistema e preferências
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow">
            <nav className="space-y-1 p-4">
              {settingSections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.key}
                    onClick={() => setActiveSection(section.key)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeSection === section.key
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{section.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              {activeSection === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Informações do Perfil</h3>
                    <p className="text-sm text-gray-600">Atualize suas informações pessoais</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                        defaultValue="Administrador"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                        defaultValue="admin@sapere.com.br"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                      <input
                        type="tel"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                        defaultValue="(11) 99999-9999"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cargo</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                        defaultValue="Administrador"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                      Salvar Alterações
                    </button>
                  </div>
                </div>
              )}

              {activeSection === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Preferências de Notificação</h3>
                    <p className="text-sm text-gray-600">Configure como deseja receber notificações</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Notificações por Email</h4>
                        <p className="text-sm text-gray-500">Receber notificações importantes por email</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={notifications.email}
                          onChange={(e) => setNotifications(prev => ({ ...prev, email: e.target.checked }))}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">WhatsApp</h4>
                        <p className="text-sm text-gray-500">Receber notificações via WhatsApp</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={notifications.whatsapp}
                          onChange={(e) => setNotifications(prev => ({ ...prev, whatsapp: e.target.checked }))}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Lembretes de Consulta</h4>
                        <p className="text-sm text-gray-500">Notificações sobre consultas agendadas</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={notifications.appointments}
                          onChange={(e) => setNotifications(prev => ({ ...prev, appointments: e.target.checked }))}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Relatórios</h4>
                        <p className="text-sm text-gray-500">Notificações sobre relatórios automáticos</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={notifications.reports}
                          onChange={(e) => setNotifications(prev => ({ ...prev, reports: e.target.checked }))}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Configurações de Segurança</h3>
                    <p className="text-sm text-gray-600">Gerencie a segurança da sua conta</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Alterar Senha</h4>
                      <div className="space-y-3">
                        <input
                          type="password"
                          placeholder="Senha atual"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                        />
                        <input
                          type="password"
                          placeholder="Nova senha"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                        />
                        <input
                          type="password"
                          placeholder="Confirmar nova senha"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                        />
                      </div>
                      <button className="mt-3 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm">
                        Alterar Senha
                      </button>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Sessões Ativas</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Sessão Atual</p>
                            <p className="text-xs text-gray-500">Chrome • São Paulo, SP</p>
                          </div>
                          <span className="text-xs text-green-600 font-medium">Ativa</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'appearance' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Configurações de Aparência</h3>
                    <p className="text-sm text-gray-600">Personalize a aparência do sistema</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tema</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500">
                        <option>Claro</option>
                        <option>Escuro</option>
                        <option>Automático</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Idioma</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500">
                        <option>Português (BR)</option>
                        <option>English</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'system' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Configurações do Sistema</h3>
                    <p className="text-sm text-gray-600">Configurações gerais do sistema</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Horário de Funcionamento</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Abertura</label>
                          <input
                            type="time"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                            defaultValue="08:00"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Fechamento</label>
                          <input
                            type="time"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                            defaultValue="18:00"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Backup de Dados</h4>
                      <div className="flex items-center space-x-3">
                        <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm">
                          Fazer Backup Agora
                        </button>
                        <span className="text-sm text-gray-500">Último backup: 15/03/2024 às 02:30</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'integrations' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Integrações</h3>
                    <p className="text-sm text-gray-600">Configure integrações com serviços externos</p>
                  </div>

                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Mail className="text-blue-600" size={24} />
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Email</h4>
                            <p className="text-sm text-gray-500">Configuração de envio de emails</p>
                          </div>
                        </div>
                        <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                          Configurar
                        </button>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
                            <span className="text-white text-xs font-bold">W</span>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">WhatsApp Business</h4>
                            <p className="text-sm text-gray-500">Envio de mensagens via WhatsApp</p>
                          </div>
                        </div>
                        <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                          Configurar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}