import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAppNavigation } from '@/components/Navigation';

interface Anamnese {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  type: string;
  therapist: string;
  mainComplaint: string;
  clinicalHistory: string;
  familyHistory: string;
  socialHistory: string;
  developmentHistory: string;
  currentBehaviors: string;
  medications: string;
  previousTreatments: string;
  observations: string;
  recommendations: string;
  createdAt: string;
}

interface Patient {
  id: string;
  name: string;
  birthDate: string;
}

const AnamneseManagement: React.FC = () => {
  const { user, logout } = useAuth();
  const { goToDashboard } = useAppNavigation();
  const [anamneses, setAnamneses] = useState<Anamnese[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAnamnese, setEditingAnamnese] = useState<Anamnese | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<Omit<Anamnese, 'id' | 'createdAt' | 'patientName'>>({
    patientId: '',
    date: new Date().toISOString().split('T')[0],
    type: 'inicial',
    therapist: user?.name || 'Terapeuta',
    mainComplaint: '',
    clinicalHistory: '',
    familyHistory: '',
    socialHistory: '',
    developmentHistory: '',
    currentBehaviors: '',
    medications: '',
    previousTreatments: '',
    observations: '',
    recommendations: ''
  });

  useEffect(() => {
    loadAnamneses();
    loadPatients();
  }, []);

  const loadAnamneses = () => {
    const stored = localStorage.getItem('sapere_anamneses');
    if (stored) {
      setAnamneses(JSON.parse(stored));
    }
  };

  const loadPatients = () => {
    const stored = localStorage.getItem('sapere_patients');
    if (stored) {
      const allPatients = JSON.parse(stored);
      setPatients(allPatients.map((p: any) => ({
        id: p.id,
        name: p.name,
        birthDate: p.birthDate
      })));
    }
  };

  const saveAnamneses = (updatedAnamneses: Anamnese[]) => {
    localStorage.setItem('sapere_anamneses', JSON.stringify(updatedAnamneses));
    setAnamneses(updatedAnamneses);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedPatient = patients.find(p => p.id === formData.patientId);
    if (!selectedPatient) {
      alert('Selecione um paciente válido');
      return;
    }

    if (editingAnamnese) {
      // Editar anamnese existente
      const updated = anamneses.map(a =>
        a.id === editingAnamnese.id
          ? {
              ...formData,
              id: editingAnamnese.id,
              createdAt: editingAnamnese.createdAt,
              patientName: selectedPatient.name
            }
          : a
      );
      saveAnamneses(updated);
    } else {
      // Criar nova anamnese
      const newAnamnese: Anamnese = {
        ...formData,
        id: Date.now().toString(),
        patientName: selectedPatient.name,
        createdAt: new Date().toISOString()
      };
      saveAnamneses([...anamneses, newAnamnese]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      date: new Date().toISOString().split('T')[0],
      type: 'inicial',
      therapist: user?.name || 'Terapeuta',
      mainComplaint: '',
      clinicalHistory: '',
      familyHistory: '',
      socialHistory: '',
      developmentHistory: '',
      currentBehaviors: '',
      medications: '',
      previousTreatments: '',
      observations: '',
      recommendations: ''
    });
    setShowForm(false);
    setEditingAnamnese(null);
  };

  const handleEdit = (anamnese: Anamnese) => {
    setFormData({
      patientId: anamnese.patientId,
      date: anamnese.date,
      type: anamnese.type,
      therapist: anamnese.therapist,
      mainComplaint: anamnese.mainComplaint,
      clinicalHistory: anamnese.clinicalHistory,
      familyHistory: anamnese.familyHistory,
      socialHistory: anamnese.socialHistory,
      developmentHistory: anamnese.developmentHistory,
      currentBehaviors: anamnese.currentBehaviors,
      medications: anamnese.medications,
      previousTreatments: anamnese.previousTreatments,
      observations: anamnese.observations,
      recommendations: anamnese.recommendations
    });
    setEditingAnamnese(anamnese);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta anamnese?')) {
      const filtered = anamneses.filter(a => a.id !== id);
      saveAnamneses(filtered);
    }
  };

  const filteredAnamneses = anamneses.filter(anamnese =>
    anamnese.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    anamnese.type.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const commonStyle = {
    fontFamily: 'Arial, sans-serif',
    boxSizing: 'border-box' as const
  };

  const inputStyle = {
    ...commonStyle,
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px'
  };

  const buttonStyle = {
    ...commonStyle,
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500' as const
  };

  return (
    <div style={{ ...commonStyle, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#f59e0b',
        color: 'white',
        padding: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button
            onClick={goToDashboard}
            style={{
              ...buttonStyle,
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)'
            }}
          >
            ← Dashboard
          </button>
          <div>
            <h1 style={{ margin: '0', fontSize: '24px', fontWeight: 'bold' }}>
              📋 Gestão de Anamneses
            </h1>
            <p style={{ margin: '5px 0 0 0', opacity: '0.9' }}>
              Sistema Sapere - Avaliação Clínica
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span>{user?.name}</span>
          <button onClick={logout} style={{
            ...buttonStyle,
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            Sair
          </button>
        </div>
      </div>

      <div style={{ padding: '30px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Controles superiores */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap' as const,
          gap: '15px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <input
              type="text"
              placeholder="Buscar anamneses (paciente, tipo)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ ...inputStyle, width: '300px' }}
            />
            <span style={{ color: '#666', fontSize: '14px' }}>
              {filteredAnamneses.length} anamnese(s) encontrada(s)
            </span>
          </div>
          <button
            onClick={() => setShowForm(true)}
            style={{
              ...buttonStyle,
              backgroundColor: '#10b981',
              color: 'white'
            }}
          >
            + Nova Anamnese
          </button>
        </div>

        {/* Formulário */}
        {showForm && (
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '10px',
            marginBottom: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ marginTop: '0', color: '#1f2937' }}>
              {editingAnamnese ? 'Editar Anamnese' : 'Nova Anamnese'}
            </h3>

            {patients.length === 0 && (
              <div style={{
                backgroundColor: '#fef3c7',
                border: '1px solid #f59e0b',
                padding: '15px',
                borderRadius: '5px',
                marginBottom: '20px',
                color: '#92400e'
              }}>
                ⚠️ Você precisa cadastrar pacientes primeiro para criar anamneses.
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>Paciente *</label>
                  <select
                    required
                    value={formData.patientId}
                    onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                    style={inputStyle}
                  >
                    <option value="">Selecione um paciente</option>
                    {patients.map(patient => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>Data *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>Tipo de Anamnese *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    style={inputStyle}
                  >
                    <option value="inicial">Avaliação Inicial</option>
                    <option value="evolutiva">Evolutiva</option>
                    <option value="reavaliacao">Reavaliação</option>
                    <option value="familiar">Orientação Familiar</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>Terapeuta</label>
                  <input
                    type="text"
                    value={formData.therapist}
                    onChange={(e) => setFormData({...formData, therapist: e.target.value})}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Seções da anamnese */}
              <div style={{ display: 'grid', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>Queixa Principal *</label>
                  <textarea
                    required
                    value={formData.mainComplaint}
                    onChange={(e) => setFormData({...formData, mainComplaint: e.target.value})}
                    style={{ ...inputStyle, height: '80px', resize: 'vertical' as const }}
                    placeholder="Descreva a queixa principal que motivou a busca pelo atendimento..."
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>História Clínica</label>
                  <textarea
                    value={formData.clinicalHistory}
                    onChange={(e) => setFormData({...formData, clinicalHistory: e.target.value})}
                    style={{ ...inputStyle, height: '100px', resize: 'vertical' as const }}
                    placeholder="Histórico médico, diagnósticos anteriores, cirurgias, etc..."
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>História Familiar</label>
                  <textarea
                    value={formData.familyHistory}
                    onChange={(e) => setFormData({...formData, familyHistory: e.target.value})}
                    style={{ ...inputStyle, height: '80px', resize: 'vertical' as const }}
                    placeholder="Histórico familiar relevante, transtornos neurológicos, etc..."
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>História Social</label>
                  <textarea
                    value={formData.socialHistory}
                    onChange={(e) => setFormData({...formData, socialHistory: e.target.value})}
                    style={{ ...inputStyle, height: '80px', resize: 'vertical' as const }}
                    placeholder="Contexto social, familiar, escolar, etc..."
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>História do Desenvolvimento</label>
                  <textarea
                    value={formData.developmentHistory}
                    onChange={(e) => setFormData({...formData, developmentHistory: e.target.value})}
                    style={{ ...inputStyle, height: '100px', resize: 'vertical' as const }}
                    placeholder="Marcos do desenvolvimento, gestação, parto, primeiros anos..."
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>Comportamentos Atuais</label>
                  <textarea
                    value={formData.currentBehaviors}
                    onChange={(e) => setFormData({...formData, currentBehaviors: e.target.value})}
                    style={{ ...inputStyle, height: '100px', resize: 'vertical' as const }}
                    placeholder="Comportamentos observados, dificuldades, habilidades..."
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>Medicações</label>
                  <textarea
                    value={formData.medications}
                    onChange={(e) => setFormData({...formData, medications: e.target.value})}
                    style={{ ...inputStyle, height: '60px', resize: 'vertical' as const }}
                    placeholder="Medicações atuais, dosagens, etc..."
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>Tratamentos Anteriores</label>
                  <textarea
                    value={formData.previousTreatments}
                    onChange={(e) => setFormData({...formData, previousTreatments: e.target.value})}
                    style={{ ...inputStyle, height: '80px', resize: 'vertical' as const }}
                    placeholder="Terapias anteriores, profissionais consultados, etc..."
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>Observações</label>
                  <textarea
                    value={formData.observations}
                    onChange={(e) => setFormData({...formData, observations: e.target.value})}
                    style={{ ...inputStyle, height: '80px', resize: 'vertical' as const }}
                    placeholder="Observações gerais sobre o paciente..."
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>Recomendações</label>
                  <textarea
                    value={formData.recommendations}
                    onChange={(e) => setFormData({...formData, recommendations: e.target.value})}
                    style={{ ...inputStyle, height: '100px', resize: 'vertical' as const }}
                    placeholder="Recomendações terapêuticas, orientações, próximos passos..."
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
                <button
                  type="submit"
                  disabled={patients.length === 0}
                  style={{
                    ...buttonStyle,
                    backgroundColor: patients.length === 0 ? '#d1d5db' : '#3b82f6',
                    color: 'white',
                    cursor: patients.length === 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  {editingAnamnese ? 'Atualizar' : 'Salvar'} Anamnese
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    ...buttonStyle,
                    backgroundColor: '#6b7280',
                    color: 'white'
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de anamneses */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '20px',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: '#f9fafb'
          }}>
            <h3 style={{ margin: '0', color: '#1f2937' }}>
              Anamneses ({filteredAnamneses.length})
            </h3>
          </div>

          {filteredAnamneses.length === 0 ? (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              <p style={{ fontSize: '18px', margin: '0' }}>
                {anamneses.length === 0
                  ? 'Nenhuma anamnese criada ainda.'
                  : 'Nenhuma anamnese encontrada com os critérios de busca.'}
              </p>
              {anamneses.length === 0 && patients.length > 0 && (
                <button
                  onClick={() => setShowForm(true)}
                  style={{
                    ...buttonStyle,
                    backgroundColor: '#10b981',
                    color: 'white',
                    marginTop: '15px'
                  }}
                >
                  Criar Primeira Anamnese
                </button>
              )}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' as const }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb' }}>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: '600', color: '#374151' }}>Paciente</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: '600', color: '#374151' }}>Data</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: '600', color: '#374151' }}>Tipo</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: '600', color: '#374151' }}>Terapeuta</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: '600', color: '#374151' }}>Queixa Principal</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e5e7eb', fontWeight: '600', color: '#374151' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAnamneses.map((anamnese, index) => (
                    <tr key={anamnese.id} style={{ backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb' }}>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>
                        <div style={{ fontWeight: '500', color: '#1f2937' }}>{anamnese.patientName}</div>
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', color: '#6b7280' }}>
                        {new Date(anamnese.date).toLocaleDateString('pt-BR')}
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', color: '#6b7280' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: '#e0e7ff',
                          color: '#3730a3',
                          fontSize: '12px'
                        }}>
                          {anamnese.type}
                        </span>
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', color: '#6b7280' }}>
                        {anamnese.therapist}
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', color: '#6b7280', maxWidth: '300px' }}>
                        <div style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {anamnese.mainComplaint || '-'}
                        </div>
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleEdit(anamnese)}
                            style={{
                              ...buttonStyle,
                              backgroundColor: '#3b82f6',
                              color: 'white',
                              padding: '6px 12px',
                              fontSize: '12px'
                            }}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(anamnese.id)}
                            style={{
                              ...buttonStyle,
                              backgroundColor: '#ef4444',
                              color: 'white',
                              padding: '6px 12px',
                              fontSize: '12px'
                            }}
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnamneseManagement;