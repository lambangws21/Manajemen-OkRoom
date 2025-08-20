import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getCurrentShift = (): 'Pagi' | 'Siang' | 'Malam' => {
  const currentHour = new Date().getHours();
  if (currentHour >= 7 && currentHour < 14) return 'Pagi';
  if (currentHour >= 14 && currentHour < 20) return 'Siang';
  return 'Malam';
};

export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Selamat Pagi';
  if (hour < 18) return 'Selamat Siang';
  return 'Selamat Malam';
};