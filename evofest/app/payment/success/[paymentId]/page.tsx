'use client';

import { useParams } from 'next/navigation';
import axios from 'axios';
import { 
  CheckCircle2,
  CreditCard,
  BadgeCheck,
  ArrowRight,
  Home,
  Calendar,
  XCircle,
  User
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAppSelector } from '@/lib/hooks/hook';
import { setLoading } from '@/lib/redux/slice/loadingSlice';
import { TicketLoader } from '@/components/ui/ticketLoader';
import toast from 'react-hot-toast';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

interface Payment {
  paymentId: string;
  transactionId: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  paidDate: string;
  attendee: {
    name: string;
    email: string;
  };
}

export default function PaymentSuccessPage() {
  const { paymentId } = useParams();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [error, setError] = useState('');
  const isLoading = useSelector((state: any) => state.loading.isLoading);
  const dispatch = useDispatch();
  const { token } = useAppSelector((state) => state.auth);
    
  useEffect(() => {
    const fetchPayment = async () => {
      try {
        dispatch(setLoading(true));
        const response = await axios.get(`/api/payments/${paymentId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if(response.data.success){
          toast.success(response.data.message);
          setPayment(response.data.payment);
        }
      } catch (err) {
        setError('Failed to fetch payment details');
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchPayment();
  }, [paymentId]);

  if (isLoading) {
    return <TicketLoader />
  }

  if (error || !payment) {
    return <TicketLoader />
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center"
        >
          {/* Success Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-6"
          >
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </motion.div>

          <h1 className="text-3xl md:text-4xl font-bold text-purple-900 mb-4">
            Payment Successful!
          </h1>
          <p className="text-xl text-purple-600 mb-8">
            Thank you for your payment. Your transaction is complete.
          </p>

          {/* Confetti Animation */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: -100, x: Math.random() * 200 - 100, rotate: 0 }}
                animate={{
                  y: [0, 1000],
                  x: Math.random() * 200 - 100,
                  rotate: 360,
                  opacity: [1, 0]
                }}
                transition={{
                  duration: 3 + Math.random() * 5,
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: `${Math.random() * 100}%`,
                  fontSize: '20px',
                  color: ['#8b5cf6', '#ec4899', '#10b981'][Math.floor(Math.random() * 3)]
                }}
              >
                {['🎉', '🎊', '✨', '🎈', '🎁'][Math.floor(Math.random() * 5)]}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Payment Receipt */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 bg-white rounded-xl shadow-lg overflow-hidden max-w-2xl mx-auto"
        >
          <div className="p-6 bg-gradient-to-r from-purple-600 to-pink-500 text-white">
            <h2 className="text-xl font-bold flex items-center">
              <BadgeCheck className="h-6 w-6 mr-2" />
              Payment Receipt
            </h2>
            <p className="text-sm opacity-90 mt-1">
              Payment ID: {payment.paymentId}
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
                  <User className="h-5 w-5 text-purple-600 mr-2" />
                  Customer Details
                </h3>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    <span className="font-medium">Name:</span> {payment.attendee.name}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Email:</span> {payment.attendee.email}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
                  <CreditCard className="h-5 w-5 text-purple-600 mr-2" />
                  Transaction Details
                </h3>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    <span className="font-medium">Amount:</span> ₹{payment.amount.toLocaleString()}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Date:</span> {format(new Date(payment.paidDate), 'PPPp')}
                  </p>
                  <p className="text-gray-700 flex items-center">
                    <span className="font-medium">Status:</span> 
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Completed
                    </span>
                  </p>
                  {payment.transactionId && (
                    <p className="text-gray-700">
                      <span className="font-medium">Transaction ID:</span> {payment.transactionId}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-purple-100">
              <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
                <Calendar className="h-5 w-5 text-purple-600 mr-2" />
                Next Steps
              </h3>
              <p className="text-gray-700">
                You will receive a confirmation email with your payment details shortly.
                If you have any questions about your payment, please contact our support team.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 flex flex-col sm:flex-row justify-center gap-4 max-w-2xl mx-auto"
        >
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 hover:scale-105"
          >
            <Home className="h-5 w-5 mr-2" />
            Back to Home
          </Link>
          <Link
            href="/user/payments"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-purple-700 bg-purple-100 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 hover:scale-105"
          >
            Payment History
            <ArrowRight className="h-5 w-5 ml-2" />
          </Link>
        </motion.div>
      </div>
      </div>
      <Footer />
    </>    
  );
}