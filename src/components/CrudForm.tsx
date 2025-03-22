import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import TextFieldCustom from './TextFieldCustom';
import ButtonPrimary from './ButtonPrimary';
import ButtonSecondary from './ButtonSecondary';

interface Field {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'textarea';
  required?: boolean;
}

interface CrudFormProps {
  fields: Field[];
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => void;
  onCancel: () => void;
  title: string;
}

const CrudForm: React.FC<CrudFormProps> = ({ fields, initialData, onSubmit, onCancel, title }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      const emptyData: Record<string, any> = {};
      fields.forEach((field) => {
        emptyData[field.name] = '';
      });
      setFormData(emptyData);
    }
  }, [fields, initialData]);

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.form
        onSubmit={handleSubmit}
        className="bg-[#F5F5F5] rounded-xl shadow-lg p-6 w-full max-w-md relative"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 text-soft-brown/60 hover:text-soft-brown"
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-serif font-bold text-soft-brown mb-6">{title}</h2>
        <div className="space-y-4">
          {fields.map((field) => (
            <TextFieldCustom
              key={field.name}
              id={field.name}
              label={field.label}
              type={field.type}
              value={formData[field.name] || ''}
              onChange={(value) => handleChange(field.name, value)}
              required={field.required}
              multiline={field.type === 'textarea'}
              rows={field.type === 'textarea' ? 4 : undefined}
            />
          ))}
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <ButtonSecondary type="button" onClick={onCancel}>
            Annuler
          </ButtonSecondary>
          <ButtonPrimary type="submit">{initialData ? 'Mettre à jour' : 'Créer'}</ButtonPrimary>
        </div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-floral-pattern bg-no-repeat bg-contain opacity-5 transform rotate-180" />
      </motion.form>
    </motion.div>
  );
};

export default CrudForm;