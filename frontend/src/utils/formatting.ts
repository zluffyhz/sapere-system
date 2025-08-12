// Utilitários de formatação para o sistema Sapere

import { format, parseISO, isValid, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DATE_FORMATS } from '@/config/constants';

/**
 * Formatação de datas
 */
export const formatDate = (date: string | Date, formatString: string = DATE_FORMATS.DISPLAY): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    if (!isValid(dateObj)) {
      return 'Data inválida';
    }
    
    return format(dateObj, formatString, { locale: ptBR });
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return 'Data inválida';
  }
};

export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, DATE_FORMATS.DISPLAY_WITH_TIME);
};

export const formatTimeAgo = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    if (!isValid(dateObj)) {
      return 'Data inválida';
    }
    
    return formatDistanceToNow(dateObj, { addSuffix: true, locale: ptBR });
  } catch (error) {
    console.error('Erro ao formatar tempo relativo:', error);
    return 'Data inválida';
  }
};

/**
 * Formatação de telefone
 */
export const formatPhone = (phone: string): string => {
  if (!phone) return '';
  
  // Remove todos os caracteres não numéricos
  const cleaned = phone.replace(/\D/g, '');
  
  // Aplica formatação baseada no tamanho
  if (cleaned.length === 11) {
    // Celular: (XX) 9XXXX-XXXX
    return cleaned.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, '($1) $2$3-$4');
  } else if (cleaned.length === 10) {
    // Fixo: (XX) XXXX-XXXX
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return phone;
};

/**
 * Formatação de CPF
 */
export const formatCPF = (cpf: string): string => {
  if (!cpf) return '';
  
  const cleaned = cpf.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  
  return cpf;
};

/**
 * Formatação de moeda (Real brasileiro)
 */
export const formatCurrency = (value: number | string): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return 'R$ 0,00';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(numValue);
};

/**
 * Formatação de nome (primeira letra maiúscula)
 */
export const formatName = (name: string): string => {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .split(' ')
    .map(word => {
      // Preposições e artigos ficam em minúsculo, exceto no início
      const lowercaseWords = ['de', 'da', 'do', 'das', 'dos', 'e', 'em', 'na', 'no'];
      return lowercaseWords.includes(word) && name.split(' ').indexOf(word) !== 0
        ? word
        : word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};

/**
 * Formatação de email (minúsculo)
 */
export const formatEmail = (email: string): string => {
  return email?.toLowerCase().trim() || '';
};

/**
 * Truncar texto
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
};

/**
 * Formatação de idade a partir da data de nascimento
 */
export const calculateAge = (birthDate: string | Date): number => {
  try {
    const birth = typeof birthDate === 'string' ? parseISO(birthDate) : birthDate;
    
    if (!isValid(birth)) return 0;
    
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    
    return age;
  } catch (error) {
    console.error('Erro ao calcular idade:', error);
    return 0;
  }
};

/**
 * Formatação de duração em minutos para formato legível
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}min`;
};

/**
 * Formatação de status com cores
 */
export const getStatusDisplay = (status: string, statusLabels: Record<string, string>, statusColors: Record<string, string>) => {
  return {
    label: statusLabels[status] || status,
    color: statusColors[status] || 'bg-gray-100 text-gray-800'
  };
};

/**
 * Formatação de iniciais do nome
 */
export const getInitials = (name: string): string => {
  if (!name) return '';
  
  return name
    .split(' ')
    .filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2) // Máximo 2 iniciais
    .join('');
};

/**
 * Validação e formatação de dados
 */
export const sanitizeInput = (input: string): string => {
  return input?.trim().replace(/\s+/g, ' ') || '';
};

/**
 * Formatação para URL amigável (slug)
 */
export const createSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .trim()
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-'); // Remove hífens duplicados
};

/**
 * Formatação de tamanho de arquivo
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};