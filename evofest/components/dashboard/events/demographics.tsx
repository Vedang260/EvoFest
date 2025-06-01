'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Users,
  User,
  PieChart,
  BarChart2,
  Calendar,
 
  Ticket
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
  ComposedChart,
  Line
} from 'recharts';
import { useAppSelector } from '@/lib/hooks/hook';
import { setLoading } from '@/lib/redux/slice/loadingSlice';
import { useDispatch } from 'react-redux';

// Types
interface DemographicData {
  ageDistribution: Array<{ age_group: string; count: number }>;
  genderBreakdown: Array<{ gender: string; count: number }>;
  ticketTypeDemographics: Array<{ ticket_type: string; gender: string; count: number }>;
  dailyDemographics: Array<{ day: string; age_group: string; gender: string; count: number }>;
}

// Color palette
const COLORS = ['#8B5CF6', '#EC4899', '#6366F1', '#10B981', '#F59E0B'];
const GENDER_COLORS = {
  MALE: '#3B82F6',
  FEMALE: '#EC4899',
  OTHER: '#10B981'
};

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

export default function DailyDemographicsTab({ eventId }: { eventId: string }) {
  const [data, setData] = useState<DemographicData | null>(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const { token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const fetchDemographicsData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/dashboard/events/${eventId}/demographic`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setData(response.data);
      } catch (err) {
        console.error('Failed to fetch demographics data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDemographicsData();
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
        Failed to load demographics data
      </div>
    );
  }

  // Format data for combined gender/age chart
  const genderAgeData = data.ageDistribution.map(ageGroup => {
    const entry: any = { age_group: ageGroup.age_group };
    data.genderBreakdown.forEach(gender => {
      const match = data.dailyDemographics.find(
        d => d.age_group === ageGroup.age_group && d.gender === gender.gender
      );
      entry[gender.gender] = match ? match.count : 0;
    });
    return entry;
  });

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
            title: "Total Attendees", 
            value: data.genderBreakdown.reduce((sum, item) => sum + item.count, 0),
            color: 'bg-purple-100 text-purple-600'
          },
          { 
            icon: Users, 
            title: "Male Attendees", 
            value: data.genderBreakdown.find(g => g.gender === 'MALE')?.count || 0,
            color: 'bg-blue-100 text-blue-600'
          },
          { 
            icon: Users, 
            title: "Female Attendees", 
            value: data.genderBreakdown.find(g => g.gender === 'FEMALE')?.count || 0,
            color: 'bg-pink-100 text-pink-600'
          },
          { 
            icon: Users, 
            title: "Largest Age Group", 
            value: data.ageDistribution.reduce((max, item) => 
              item.count > max.count ? item : max
            ).age_group,
            subValue: `${Math.max(...data.ageDistribution.map(a => a.count))} attendees`,
            color: 'bg-green-100 text-green-600'
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
        {/* Age Distribution */}
        <motion.div
          variants={chartVariants}
          initial="hidden"
          animate="visible"
          className="bg-white p-6 rounded-xl shadow-sm border border-purple-50"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-purple-900 flex items-center">
              <PieChart className="h-5 w-5 mr-2 text-purple-600" />
              Age Distribution
            </h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={data.ageDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="age_group"
                  label={({ age_group, percent }) => `${age_group}: ${(percent * 100).toFixed(0)}%`}
                  animationDuration={2000}
                >
                  {data.ageDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number, name: string) => [`${value} attendees`, name]}
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
        </motion.div>

        {/* Gender Breakdown */}
        <motion.div
          variants={chartVariants}
          initial="hidden"
          animate="visible"
          className="bg-white p-6 rounded-xl shadow-sm border border-purple-50"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-purple-900 flex items-center">
              <User className="h-5 w-5 mr-2 text-purple-600" />
              Gender Breakdown
            </h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.genderBreakdown}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#EDE9FE" />
                <XAxis 
                  dataKey="gender" 
                  tick={{ fill: '#6B7280' }}
                  tickFormatter={(value) => value.charAt(0) + value.slice(1).toLowerCase()}
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
                  name="Attendees"
                  animationDuration={2000}
                >
                  {data.genderBreakdown.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={GENDER_COLORS[entry.gender as keyof typeof GENDER_COLORS] || COLORS[index]} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Gender by Age Group */}
        <motion.div
          variants={chartVariants}
          initial="hidden"
          animate="visible"
          className="bg-white p-6 rounded-xl shadow-sm border border-purple-50"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-purple-900 flex items-center">
              <BarChart2 className="h-5 w-5 mr-2 text-purple-600" />
              Gender by Age Group
            </h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={genderAgeData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#EDE9FE" />
                <XAxis 
                  dataKey="age_group" 
                  tick={{ fill: '#6B7280' }}
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
                {data.genderBreakdown.map(gender => (
                  <Bar
                    key={gender.gender}
                    dataKey={gender.gender}
                    name={gender.gender.charAt(0) + gender.gender.slice(1).toLowerCase()}
                    fill={GENDER_COLORS[gender.gender as keyof typeof GENDER_COLORS]}
                    animationDuration={2000}
                  />
                ))}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Ticket Type Demographics */}
        <motion.div
          variants={chartVariants}
          initial="hidden"
          animate="visible"
          className="bg-white p-6 rounded-xl shadow-sm border border-purple-50"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-purple-900 flex items-center">
              <Ticket className="h-5 w-5 mr-2 text-purple-600" />
              Ticket Type Demographics
            </h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={data.ticketTypeDemographics}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#EDE9FE" />
                <XAxis 
                  dataKey="ticket_type" 
                  tick={{ fill: '#6B7280' }}
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
                {data.genderBreakdown.map(gender => (
                  <Bar
                    key={gender.gender}
                    dataKey="count"
                    name={gender.gender.charAt(0) + gender.gender.slice(1).toLowerCase()}
                    stackId="a"
                    fill={GENDER_COLORS[gender.gender as keyof typeof GENDER_COLORS]}
                    animationDuration={2000}
                  >
                    {data.ticketTypeDemographics
                      .filter(d => d.gender === gender.gender)
                      .map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={GENDER_COLORS[entry.gender as keyof typeof GENDER_COLORS]} 
                        />
                      ))}
                  </Bar>
                ))}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}