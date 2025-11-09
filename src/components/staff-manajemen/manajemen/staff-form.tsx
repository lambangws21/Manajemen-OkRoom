'use client';
import { ChangeEvent } from 'react';
import { StaffFormData } from '../types';
import { motion } from 'framer-motion';

export default function StaffForm({
  formData,
  onChange,
  onSubmit,
  isEdit,
}: {
  formData: StaffFormData;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  isEdit: boolean;
}) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
   {(Object.keys(formData) as (keyof StaffFormData)[]).map((field) => (
  <div key={field}>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize mb-1">
      {field}
    </label>
    <input
      type="text"
      name={field}
      value={formData[field] ?? ''} // ✅ aman & strongly typed
      onChange={onChange}
      required={field !== 'department'}
      className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition"
    />
  </div>
))}

      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
        >
          {isEdit ? 'Update' : 'Simpan'}
        </button>
      </div>
    </motion.form>
  );
}
