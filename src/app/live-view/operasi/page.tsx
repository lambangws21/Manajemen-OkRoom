'use client';

import SurgeryStatusBoard from '@/components/live-view/SurgeryStatusBoard';
import { useEffect, useState, useRef } from 'react';
import { getCurrentShift } from '@/lib/utils';
import { mockOnCallAnesthesiaTeam } from '@/lib/mock-data';
import { StaffMember } from '@/types';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CSSTransition, SwitchTransition } from 'react-transition-group';

export default function SurgeryLiveViewPage() {
  const [currentTime, setCurrentTime] = useState('');
  const [activeShift, setActiveShift] = useState<'Pagi' | 'Siang' | 'Malam' | null>(null);
  const [anesthesiaTeam] = useState<StaffMember[]>(mockOnCallAnesthesiaTeam);
  const [currentDoctorIndex, setCurrentDoctorIndex] = useState(0);
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Jalankan sekali saat komponen dimuat untuk menghindari tampilan kosong
    setActiveShift(getCurrentShift());
    setCurrentTime(new Date().toLocaleString('id-ID', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      timeZone: 'Asia/Makassar',
    }));

    // Interval untuk memperbarui jam setiap detik
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleString('id-ID', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        timeZone: 'Asia/Makassar',
      }));
      // Cek perubahan shift setiap detik juga (ringan)
      setActiveShift(getCurrentShift());
    }, 3000);

    // Interval untuk animasi slide nama dokter
    const doctorSlideInterval = setInterval(() => {
      if (anesthesiaTeam.length > 0) {
        setCurrentDoctorIndex(prevIndex => (prevIndex + 1) % anesthesiaTeam.length);
      }
    }, 4000);

    // Cleanup interval saat komponen tidak lagi ditampilkan
    return () => {
      clearInterval(timer);
      clearInterval(doctorSlideInterval);
    };
  }, [anesthesiaTeam.length]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8 relative overflow-hidden">
      <Link href="/dashboard" className="absolute top-4 left-4 p-2 bg-gray-700/50 rounded-full hover:bg-gray-600 transition-colors z-10">
        <ArrowLeft size={24} />
      </Link>

      <header className="flex flex-col md:flex-row justify-between items-center mb-8 border-b-2 border-gray-700 pb-4">
        <div>
          <h1 className="text-3xl sm:text-5xl font-bold">PAPAN STATUS OPERASI</h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-x-6 gap-y-2 mt-4 text-gray-300">
            {activeShift && (
              <div className="text-lg">
                <span className="font-semibold">Shift Aktif:</span>
                <span className="ml-2 px-3 py-1 bg-green-800 text-green-200 rounded-full text-md font-bold">{activeShift}</span>
              </div>
            )}
            <div className="text-lg flex items-center h-8">
              <span className="font-semibold mr-2">Dokter Anestesi Jaga:</span>
              <SwitchTransition mode="out-in">
                <CSSTransition
                  key={currentDoctorIndex}
                  nodeRef={nodeRef}
                  addEndListener={(done) => {
                    nodeRef.current?.addEventListener("transitionend", done, false);
                  }}
                  classNames="fade"
                >
                  <span ref={nodeRef} className="inline-block">
                    {anesthesiaTeam[currentDoctorIndex]?.name.split(',')[0] || 'Memuat...'}
                  </span>
                </CSSTransition>
              </SwitchTransition>
            </div>
          </div>
        </div>
        
        <div className="text-right mt-4 md:mt-0">
          <p className="text-2xl sm:text-4xl font-semibold font-mono">{currentTime.split(' ')[1] || ''}</p>
          <p className="text-lg sm:text-2xl text-gray-400">{currentTime.split(', ')[0] || ''}</p>
        </div>
      </header>
      <main>
        <SurgeryStatusBoard />
      </main>
    </div>
  );
}