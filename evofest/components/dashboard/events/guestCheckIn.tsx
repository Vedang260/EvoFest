'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Users,
  CheckCircle,
  Clock,
  Calendar,
  Activity,
  User,
  Phone,
  Mail,
  Gauge,
  TrendingUp,
  Award
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
import Heatmap from 'react-heatmap-grid';
import { useAppSelector } from '@/lib/hooks/hook';
import { setLoading } from '@/lib/redux/slice/loadingSlice';
import { useDispatch } from 'react-redux';

// Types
interface Guest {
  guestId: string;
  name: string;
  email: string;
  phoneNumber: string;
  gender: string;
  age: number;
  checkInAt: string | null;
}

interface CheckInData {
  totalGuests: number;
  checkedInGuests: number;
  checkInRate: number;
  dailyCheckins: Array<{ day: string; count: number }>;
  hourlyCheckins: Array<{ hour: string; count: number }>;
  peakCheckIn: { hour: string; count: number };
  dailyAttendance: Array<{ day: string; count: number }>;
  heatmapData: Array<{ day: string; hour: number; count: number }>;
  guestList: Guest[];
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

export default function GuestsCheckInTab({ eventId }: { eventId: string }) {
  const [data, setData] = useState<CheckInData | null>(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const { token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const fetchCheckInData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/dashboard/events/${eventId}/checkIn`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setData(response.data);
      } catch (err) {
        console.error('Failed to fetch check-in data:', err);
      } finally {
        setLoading(false);
        setLoading(false);
      }
    };

    fetchCheckInData();
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
        Failed to load check-in data
      </div>
    );
  }

  // Format heatmap data
//   const formatHeatmapData = () => {
//     const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
//     const dates = Array.from(new Set(data.heatmapData.map(item => item.day))).sort();
    
//     const formattedData = dates.map(date => {
//       const row = hours.map((_, hour) => {
//         const entry = data.heatmapData.find(
//           item => item.day === date && item.hour === hour
//         );
//         return entry ? entry.count : 0;
//       });
//       return { date, data: row };
//     });

//     return {
//       xLabels: hours,
//       yLabels: dates,
//       data: formattedData.map(d => d.data)
//     };
//   };

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
            icon: Users, 
            title: "Total Guests", 
            value: data.totalGuests,
            color: 'bg-purple-100 text-purple-600'
          },
          { 
            icon: CheckCircle, 
            title: "Checked In", 
            value: data.checkedInGuests,
            color: 'bg-green-100 text-green-600'
          },
          { 
            icon: Gauge, 
            title: "Check-In Rate", 
            value: `${data.checkInRate.toFixed(1)}%`,
            color: 'bg-blue-100 text-blue-600'
          },
          { 
            icon: Award, 
            title: "Peak Check-In", 
            value: formatTime(data.peakCheckIn.hour),
            subValue: `${data.peakCheckIn.count} guests`,
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
        {/* Check-In Rate */}
        <motion.div
          variants={chartVariants}
          initial="hidden"
          animate="visible"
          className="bg-white p-6 rounded-xl shadow-sm border border-purple-50"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-purple-900 flex items-center">
              <Gauge className="h-5 w-5 mr-2 text-purple-600" />
              Check-In Progress
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              data.checkInRate >= 75 ? 'bg-green-100 text-green-800' :
              data.checkInRate >= 50 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {data.checkInRate.toFixed(1)}% Complete
            </span>
          </div>
          <div className="h-24">
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className={`h-4 rounded-full ${
                  data.checkInRate >= 75 ? 'bg-green-500' :
                  data.checkInRate >= 50 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${data.checkInRate}%` }}
              ></div>
            </div>
          </div>
        </motion.div>

        {/* Daily Check-Ins */}
        <motion.div
          variants={chartVariants}
          initial="hidden"
          animate="visible"
          className="bg-white p-6 rounded-xl shadow-sm border border-purple-50"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-purple-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-purple-600" />
              Daily Check-Ins
            </h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.dailyCheckins}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#EDE9FE" />
                <XAxis 
                  dataKey="day" 
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
                <Bar
                  dataKey="count"
                  name="Check-Ins"
                  fill="#8B5CF6"
                  animationDuration={2000}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Check-In Heatmap */}
        <motion.div
          variants={chartVariants}
          initial="hidden"
          animate="visible"
          className="bg-white p-6 rounded-xl shadow-sm border border-purple-50"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-purple-900 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-purple-600" />
              Check-Ins Heatmap
            </h3>
          </div>
          {/* <div className="h-[500px] overflow-x-auto">
            <div className="min-w-[800px]">
              <Heatmap
                xLabels={formatHeatmapData().xLabels}
                yLabels={formatHeatmapData().yLabels}
                data={formatHeatmapData().data}
                squares
                height={25}
                onClick={(x: any, y: any) => alert(`Clicked: ${y}, ${x}`)}
                cellStyle={(background: any, value: any, min: any, max: any, data: any, x: any, y: any) => ({
                  background: value === 0 
                    ? '#F3F4F6' 
                    : `rgba(139, 92, 246, ${0.2 + (0.8 * value / Math.max(...data.flat()))})`,
                  fontSize: '10px',
                  color: value === 0 ? '#9CA3AF' : '#4B5563'
                })}
                cellRender={(value: number) => value > 0 ? value : ''}
                title={(value: number, unit: string) => `${value} check-ins`}
                xLabelsStyle={{ fontSize: 10, color: '#6B7280' }}
                yLabelsStyle={{ fontSize: 10, color: '#6B7280' }}
              />
              <div className="mt-4 flex items-center justify-center text-xs text-gray-500">
                <div className="flex items-center mr-4">
                  <div className="w-4 h-4 mr-1 bg-gray-200 rounded-sm"></div>
                  <span>0 check-ins</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 mr-1 bg-purple-100 rounded-sm"></div>
                  <span>1+ check-ins</span>
                </div>
                <div className="flex items-center ml-4">
                  <div className="w-4 h-4 mr-1 bg-purple-600 rounded-sm"></div>
                  <span>Peak activity</span>
                </div>
              </div>
            </div>
          </div> */}
        </motion.div>

        {/* Guest List */}
        <motion.div
          variants={chartVariants}
          initial="hidden"
          animate="visible"
          className="bg-white p-6 rounded-xl shadow-sm border border-purple-50"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-purple-900 flex items-center">
              <Users className="h-5 w-5 mr-2 text-purple-600" />
              Guest List
            </h3>
            <div className="text-sm text-purple-600">
              {data.checkedInGuests} of {data.totalGuests} checked in
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-purple-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-500 uppercase tracking-wider">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.guestList.map((guest) => (
                  <tr key={guest.guestId} className="hover:bg-purple-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                          <User className="h-5 w-5" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-purple-900">{guest.name}</div>
                          <div className="text-sm text-gray-500">{guest.age} years • {guest.gender}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-purple-900 flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        {guest.email}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <Phone className="h-4 w-4 mr-2" />
                        {guest.phoneNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Guest ID: {guest.guestId.slice(0, 8)}...</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        guest.checkInAt 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {guest.checkInAt ? `Checked in at ${formatTime(guest.checkInAt)}` : 'Not checked in'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Helper functions
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

function formatTime(dateTimeString: string) {
  return new Date(dateTimeString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}