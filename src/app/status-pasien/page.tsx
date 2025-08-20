'use client';

import TrackerAccessForm from '@/components/tracker/TrackerAccressForm';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { Home } from 'lucide-react';

export default function StatusPasienPage() {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 relative">
      {/* Tombol Kembali ke Homepage */}
      <Link href="/" className="absolute top-6 left-6">
        <Button variant="secondary">
          <Home size={16} className="mr-2" />
          Kembali ke Homepage
        </Button>
      </Link>
      
      <TrackerAccessForm />
    </div>
  );
}