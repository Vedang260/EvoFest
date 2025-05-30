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
  ArrowUpRightIcon,
  LayoutDashboardIcon
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
import OverviewTab from '@/components/dashboard/events/overview';

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

export default function EventAnalyticsPage() {
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

  const handleViewAnalytics = (eventId: string) => {
    router.push(`dashboard/events/${eventId}/analytics`);
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
                    onClick={() => setActiveTab('overview')}
                    className={`py-4 px-6 text-sm font-medium ${activeTab === 'overview' ? 'border-purple-500 text-purple-600 border-b-2' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('ticketSales')}
                    className={`py-4 px-6 text-sm font-medium ${activeTab === 'ticketSales' ? 'border-purple-500 text-purple-600 border-b-2' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  >
                    Ticket Sales
                  </button>
                </nav>
              </div>
              <div className="p-6">
                {activeTab === 'overview' && <OverviewTab eventId={eventId} />}
                
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  </div>
</div>
    <Footer />
    </>
  );
}