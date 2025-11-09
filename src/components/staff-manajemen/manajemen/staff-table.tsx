'use client';
import { Staff } from '../types';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StaffTable({
  staffs,
  loading,
  onEdit,
  onDelete,
}: {
  staffs: Staff[];
  loading: boolean;
  onEdit: (s: Staff) => void;
  onDelete: (id: string) => void;
}) {
  if (loading)
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="animate-spin text-blue-500" />
      </div>
    );

  if (staffs.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500 dark:text-gray-400 italic">
        Tidak ada staff ditemukan.
      </div>
    );
  }

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* 💻 TAMPILAN DESKTOP */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
            <tr>
              <th className="px-4 py-2 text-left font-semibold">Nama</th>
              <th className="px-4 py-2 text-left font-semibold">Role</th>
              <th className="px-4 py-2 text-left font-semibold">Departemen</th>
              <th className="px-4 py-2 text-left font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {staffs.map((s) => (
              <motion.tr
                key={s.id}
                whileHover={{ scale: 1.01, backgroundColor: 'rgba(59,130,246,0.05)' }}
                transition={{ duration: 0.2 }}
                className="text-gray-900 dark:text-gray-100"
              >
                <td className="px-4 py-2 font-medium">{s.name}</td>
                <td className="px-4 py-2">{s.role}</td>
                <td className="px-4 py-2">{s.department || '-'}</td>
                <td className="px-4 py-2 space-x-2">
                  <button
                    onClick={() => onEdit(s)}
                    className="text-blue-600 hover:text-blue-800 font-medium transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(s.id)}
                    className="text-red-600 hover:text-red-800 font-medium transition"
                  >
                    Hapus
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 📱 TAMPILAN MOBILE */}
      <div className="md:hidden space-y-4">
        {staffs.map((s) => (
          <motion.div
            key={s.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4 flex flex-col gap-2"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base">
                {s.name}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(s)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(s.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Hapus
                </button>
              </div>
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <p>
                <span className="font-medium text-gray-800 dark:text-gray-200">Role:</span>{' '}
                {s.role}
              </p>
              <p>
                <span className="font-medium text-gray-800 dark:text-gray-200">Departemen:</span>{' '}
                {s.department || '-'}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
