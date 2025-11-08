'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import {Input} from '@/components/ui/ui/ui';
import Button from '@/components/ui/button';
import Spinner from '@/components/ui/Spinner';
import Card from '@/components/ui/card';

export default function TrackerAccessForm() {
  const [accessCode, setAccessCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!accessCode.trim()) {
      setError('Kode akses atau ID Operasi tidak boleh kosong.');
      return;
    }
    
    setIsLoading(true);
    // DIUBAH: Mengarahkan ke URL dengan kode akses tanpa .toUpperCase()
    // karena ID operasi bisa case-sensitive (misal: op-001)
    router.push(`/status-pasien/${accessCode.trim()}`);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (error) setError(null);
    // DIUBAH: Tidak perlu .toUpperCase() lagi
    setAccessCode(e.target.value);
  }

  return (
    <Card className="max-w-md w-full mx-auto mt-10 dark:bg-gray-800">
      <form onSubmit={handleSubmit} className="p-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Lacak Status Pasien</h2>
          <p className="text-gray-600 dark:text-gray-200 mt-2">
            Masukkan ID Operasi pasien untuk melihat progres.
          </p>
        </div>
        
        <div className="space-y-4">
          <div className='dark:text-gray-200'>
            <label htmlFor="access-code" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              ID Operasi
            </label>
            <Input
              id="access-code"
              placeholder="Contoh: op-001"
              value={accessCode}
              onChange={handleChange}
            />
            {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
          </div>

          <Button type="submit" variant="primary" disabled={isLoading} className="w-full">
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Spinner size="sm" />
                <span className="ml-2">Melacak...</span>
              </div>
            ) : (
              'Lacak Status'
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}