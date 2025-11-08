'use client';

import SurgeryStatusBoard from '@/components/live-view/SurgeryStatusBoard';
import { useEffect, useState, useRef, useCallback } from 'react';
import { getCurrentShift } from '@/lib/utils';
// 💥 DIHAPUS: import { mockOnCallAnesthesiaTeam } from '@/lib/mock-data';
import { StaffMember } from '@/types';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { CSSTransition, SwitchTransition } from 'react-transition-group';

// 💥 BARU: Tipe data dari API
interface LiveShiftData {
    anesthesiaTeam: StaffMember[];
    responsibleStaff: string;
}


export default function SurgeryLiveViewPage() {
    const [currentTime, setCurrentTime] = useState('');
    const [activeShift, setActiveShift] = useState<'Pagi' | 'Siang' | 'Malam' | null>(null);
    
    // 💥 PERUBAHAN: State untuk data yang diambil dari API
    const [liveData, setLiveData] = useState<LiveShiftData>({ anesthesiaTeam: [], responsibleStaff: 'Memuat...' });
    const [loadingData, setLoadingData] = useState(true);
    
    const [currentDoctorIndex, setCurrentDoctorIndex] = useState(0);
    const nodeRef = useRef<HTMLSpanElement>(null);

    // 💥 BARU: Fungsi untuk mengambil data shift dari API
    const fetchLiveData = useCallback(async () => {
        setLoadingData(true);
        try {
            // Panggil API handler yang baru dibuat
            const res = await fetch('/api/operasi-live-view');
            if (!res.ok) throw new Error("Gagal mengambil data shift.");
            
            const data: LiveShiftData = await res.json();
            setLiveData(data);
        } catch (error) {
            console.error(error);
            setLiveData(prev => ({ ...prev, responsibleStaff: 'Error memuat data' }));
        } finally {
            setLoadingData(false);
        }
    }, []);

    // 1. Setup Time and Fetch Data
    useEffect(() => {
        // Ambil data shift saat pertama kali dimuat
        fetchLiveData(); 
        
        // Setup waktu lokal awal
        const initialTime = new Date().toLocaleString('id-ID', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            timeZone: 'Asia/Makassar',
        });
        setActiveShift(getCurrentShift());
        setCurrentTime(initialTime);

        // Interval untuk memperbarui jam dan shift setiap 3 detik
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleString('id-ID', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit',
                timeZone: 'Asia/Makassar',
            }));
            setActiveShift(getCurrentShift());
            // 💥 BARU: Refresh data setiap 30 detik (jika perlu)
            // fetchLiveData(); 
        }, 3000);

        // Interval untuk animasi slide nama dokter
        const doctorSlideInterval = setInterval(() => {
            if (liveData.anesthesiaTeam.length > 0) {
                setCurrentDoctorIndex(prevIndex => (prevIndex + 1) % liveData.anesthesiaTeam.length);
            }
        }, 4000);

        // Cleanup interval
        return () => {
            clearInterval(timer);
            clearInterval(doctorSlideInterval);
        };
    }, [fetchLiveData, liveData.anesthesiaTeam.length]); // Tambahkan dependensi fetchLiveData

    // Ambil tim anestesi dari state liveData
    const anesthesiaTeam = liveData.anesthesiaTeam;

    // Untuk memastikan tampilan nama dokter jaga tidak kosong
    const doctorName = anesthesiaTeam[currentDoctorIndex]?.name.split(',')[0] || liveData.responsibleStaff || 'N/A';
    

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8 relative overflow-hidden">
            <Link href="/dashboard" className="absolute top-4 left-4 p-2 bg-gray-700/50 rounded-full hover:bg-gray-600 transition-colors z-10">
                <ArrowLeft size={14} />
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
                            {loadingData ? (
                                <Loader2 size={18} className="animate-spin text-blue-400" />
                            ) : (
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
                                            {doctorName}
                                        </span>
                                    </CSSTransition>
                                </SwitchTransition>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className=" flex items-center text-right mt-4 md:mt-0">
                    {/* <p className="text-9xl sm:text-4xl font-bold font-mono">{currentTime.split(' ')[1] || ''}</p>
                    <p className="text-xl sm:text-2xl text-gray-400">{currentTime.split(', ')[0] || ''}</p> */}
                    <p className="text-4xl sm:text-2xl text-gray-200">{currentTime.split(', ')[1] || ''}</p>
                </div>
            </header>
            <main>
                <SurgeryStatusBoard />
            </main>
            
            {/* CSS untuk transisi fade-out/fade-in */}
            <style jsx global>{`
                .fade-enter {
                    opacity: 0;
                    transform: translateX(10px);
                }
                .fade-enter-active {
                    opacity: 1;
                    transform: translateX(0);
                    transition: opacity 300ms, transform 300ms;
                }
                .fade-exit {
                    opacity: 1;
                    transform: translateX(0);
                }
                .fade-exit-active {
                    opacity: 0;
                    transform: translateX(-10px);
                    transition: opacity 300ms, transform 300ms;
                }
            `}</style>
        </div>
    );
}