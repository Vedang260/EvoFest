'use client';

import { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import {
  UserCircleIcon,
  EnvelopeIcon,
  LockClosedIcon,
  TicketIcon,
  MicrophoneIcon,
  UserGroupIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { loginSuccess } from '../../lib/redux/slice/authSlice';
import { useDispatch } from 'react-redux';
import { setLoading } from '@/lib/redux/slice/loadingSlice';

interface FormValues {
  email: string;
  password: string;
}

const LoginPage = () => {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const validationSchema = Yup.object().shape({
        email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
        password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            'Password must contain at least one uppercase, one lowercase, one number, and one special character'
        )
        .required('Password is required'),
    });

  const handleSubmit = async (values: FormValues, { setSubmitting, setStatus }: { setSubmitting: (isSubmitting: boolean) => void; setStatus: (status: any) => void }) => {
    try {
      console.log('Form data', values);
      setIsSubmitted(true);
      dispatch(setLoading(true));
      const response = await axios.post('/api/auth/login', 
        values, {
        headers: {
          "Content-Type": "application/json"
        }
      });
      console.log("Response from backend: ", response);
      const result = response.data;

      if (result.success) {
          // Login was successful
          console.log("Login successful:", result.message);
          dispatch(loginSuccess({
            user: result?.user,
            token: result?.token
          }));
          if(result.user.role === 'ATTENDEE'){
              router.push('/events');
          }else if(result.user.role === 'ORGANIZER'){
              router.push('/');
          }else if(result.user.role === 'STAFF'){

          }
      } else {
        // Handle registration failure
        console.log("Login failed:", result.message);
        toast.error(result.message);
      }

    } catch (error: any) {
      toast.error(error.data.message);
    } finally {
      setSubmitting(false);
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col lg:flex-row gap-8"
        >
          {/* Left Side - Quote and QR Code */}
          <div className="lg:w-1/2 flex flex-col justify-center items-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-center max-w-lg"
            >
              <h2 className="text-4xl font-bold text-purple-700 mb-6">Join the EvoFest Community</h2>
              <blockquote className="text-2xl italic text-pink-400 mb-8">
                "Events are where memories are made, connections are forged, and dreams come to life."
                <footer className="text-xl text-gray-500 mt-3">— EvoFest Team</footer>
              </blockquote>

              <div className="mt-8">
                <h3 className="text-xl font-semibold text-purple-600 mb-4">Scan to Join</h3>
                <div className="bg-white p-6 rounded-lg shadow-md inline-block">
                  <Image
                    src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://evofest.com"
                    alt="EvoFest QR Code"
                    width={250}
                    height={250}
                  />
                </div>
                <p className="text-base text-gray-500 mt-4">Scan the QR code to visit EvoFest!</p>
              </div>
            </motion.div>
          </div>

          {/* Right Side - Login Form Card */}
          <div className="lg:w-1/2 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full"
            >
              <h2 className="text-3xl text-center font-bold text-purple-900 mb-3">Create Your Account</h2>
              <p className="text-gray-600 mb-8 text-base">Join thousands of event enthusiasts</p>

              <Formik
                initialValues={{
                  email: '',
                  password: '',
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting, setFieldValue, status }) => (
                  <Form className="space-y-6">
                    {status?.error && <div className="text-red-500 text-base mb-4">{status.error}</div>}
                    <div>
                      <label htmlFor="email" className="block text-l font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <EnvelopeIcon className="h-6 w-6 text-gray-400" />
                        </div>
                        <Field
                          type="email"
                          id="email"
                          name="email"
                          className="pl-11 w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-gray-50 text-gray-900 placeholder-gray-400 text-base"
                          placeholder="Enter your email"
                        />
                      </div>
                      <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-base font-medium text-gray-700 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <LockClosedIcon className="h-6 w-6 text-gray-400" />
                        </div>
                        <Field
                          type="password"
                          id="password"
                          name="password"
                          className="pl-11 w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-gray-50 text-gray-900 placeholder-gray-400 text-base"
                          placeholder="Create a password"
                        />
                      </div>
                      <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3.5 px-4 rounded-lg hover:from-purple-700 hover:to-pink-600 transition-all flex items-center justify-center font-medium text-base"
                    >
                      {isSubmitting ? (
                        'Signing in...'
                      ) : (
                        <>
                          Login <ArrowRightIcon className="w-6 h-6 ml-2" />
                        </>
                      )}
                    </motion.button>

                    <div className="text-center text-base text-gray-600">
                      Don't have an account?{' '}
                      <a href="/register" className="font-medium text-purple-600 hover:text-purple-500">
                        Sign Up
                      </a>
                    </div>
                  </Form>
                )}
              </Formik>
            </motion.div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default LoginPage;