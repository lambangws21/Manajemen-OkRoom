import { ReactNode } from 'react';

// Mendefinisikan tipe untuk props
interface CardProps {
  // 'children' bisa berisi elemen JSX, teks, atau komponen lain
  children: ReactNode;
  // 'className' bersifat opsional untuk menambahkan styling dari luar
  className?: string;
}

/**
 * Card adalah komponen UI dasar yang berfungsi sebagai wadah konten
 * dengan latar belakang putih, sudut membulat, dan bayangan.
 */
export default function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white text-slate-700 rounded-lg shadow-md p-4 transition-shadow hover:shadow-lg ${className}`}>
      {children}
    </div>
  );
}