'use client';

import { useRef, useEffect, useState } from 'react';
import EmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { 
  MusicIcon, 
  FilmIcon, 
  GamepadIcon, 
  MicIcon, 
  BookOpenIcon,
  UsersIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  ArrowRightIcon,
  TicketIcon,
  SparklesIcon,
  StarIcon,
  HeartIcon
} from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

// Mock data - expanded with more content
const featuredEvents = [
  {
    id: 1,
    title: "Summer Music Festival",
    genre: "Music",
    image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
    venue: "Central Park",
    date: "June 15, 2023",
    time: "6:00 PM",
    price: 45
  },
  {
    id: 2,
    title: "Indie Film Premiere",
    genre: "Screening",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
    venue: "Downtown Theater",
    date: "June 18, 2023",
    time: "8:00 PM",
    price: 25
  },
  {
    id: 3,
    title: "Gaming Expo",
    genre: "Arcade",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
    venue: "Convention Center",
    date: "June 22, 2023",
    time: "10:00 AM",
    price: 35
  },
  {
    id: 4,
    title: "Electronic Dance Night",
    genre: "Music",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
    venue: "Neon Club",
    date: "June 25, 2023",
    time: "10:00 PM",
    price: 30
  }
];

const genres = [
  { name: "Music", count: 42, image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80", icon: MusicIcon },
  { name: "Screening", count: 28, image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80", icon: FilmIcon },
  { name: "Arcade", count: 56, image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80", icon: GamepadIcon },
  { name: "Comedy", count: 34, image: "https://images.unsplash.com/photo-1552862745-5e0a8a6e6a3a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80", icon: MicIcon },
  { name: "Workshop", count: 19, image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80", icon: BookOpenIcon },
  { name: "Conference", count: 27, image: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80", icon: UsersIcon },
  { name: "Parties", count: 63, image: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80", icon: UsersIcon },
  { name: "Theater", count: 15, image: "https://images.unsplash.com/photo-1494972308805-463bc619d34e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1742&q=80", icon: FilmIcon },
  { name: "Sports", count: 38, image: "https://images.unsplash.com/photo-1543357486-d0e785ad4b7d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80", icon: UsersIcon },
  { name: "Food & Drink", count: 47, image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80", icon: BookOpenIcon },
  { name: "Art", count: 22, image: "https://images.unsplash.com/photo-1501612780327-45045538702b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80", icon: BookOpenIcon },
  { name: "Family", count: 31, image: "https://images.unsplash.com/photo-1503917988258-f87a78e3c995?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80", icon: UsersIcon }
];

const upcomingEvents = [
  {
    id: 4,
    title: "Jazz Night",
    genre: "Music",
    image: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
    venue: "Blue Note Club",
    date: "June 25, 2023",
    time: "7:30 PM",
    price: 30
  },
  {
    id: 5,
    title: "Stand-Up Comedy",
    genre: "Comedy",
    image: "https://images.unsplash.com/photo-1552862745-5e0a8a6e6a3a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
    venue: "Laugh Factory",
    date: "June 28, 2023",
    time: "8:00 PM",
    price: 20
  },
  {
    id: 6,
    title: "Tech Conference",
    genre: "Conference",
    image: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
    venue: "Tech Center",
    date: "July 2, 2023",
    time: "9:00 AM",
    price: 120
  },
  {
    id: 7,
    title: "Food Festival",
    genre: "Food & Drink",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
    venue: "Downtown Square",
    date: "July 5, 2023",
    time: "11:00 AM",
    price: 15
  },
  {
    id: 8,
    title: "Art Exhibition",
    genre: "Art",
    image: "https://images.unsplash.com/photo-1501612780327-45045538702b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
    venue: "Modern Art Museum",
    date: "July 8, 2023",
    time: "10:00 AM",
    price: 25
  },
  {
    id: 9,
    title: "Basketball Championship",
    genre: "Sports",
    image: "https://images.unsplash.com/photo-1543357486-d0e785ad4b7d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
    venue: "City Arena",
    date: "July 12, 2023",
    time: "7:00 PM",
    price: 65
  }
];

const newExperiences = [
  {
    id: 1,
    title: "Virtual Reality Concert",
    description: "Experience live music in immersive VR",
    image: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1752&q=80"
  },
  {
    id: 2,
    title: "Interactive Theater",
    description: "Become part of the story in this unique experience",
    image: "https://images.unsplash.com/photo-1494972308805-463bc619d34e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1742&q=80"
  },
  {
    id: 3,
    title: "Silent Disco",
    description: "Dance to your own rhythm with wireless headphones",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
  },
  {
    id: 4,
    title: "Escape Room Challenge",
    description: "Solve puzzles to escape before time runs out",
    image: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
  }
];

const popularArtists = [
  {
    id: 1,
    name: "DJ Nova",
    genre: "Electronic",
    image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1738&q=80"
  },
  {
    id: 2,
    name: "The Rockets",
    genre: "Rock",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
  },
  {
    id: 3,
    name: "Lena Blue",
    genre: "Jazz",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1744&q=80"
  },
  {
    id: 4,
    name: "Mike Stand",
    genre: "Comedy",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
  },
  {
    id: 5,
    name: "Sarah Keys",
    genre: "Piano",
    image: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1727&q=80"
  },
  {
    id: 6,
    name: "Urban Flow",
    genre: "Hip Hop",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
  },
  {
    id: 7,
    name: "The Classics",
    genre: "Orchestra",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
  },
  {
    id: 8,
    name: "Electro Pulse",
    genre: "EDM",
    image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1738&q=80"
  }
];

const popularVenues = [
  {
    id: 1,
    name: "Skyline Arena",
    image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
    location: "Downtown",
    capacity: "5,000"
  },
  {
    id: 2,
    name: "The Jazz Cellar",
    image: "https://images.unsplash.com/photo-1567443024551-f3e3c9b76d59?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
    location: "West End",
    capacity: "200"
  },
  {
    id: 3,
    name: "Convention Center",
    image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1738&q=80",
    location: "Business District",
    capacity: "10,000"
  },
  {
    id: 4,
    name: "Neon Club",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
    location: "Entertainment District",
    capacity: "1,200"
  }
];

const GenreIcon = ({ name, className }: { name: string; className?: string }) => {
  const IconComponent = genres.find(g => g.name === name)?.icon || UsersIcon;
  return <IconComponent className={className} />;
};

export default function Home() {
  const [emblaRef, emblaApi] = EmblaCarousel({ loop: true }, [Autoplay({ delay: 3000 })]);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  // Infinite auto-scrolling for genres
  useEffect(() => {
    const container = document.getElementById('genres-container');
    if (!container) return;

    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;
    const maxScroll = scrollWidth - clientWidth;

    const scroll = () => {
      if (isHovered) return; // Pause on hover
      
      setScrollPosition(prev => {
        if (prev >= maxScroll) {
          return 0;
        }
        return prev + 0.5;
      });
    };

    const interval = setInterval(scroll, 20);
    return () => clearInterval(interval);
  }, [isHovered]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <Navbar />
      {/* Hero Carousel */}
      <section className="relative overflow-hidden">
        <div className="relative h-[500px] w-full" ref={emblaRef}>
          <div className="flex">
            {featuredEvents.map((event) => (
              <div key={event.id} className="relative h-[500px] w-full flex-shrink-0">
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  className="object-cover brightness-75 transition-all duration-500 hover:brightness-90"
                  priority
                />
                <div className="absolute bottom-0 left-0 p-8 text-white">
                  <motion.span 
                    className="rounded-full bg-pink-500 px-4 py-1 text-sm font-medium"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {event.genre}
                  </motion.span>
                  <motion.h2 
                    className="mt-2 text-4xl font-bold md:text-5xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {event.title}
                  </motion.h2>
                  <motion.p 
                    className="mt-1 text-lg md:text-xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    {event.venue} • {event.date}
                  </motion.p>
                  <motion.button 
                    className="mt-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-2 font-medium text-white shadow-lg transition-all hover:from-purple-700 hover:to-pink-600 hover:shadow-xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Book Now - ${event.price}
                  </motion.button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <button
          ref={prevRef}
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white hover:bg-black/70"
          onClick={scrollPrev}
        >
          <ArrowRightIcon className="h-6 w-6 rotate-180" />
        </button>
        <button
          ref={nextRef}
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white hover:bg-black/70"
          onClick={scrollNext}
        >
          <ArrowRightIcon className="h-6 w-6" />
        </button>
      </section>

      {/* Browse by Genre - Infinite Scroll */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.h2 
            className="mb-8 text-3xl font-bold text-purple-800"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            Browse Events by Genre
          </motion.h2>
          <div className="relative w-full overflow-hidden py-4">
            <div className="flex animate-infinite-scroll">
              {[...genres, ...genres].map((genre, index) => (
                <motion.div
                  key={`${genre.name}-${index}`}
                  className="mx-4 flex-shrink-0"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <div className="group relative h-40 w-40 overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
                    <Image
                      src={genre.image}
                      alt={genre.name}
                      fill
                      className="object-cover brightness-75 transition-all duration-300 group-hover:brightness-90"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-white">
                      <genre.icon className="h-8 w-8" />
                      <h3 className="mt-2 font-semibold">{genre.name}</h3>
                      <p className="mt-1 text-sm opacity-90">{genre.count} events</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-7xl">
          <motion.div 
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-purple-800">Upcoming Events</h2>
            <button className="flex items-center text-purple-600 hover:text-purple-700">
              View All <ArrowRightIcon className="ml-1 h-4 w-4" />
            </button>
          </motion.div>
          <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((event) => (
              <motion.div 
                key={event.id}
                className="group overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:shadow-xl"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <span className="absolute right-3 top-3 rounded-full bg-pink-500 px-3 py-1 text-xs font-medium text-white">
                    {event.genre}
                  </span>
                  <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent p-4">
                    <h3 className="text-lg font-bold text-white">{event.title}</h3>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <CalendarIcon className="h-4 w-4 text-purple-500" />
                    <span>{event.date}</span>
                  </div>
                  <div className="mt-1 flex items-center space-x-2 text-sm text-gray-600">
                    <ClockIcon className="h-4 w-4 text-purple-500" />
                    <span>{event.time}</span>
                  </div>
                  <div className="mt-1 flex items-center space-x-2 text-sm text-gray-600">
                    <MapPinIcon className="h-4 w-4 text-purple-500" />
                    <span>{event.venue}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-bold text-purple-600">${event.price}</span>
                    <motion.button 
                      className="rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:shadow-lg"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Get Tickets
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* New Experiences */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-purple-50">
        <div className="mx-auto max-w-7xl">
          <motion.div 
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-purple-800">Unique Experiences</h2>
            <button className="flex items-center text-purple-600 hover:text-purple-700">
              View All <ArrowRightIcon className="ml-1 h-4 w-4" />
            </button>
          </motion.div>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {newExperiences.map((exp) => (
              <motion.div 
                key={exp.id}
                className="group relative h-64 overflow-hidden rounded-2xl shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <Image
                  src={exp.image}
                  alt={exp.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6 text-white">
                  <SparklesIcon className="h-6 w-6 text-pink-400" />
                  <h3 className="mt-2 text-xl font-bold">{exp.title}</h3>
                  <p className="mt-1 text-sm opacity-90">{exp.description}</p>
                  <motion.button 
                    className="mt-3 inline-flex items-center text-sm font-medium text-white underline decoration-transparent transition-all hover:decoration-white"
                    whileHover={{ x: 5 }}
                  >
                    Explore <ArrowRightIcon className="ml-1 h-4 w-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Artists */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-7xl">
          <motion.div 
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-purple-800">Popular Artists</h2>
            <button className="flex items-center text-primary-600 hover:text-primary-700">
              View All <ArrowRightIcon className="ml-1 h-4 w-4" />
            </button>
          </motion.div>

          <div className="mt-8 flex space-x-8 overflow-x-auto pb-6 scrollbar-hide">
            {popularArtists.map((artist) => (
              <motion.div
                key={artist.id}
                className="flex-shrink-0 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                {/* Artist Image */}
                <div className="relative h-48 w-48 overflow-hidden rounded-full shadow-lg mx-auto">
                  <Image
                    src={artist.image}
                    alt={artist.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>

                {/* Name & Genre */}
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-900">{artist.name}</h3>
                  <p className="text-sm text-gray-600">{artist.genre}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Venues */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-purple-50 to-white">
        <div className="mx-auto max-w-7xl">
          <motion.div 
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-purple-800">Popular Venues</h2>
            <button className="flex items-center text-purple-600 hover:text-purple-700">
              View All <ArrowRightIcon className="ml-1 h-4 w-4" />
            </button>
          </motion.div>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {popularVenues.map((venue) => (
              <motion.div
                key={venue.id}
                className="group relative h-64 overflow-hidden rounded-2xl shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <Image
                  src={venue.image}
                  alt={venue.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6 text-white">
                  <MapPinIcon className="h-6 w-6 text-purple-400" />
                  <h3 className="mt-2 text-xl font-bold">{venue.name}</h3>
                  <p className="mt-1 text-sm opacity-90">{venue.location}</p>
                  <p className="mt-1 text-sm opacity-90">Capacity: {venue.capacity}</p>
                  <motion.button
                    className="mt-3 inline-flex items-center text-sm font-medium text-white underline decoration-transparent transition-all hover:decoration-white"
                    whileHover={{ x: 5 }}
                  >
                    View Events <ArrowRightIcon className="ml-1 h-4 w-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}