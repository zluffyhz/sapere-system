// Utilitários para verificação de permissões no sistema

import React from 'react';
import { UserRole } from '@/types';
import { PERMISSIONS } from '@/config/constants';

export type PermissionKey = keyof typeof PERMISSIONS;

/**
 * Verifica se o usuário tem uma permissão específica
 */
export const hasPermission = (userRole: UserRole, permission: PermissionKey): boolean => {
  const allowedRoles = PERMISSIONS[permission] as readonly UserRole[];
  return allowedRoles.includes(userRole);
};

/**
 * Verifica se o usuário tem pelo menos uma das permissões especificadas
 */
export const hasAnyPermission = (userRole: UserRole, permissions: PermissionKey[]): boolean => {
  return permissions.some(permission => hasPermission(userRole, permission));
};

/**
 * Verifica se o usuário tem todas as permissões especificadas
 */
export const hasAllPermissions = (userRole: UserRole, permissions: PermissionKey[]): boolean => {
  return permissions.every(permission => hasPermission(userRole, permission));
};

/**
 * Funções específicas de verificação de permissões por área
 */
export const canManageUsers = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'MANAGE_USERS');
};

export const canManageSettings = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'MANAGE_SETTINGS');
};

export const canViewPatients = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'VIEW_PATIENTS');
};

export const canCreateAppointments = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'CREATE_APPOINTMENTS');
};

export const canManageRecords = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'MANAGE_RECORDS');
};

export const canCreateRecords = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'CREATE_RECORDS');
};

export const canViewReports = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'VIEW_REPORTS');
};

export const canDeleteData = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'DELETE_DATA');
};

/**
 * Permissões específicas para anamnese
 */
export const canViewAnamnese = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'VIEW_ANAMNESE');
};

export const canCreateAnamnese = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'CREATE_ANAMNESE');
};

export const canEditAnamnese = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'EDIT_ANAMNESE');
};

export const canDeleteAnamnese = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'DELETE_ANAMNESE');
};

export const canManageAnamneseTemplates = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'MANAGE_ANAMNESE_TEMPLATES');
};

export const canCommentAnamnese = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'COMMENT_ANAMNESE');
};

export const canFavoriteAnamnese = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'FAVORITE_ANAMNESE');
};

export const canExportAnamnese = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'EXPORT_ANAMNESE');
};

/**
 * Utilitário para criar componentes condicionais baseados em permissões
 */
export const withPermission = <T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  permission: PermissionKey
) => {
  return (props: T & { userRole: UserRole; fallback?: React.ReactNode }): React.ReactElement | null => {
    const { userRole, fallback = null, ...restProps } = props;
    
    if (!hasPermission(userRole, permission)) {
      return fallback as React.ReactElement | null;
    }
    
    return React.createElement(Component, restProps as any);
  };
};

/**
 * Hook para usar permissões em componentes funcionais
 */
export const usePermissions = (userRole: UserRole | null) => {
  if (!userRole) {
    return {
      hasPermission: () => false,
      hasAnyPermission: () => false,
      hasAllPermissions: () => false,
      canManageUsers: false,
      canManageSettings: false,
      canViewPatients: false,
      canCreateAppointments: false,
      canManageRecords: false,
      canCreateRecords: false,
      canViewReports: false,
      canDeleteData: false,
    };
  }

  return {
    hasPermission: (permission: PermissionKey) => hasPermission(userRole, permission),
    hasAnyPermission: (permissions: PermissionKey[]) => hasAnyPermission(userRole, permissions),
    hasAllPermissions: (permissions: PermissionKey[]) => hasAllPermissions(userRole, permissions),
    canManageUsers: canManageUsers(userRole),
    canManageSettings: canManageSettings(userRole),
    canViewPatients: canViewPatients(userRole),
    canCreateAppointments: canCreateAppointments(userRole),
    canManageRecords: canManageRecords(userRole),
    canCreateRecords: canCreateRecords(userRole),
    canViewReports: canViewReports(userRole),
    canDeleteData: canDeleteData(userRole),
    // Anamnese permissions
    canViewAnamnese: canViewAnamnese(userRole),
    canCreateAnamnese: canCreateAnamnese(userRole),
    canEditAnamnese: canEditAnamnese(userRole),
    canDeleteAnamnese: canDeleteAnamnese(userRole),
    canManageAnamneseTemplates: canManageAnamneseTemplates(userRole),
    canCommentAnamnese: canCommentAnamnese(userRole),
    canFavoriteAnamnese: canFavoriteAnamnese(userRole),
    canExportAnamnese: canExportAnamnese(userRole),
  };
};