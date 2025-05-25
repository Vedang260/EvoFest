'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import EmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { 
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  TicketIcon,
  MusicIcon,
  FilmIcon,
  UsersIcon,
  MicIcon,
  GamepadIcon,
  AlertCircleIcon,
  FileTextIcon,
  ChevronRightIcon,
  ShoppingCartIcon,
  UserIcon,
  ArrowUpRightIcon
} from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { useAppSelector } from '@/lib/hooks/hook';
import Footer from '@/components/footer';
import Navbar from '@/components/navbar';
import { setLoading } from '@/lib/redux/slice/loadingSlice';
import { useDispatch, useSelector } from 'react-redux';
import { TicketLoader } from '@/components/ui/ticketLoader';
import { useRouter } from 'next/navigation';

// Types
interface EventSchedule {
  date: string;
  startTime: string;
  endTime: string;
}

interface Event {
  eventId: string;
  title: string;
  description: string;
  category: string;
  venue: string;
  media: string[];
  status: string;
  startDate: string;
  endDate: string;
  prohibitedItems: string[];
  termsAndConditions: string[];
  capacity: number;
  createdAt: string;
  organizerId: string;
  eventSchedule: EventSchedule[];
}

interface ApiResponse {
  success: boolean;
  message: string;
  event: Event;
}

// Category icons mapping
const categoryIcons = {
  MUSIC: MusicIcon,
  FILM: FilmIcon,
  SPORTS: UsersIcon,
  CONFERENCE: UsersIcon,
  GAMING: GamepadIcon,
  COMEDY: MicIcon,
  THEATER: FilmIcon,
  FOOD: UsersIcon,
};

