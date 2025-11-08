// lib/status.ts

import { PatientStatusData, PatientStage, ExtendedOngoingSurgery } from '@/types/tracker';

/**
 * Mapping alur kerja standar operasi dengan status kunci data (timestamp)
 */
export const WORKFLOW_MAP: { [key: string]: { name: string, desc: string, statusKey: keyof ExtendedOngoingSurgery } } = {
    'Diterima': { name: " Pendaftaran (OK)", desc: "Pasien diterima di area transfer kamar operasi.", statusKey: 'startTime' },
    'Persiapan Operasi': { name: "Persiapan di OK", desc: "Pasien menjalani prosedur persiapan akhir sebelum tindakan.", statusKey: 'startTime' },
    'Operasi Berlangsung': { name: "Operasi Berlangsung", desc: "Tindakan bedah sedang dilakukan.", statusKey: 'actualStartTime' },
    'Operasi Selesai': { name: "Operasi Selesai", desc: "Prosedur bedah telah selesai.", statusKey: 'endTime' },
    'Ruang Pemulihan': { name: "Pemulihan (Recovery)", desc: "Pasien dipindahkan ke ruang pemulihan pasca operasi.", statusKey: 'endTime' },
};

/**
 * Mengonversi data OngoingSurgery dari API menjadi struktur timeline.
 * @param surgery Data operasi mentah dari API.
 * @returns Struktur data yang siap ditampilkan di timeline.
 */
export function mapSurgeryToTimeline(surgery: ExtendedOngoingSurgery): PatientStatusData {
    const statusKeys = Object.keys(WORKFLOW_MAP);
    // Gunakan status dari API, fallback ke status pertama jika kosong/tidak valid
    const currentApiStatus = surgery.status || statusKeys[0]; 

    const stages: PatientStage[] = statusKeys.map(key => {
        const map = WORKFLOW_MAP[key];
        let timestamp: string | null = null;
        
        // Ambil timestamp dari properti yang sesuai di data surgery
        const keyName = map.statusKey as keyof ExtendedOngoingSurgery;
        const surgeryTimestamp = surgery[keyName];

        if (surgeryTimestamp) {
            timestamp = surgeryTimestamp as string;
        }

        const statusIndexInMap = statusKeys.indexOf(currentApiStatus);
        const stageIndexInMap = statusKeys.indexOf(key);

        // Jika tahap sudah lewat namun timestamp null, gunakan startTime (untuk visual)
        if (stageIndexInMap < statusIndexInMap && timestamp === null) {
             timestamp = surgery.startTime || null; 
        }
        
        // Tahap yang sedang berjalan dan belum memiliki timestamp khusus, beri waktu saat ini
        if (stageIndexInMap === statusIndexInMap && timestamp === null) {
            timestamp = new Date().toISOString();
        }

        return {
            name: map.name,
            timestamp: timestamp,
            desc: map.desc,
            statusKey: map.statusKey,
        };
    });
    
    // Tentukan nama stage yang sedang aktif
    const currentStageName = WORKFLOW_MAP[currentApiStatus]?.name || stages[0].name;

    return {
        id: surgery.id,
        patientName: surgery.patientName,
        mrn: surgery.mrn,
        stages: stages,
        currentStage: currentStageName,
    };
}