// src/components/staffs/StaffForm.tsx
import { ChangeEvent } from "react";

const ROLE_OPTIONS = ["Dokter Anestesi", "Perawat Bedah", "Perawat Anestesi"];

interface StaffFormProps {
  formData: { name: string; role: string; department: string };
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: () => void;
  isEdit: boolean;
}

export default function StaffForm({
  formData,
  onChange,
  onSubmit,
  isEdit,
}: StaffFormProps) {
  return (
    <div className="space-y-4">
      <input
        type="text"
        name="name"
        placeholder="Nama Staff"
        value={formData.name}
        onChange={onChange}
        className="w-full border rounded px-4 py-2.5 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
        required
      />
      <select
        name="role"
        value={formData.role}
        onChange={onChange}
        className="w-full border rounded px-4 py-2.5 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 appearance-none"
        required
      >
        <option value="" disabled>
          -- Pilih Role --
        </option>
        {ROLE_OPTIONS.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>
      <input
        type="text"
        name="department"
        placeholder="Department (Opsional)"
        value={formData.department}
        onChange={onChange}
        className="w-full border rounded px-4 py-2.5 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
      />
      <button
        onClick={onSubmit}
        className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition duration-150"
      >
        {isEdit ? "Update Staff" : "Tambah Staff"}
      </button>
    </div>
  );
}