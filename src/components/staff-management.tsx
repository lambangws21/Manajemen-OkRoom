// This component is for manually testing the PUT /api/shift-assignments route handler.
'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Save, Loader2, CheckSquare, Square, AlertTriangle } from 'lucide-react';

// --- Tipe Data ---

type ShiftKey = 'Pagi' | 'Siang' | 'Malam';
const SHIFTS: ShiftKey[] = ['Pagi', 'Siang', 'Malam'];

interface Staff {
  id: string;
  name: string;
  role: string;
  department: string;
}

type NurseShiftTeams = {
  [K in ShiftKey]: Staff[];
};

interface ApiResponse {
    message?: string;
    error?: string;
}

interface ShiftAssignment {
  anesthesiaTeam: Staff[];
  nurseTeams: NurseShiftTeams;
}

// --- 1. Custom Hook untuk Mengambil Data Staf ---

/**
 * Hook kustom untuk mengambil dan mengelola daftar staf.
 */
function useStaffData() {
  const [allStaff, setAllStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStaff = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/staffs');
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || `Error ${res.status}`);
        }
        const data: Staff[] = await res.json();
        setAllStaff(data);
      } catch (e: unknown) {
        console.error('Fetch Staff Error:', e);
        setError(e instanceof Error ? e.message : 'Gagal memuat staf');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStaff();
  }, []);

  // Memfilter data menggunakan useMemo
  const anesthesiaStaff = useMemo(() =>
    allStaff.filter(s => s.role.includes('Dokter Anestesi')),
    [allStaff]
  );

  const nurseStaff = useMemo(() =>
    allStaff.filter(s => s.role.includes('Perawat')),
    [allStaff]
  );

  return { allStaff, anesthesiaStaff, nurseStaff, isLoading, error };
}

// --- 2. Custom Hook untuk Mengirim Penugasan ---

/**
 * Hook kustom untuk menangani submission PUT /api/shift-assignments.
 */
