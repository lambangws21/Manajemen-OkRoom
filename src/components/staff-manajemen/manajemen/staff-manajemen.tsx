'use client';
import { useState, useEffect, ChangeEvent } from 'react';
import { Plus, Search, Loader2, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Staff } from '@/types';

interface StaffFormData {
  name: string;
  role: string;
  department?: string;
}

const INITIAL_FORM: StaffFormData = { name: '', role: '', department: '' };

export default function StaffManagement() {
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchStaffs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/staffs');
      const data = await res.json();
      setStaffs(data);
    } catch {
      toast.error('Gagal memuat daftar staf');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStaffs(); }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.role) return toast.error('Nama dan Role wajib diisi!');
    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `/api/staffs/${editId}` : '/api/staffs';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error();
      toast.success(editId ? 'Data staf diperbarui' : 'Staf baru ditambahkan');
      setFormData(INITIAL_FORM);
      setEditId(null);
      fetchStaffs();
    } catch {
      toast.error('Gagal menyimpan data staf');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus staf ini?')) return;
    try {
      await fetch(`/api/staffs/${id}`, { method: 'DELETE' });
      toast.success('Staf dihapus');
      fetchStaffs();
    } catch {
      toast.error('Gagal hapus staf');
    }
  };

  const filtered = staffs.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-md shadow">
      <h2 className="text-xl font-semibold mb-4">Manajemen Staf</h2>
      <div className="flex items-center gap-2 mb-4">
        <Search size={16} className="text-gray-400" />
        <input
          placeholder="Cari staf..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-1 border rounded-md bg-gray-100 dark:bg-gray-700"
        />
      </div>
      {loading ? (
        <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b dark:border-gray-600">
              <th className="text-left py-2">Nama</th>
              <th className="text-left py-2">Role</th>
              <th className="text-left py-2">Dept</th>
              <th className="text-left py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-b dark:border-gray-700">
                <td>{s.name}</td>
                <td>{s.role}</td>
                <td>{s.department}</td>
                <td className="space-x-2">
                  <button onClick={() => { setFormData(s); setEditId(s.id); }} className="text-blue-500"><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(s.id)} className="text-red-500"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="mt-4 border-t pt-4">
        <h3 className="font-semibold mb-2">{editId ? 'Edit Staf' : 'Tambah Staf'}</h3>
        <div className="grid md:grid-cols-3 gap-2">
          <input name="name" value={formData.name} onChange={handleChange} placeholder="Nama" className="border rounded px-2 py-1" />
          <input name="role" value={formData.role} onChange={handleChange} placeholder="Role" className="border rounded px-2 py-1" />
          <input name="department" value={formData.department} onChange={handleChange} placeholder="Departemen" className="border rounded px-2 py-1" />
        </div>
        <button onClick={handleSubmit} className="mt-2 bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1 hover:bg-blue-700">
          <Plus size={14} /> Simpan
        </button>
      </div>
    </div>
  );
}
