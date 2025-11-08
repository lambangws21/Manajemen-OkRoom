"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

type Staff = {
  id: string;
  name: string;
  role: string;
  department?: string;
  createdAt?: string;
  updatedAt?: string;
};

const STATUS_OPTIONS: Staff["role"][] = [
  "Dokter Anestesi",
  "Perawat Bedah",
  "Perawat Anestesi",
];

export default function StaffsManager() {
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: "", role: "", department: "" });
  const [editId, setEditId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchStaffs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/staffs");
      const data = await res.json();
      setStaffs(Array.isArray(data) ? data : data.staffs ?? []);
    } catch (err) {
      console.error("Failed to fetch staffs:", err);
      setStaffs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffs();
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewStaff((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!newStaff.name || !newStaff.role) return alert("Lengkapi data!");
    try {
      const url = editId ? `/api/staffs/${editId}` : "/api/staffs";
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStaff),
      });
      if (!res.ok) throw new Error("Gagal simpan staff");

      setNewStaff({ name: "", role: "", department: "" });
      setEditId(null);
      setIsModalOpen(false);
      fetchStaffs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus staff ini?")) return;
    try {
      const res = await fetch(`/api/staffs/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal hapus staff");
      fetchStaffs();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold dark:text-white">Staffs Manager</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Tambah Staff
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg shadow">
        {loading ? (
          <p className="p-4 dark:text-gray-300">Loading...</p>
        ) : (
          <table className="w-full border-collapse">
            <thead className="bg-gray-200 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">Nama</th>
                <th className="px-4 py-2 text-left">Role</th>
                <th className="px-4 py-2 text-left">Department</th>
                <th className="px-4 py-2 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {staffs.map((staff) => (
                <tr
                  key={staff.id}
                  className="border-b dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <td className="px-4 py-2 dark:text-gray-100">{staff.name}</td>
                  <td className="px-4 py-2 dark:text-gray-100">{staff.role}</td>
                  <td className="px-4 py-2 dark:text-gray-100">
                    {staff.department || "-"}
                  </td>
                  <td className="px-4 py-2 text-center space-x-2">
                    <button
                      onClick={() => {
                        setEditId(staff.id);
                        setNewStaff({
                          name: staff.name,
                          role: staff.role,
                          department: staff.department || "",
                        });
                        setIsModalOpen(true);
                      }}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(staff.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
              {staffs.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-4 text-gray-500 dark:text-gray-400"
                  >
                    Tidak ada staff.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Form */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 w-96 relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditId(null);
                  setNewStaff({ name: "", role: "", department: "" });
                }}
                className="absolute top-3 right-3 text-gray-500 hover:text-black dark:hover:text-white"
              >
                <X />
              </button>

              <h3 className="text-lg font-bold mb-4 dark:text-white">
                {editId ? "Edit Staff" : "Tambah Staff"}
              </h3>

              <div className="space-y-3">
                <input
                  type="text"
                  name="name"
                  placeholder="Nama"
                  value={newStaff.name}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                />
                <select
                  name="role"
                  value={newStaff.role}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                >
                  <option value="">-- Pilih Role --</option>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  name="department"
                  placeholder="Department"
                  value={newStaff.department}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                />
                <button
                  onClick={handleSubmit}
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  {editId ? "Update" : "Tambah"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
