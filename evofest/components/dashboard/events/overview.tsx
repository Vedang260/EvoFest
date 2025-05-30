'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CalendarDays,
  Ticket,
  Users,
  CreditCard,
  CheckCircle,
  BarChart2,

  Clock,
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { useAppSelector } from '@/lib/hooks/hook';
import { setLoading } from '@/lib/redux/slice/loadingSlice';
import { useDispatch } from 'react-redux';
import { format } from 'date-fns';

// Types for analytics data
interface AnalyticsData {
  totalEventDays: number;
  totalTicketTypes: number;
  totalCapacity: number;
  totalBookings: number;
  totalGuests: number;
  totalRevenue: number;
  totalCheckIns: number;
  checkInPercentage: number;
  trends: {
    bookingsByDate: Record<string, number>;
    revenueByTicketType: Record<string, number>;
    ticketTypeCounts: { _sum: { quantity: number }; type: string }[];
    checkInHeatmap: Record<string, number>;
  };
}

interface ApiResponse {
  success: boolean;
  data: AnalyticsData;
}

// Color palette matching your theme
const COLORS = ['#8B5CF6', '#EC4899', '#6366F1', '#10B981', '#F59E0B'];

const statCardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5
    }
  })
};

const chartVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

export default function OverviewTab({ eventId }: { eventId: string }) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const { token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        setLoading(true);
        const response = await axios.get<ApiResponse>(`/api/dashboard/events/${eventId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setData(response.data.data);
      } catch (err) {
        setError('Failed to fetch analytics data');
        console.error(err);
      } finally {
        setLoading(false);
        //dispatch(setLoading(false));
      }
    };

    fetchAnalyticsData();
  }, [eventId, token, dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-pink-50 border border-pink-200 text-pink-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  // Format data for charts
  const bookingsData = Object.entries(data.trends.bookingsByDate).map(([date, count]) => ({
    date,
    bookings: count
  }));

  const revenueData = Object.entries(data.trends.revenueByTicketType).map(([type, revenue]) => ({
    type,
    revenue
  }));

  const ticketDistributionData = data.trends.ticketTypeCounts.map(item => ({
    type: item.type,
    quantity: item._sum.quantity
  }));

  // Heatmap data formatting would be more complex - simplified for example
  const heatmapData = Object.entries(data.trends.checkInHeatmap).map(([time, count]) => {
    const [date, hour] = time.split('-').slice(2);
    return {
      date: `${date}-${hour}`,
      checkIns: count
    };
  });

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <motion.div 
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { icon: CalendarDays, title: "Event Days", value: data.totalEventDays },
          { icon: Ticket, title: "Ticket Types", value: data.totalTicketTypes },
          { icon: Users, title: "Total Capacity", value: data.totalCapacity.toLocaleString() },
          { icon: Users, title: "Total Bookings", value: data.totalBookings },
          { icon: Users, title: "Total Guests", value: data.totalGuests },
          { icon: CreditCard, title: "Total Revenue", value: `₹${data.totalRevenue.toLocaleString()}` },
          { icon: CheckCircle, title: "Check-Ins", value: data.totalCheckIns },
          { icon: TrendingUp, title: "Check-In %", value: `${data.checkInPercentage}%` }
        ].map((stat, i) => (
          <motion.div
            key={stat.title}
            custom={i}
            variants={statCardVariants}
            className="bg-white p-4 rounded-xl shadow-sm border border-purple-50 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-purple-600">{stat.title}</p>
                <p className="text-xl font-bold text-purple-900">
                  {stat.value}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Section */}
      <div className="space-y-8">
        {/* Bookings Over Time */}
        <motion.div
          variants={chartVariants}
          initial="hidden"
          animate="visible"
          className="bg-white p-6 rounded-xl shadow-sm border border-purple-50"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-purple-900 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
              Bookings Over Time
            </h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={bookingsData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EDE9FE" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: '#6B7280' }}
                  tickFormatter={(value) => format(new Date(value), 'MMM d')}
                />
                <YAxis tick={{ fill: '#6B7280' }} />
                <Tooltip 
                  contentStyle={{
                    background: '#FFFFFF',
                    borderColor: '#8B5CF6',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="bookings"
                  stroke="#8B5CF6"
                  fillOpacity={1}
                  fill="url(#colorBookings)"
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Revenue by Ticket Type */}
        <motion.div
          variants={chartVariants}
          initial="hidden"
          animate="visible"
          className="bg-white p-6 rounded-xl shadow-sm border border-purple-50"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-purple-900 flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-purple-600" />
              Revenue by Ticket Type
            </h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={revenueData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#EDE9FE" horizontal={false} />
                <XAxis 
                  type="number" 
                  tick={{ fill: '#6B7280' }}
                  tickFormatter={(value) => `₹${value.toLocaleString()}`}
                />
                <YAxis 
                  dataKey="type" 
                  type="category" 
                  tick={{ fill: '#6B7280' }}
                  width={80}
                />
                <Tooltip 
                  formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
                  contentStyle={{
                    background: '#FFFFFF',
                    borderColor: '#8B5CF6',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar
                  dataKey="revenue"
                  name="Revenue"
                  fill="#8B5CF6"
                  radius={[0, 4, 4, 0]}
                  animationDuration={2000}
                >
                  {revenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Ticket Type Distribution */}
        <motion.div
          variants={chartVariants}
          initial="hidden"
          animate="visible"
          className="bg-white p-6 rounded-xl shadow-sm border border-purple-50"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-purple-900 flex items-center">
              <PieChart className="h-5 w-5 mr-2 text-purple-600" />
              Ticket Type Distribution
            </h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ticketDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="quantity"
                  nameKey="type"
                  animationDuration={2000}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {ticketDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [value, 'Tickets']}
                  contentStyle={{
                    background: '#FFFFFF',
                    borderColor: '#8B5CF6',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Check-In Percentage */}
        <motion.div
          variants={chartVariants}
          initial="hidden"
          animate="visible"
          className="bg-white p-6 rounded-xl shadow-sm border border-purple-50"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-purple-900 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-purple-600" />
              Check-In Progress
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              data.checkInPercentage >= 75 ? 'bg-green-100 text-green-800' :
              data.checkInPercentage >= 50 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {data.checkInPercentage}% Complete
            </span>
          </div>
          <div className="h-24">
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className={`h-4 rounded-full ${
                  data.checkInPercentage >= 75 ? 'bg-green-500' :
                  data.checkInPercentage >= 50 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${data.checkInPercentage}%` }}
              ></div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}