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
  Gamepad2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { useAppSelector } from '@/lib/hooks/hook';
import { setLoading } from '@/lib/redux/slice/loadingSlice';
import { TicketLoader } from '@/components/ui/ticketLoader';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

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

export default function BookingsPage() {
    
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState('');
  const [selectedQr, setSelectedQr] = useState<string | null>(null);
  const isLoading = useSelector((state: any) => state.loading.isLoading);
  const dispatch = useDispatch();
  const { token } = useAppSelector((state) => state.auth);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  // Fetch bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        dispatch(setLoading(true));
        const response = await axios.get<ApiResponse>(`/api/bookings/attendee`, {
            headers:{
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

  if (isLoading) {
    return (
      <TicketLoader />
    );
  }

  if (error) {
    return (
      <TicketLoader />
    );
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
            {bookings.map((booking) => {
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
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {selectedQr && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative"
            >
              <button
                onClick={() => setSelectedQr(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
              
              <h3 className="text-xl font-bold text-purple-900 mb-4">Your Ticket QR Code</h3>
              
              <div className="flex flex-col items-center">
                {/* QR Code Container with Theme Styling */}
                <div className="p-4 bg-white rounded-lg border-2 border-purple-200 mb-4">
                  <img 
                    src={selectedQr} 
                    alt="QR Code" 
                    className="w-64 h-64 object-contain"
                  />
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    Scan this QR code at the event entrance
                  </p>
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-sm font-medium">
                    <Ticket className="h-4 w-4 mr-1" />
                    Valid Ticket
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-purple-100">
                <p className="text-sm text-gray-500 text-center">
                  Please bring a valid ID matching your booking details
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
        </div>
        <Footer />
    </>
  );
}