import React from 'react';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
  title: string;
  children: React.ReactNode;
}

export default function AuthLayout({ title, children }: AuthLayoutProps) {
  return (
    <motion.main
      className="min-h-screen flex flex-col items-center justify-center bg-blue-50 text-gray-800 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="w-full max-w-lg">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-blue-800">{title}</h1>
        </header>
        <section className="rounded-2xl bg-white p-8 shadow-md ring-1 ring-gray-200">
          {children}
        </section>
      </div>
    </motion.main>
  );
}
