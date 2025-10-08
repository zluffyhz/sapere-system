import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export const useAppNavigation = () => {
  const navigate = useNavigate();

  return {
    goToDashboard: () => navigate('/dashboard'),
    goToPatients: () => navigate('/patients'),
    goToAppointments: () => navigate('/appointments'),
    goToAnamnese: () => navigate('/anamnese'),
    goToSettings: () => navigate('/settings'),
    goToLogin: () => navigate('/login')
  };
};