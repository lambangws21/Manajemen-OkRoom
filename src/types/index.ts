// types/index.ts

export interface Room {
    id: number | string;
    number: number;
    type: string;
    status: 'Available' | 'Occupied' | 'Dirty' | 'Out of Order';
  }
  
  export interface PatientStage {
    name: string;
    timestamp: string | null;
    desc: string;
  }
  
  export interface PatientStatusData {
    stages: PatientStage[];
    currentStage: string;
  }