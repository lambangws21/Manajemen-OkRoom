// lib/api.ts
import { Room, PatientStatusData } from '@/types';

const SCRIPT_URL = 'https://script.google.com/macros/s/xxxxxxxxxxxxxxxxxxxxxxxxx/exec';

export const getRoomsData = async (): Promise<Room[]> => {
  try {
    const response = await fetch(`${SCRIPT_URL}?action=getRooms`);
    if (!response.ok) throw new Error('Network response was not ok');
    const data: Room[] = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch rooms data:', error);
    return [];
  }
};

export const getPatientStatus = async (accessCode: string): Promise<PatientStatusData | null> => {
  try {
    const response = await fetch(`${SCRIPT_URL}?action=getStatus&code=${accessCode}`);
    if (!response.ok) throw new Error('Network response was not ok');
    const data: PatientStatusData = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch patient status:', error);
    return null;
  }
};