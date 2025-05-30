'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CalendarDays,
  Clock,
  MapPin,
  Ticket,
  User,
  QrCode,
  ChevronRight,
  X,
  Music,
  Film,
  Users,
  Mic,
  Gamepad2,
  ShieldCheck,
  CreditCard,
  Download,
  BadgeCheck,
  Loader2,
  ChevronLeft,
  ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { useAppSelector } from '@/lib/hooks/hook';
import { setLoading } from '@/lib/redux/slice/loadingSlice';
import { TicketLoader } from '@/components/ui/ticketLoader';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Types
interface Guest {
  guestId: string;
  name: string;
  gender: string;
  age: number;
  email: string;
  phoneNumber: string;
  qrCode: string;
}

interface EventSchedule {
  date: string;
  startTime: string;
  endTime: string;
  event: {
    title: string;
    venue: string;
    category: string;
  };
}

interface DailyTicketTypeEntry {
  type: string;
  eventSchedule: EventSchedule;
}

interface Booking {
  paymentId: string;
  bookingId: string;
  quantity: number;
  totalPrice: number;
  createdAt: string;
  guests: Guest[];
  dailyTicketTypeEntry: DailyTicketTypeEntry;
}

interface ApiResponse {
  success: boolean;
  message: string;
  bookings: Booking[];
}

interface PaymentDetails {
  paymentId: string;
  attendeeId: string;
  transactionId: string;
  amount: number;
  status: string;
  paidDate: string;
  createdAt: string;
  attendee: {
    username: string;
    email: string;
  };
}

interface PaymentApiResponse {
  success: boolean;
  message: string;
  payment: PaymentDetails;
}

// Category icons mapping
const categoryIcons = {
  MUSIC: Music,
  FILM: Film,
  SPORTS: Users,
  CONFERENCE: Users,
  GAMING: Gamepad2,
  COMEDY: Mic,
  THEATER: Film,
  FOOD: Users,
};

// PDF Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#F5F3FF',
    padding: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7C3AED',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 30,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7C3AED',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
  },
  value: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginVertical: 15,
  },
  total: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footer: {
    marginTop: 30,
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  qrContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  qrText: {
    fontSize: 10,
    marginTop: 10,
    color: '#6B7280',
  },
});

