'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { 
  QrCode,
  Check,
  User,
  Ticket,
  CalendarDays,
  Clock,
  MapPin,
  Search,
  X,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '@/lib/hooks/hook';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

// Types
interface Guest {
  guestId: string;
  bookingId: string;
  name: string;
  gender: string;
  age: number;
  email: string;
  phoneNumber: string;
  qrCode: string;
  checkedIn?: boolean;
  checkedInAt?: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  guests: Guest[];
}

export default function EventCheckInPage() {
  const { eventId } = useParams();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [qrScannerOpen, setQrScannerOpen] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const dispatch = useDispatch();
  const { token } = useAppSelector((state) => state.auth);
  
  // Mock event data since it's not in the backend response
  const [event, setEvent] = useState({
    title: 'Event Title',
    date: new Date().toISOString(),
    startTime: '10:00 AM',
    endTime: '6:00 PM',
    venue: 'Event Venue',
    guests: [] as Guest[]
  });

  // Fetch event guests
  useEffect(() => {
    const fetchEventGuests = async () => {
      try {
        setLoading(true);
        const response = await axios.get<ApiResponse>(`/api/events/${eventId}/guests`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        // Initialize checkedIn status for each guest
        const guestsWithCheckInStatus = response.data.guests.map(guest => ({
          ...guest,
          checkedIn: false
        }));
        
        setGuests(guestsWithCheckInStatus);
        setEvent(prev => ({
          ...prev,
          guests: guestsWithCheckInStatus
        }));
      } catch (err) {
        setError('Failed to fetch event guests');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEventGuests();
  }, [eventId, token]);

  // Filter guests based on search
  const filteredGuests = guests.filter(guest => 
    guest?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest?.phoneNumber.includes(searchTerm)
  );

  // Handle QR scan button click
  const handleScanClick = () => {
    setQrScannerOpen(true);
    startScanner();
  };

  // Start QR scanner
  const startScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      scanQRCode();
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Could not access camera. Please ensure you have granted permissions.');
      setQrScannerOpen(false);
    }
  };

  // Scan for QR codes
  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    const scan = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        context?.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = context?.getImageData(0, 0, canvas.width, canvas.height);
        if (imageData) {
          try {
            // In a real app, you would use a QR code library like jsQR
            // const code = jsQR(imageData.data, imageData.width, imageData.height);
            // if (code) {
            //   handleScannedQR(code.data);
            //   return;
            // }
            
            // For demo purposes, we'll simulate finding a QR code after 2 seconds
            if (process.env.NODE_ENV === 'development') {
              setTimeout(() => {
                handleScannedQR(guests[0]?.guestId || '');
              }, 2000);
            }
          } catch (err) {
            console.error('QR scanning error:', err);
          }
        }
      }
      requestAnimationFrame(scan);
    };
    
    scan();
  };

  // Handle scanned QR code
  const handleScannedQR = (guestId: string) => {
    stopScanner();
    setQrScannerOpen(false);
    
    const guest = guests.find(g => g.guestId === guestId);
    if (guest) {
      setSelectedGuest(guest);
    } else {
      setError('Guest not found. Please try again or search manually.');
    }
  };

  // Stop scanner
  const stopScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Handle check-in
  const handleCheckIn = async () => {
    if (!selectedGuest) return;
    
    try {
      setCheckingIn(true);
      await axios.post(`/api/events/${eventId}/check-in`, {
        guestId: selectedGuest.guestId
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Update local state
      setGuests(prevGuests => 
        prevGuests.map(g => 
          g.guestId === selectedGuest.guestId 
            ? { ...g, checkedIn: true, checkedInAt: new Date().toISOString() } 
            : g
        )
      );
      
      setSelectedGuest(null);
    } catch (err) {
      console.error('Check-in failed:', err);
      setError('Check-in failed. Please try again.');
    } finally {
      setCheckingIn(false);
    }
  };

  // Clean up scanner on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-purple-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 max-w-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <X className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
          <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Event Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-md p-6 mb-8"
        >
          <h1 className="text-2xl font-bold text-purple-900 mb-2">{event.title}</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="flex items-start">
              <CalendarDays className="h-5 w-5 text-purple-600 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="text-gray-700">
                  {format(parseISO(event.date), 'EEEE, MMMM d, yyyy')}
                </p>
                <p className="text-sm text-purple-600 flex items-center mt-1">
                  <Clock className="h-4 w-4 mr-1" />
                  {event.startTime} - {event.endTime}
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
                {guests.length} Guest{guests.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Check-In Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-xl shadow-md p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-purple-400" />
              </div>
              <input
                type="text"
                placeholder="Search guests by name, email or phone"
                className="block w-full pl-10 pr-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <motion.button
              onClick={handleScanClick}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <QrCode className="h-4 w-4 mr-2" />
              Scan QR Code
            </motion.button>
          </div>
        </motion.div>

        {/* Guest List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-semibold text-purple-800 mb-4">
            Guests ({filteredGuests.length})
          </h2>
          
          {filteredGuests.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <p className="text-gray-500">No guests found matching your search</p>
            </div>
          ) : (
            filteredGuests.map(guest => (
              <motion.div
                key={guest.guestId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`bg-white rounded-xl shadow-sm overflow-hidden border-l-4 ${guest.checkedIn ? 'border-green-500' : 'border-purple-200'} ${selectedGuest?.guestId === guest.guestId ? 'ring-2 ring-purple-500' : ''}`}
                onClick={() => setSelectedGuest(guest)}
              >
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${guest.checkedIn ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'}`}>
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-purple-900">{guest.name}</h3>
                      <p className="text-sm text-purple-600">{guest.email}</p>
                      <p className="text-sm text-gray-500">{guest.phoneNumber}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    {guest.checkedIn ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Check className="h-3 w-3 mr-1" />
                        Checked In
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>

      {/* Selected Guest Check-In Panel */}
      <AnimatePresence>
        {selectedGuest && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-0 left-0 right-0 bg-white border-t border-purple-200 shadow-lg rounded-t-xl p-6"
          >
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-purple-900">
                  {selectedGuest.checkedIn ? 'Guest Already Checked In' : 'Ready to Check In'}
                </h3>
                <button
                  onClick={() => setSelectedGuest(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{selectedGuest.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedGuest.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{selectedGuest.phoneNumber}</p>
                </div>
              </div>
              
              {selectedGuest.checkedIn ? (
                <div className="bg-green-50 border-l-4 border-green-500 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">
                        This guest was checked in at {format(parseISO(selectedGuest.checkedInAt || new Date().toISOString()), 'p')}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <motion.button
                  onClick={handleCheckIn}
                  disabled={checkingIn}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-70"
                >
                  {checkingIn ? (
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  ) : (
                    <Check className="h-5 w-5 mr-2" />
                  )}
                  Confirm Check-In
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Scanner Modal */}
      <AnimatePresence>
        {qrScannerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Scan Guest QR Code</h3>
                <button
                  onClick={() => {
                    stopScanner();
                    setQrScannerOpen(false);
                  }}
                  className="text-white hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="relative rounded-xl overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-auto"
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {/* Scanner overlay frame */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="border-4 border-purple-400 rounded-lg w-64 h-64 relative">
                    <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-purple-400" />
                    <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-purple-400" />
                    <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-purple-400" />
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-purple-400" />
                  </div>
                </div>
              </div>
              
              <p className="mt-4 text-center text-white">
                Position the QR code within the frame
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
      <Footer />
    </>
  );
}