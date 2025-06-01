'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Ticket,
  CreditCard,
  BarChart2,
  PieChart,
  Calendar,
  TrendingUp,
  Award,
  Star,
  Zap
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
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart,
  Line
} from 'recharts';
import { useAppSelector } from '@/lib/hooks/hook';
import { setLoading } from '@/lib/redux/slice/loadingSlice';
import { useDispatch } from 'react-redux';

// Types
interface TicketSalesData {
  totalTicketsSold: number;
  totalRevenue: number;
  typeStats: {
    [key: string]: {
      sold: number;
      revenue: number;
      available: number;
    };
  };
  dateWiseStats: {
    [key: string]: {
      [key: string]: number;
    };
  };
  trend: {
    [key: string]: {
      quantity: number;
      revenue: number;
    };
  };
  bestSellingType: {
    type: string;
    sold: number;
    revenue: number;
    available: number;
  };
  peakSalesDay: {
    date: string;
    quantity: number;
    revenue: number;
  };
}

// Color palette
const COLORS = ['#8B5CF6', '#EC4899', '#6366F1', '#10B981', '#F59E0B'];

// Animation variants
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

export default function TicketSalesTab({ eventId }: { eventId: string }) {
  const [data, setData] = useState<TicketSalesData | null>(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const { token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/dashboard/events/${eventId}/ticketSales`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setData(response.data);
      } catch (err) {
        console.error('Failed to fetch ticket sales data:', err);
      } finally {
        setLoading(false);
        setLoading(false);
      }
    };

    fetchSalesData();
  }, [eventId, token, dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-pink-50 border border-pink-200 text-pink-700 px-4 py-3 rounded">
        Failed to load ticket sales data
      </div>
    );
  }

  // Format data for charts
  const ticketTypeData = Object.entries(data.typeStats).map(([type, stats]) => ({
    type,
    ...stats
  }));

  const dailySalesData = Object.entries(data.dateWiseStats).map(([date, types]) => {
    const entry: any = { date };
    Object.entries(types).forEach(([type, count]) => {
      entry[type] = count;
    });
    return entry;
  });

  const trendData = Object.entries(data.trend).map(([date, stats]) => ({
    date,
    ...stats
  }));

  return (
    <div className="space-y-8">
      {/* Summary Stats */}
      <motion.div 
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { 
            icon: Ticket, 
            title: "Total Tickets Sold", 
            value: data.totalTicketsSold,
            color: 'bg-purple-100 text-purple-600'
          },
          { 
            icon: CreditCard, 
            title: "Total Revenue", 
            value: `₹${data.totalRevenue.toLocaleString()}`,
            color: 'bg-pink-100 text-pink-600'
          },
          { 
            icon: Award, 
            title: "Best-Selling Type", 
            value: data.bestSellingType.type,
            subValue: `${data.bestSellingType.sold} sold (₹${data.bestSellingType.revenue.toLocaleString()})`,
            color: 'bg-indigo-100 text-indigo-600'
          },
          { 
            icon: Star, 
            title: "Peak Sales Day", 
            value: formatDate(data.peakSalesDay.date),
            subValue: `${data.peakSalesDay.quantity} tickets (₹${data.peakSalesDay.revenue.toLocaleString()})`,
            color: 'bg-yellow-100 text-yellow-600'
          }
        ].map((stat, i) => (
          <motion.div
            key={stat.title}
            custom={i}
            variants={statCardVariants}
            className="bg-white p-4 rounded-xl shadow-sm border border-purple-50 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-purple-600">{stat.title}</p>
                <p className="text-xl font-bold text-purple-900">
                  {stat.value}
                </p>
                {stat.subValue && (
                  <p className="text-xs text-gray-500 mt-1">{stat.subValue}</p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Section */}
      <div className="space-y-8">
        {/* Ticket Type Distribution */}
        <motion.div
          variants={chartVariants}
          initial="hidden"
          animate="visible"
          className="bg-white p-6 rounded-xl shadow-sm border border-purple-50 grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-purple-900 flex items-center">
                <PieChart className="h-5 w-5 mr-2 text-purple-600" />
                Ticket Type Distribution
              </h3>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={ticketTypeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="sold"
                    nameKey="type"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    animationDuration={2000}
                  >
                    {ticketTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number, name: string) => [`${value} tickets`, name]}
                    contentStyle={{
                      background: '#FFFFFF',
                      borderColor: '#8B5CF6',
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-purple-900 flex items-center">
                <BarChart2 className="h-5 w-5 mr-2 text-purple-600" />
                Revenue by Ticket Type
              </h3>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={ticketTypeData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#EDE9FE" />
                  <XAxis dataKey="type" tick={{ fill: '#6B7280' }} />
                  <YAxis 
                    tick={{ fill: '#6B7280' }}
                    tickFormatter={(value) => `₹${value.toLocaleString()}`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
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
                    animationDuration={2000}
                  >
                    {ticketTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Daily Ticket Sales */}
        <motion.div
          variants={chartVariants}
          initial="hidden"
          animate="visible"
          className="bg-white p-6 rounded-xl shadow-sm border border-purple-50"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-purple-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-purple-600" />
              Daily Ticket Sales
            </h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={dailySalesData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                stackOffset="expand"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#EDE9FE" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: '#6B7280' }}
                  tickFormatter={(value) => formatDate(value)}
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
                <Legend />
                {Object.keys(data.typeStats).map((type, index) => (
                  <Bar
                    key={type}
                    dataKey={type}
                    stackId="a"
                    name={type}
                    fill={COLORS[index % COLORS.length]}
                    animationDuration={2000}
                  />
                ))}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Booking Trend */}
        <motion.div
          variants={chartVariants}
          initial="hidden"
          animate="visible"
          className="bg-white p-6 rounded-xl shadow-sm border border-purple-50"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-purple-900 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
              Booking Trend Over Time
            </h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={trendData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#EDE9FE" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: '#6B7280' }}
                  tickFormatter={(value) => formatDate(value)}
                />
                <YAxis 
                  yAxisId="left"
                  tick={{ fill: '#6B7280' }}
                  label={{ value: 'Quantity', angle: -90, position: 'insideLeft' }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: '#6B7280' }}
                  tickFormatter={(value) => `₹${value.toLocaleString()}`}
                  label={{ value: 'Revenue', angle: 90, position: 'insideRight' }}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => 
                    name === 'Revenue' ? [`₹${value.toLocaleString()}`, name] : [value, name]
                  }
                  contentStyle={{
                    background: '#FFFFFF',
                    borderColor: '#8B5CF6',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="quantity"
                  name="Tickets Sold"
                  fill="#8B5CF6"
                  stroke="#8B5CF6"
                  fillOpacity={0.2}
                  animationDuration={2000}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#EC4899"
                  animationDuration={2000}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Helper function to format dates
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}