function useSubmitAssignment() {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (payload: ShiftAssignment) => {
    setIsLoading(true);
    setResponse(null);
    setError(null);

    try {
      const apiUrl = '/api/shift-assignments';
      const res = await fetch(apiUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data: ApiResponse;

      try {
        data = JSON.parse(text) as ApiResponse;
      } catch {
        data = { error: `Non-JSON Response (${res.status}): ${String(text).substring(0, 100)}...` };
      }

      if (res.ok) {
        setResponse(JSON.stringify(data, null, 2));
        console.log('API Test Success:', data);
      } else {
        setError(data.error || `Error ${res.status}: ${res.statusText}`);
        setResponse(JSON.stringify(data, null, 2));
      }
    } catch (e: unknown) {
      console.error('Fetch Error:', e);
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { submit, isLoading, response, error };
}


// --- 3. Komponen Helper (CheckboxGroup) ---
// (Tidak ada perubahan, sudah cukup clean)
interface CheckboxGroupProps {
  title: string;
  options: Staff[];
  selectedIds: string[];
  onChange: (staffId: string) => void;
  className?: string;
}

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({ title, options, selectedIds, onChange, className }) => (
  <div className={`p-4 border border-gray-200 rounded-lg ${className}`}>
    <h4 className="font-semibold text-gray-800 mb-2">{title}</h4>
    <div className="space-y-2">
      {options.length === 0 && (
        <p className="text-sm text-gray-500 italic">Tidak ada staf tersedia.</p>
      )}
      {options.map(staff => {
        const isSelected = selectedIds.includes(staff.id);
        return (
          <label
            key={staff.id}
            className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${
              isSelected ? 'bg-blue-50 border border-blue-300' : 'hover:bg-gray-50'
            }`}
          >
            <input
              type="checkbox"
              className="hidden"
              checked={isSelected}
              onChange={() => onChange(staff.id)}
            />
            {isSelected ? (
              <CheckSquare size={18} className="text-blue-600 mr-2" />
            ) : (
              <Square size={18} className="text-gray-400 mr-2" />
            )}
            <div className="text-sm">
              <span className="font-medium text-gray-900">{staff.name}</span>
              <span className="text-gray-500 ml-2">({staff.role})</span>
            </div>
          </label>
        );
      })}
    </div>
  </div>
);

// --- 4. Komponen Form Terpisah ---

interface AssignmentFormProps {
  allStaff: Staff[];
  anesthesiaStaff: Staff[];
  nurseStaff: Staff[];
  onSubmit: (payload: ShiftAssignment) => void;
  isSubmitting: boolean;
}

const AssignmentForm: React.FC<AssignmentFormProps> = ({
  allStaff,
  anesthesiaStaff,
  nurseStaff,
  onSubmit,
  isSubmitting,
}) => {
  // State untuk form dipindahkan ke sini
  const [selectedAnesthesiaIds, setSelectedAnesthesiaIds] = useState<string[]>([]);
  const [selectedNurseIds, setSelectedNurseIds] = useState<Record<ShiftKey, string[]>>({
    Pagi: [], Siang: [], Malam: [],
  });

  // Handler Checkbox
  const toggleAnesthesia = (staffId: string) => {
    setSelectedAnesthesiaIds(prev =>
      prev.includes(staffId) ? prev.filter(id => id !== staffId) : [...prev, staffId]
    );
  };

  const toggleNurse = (shift: ShiftKey, staffId: string) => {
    setSelectedNurseIds(prev => {
      const currentShiftIds = prev[shift];
      const newShiftIds = currentShiftIds.includes(staffId)
        ? currentShiftIds.filter(id => id !== staffId)
        : [...currentShiftIds, staffId];
      return { ...prev, [shift]: newShiftIds };
    });
  };

  // Handler untuk Submit Form
  const handleRunTest = (e: React.FormEvent) => {
    e.preventDefault();

    // Membangun payload dari `allStaff`
    const findStaffById = (id: string) => allStaff.find(s => s.id === id);
    const filterValidStaff = (s: Staff | undefined): s is Staff => !!s;

    const payload: ShiftAssignment = {
      anesthesiaTeam: selectedAnesthesiaIds.map(findStaffById).filter(filterValidStaff),
      nurseTeams: {
        Pagi: selectedNurseIds.Pagi.map(findStaffById).filter(filterValidStaff),
        Siang: selectedNurseIds.Siang.map(findStaffById).filter(filterValidStaff),
        Malam: selectedNurseIds.Malam.map(findStaffById).filter(filterValidStaff),
      }
    };

    onSubmit(payload); // Memanggil fungsi submit dari hook
  };

  return (
    <form onSubmit={handleRunTest} className="space-y-6">
      {/* Bagian Dokter Anestesi */}
      <CheckboxGroup
        title="Tim Dokter Anestesi"
        options={anesthesiaStaff}
        selectedIds={selectedAnesthesiaIds}
        onChange={toggleAnesthesia}
        className="bg-blue-50/50"
      />

      {/* Bagian Perawat */}
      <div className="p-4 border border-gray-200 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-4">Tim Perawat per Shift</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SHIFTS.map(shift => (
            <CheckboxGroup
              key={shift}
              title={`Shift ${shift}`}
              options={nurseStaff}
              selectedIds={selectedNurseIds[shift]}
              onChange={(staffId) => toggleNurse(shift, staffId)}
              className="bg-green-50/30"
            />
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-10 flex items-center justify-center rounded-lg font-medium transition-colors bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 shadow-lg"
      >
        {isSubmitting ? (
          <><Loader2 size={18} className="mr-2 animate-spin" /> Mengirim PUT Request...</>
        ) : (
          <><Save size={18} className="mr-2" /> Jalankan Tes PUT</>
        )}
      </button>
    </form>
  );
};

// --- 5. Komponen Status/Response Terpisah ---

const StatusMessages: React.FC<{ isLoading: boolean, error: string | null }> = ({ isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 size={24} className="animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Memuat daftar staf...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-lg border border-red-300 font-medium flex items-center">
        <AlertTriangle size={18} className="mr-2" />
        <div>
          <span className="font-bold">Gagal memuat staf:</span> {error}
        </div>
      </div>
    );
  }

  return null;
};

const ServerResponse: React.FC<{ response: string | null, error: string | null }> = ({ response, error }) => {
  if (!response && !error) return null;

  return (
    <div className="mt-6 border-t pt-4">
      <h3 className="font-semibold mb-2">Respons Server:</h3>
      {error && (
        <div className="p-3 mb-2 bg-red-100 text-red-700 rounded-lg border border-red-300 font-medium">
          <span className="font-bold">Error:</span> {error}
        </div>
      )}
      {response && (
        <pre className={`text-xs p-2 rounded-md overflow-x-auto ${error ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
          {response}
        </pre>
      )}
    </div>
  );
};


// --- 6. KOMPONEN TESTER UTAMA (Sekarang Jauh Lebih Clean) ---

const ApiTester = () => {
  // Panggil hook untuk data staf
  const { allStaff, anesthesiaStaff, nurseStaff, isLoading: isStaffLoading, error: staffError } = useStaffData();

  // Panggil hook untuk submit
  const { submit, isLoading: isSubmitting, response, error: submitError } = useSubmitAssignment();

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white shadow-xl rounded-xl border border-gray-200">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">API PUT Test: /api/shift-assignments</h1>
      <p className="text-sm text-gray-600 mb-6">Pilih staf dari daftar database untuk membangun payload dan mengirimkannya ke API Anda.</p>

      {/* Tampilkan status loading/error untuk data staf */}
      <StatusMessages isLoading={isStaffLoading} error={staffError} />

      {/* Tampilkan form hanya jika staf berhasil dimuat */}
      {!isStaffLoading && !staffError && (
        <AssignmentForm
          allStaff={allStaff}
          anesthesiaStaff={anesthesiaStaff}
          nurseStaff={nurseStaff}
          onSubmit={submit} // Kirim fungsi submit dari hook
          isSubmitting={isSubmitting} // Kirim status loading dari hook
        />
      )}

      {/* Tampilkan response dari server */}
      <ServerResponse response={response} error={submitError} />
    </div>
  );
}

export default ApiTester;