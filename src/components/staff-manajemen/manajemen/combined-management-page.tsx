'use client';

import { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Users,
  ClipboardList,
  CalendarClock,
  LayoutDashboard,
  PlusIcon,
  Search,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/ui/tabs';
import StaffForm from '@/components/staff-manajemen/manajemen/staff-form';
import StaffTable from '@/components/staff-manajemen/manajemen/staff-table';
import Modal from '@/components/staff-manajemen/manajemen/modal';
import LeaveManagement from '@/components/staff-manajemen/manajemen/leave-manajemen';
import HistoryShift from '@/components/staff-manajemen/manajemen/history-shift';
import { Staff, StaffFormData } from '@/components/staff-manajemen/types';

export default function CombinedManagementPage() {
  const [activeTab, setActiveTab] = useState('staff');
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<StaffFormData>({ name: '', role: '', department: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // 🔹 Fetch Data
  const fetchStaffs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/staffs');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setStaffs(data);
    } catch {
      toast.error('Gagal memuat data staff');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaffs();
  }, [fetchStaffs]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.role) {
      toast.error('Nama dan role wajib diisi!');
      return;
    }

    try {
      const url = editId ? `/api/staffs/${editId}` : '/api/staffs';
      const method = editId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error();
      toast.success(editId ? 'Staff diperbarui' : 'Staff berhasil ditambahkan!');
      setIsModalOpen(false);
      setEditId(null);
      setFormData({ name: '', role: '', department: '' });
      fetchStaffs();
    } catch {
      toast.error('Gagal menyimpan data staff');
    }
  };

  const handleEdit = (staff: Staff) => {
    setEditId(staff.id);
    setFormData({
      name: staff.name,
      role: staff.role,
      department: staff.department || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus staff ini?')) return;
    try {
      const res = await fetch(`/api/staffs/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Staff berhasil dihapus');
      fetchStaffs();
    } catch {
      toast.error('Gagal menghapus staff');
    }
  };

  const filteredStaffs = staffs.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.role.toLowerCase().includes(search.toLowerCase()) ||
      s.department?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-10 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <LayoutDashboard className="text-blue-600 dark:text-blue-400" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            My Staffs
          </h1>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="sticky top-4 z-40 backdrop-blur-md bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm flex justify-around p-2">
            <TabsTrigger
              value="staff"
              className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Users size={18} /> Staff
            </TabsTrigger>
            <TabsTrigger
              value="leave"
              className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <ClipboardList size={18} /> Cuti
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <CalendarClock size={18} /> Histori
            </TabsTrigger>
          </TabsList>

          {/* --- Staff Tab --- */}
          <TabsContent value="staff" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-5"
            >
              <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-3">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Manajemen Staff
                </h1>
                <div className="flex gap-2 w-full md:w-auto">
                  <div className="relative flex-grow md:flex-grow-0">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      placeholder="Cari staff..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9 pr-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-56"
                    />
                  </div>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all shadow-sm hover:shadow-md"
                  >
                    <PlusIcon size={16} /> Tambah
                  </button>
                </div>
              </div>
              <StaffTable
                staffs={filteredStaffs}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </motion.div>
          </TabsContent>

          {/* --- Leave Tab --- */}
          <TabsContent value="leave" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-5"
            >
              <LeaveManagement />
            </motion.div>
          </TabsContent>

          {/* --- History Tab --- */}
          <TabsContent value="history" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-5"
            >
              <div className="flex items-center mb-4">
                <CalendarClock size={24} className="text-purple-500 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Histori Shift Operasi
                </h2>
              </div>
              <HistoryShift />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal Tambah/Edit */}
      <AnimatePresence>
        {isModalOpen && (
          <Modal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setEditId(null);
            }}
            title={editId ? 'Edit Staff' : 'Tambah Staff'}
          >
            <StaffForm
              formData={formData}
              onChange={handleChange}
              onSubmit={handleSubmit}
              isEdit={!!editId}
            />
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
