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
    <div className={`bg-slate-50 text-slate-100 rounded shadow-md p-2 transition-shadow hover:shadow-lg ${className}`}>
      {children}
    </div>
  );
}