// PDF Receipt Component
const ReceiptPDF = ({ payment, booking }: { payment: PaymentDetails, booking: Booking }) => {
  const event = booking.dailyTicketTypeEntry.eventSchedule.event;
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Event Ticket Receipt</Text>
          <Text style={styles.subtitle}>Booking #{booking.bookingId.slice(0, 8)}</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Event Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Event:</Text>
            <Text style={styles.value}>{event.title}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>
              {format(parseISO(booking.dailyTicketTypeEntry.eventSchedule.date), 'EEEE, MMMM d, yyyy')}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Time:</Text>
            <Text style={styles.value}>
              {booking.dailyTicketTypeEntry.eventSchedule.startTime} - {booking.dailyTicketTypeEntry.eventSchedule.endTime}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Venue:</Text>
            <Text style={styles.value}>{event.venue}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Ticket Type:</Text>
            <Text style={styles.value}>
              {booking.quantity} × {booking.dailyTicketTypeEntry.type}
            </Text>
          </View>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Payment ID:</Text>
            <Text style={styles.value}>{payment.paymentId}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Transaction ID:</Text>
            <Text style={styles.value}>{payment.transactionId}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Payment Date:</Text>
            <Text style={styles.value}>
              {format(parseISO(payment.paidDate || payment.createdAt), 'MMMM d, yyyy HH:mm')}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Payment Status:</Text>
            <Text style={[styles.value, { color: payment.status === 'PAID' ? '#10B981' : '#EF4444' }]}>
              {payment.status}
            </Text>
          </View>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Attendee Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{payment.attendee.username}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{payment.attendee.email}</Text>
          </View>
        </View>
        
        <View style={styles.total}>
          <Text style={[styles.label, { fontSize: 14 }]}>Total Amount:</Text>
          <Text style={[styles.value, { fontSize: 16, color: '#7C3AED' }]}>
            ₹{payment.amount.toLocaleString()}
          </Text>
        </View>
        
        <View style={styles.qrContainer}>
          <Image src={booking.guests[0]?.qrCode} style={{ width: 120, height: 120 }} />
          <Text style={styles.qrText}>Scan this QR code at the event entrance</Text>
        </View>
        
        <View style={styles.footer}>
          <Text>Thank you for your booking!</Text>
          <Text>For any questions, please contact support@eventify.com</Text>
        </View>
      </Page>
    </Document>
  );
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState('');
  const [selectedQr, setSelectedQr] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<{
    payment: PaymentDetails | null;
    booking: Booking | null;
  }>({ payment: null, booking: null });
  const [loadingPayment, setLoadingPayment] = useState(false);
  const isLoading = useSelector((state: any) => state.loading.isLoading);
  const dispatch = useDispatch();
  const { token } = useAppSelector((state) => state.auth);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 5;

   // Calculate pagination data
  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = bookings.slice(indexOfFirstBooking, indexOfLastBooking);
  const totalPages = Math.ceil(bookings.length / bookingsPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // Fetch bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        dispatch(setLoading(true));
        const response = await axios.get<ApiResponse>(`/api/bookings/attendee`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setBookings(response.data.bookings);
      } catch (err) {
        setError('Failed to fetch your bookings');
        console.error(err);
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchBookings();
  }, []);

  // Fetch payment details
  const fetchPaymentDetails = async (paymentId: string, booking: Booking) => {
    try {
      setLoadingPayment(true);
      const response = await axios.get<PaymentApiResponse>(`/api/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setSelectedPayment({ payment: response.data.payment, booking });
    } catch (err) {
      console.error('Failed to fetch payment details:', err);
    } finally {
      setLoadingPayment(false);
    }
  };

  if (isLoading) {
    return <TicketLoader />;
  }

  if (error) {
    return <TicketLoader />;
  }

  if (bookings.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Ticket className="mx-auto h-12 w-12 text-purple-400" />
          <h3 className="mt-4 text-lg font-medium text-purple-800">No bookings found</h3>
          <p className="mt-2 text-purple-600">You haven't made any bookings yet</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-3xl font-bold text-purple-900 mb-2">Your Bookings</h1>
            <p className="text-purple-600 mb-8">View and manage your event tickets</p>

            <div className="space-y-6">
              {currentBookings.map((booking) => {
                const event = booking.dailyTicketTypeEntry.eventSchedule.event;
                const CategoryIcon = categoryIcons[event.category as keyof typeof categoryIcons] || Users;
                
                return (
                  <motion.div
                    key={booking.bookingId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden"
                  >
                    {/* Booking Header */}
                    <div className="p-6 bg-gradient-to-r from-purple-600 to-pink-500 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-xl font-bold flex items-center">
                            <CategoryIcon className="h-5 w-5 mr-2" />
                            {event.title}
                          </h2>
                          <p className="text-sm opacity-90 mt-1">
                            {format(parseISO(booking.dailyTicketTypeEntry.eventSchedule.date), 'EEEE, MMMM d, yyyy')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm opacity-90">Booking #{booking.bookingId.slice(0, 8)}</p>
                          <p className="text-lg font-bold">₹{booking.totalPrice.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Event Details */}
                        <div>
                          <h3 className="text-lg font-semibold text-purple-800 mb-3">Event Details</h3>
                          <div className="space-y-3">
                            <div className="flex items-start">
                              <CalendarDays className="h-5 w-5 text-purple-600 mt-0.5 mr-2 flex-shrink-0" />
                              <div>
                                <p className="text-gray-700">
                                  {format(parseISO(booking.dailyTicketTypeEntry.eventSchedule.date), 'EEEE, MMMM d, yyyy')}
                                </p>
                                <p className="text-sm text-purple-600 flex items-center mt-1">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {booking.dailyTicketTypeEntry.eventSchedule.startTime} - {booking.dailyTicketTypeEntry.eventSchedule.endTime}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-start">
                              <MapPin className="h-5 w-5 text-purple-600 mt-0.5 mr-2 flex-shrink-0" />
                              <p className="text-gray-700">{event.venue}</p>
                            </div>
                            
                            <div className="flex items-start">
                              <Ticket className="h-5 w-5 text-purple-600 mt-0.5 mr-2 flex-shrink-0" />
                              <p className="text-gray-700">
                                {booking.quantity} × {booking.dailyTicketTypeEntry.type} Ticket{booking.quantity > 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Guests */}
                        <div>
                          
                          <h3 className="text-lg font-semibold text-purple-800 mb-3">Guests</h3>
                          <div className="space-y-3">
                            {booking.guests.map((guest) => (
                              <div key={guest.guestId} className="flex items-center justify-between bg-purple-50 p-3 rounded-lg">
                                <div>
                                  <p className="font-medium text-purple-900">{guest.name}</p>
                                  <p className="text-sm text-purple-600">
                                    {guest.age} years • {guest.gender}
                                  </p>
                                </div>
                                <motion.button
                                  onClick={() => setSelectedQr(guest.qrCode)}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="flex items-center text-sm font-medium text-purple-600 hover:text-purple-700"
                                >
                                  <QrCode className="h-4 w-4 mr-1" />
                                  View QR
                                </motion.button>
                              </div>
                            ))}
                          </div>
                           {/* Payment Button */}
                      <div className="mt-6 pt-6 border-t border-purple-100">
                        <motion.button
                          onClick={() => fetchPaymentDetails(booking.paymentId, booking)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg text-purple-800 font-medium hover:from-purple-200 hover:to-pink-200 transition-all"
                        >
                          <CreditCard className="h-5 w-5" />
                          View Payment Details
                        </motion.button>
                      </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {bookings.length > bookingsPerPage && (
              <div className="mt-8 flex items-center justify-between">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg ${
                    currentPage === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-purple-700 hover:bg-purple-100'
                  }`}
                >
                  <ChevronLeft className="h-5 w-5" />
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`w-10 h-10 flex items-center justify-center rounded-full ${
                        currentPage === number
                          ? 'bg-purple-600 text-white'
                          : 'text-purple-700 hover:bg-purple-100'
                      }`}
                    >
                      {number}
                    </button>
                  ))}
                </div>

                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg ${
                    currentPage === totalPages
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-purple-700 hover:bg-purple-100'
                  }`}
                >
                  Next
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
            )}
          </motion.div>
        </div>

        {/* QR Code Modal */}
        <AnimatePresence>
          {selectedQr && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-purple-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-2xl max-w-md w-full p-8 relative border-2 border-purple-200"
              >
                <button
                  onClick={() => setSelectedQr(null)}
                  className="absolute top-4 right-4 text-purple-500 hover:text-purple-700 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-2">
                    Your Event Ticket
                  </h3>
                  <p className="text-purple-700/80 text-sm">Present this QR code for entry</p>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="p-6 bg-white rounded-xl border-2 border-purple-300 mb-6 shadow-lg relative overflow-hidden">
                    <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-pink-300/30"></div>
                    <div className="absolute -bottom-4 -right-4 w-8 h-8 rounded-full bg-purple-300/30"></div>
                    
                    <img 
                      src={selectedQr} 
                      alt="QR Code" 
                      className="w-64 h-64 object-contain"
                    />
                    
                    <motion.div 
                      className="absolute inset-0 border-2 border-transparent rounded-xl pointer-events-none"
                      animate={{
                        borderColor: ['rgba(168, 85, 247, 0)', 'rgba(236, 72, 153, 0.3)', 'rgba(168, 85, 247, 0)']
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </div>
                  
                  <div className="text-center">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 text-sm font-medium mb-3 border border-purple-200 shadow-sm">
                      <Ticket className="h-5 w-5 mr-2 text-pink-500" />
                      <span className="font-semibold">VIP Event Access</span>
                    </div>
                    <p className="text-purple-700/70 text-xs max-w-xs">
                      This QR code contains your unique ticket information. Keep it secure.
                    </p>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-purple-200/50">
                  <div className="flex items-center justify-center space-x-2">
                    <ShieldCheck className="h-4 w-4 text-purple-500" />
                    <p className="text-xs text-purple-700/60 text-center">
                      Verified ticket • Non-transferable • ID required
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Payment Details Modal */}
        <AnimatePresence>
          {selectedPayment.payment && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-purple-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-2xl max-w-md w-full p-8 relative border-2 border-purple-200"
              >
                <button
                  onClick={() => setSelectedPayment({ payment: null, booking: null })}
                  className="absolute top-4 right-4 text-purple-500 hover:text-purple-700 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-2">
                    Payment Details
                  </h3>
                  <p className="text-purple-700/80 text-sm">
                    Booking #{selectedPayment.booking?.bookingId.slice(0, 8)}
                  </p>
                </div>
                
                {loadingPayment ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-purple-600">Payment ID:</span>
                          <span className="font-medium">{selectedPayment.payment.paymentId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-600">Transaction ID:</span>
                          <span className="font-medium">{selectedPayment.payment.transactionId.slice(0,20)}...</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-600">Date:</span>
                          <span className="font-medium">
                            {format(parseISO(selectedPayment.payment.paidDate || selectedPayment.payment.createdAt), 'MMMM d, yyyy HH:mm')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-600">Status:</span>
                          <span className={`font-medium flex items-center ${
                            selectedPayment.payment.status === 'COMPLETED' ? 'text-green-500' : 'text-yellow-500'
                          }`}>
                            {selectedPayment.payment.status === 'COMPLETED' ? (
                              <BadgeCheck className="h-4 w-4 mr-1" />
                            ) : null}
                            {selectedPayment.payment.status}
                          </span>
                        </div>
                        <div className="flex justify-between pt-4 border-t border-purple-100">
                          <span className="text-purple-600 font-semibold">Total Amount:</span>
                          <span className="text-xl font-bold text-purple-800">
                            ₹{selectedPayment.payment.amount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <h4 className="text-purple-800 font-semibold mb-4">Attendee Information</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-purple-600">Name:</span>
                          <span className="font-medium">{selectedPayment.payment.attendee.username}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-600">Email:</span>
                          <span className="font-medium">{selectedPayment.payment.attendee.email}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <PDFDownloadLink
                        document={<ReceiptPDF payment={selectedPayment.payment} booking={selectedPayment.booking!} />}
                        fileName={`receipt-${selectedPayment.payment.paymentId}.pdf`}
                      >
                        {({ loading }) => (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-500 rounded-lg text-white font-medium hover:from-purple-700 hover:to-pink-600 transition-all"
                          >
                            <Download className="h-5 w-5" />
                            {loading ? 'Preparing Receipt...' : 'Download Receipt'}
                          </motion.button>
                        )}
                      </PDFDownloadLink>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Footer />
    </>
  );
}