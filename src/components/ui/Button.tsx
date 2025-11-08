'use client';

import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg'; // ✅ DITAMBAHKAN: Prop 'size'
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export default function Button({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md', // ✅ DITAMBAHKAN: Default size adalah 'md'
  disabled = false, 
  type = 'button',
  className = '' 
}: ButtonProps) {
  
  // Kelas dasar yang umum untuk semua tombol
  const baseClasses = 'font-semibold text-white transition-colors focus:outline-none focus:ring-1 focus:ring-offset-1 flex items-center justify-center rounded';
  
  // Opsi varian warna
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-500 hover:bg-gray-600 focus:ring-gray-400',
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
  };

  // ✅ DITAMBAHKAN: Opsi ukuran (padding dan ukuran font)
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  
  const disabledClasses = 'disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      // ✅ DIUBAH: Menggabungkan semua kelas, termasuk kelas ukuran (size)
      className={`${baseClasses} ${sizes[size]} ${variants[variant]} ${disabledClasses} ${className}`}
    >
      {children}
    </button>
  );
}