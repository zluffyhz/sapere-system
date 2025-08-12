// Componente para construir formulários dinâmicos baseados nos templates de anamnese

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { AlertCircle, FileText, Calendar, Hash, Type, CheckSquare } from 'lucide-react';
import type { 
  AnamneseTemplate, 
  FormSection, 
  FormField, 
  FieldType 
} from '@/types/anamnese';

interface DynamicFormProps {
  template: AnamneseTemplate;
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => void;
  onCancel?: () => void;
  loading?: boolean;
  readOnly?: boolean;
}

interface FieldComponentProps {
  field: FormField;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  readOnly?: boolean;
}

const FieldComponent: React.FC<FieldComponentProps> = ({
  field,
  value,
  onChange,
  error,
  readOnly = false
}) => {
  const getFieldIcon = (type: FieldType) => {
    switch (type) {
      case 'text':
      case 'textarea':
        return <Type className="h-4 w-4" />;
      case 'number':
        return <Hash className="h-4 w-4" />;
      case 'date':
        return <Calendar className="h-4 w-4" />;
      case 'file':
        return <FileText className="h-4 w-4" />;
      case 'checkbox':
        return <CheckSquare className="h-4 w-4" />;
      default:
        return <Type className="h-4 w-4" />;
    }
  };

  const renderInput = () => {
    const baseClasses = `
      w-full border rounded-lg px-3 py-2 transition-colors
      ${error 
        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
        : 'border-gray-300 focus:border-sapere-orange focus:ring-sapere-orange/20'
      }
      ${readOnly 
        ? 'bg-gray-50 cursor-not-allowed' 
        : 'focus:ring-2'
      }
    `;

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className={baseClasses}
            readOnly={readOnly}
            maxLength={field.validation?.max}
            minLength={field.validation?.min}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            className={baseClasses}
            readOnly={readOnly}
            maxLength={field.validation?.max}
            minLength={field.validation?.min}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(Number(e.target.value))}
            placeholder={field.placeholder}
            className={baseClasses}
            readOnly={readOnly}
            min={field.validation?.min}
            max={field.validation?.max}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={baseClasses}
            readOnly={readOnly}
          />
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={baseClasses}
            disabled={readOnly}
          >
            <option value="">Selecione...</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={field.name}
                  value={option}
                  checked={value === option}
                  onChange={(e) => onChange(e.target.value)}
                  className="text-sapere-orange focus:ring-sapere-orange"
                  disabled={readOnly}
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        if (field.options) {
          // Multiple checkboxes
          const selectedValues = Array.isArray(value) ? value : [];
          return (
            <div className="space-y-2">
              {field.options.map((option, index) => (
                <label key={index} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onChange([...selectedValues, option]);
                      } else {
                        onChange(selectedValues.filter((v: string) => v !== option));
                      }
                    }}
                    className="text-sapere-orange focus:ring-sapere-orange"
                    disabled={readOnly}
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          );
        } else {
          // Single checkbox
          return (
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={value === true}
                onChange={(e) => onChange(e.target.checked)}
                className="text-sapere-orange focus:ring-sapere-orange"
                disabled={readOnly}
              />
              <span className="text-sm text-gray-700">{field.label}</span>
            </label>
          );
        }

      case 'file':
        return (
          <input
            type="file"
            onChange={(e) => onChange(e.target.files)}
            className={baseClasses}
            disabled={readOnly}
            accept={field.validation?.pattern}
          />
        );

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={baseClasses}
            readOnly={readOnly}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
        {getFieldIcon(field.type)}
        {field.label}
        {field.required && <span className="text-red-500">*</span>}
      </label>
      
      {renderInput()}
      
      {error && (
        <div className="flex items-center gap-1 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
      
      {field.validation?.message && !error && (
        <p className="text-xs text-gray-500">
          {field.validation.message}
        </p>
      )}
    </div>
  );
};

const DynamicForm: React.FC<DynamicFormProps> = ({
  template,
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
  readOnly = false
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm({
    defaultValues: initialData
  });

  const [currentSection, setCurrentSection] = useState(0);

  useEffect(() => {
    // Definir valores iniciais
    Object.keys(initialData).forEach(key => {
      setValue(key, initialData[key]);
    });
  }, [initialData, setValue]);

  const validateField = (field: FormField, value: any) => {
    if (field.required && (!value || value === '')) {
      return `${field.label} é obrigatório`;
    }

    if (field.validation) {
      const { min, max, pattern } = field.validation;
      
      if (min !== undefined && field.type === 'text' && value && value.length < min) {
        return `${field.label} deve ter pelo menos ${min} caracteres`;
      }
      
      if (max !== undefined && field.type === 'text' && value && value.length > max) {
        return `${field.label} deve ter no máximo ${max} caracteres`;
      }
      
      if (min !== undefined && field.type === 'number' && value < min) {
        return `${field.label} deve ser pelo menos ${min}`;
      }
      
      if (max !== undefined && field.type === 'number' && value > max) {
        return `${field.label} deve ser no máximo ${max}`;
      }
      
      if (pattern && value && !new RegExp(pattern).test(value)) {
        return field.validation.message || `${field.label} tem formato inválido`;
      }
    }

    return undefined;
  };

  const renderSection = (section: FormSection, sectionIndex: number) => (
    <div key={sectionIndex} className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
        {section.description && (
          <p className="text-sm text-gray-600 mt-1">{section.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {section.fields.map((field, fieldIndex) => (
          <div
            key={`${sectionIndex}-${fieldIndex}`}
            className={field.type === 'textarea' ? 'md:col-span-2' : ''}
          >
            <Controller
              name={field.name}
              control={control}
              rules={{
                required: field.required ? `${field.label} é obrigatório` : false,
                validate: (value) => validateField(field, value)
              }}
              render={({ field: { onChange, value } }) => (
                <FieldComponent
                  field={field}
                  value={value}
                  onChange={onChange}
                  error={errors[field.name]?.message as string}
                  readOnly={readOnly}
                />
              )}
            />
          </div>
        ))}
      </div>
    </div>
  );

  const sections = template.template.sections;
  const totalSections = sections.length;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Navegação entre seções */}
      {totalSections > 1 && (
        <div className="border-b border-gray-200 pb-4">
          <nav className="flex space-x-8 overflow-x-auto">
            {sections.map((section, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentSection(index)}
                className={`
                  whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors
                  ${index === currentSection
                    ? 'border-sapere-orange text-sapere-orange'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {section.title}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Conteúdo da seção atual */}
      <div className="min-h-96">
        {renderSection(sections[currentSection], currentSection)}
      </div>

      {/* Navegação e ações */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <div className="flex gap-3">
          {currentSection > 0 && (
            <button
              type="button"
              onClick={() => setCurrentSection(currentSection - 1)}
              className="btn-secondary"
            >
              Anterior
            </button>
          )}
          
          {currentSection < totalSections - 1 && (
            <button
              type="button"
              onClick={() => setCurrentSection(currentSection + 1)}
              className="btn-secondary"
            >
              Próxima
            </button>
          )}
        </div>

        <div className="flex gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary"
              disabled={loading}
            >
              Cancelar
            </button>
          )}
          
          {!readOnly && (
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar Anamnese'}
            </button>
          )}
        </div>
      </div>

      {/* Progresso */}
      {totalSections > 1 && (
        <div className="text-center text-sm text-gray-500">
          Seção {currentSection + 1} de {totalSections}
        </div>
      )}
    </form>
  );
};

export default DynamicForm;