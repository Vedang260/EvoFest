'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import EmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { 
  SearchIcon, 
  CalendarIcon, 
  MapPinIcon, 
  MusicIcon,
  FilmIcon,
  GamepadIcon,
  MicIcon,
  UsersIcon,
  TicketIcon,
  ArrowRightIcon,
  CheckIcon,
  CookingPotIcon
} from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/hooks/hook';
import Footer from '@/components/footer';
import Navbar from '@/components/navbar';

// Types
interface Event {
  eventId: string;
  title: string;
  media: string[];
  category: string;
  startDate: string;
  endDate: string;
  venue: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  events: Event[];
}

// Mock cities - you can expand this list
const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Goa', 'Hyderabad', 'Ahmedabad', 'Pune'];

// Event categories with icons
const categories = [
  { name: 'MUSIC', icon: MusicIcon },
  { name: 'FILM', icon: FilmIcon },
  { name: 'SPORTS', icon: UsersIcon },
  { name: 'CONFERENCE', icon: UsersIcon },
  { name: 'GAMING', icon: GamepadIcon },
  { name: 'COMEDY', icon: MicIcon },
  { name: 'THEATER', icon: FilmIcon },
  { name: 'FOOD', icon: CookingPotIcon },
  { name: 'FESTIVAL', icon: CookingPotIcon },
];

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [emblaRef, emblaApi] = EmblaCarousel({ loop: true }, [Autoplay({ delay: 3000 })]);
    const router = useRouter();
    const { token } = useAppSelector((state) => state.auth);
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    // Fetch events from API
    useEffect(() => {
        const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await axios.get<ApiResponse>('/api/events', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            setEvents(response.data.events);
        } catch (err) {
            setError('Failed to fetch events');
            console.error(err);
        } finally {
            setLoading(false);
        }
        };

        fetchEvents();
    }, []);

    const handleViewDetails = (eventId: string) => {
      router.push(`dashboard/events/${eventId}`);
    };


  // Filter events based on search and filters
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         event.venue.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = !selectedCity || event.venue.includes(selectedCity);
    const matchesDate = !selectedDate || 
                       (new Date(event.startDate).toDateString() === new Date(selectedDate).toDateString());
    const matchesCategory = !selectedCategory || event.category === selectedCategory;
    
    return matchesSearch && matchesCity && matchesDate && matchesCategory;
  });
    // Hero carousel images (using first 4 events' first images)
  const heroImages = events.slice(0, 4).map(event => event.media[0]).filter(Boolean);

  return (
    <>
        <Navbar />
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white"> 
              {/* Hero Carousel with Search Overlay */}
            <section className="relative min-h-[60dvh] w-full">
            {/* Background Carousel */}
            {heroImages.length > 0 && (
                <div className="absolute inset-0">
                <div className="h-full w-full" ref={emblaRef}>
                    <div className="flex h-full">
                    {heroImages.map((image, index) => (
                        <div key={index} className="relative h-full w-full flex-shrink-0">
                        <Image
                            src={image}
                            alt={`Event image ${index + 1}`}
                            fill
                            className="object-cover brightness-75"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
                        </div>
                    ))}
                    </div>
                </div>
                </div>
            )}
        
            {/* Search and Filter Bar - Now fully visible */}
            <div className="absolute bottom-0 left-0 w-full z-10">
                <motion.div 
                className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                >
                <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-6 mx-4 mb-8">
                    <div className="flex flex-col md:flex-row md:items-end gap-4 flex-wrap">
                    {/* Search Input */}
                    <div className="flex-1 min-w-[250px]">
                        <label htmlFor="search" className="block text-sm font-medium text-purple-800 mb-1">
                        Search Events
                        </label>
                        <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-purple-400" />
                        </div>
                        <input
                            type="text"
                            id="search"
                            className="block w-full pl-10 pr-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            placeholder="Search by event name or venue..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        </div>
                    </div>
        
                    {/* City Select */}
                    <div className="min-w-[200px]">
                        <label htmlFor="city" className="block text-sm font-medium text-purple-800 mb-1">
                        City
                        </label>
                        <select
                        id="city"
                        className="block w-full pl-3 pr-10 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        >
                        <option value="">All Cities</option>
                        {cities.map(city => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                        </select>
                    </div>
        
                    {/* Date Picker */}
                    <div className="min-w-[200px]">
                        <label htmlFor="date" className="block text-sm font-medium text-purple-800 mb-1">
                        Date
                        </label>
                        <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <CalendarIcon className="h-5 w-5 text-purple-400" />
                        </div>
                        <input
                            type="date"
                            id="date"
                            className="block w-full pl-10 pr-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                        </div>
                    </div>
        
                    {/* Category Select */}
                    <div className="min-w-[200px]">
                        <label htmlFor="category" className="block text-sm font-medium text-purple-800 mb-1">
                        Category
                        </label>
                        <select
                        id="category"
                        className="block w-full pl-3 pr-10 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.name} value={cat.name}>
                            {cat.name.charAt(0) + cat.name.slice(1).toLowerCase()}
                            </option>
                        ))}
                        </select>
                    </div>
                    </div>
                </div>
                </motion.div>
            </div>
            </section>
      {/* Events List Section */}
      <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-purple-800">Your Events</h2>
            <p className="mt-2 text-purple-600">
              {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} found
            </p>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredEvents.length === 0 && (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mx-auto h-24 w-24 text-purple-400">
                <TicketIcon className="h-full w-full" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-purple-800">No events found</h3>
              <p className="mt-2 text-purple-600">Try adjusting your search or filters</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCity('');
                  setSelectedDate('');
                  setSelectedCategory('');
                }}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Clear all filters
              </button>
            </motion.div>
          )}

          {/* Events Grid */}
          {!loading && !error && filteredEvents.length > 0 && (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence>
                {filteredEvents.map((event) => {
                  const IconComponent = categories.find(c => c.name === event.category)?.icon || UsersIcon;
                  const startDate = new Date(event.startDate);
                  const endDate = new Date(event.endDate);
                  
                  return (
                    <motion.div
                      key={event.eventId}
                      className="group overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:shadow-xl"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      viewport={{ once: true }}
                      whileHover={{ y: -5 }}
                    >
                      {/* Event Image */}
                      <div className="relative h-48 overflow-hidden">
                        {event.media.length > 0 ? (
                          <Image
                            src={event.media[0]}
                            alt={event.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="h-full w-full bg-purple-100 flex items-center justify-center">
                            <IconComponent className="h-12 w-12 text-purple-400" />
                          </div>
                        )}
                        <div className="absolute top-3 right-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-600 text-xs font-medium text-white">
                            {event.category.charAt(0) + event.category.slice(1).toLowerCase()}
                          </span>
                        </div>
                      </div>

                      {/* Event Details */}
                      <div className="p-5">
                        <h3 className="text-xl font-bold text-purple-800 line-clamp-1">{event.title}</h3>
                        
                        <div className="mt-3 space-y-2">
                          <div className="flex items-start">
                            <MapPinIcon className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                            <span className="ml-2 text-sm text-gray-600 line-clamp-2">{event.venue}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <CalendarIcon className="h-5 w-5 text-purple-500 flex-shrink-0" />
                            <span className="ml-2 text-sm text-gray-600">
                              {format(startDate, 'MMM d, yyyy')}
                              {startDate.toDateString() !== endDate.toDateString() && 
                                ` - ${format(endDate, 'MMM d, yyyy')}`}
                            </span>
                          </div>
                          
                          <div className="flex items-center">
                            <IconComponent className="h-5 w-5 text-purple-500 flex-shrink-0" />
                            <span className="ml-2 text-sm text-gray-600 capitalize">
                              {event.category.toLowerCase()}
                            </span>
                          </div>
                        </div>

                        <motion.button
                          className="mt-4 w-full flex items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:shadow-lg"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleViewDetails(event.eventId)}
                        >
                            View Details
                            <ArrowRightIcon className="ml-2 h-4 w-4" />
                          </motion.button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>
    </div>
    <Footer />
    </>
  );
}