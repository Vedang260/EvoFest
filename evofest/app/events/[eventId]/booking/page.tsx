'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { 
  CalendarIcon,
  ClockIcon,
  TicketIcon,
  UserIcon,
  PhoneIcon,
  MailIcon,
  ChevronRightIcon,
  CheckIcon,
  XIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading } from '@/lib/redux/slice/loadingSlice';
import { TicketLoader } from '@/components/ui/ticketLoader';
import { useAppSelector } from '@/lib/hooks/hook';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

// Types
interface DailyTicketTypeEntry {
  dailyTicketTypeEntryId: string;
  eventScheduleId: string;
  type: string;
  price: number;
  quantity: number;
  createdAt: string;
  booked: number;
  remaining: number;
}

interface EventSchedule {
  eventScheduleId: string;
  eventId: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  dailyTickets: DailyTicketTypeEntry[];
  totalBooked: number;
  remainingCapacity: number;
}

interface ApiResponse {
  success: boolean;
  message: string;
  event: EventSchedule[];
}

interface GuestInfo {
  name: string;
  age: string;
  gender: string;
  phone: string;
  email: string;
  ticketType: string;
}

export default function TicketBookingPage() {
  const { eventId } = useParams();
  const [schedules, setSchedules] = useState<EventSchedule[]>([]);
  const dispatch = useDispatch();
  const isLoading = useSelector((state: any) => state.loading.isLoading);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [ticketQuantities, setTicketQuantities] = useState<Record<string, number>>({});
  const [guestInfo, setGuestInfo] = useState<GuestInfo[]>([]);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const { token } = useAppSelector((state) => state.auth);
  // Fetch event schedules
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        dispatch(setLoading(true));
        const response = await axios.get<ApiResponse>(`/api/events/schedule/${eventId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setSchedules(response.data.event);
      } catch (err) {
        setError('Failed to fetch event schedules');
        console.error(err);
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchSchedules();
  }, [eventId]);

  // Reset quantities when date changes
  useEffect(() => {
    setTicketQuantities({});
    setGuestInfo([]);
  }, [selectedDate]);

  // Update guest info forms when quantities change
  useEffect(() => {
    const totalTickets = Object.values(ticketQuantities).reduce((sum, qty) => sum + qty, 0);
    
    // Create or remove guest forms as needed
    if (totalTickets > guestInfo.length) {
      // Add new guest forms
      const newGuests = Array(totalTickets - guestInfo.length).fill(null).map((_, i) => {
        // Find which ticket type this guest belongs to
        let ticketType = '';
        let cumulative = 0;
        
        for (const [type, qty] of Object.entries(ticketQuantities)) {
          cumulative += qty;
          if (guestInfo.length + i < cumulative) {
            ticketType = type;
            break;
          }
        }

        return {
          name: '',
          age: '',
          gender: '',
          phone: '',
          email: '',
          ticketType
        };
      });
      
      setGuestInfo([...guestInfo, ...newGuests]);
    } else if (totalTickets < guestInfo.length) {
      // Remove extra guest forms
      setGuestInfo(guestInfo.slice(0, totalTickets));
    }
  }, [ticketQuantities]);

  const handleQuantityChange = (ticketType: string, value: number) => {
    setTicketQuantities(prev => ({
      ...prev,
      [ticketType]: Math.max(0, value)
    }));
  };

  const handleGuestInfoChange = (index: number, field: keyof GuestInfo, value: string) => {
    setGuestInfo(prev => prev.map((guest, i) => 
      i === index ? { ...guest, [field]: value } : guest
    ));
  };

  const handleCheckout = async () => {
    try {
      setBookingInProgress(true);
      
      const selectedSchedule = schedules.find(s => 
        format(parseISO(s.date), 'yyyy-MM-dd') === selectedDate
      );
      
      if (!selectedSchedule) return;

      const bookingData = {
        eventScheduleId: selectedSchedule.eventScheduleId,
        tickets: Object.entries(ticketQuantities)
          .filter(([_, qty]) => qty > 0)
          .map(([type, quantity]) => ({
            dailyTicketTypeEntryId: selectedSchedule.dailyTickets.find(t => t.type === type)?.dailyTicketTypeEntryId,
            quantity
          })),
        guests: guestInfo
      };
      console.log('bookingData: ', bookingData);
      const response = await axios.post('/api/bookings', bookingData);
      console.log('Booking successful:', response.data);
      // Handle successful booking (redirect to confirmation, etc.)
    } catch (err) {
      console.error('Booking failed:', err);
      // Handle error
    } finally {
      setBookingInProgress(false);
    }
  };

  const getSelectedSchedule = () => {
    return schedules.find(s => 
      format(parseISO(s.date), 'yyyy-MM-dd') === selectedDate
    );
  };

  const calculateTotalPrice = () => {
    const selectedSchedule = getSelectedSchedule();
    if (!selectedSchedule) return 0;

    return Object.entries(ticketQuantities).reduce((total, [type, quantity]) => {
      const ticket = selectedSchedule.dailyTickets.find(t => t.type === type);
      return total + (ticket ? ticket.price * quantity : 0);
    }, 0);
  };

  if (isLoading) {
    return (
      <TicketLoader />
    );
  }

  if (error) {
    return (
      <TicketLoader />
    )
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
          <h1 className="text-3xl font-bold text-purple-900 mb-2">Book Your Tickets</h1>
          <p className="text-purple-600 mb-8">Select a date and choose your tickets</p>

          {/* Date Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <h2 className="text-xl font-semibold text-purple-800 mb-4 flex items-center">
              <CalendarIcon className="h-5 w-5 text-purple-600 mr-2" />
              Select Date
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {schedules.map(schedule => {
                const dateStr = format(parseISO(schedule.date), 'yyyy-MM-dd');
                const isAvailable = schedule.remainingCapacity > 0;
                const isSelected = selectedDate === dateStr;
                
                return (
                  <motion.button
                    key={schedule.eventScheduleId}
                    whileHover={isAvailable ? { scale: 1.02 } : {}}
                    whileTap={isAvailable ? { scale: 0.98 } : {}}
                    onClick={() => isAvailable && setSelectedDate(dateStr)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${isSelected ? 'border-purple-600 bg-purple-50' : 'border-purple-200'} ${isAvailable ? 'hover:border-purple-400 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                    disabled={!isAvailable}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-purple-900">
                          {format(parseISO(schedule.date), 'EEEE, MMMM d')}
                        </p>
                        <p className="text-sm text-purple-600 flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {schedule.startTime} - {schedule.endTime}
                        </p>
                      </div>
                      {isAvailable ? (
                        <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Available
                        </div>
                      ) : (
                        <div className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                          Sold out
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Ticket Selection */}
          {selectedDate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.5 }}
              className="mb-8 overflow-hidden"
            >
              <h2 className="text-xl font-semibold text-purple-800 mb-4 flex items-center">
                <TicketIcon className="h-5 w-5 text-purple-600 mr-2" />
                Select Tickets
              </h2>
              
              <div className="space-y-4">
                {getSelectedSchedule()?.dailyTickets.map(ticket => (
                  <motion.div
                    key={ticket.dailyTicketTypeEntryId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white p-4 rounded-xl shadow-sm border border-purple-100"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-purple-900">{ticket.type} Admission</h3>
                        <p className="text-purple-600">₹{ticket.price.toLocaleString()}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {ticket.remaining} of {ticket.quantity} available
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleQuantityChange(ticket.type, (ticketQuantities[ticket.type] || 0) - 1)}
                          disabled={(ticketQuantities[ticket.type] || 0) <= 0}
                          className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center disabled:opacity-30"
                        >
                          -
                        </button>
                        <span className="w-10 text-center">
                          {ticketQuantities[ticket.type] || 0}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(ticket.type, (ticketQuantities[ticket.type] || 0) + 1)}
                          disabled={(ticketQuantities[ticket.type] || 0) >= ticket.remaining}
                          className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Guest Information */}
          {guestInfo.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.5 }}
              className="mb-8 overflow-hidden"
            >
              <h2 className="text-xl font-semibold text-purple-800 mb-4 flex items-center">
                <UserIcon className="h-5 w-5 text-purple-600 mr-2" />
                Guest Information
              </h2>
              
              <div className="space-y-6">
                {guestInfo.map((guest, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-white p-6 rounded-xl shadow-md"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-purple-900">Guest {index + 1}</h3>
                      <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                        {guest.ticketType} Ticket
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-purple-800 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={guest.name}
                          onChange={(e) => handleGuestInfoChange(index, 'name', e.target.value)}
                          className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-purple-800 mb-1">Age</label>
                        <input
                          type="number"
                          value={guest.age}
                          onChange={(e) => handleGuestInfoChange(index, 'age', e.target.value)}
                          className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-purple-800 mb-1">Gender</label>
                        <select
                          value={guest.gender}
                          onChange={(e) => handleGuestInfoChange(index, 'gender', e.target.value)}
                          className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          required
                        >
                          <option value="">Select</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-purple-800 mb-1">Phone Number</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <PhoneIcon className="h-5 w-5 text-purple-400" />
                          </div>
                          <input
                            type="tel"
                            value={guest.phone}
                            onChange={(e) => handleGuestInfoChange(index, 'phone', e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-purple-800 mb-1">Email Address</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MailIcon className="h-5 w-5 text-purple-400" />
                          </div>
                          <input
                            type="email"
                            value={guest.email}
                            onChange={(e) => handleGuestInfoChange(index, 'email', e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Summary and Checkout */}
          {selectedDate && Object.values(ticketQuantities).some(qty => qty > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="sticky bottom-0 bg-white border-t border-purple-200 shadow-lg rounded-t-xl p-6"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="font-bold text-purple-900">Order Summary</h3>
                  <div className="text-sm text-purple-600">
                    {Object.entries(ticketQuantities)
                      .filter(([_, qty]) => qty > 0)
                      .map(([type, qty]) => (
                        <div key={type} className="flex items-center">
                          <CheckIcon className="h-4 w-4 mr-1 text-green-500" />
                          {qty} × {type} Ticket{qty > 1 ? 's' : ''}
                        </div>
                      ))}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-xl font-bold text-purple-900">
                      ₹{calculateTotalPrice().toLocaleString()}
                    </p>
                  </div>
                  
                  <motion.button
                    onClick={handleCheckout}
                    disabled={bookingInProgress || guestInfo.some(g => !g.name || !g.email)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-medium rounded-lg shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {bookingInProgress ? 'Processing...' : 'Proceed to Checkout'}
                    <ChevronRightIcon className="inline h-5 w-5 ml-2" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
    <Footer />
    </>
    
  );
}