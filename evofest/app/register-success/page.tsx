"use client"; // if you're using Next.js App Router

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // or 'next/navigation' for App Router
import { motion } from 'framer-motion';
import { CheckCircleIcon } from '@heroicons/react/24/outline'; // or your preferred icon package
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

export default function RegistrationSuccess() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/login');
    }, 5000);

    return () => clearTimeout(timer); // cleanup
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center p-4">
        <Navbar />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center"
      >
        <CheckCircleIcon className="w-20 h-20 text-purple-600 mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-gray-900">Registration Successful!</h2>
        <p className="text-pink-600 mt-3 text-xl">
          Thank you for joining EvoFest.{' '}
          <a href="/login" className="text-purple-600 hover:text-purple-500 font-medium">
            Sign in
          </a>{' '}
          to continue.
        </p>
        <p className="text-gray-500 text-sm mt-4">Redirecting to login in 5 seconds...</p>
      </motion.div>
        <Footer />
    </div>
  );
}
