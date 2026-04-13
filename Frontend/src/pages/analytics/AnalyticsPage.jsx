import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Calendar, Activity, Download } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend } from
'recharts';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { mockChartData } from '../../data/mockData';
// Additional mock data for the analytics page
const resourceUtilization = [
{
  name: 'Lecture Halls',
  utilization: 85,
  fill: '#3b82f6'
},
{
  name: 'Labs',
  utilization: 65,
  fill: '#8b5cf6'
},
{
  name: 'Meeting Rooms',
  utilization: 92,
  fill: '#10b981'
},
{
  name: 'Equipment',
  utilization: 45,
  fill: '#f59e0b'
}];

export function AnalyticsPage() {
  const kpis = [
  {
    label: 'Total Bookings',
    value: '1,248',
    change: '+12%',
    trend: 'up',
    icon: <Calendar className="w-5 h-5 text-brand-purple" />,
    bg: 'bg-purple-100 dark:bg-purple-900/30'
  },
  {
    label: 'Active Users',
    value: '842',
    change: '+5%',
    trend: 'up',
    icon: <Users className="w-5 h-5 text-brand-blue" />,
    bg: 'bg-blue-100 dark:bg-blue-900/30'
  },
  {
    label: 'Avg. Utilization',
    value: '72%',
    change: '-2%',
    trend: 'down',
    icon: <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />,
    bg: 'bg-green-100 dark:bg-green-900/30'
  },
  {
    label: 'Open Incidents',
    value: '14',
    change: '-8%',
    trend: 'down',
    icon:
    <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />,

    bg: 'bg-orange-100 dark:bg-orange-900/30'
  }];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Analytics Overview
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Track platform usage, resource utilization, and incident metrics.
          </p>
        </div>
        <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>
          Export Report
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) =>
        <motion.div
          key={index}
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            delay: index * 0.1
          }}>
          
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpi.bg}`}>
                  
                    {kpi.icon}
                  </div>
                  <span
                  className={`text-sm font-medium ${kpi.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  
                    {kpi.change}
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                    {kpi.value}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {kpi.label}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Trends */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Weekly Booking Trends
            </h2>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={mockChartData.bookingTrends}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0
                  }}>
                  
                  <defs>
                    <linearGradient
                      id="colorBookings"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1">
                      
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#334155"
                    opacity={0.2} />
                  
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: '#64748b',
                      fontSize: 12
                    }}
                    dy={10} />
                  
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: '#64748b',
                      fontSize: 12
                    }}
                    dx={-10} />
                  
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#f8fafc'
                    }}
                    itemStyle={{
                      color: '#c084fc'
                    }} />
                  
                  <Area
                    type="monotone"
                    dataKey="bookings"
                    stroke="#7C3AED"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorBookings)" />
                  
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Peak Hours */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Peak Usage Hours
            </h2>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={mockChartData.peakHours}
                  margin={{
                    top: 10,
                    right: 10,
                    left: -20,
                    bottom: 0
                  }}>
                  
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#334155"
                    opacity={0.2} />
                  
                  <XAxis
                    dataKey="hour"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: '#64748b',
                      fontSize: 12
                    }}
                    dy={10} />
                  
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: '#64748b',
                      fontSize: 12
                    }} />
                  
                  <Tooltip
                    cursor={{
                      fill: '#334155',
                      opacity: 0.1
                    }}
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#f8fafc'
                    }} />
                  
                  <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Incident Categories */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Incident Categories
            </h2>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockChartData.incidentCategories}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value">
                    
                    {mockChartData.incidentCategories.map((entry, index) =>
                    <Cell key={`cell-${index}`} fill={entry.color} />
                    )}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#f8fafc'
                    }} />
                  
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle" />
                  
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Resource Utilization */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Resource Utilization (%)
            </h2>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={resourceUtilization}
                  layout="vertical"
                  margin={{
                    top: 10,
                    right: 30,
                    left: 40,
                    bottom: 0
                  }}>
                  
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="#334155"
                    opacity={0.2} />
                  
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: '#64748b',
                      fontSize: 12
                    }} />
                  
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: '#64748b',
                      fontSize: 12
                    }} />
                  
                  <Tooltip
                    cursor={{
                      fill: '#334155',
                      opacity: 0.1
                    }}
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#f8fafc'
                    }}
                    formatter={(value) => [`${value}%`, 'Utilization']} />
                  
                  <Bar dataKey="utilization" radius={[0, 4, 4, 0]} barSize={24}>
                    {resourceUtilization.map((entry, index) =>
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                    )}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>);

}
