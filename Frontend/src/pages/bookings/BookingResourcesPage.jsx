import React from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiClock, FiMapPin } from 'react-icons/fi';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export function BookingResourcesPage() {
  const quickOptions = [
    { name: 'Study Room', availability: '12 available', icon: FiMapPin },
    { name: 'Computer Lab', availability: '6 available', icon: FiClock },
    { name: 'Meeting Space', availability: '4 available', icon: FiCalendar }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-600 to-indigo-700 p-7 text-white shadow-lg">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-100">
          Booking Resources
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
          Reserve campus spaces in seconds
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-blue-100">
          Choose a facility, select your time slot, and manage all upcoming resource bookings in one place.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {quickOptions.map((option) => (
          <Card key={option.name} className="border border-slate-200/70">
            <CardHeader className="flex items-center gap-3 pb-2">
              <div className="rounded-xl bg-blue-100 p-2 text-blue-600">
                <option.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{option.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{option.availability}</p>
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full" size="sm">
                Start Booking
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}