export default function EventDetailsPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const [event, setEvent] = useState<Event | null>(null);
  const dispatch = useDispatch();
  const isLoading = useSelector((state: any) => state.loading.isLoading);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('description');
  const [emblaRef, emblaApi] = EmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })]);
  const { token } = useAppSelector((state) => state.auth);
  const router = useRouter();
  // Fetch event details
 useEffect(() => {
    if (!eventId) return;

    const fetchEvent = async () => {
      try {
        dispatch(setLoading(true));
        const response = await axios.get<ApiResponse>(`/api/events/${eventId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        setEvent(response.data.event);
      } catch (err) {
        setError('Failed to fetch event details');
        console.error(err);
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchEvent();
  }, [eventId]);

  if (error || !event) {
    return <TicketLoader />;
  }

  const handleBooking = (eventId: string) => {
    router.push(`/events/${eventId}/booking`);
  }

  if (isLoading) return <TicketLoader />;
  const CategoryIcon = categoryIcons[event.category as keyof typeof categoryIcons] || UsersIcon;

  return (
    <>
      <Navbar />
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
  {/* Media Carousel */}
  

  {/* Main Content Container */}
  <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
    <section className="relative h-[40vh] sm:h-[50vh] lg:h-[60vh] w-full overflow-hidden bg-gray-900">
    {event.media.length > 0 && (
      <div className="absolute inset-0">
        <div className="h-full w-full" ref={emblaRef}>
          <div className="flex h-full">
            {event.media.map((media, index) => (
              <div key={index} className="relative h-full w-full flex-shrink-0">
                {media.endsWith('.mp4') ? (
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="h-full w-full object-cover sm:object-contain"
                    src={media}
                    
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <Image
                    src={media}
                    alt={`Event media ${index + 1}`}
                    fill
                    className="object-cover sm:object-contain"
                    quality={85}
                    priority={index === 0}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 75vw, 1200px"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )}
  </section>
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Event Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-md p-6 flex-1"
      >
        <div className="flex flex-col md:flex-row gap-6">
          {/* Event Title and Category */}
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-600 text-xs font-medium text-white">
                <CategoryIcon className="h-3 w-3 mr-1" />
                {event.category.charAt(0) + event.category.slice(1).toLowerCase()}
              </span>
              <span className="text-sm text-purple-600">
                {event.capacity.toLocaleString()} capacity
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-purple-900 mb-4">
              {event.title}
            </h1>
            
            {/* Venue Details */}
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <div className="flex items-start gap-3">
                <MapPinIcon className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-purple-900 mb-1">Venue Location</h3>
                  <p className="text-gray-700">{event.venue}</p>
                  <button className="mt-2 text-sm text-purple-600 hover:text-purple-800 flex items-center">
                    View on map <ArrowUpRightIcon className="ml-1 h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Tabs Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-xl shadow-md overflow-hidden mt-8"
            >
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  <button
                    onClick={() => setActiveTab('description')}
                    className={`py-4 px-6 text-sm font-medium ${activeTab === 'description' ? 'border-purple-500 text-purple-600 border-b-2' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  >
                    Description
                  </button>
                  <button
                    onClick={() => setActiveTab('schedule')}
                    className={`py-4 px-6 text-sm font-medium ${activeTab === 'schedule' ? 'border-purple-500 text-purple-600 border-b-2' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  >
                    Schedule
                  </button>
                  <button
                    onClick={() => setActiveTab('prohibited')}
                    className={`py-4 px-6 text-sm font-medium ${activeTab === 'prohibited' ? 'border-purple-500 text-purple-600 border-b-2' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  >
                    Prohibited Items
                  </button>
                  <button
                    onClick={() => setActiveTab('terms')}
                    className={`py-4 px-6 text-sm font-medium ${activeTab === 'terms' ? 'border-purple-500 text-purple-600 border-b-2' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  >
                    Terms
                  </button>
                </nav>
              </div>
              <div className="p-6">
                {activeTab === 'description' && (
                  <div className="prose max-w-none text-gray-700">
                    {event.description.split('\n\n').map((paragraph, i) => (
                      <p key={i} className="mb-4">{paragraph}</p>
                    ))}
                  </div>
                )}
                {activeTab === 'schedule' && (
                  <div className="space-y-4">
                    {event.eventSchedule.map((schedule, i) => (
                      <div key={i} className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0 bg-white p-2 rounded-lg shadow-sm">
                            <CalendarIcon className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-purple-900">
                              {format(parseISO(schedule.date), 'EEEE, MMMM d, yyyy')}
                            </h3>
                            <p className="text-sm text-purple-600 mt-1">
                              <ClockIcon className="inline h-4 w-4 mr-1" />
                              {schedule.startTime} - {schedule.endTime}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {activeTab === 'prohibited' && (
                  <div className="space-y-3">
                    {event.prohibitedItems.map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <AlertCircleIcon className="h-5 w-5 text-pink-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                )}
                {activeTab === 'terms' && (
                  <div className="space-y-4">
                    {event.termsAndConditions.map((term, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <FileTextIcon className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{term}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Right Sidebar Column */}
      <div className="lg:w-80 space-y-6">
        {/* Schedule Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <h2 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-purple-600" />
            Event Schedule
          </h2>
          <div className="space-y-4">
            {event.eventSchedule.map((schedule, i) => (
              <div key={i} className="border-l-2 border-purple-200 pl-4 py-1">
                <h3 className="font-medium text-purple-900">
                  {format(parseISO(schedule.date), 'MMM d, yyyy')}
                </h3>
                <p className="text-sm text-gray-600">
                  {schedule.startTime} - {schedule.endTime}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Booking Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl shadow-lg p-6 text-white"
        >
          <h2 className="text-xl font-bold mb-4">Ready to Book?</h2>
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-2">
              <TicketIcon className="h-5 w-5 text-purple-200" />
            </div>
            <div className="flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-purple-200" />
              <span>{event.capacity.toLocaleString()} seats available</span>
            </div>
          </div>
          <motion.button
            onClick={() => handleBooking(event.eventId)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-white text-purple-700 hover:bg-gray-100 font-medium rounded-lg px-6 py-3 shadow-md flex items-center justify-center gap-2"
          >
            <ShoppingCartIcon className="h-5 w-5" />
            Book Now
          </motion.button>
        </motion.div>
      </div>
    </div>
  </div>
</div>
    <Footer />
    </>
  );
}