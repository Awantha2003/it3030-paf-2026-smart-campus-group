import React from 'react';
import { motion } from 'framer-motion';
import { WrenchIcon, AlertCircleIcon, ChevronRightIcon } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { mockTickets } from '../../data/mockData';
import { useAuth } from '../../contexts/AuthContext';

export function UserDashboard() {
  const { user } = useAuth();

  const stats = [
    {
      label: 'Active Tickets',
      value: '2',
      trend: '1 requires attention',
      icon: WrenchIcon,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Welcome back, {user?.name.split(' ')[0]}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Here&apos;s what&apos;s happening on campus today.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" leftIcon={<AlertCircleIcon className="w-4 h-4" />}>
            Report Issue
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${stat.color} shadow-sm`}
                >
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {stat.label}
                  </p>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stat.value}
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    {stat.trend}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-white">My Active Tickets</h3>
            <Button
              variant="ghost"
              size="sm"
              rightIcon={<ChevronRightIcon className="w-4 h-4" />}
            >
              View All
            </Button>
          </CardHeader>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {mockTickets.slice(0, 4).map((ticket) => (
              <div
                key={ticket.id}
                className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div>
                  <p className="font-medium text-slate-900 dark:text-white text-sm">
                    {ticket.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {ticket.location}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${ticket.priority === 'CRITICAL' ? 'bg-red-500' : ticket.priority === 'HIGH' ? 'bg-orange-500' : 'bg-blue-500'}`}
                  ></span>
                  <StatusBadge status={ticket.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
