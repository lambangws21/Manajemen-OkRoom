// src/components/staffs/StaffTable.tsx

import { Staff } from "@/types/index"; // Asumsikan Anda menggunakan alias @/types/index

interface StaffTableProps {
  staffs: Staff[];
  loading: boolean;
  onEdit: (staff: Staff) => void;
  onDelete: (id: string) => void;
}

export default function StaffTable({
  staffs,
  loading,
  onEdit,
  onDelete,
}: StaffTableProps) {
  if (loading) {
    return (
      <div className="p-6 text-center dark:text-gray-300">
        <p>Memuat data staff...</p>
      </div>
    );
  }

  if (staffs.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        <p>Tidak ada staff yang terdaftar saat ini.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg shadow-xl">
      <table className="min-w-full border-collapse">
        <thead className="bg-gray-100 dark:bg-gray-700 border-b dark:border-gray-600">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Nama
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Department
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y dark:divide-gray-700">
          {staffs.map((staff) => (
            <tr
              key={staff.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-100"
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium dark:text-gray-100">
                {staff.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm dark:text-gray-200">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    staff.role.includes("Dokter") ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                }`}>
                    {staff.role}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {staff.department || "-"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                <button
                  onClick={() => onEdit(staff)}
                  className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300 transition duration-150"
                  aria-label={`Edit ${staff.name}`}
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(staff.id)}
                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition duration-150"
                  aria-label={`Hapus ${staff.name}`}
                >
                  Hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}