import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  Building2,
  CalendarDays,
  Dumbbell,
  Library,
  Package,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export function BookingResourcesPage() {
  const resourceTypes = [
    {
      id: 'FACILITY',
      icon: Building2,
      summary: 'Lecture halls, labs, studios, and meeting spaces',
      availability: '42 spaces',
      accents: 'from-cyan-500/25 via-blue-500/10 to-transparent ring-cyan-400/40'
    },
    {
      id: 'EQUIPMENT',
      icon: Package,
      summary: 'Projectors, cameras, kits, and multimedia gear',
      availability: '127 items',
      accents: 'from-amber-500/25 via-orange-500/10 to-transparent ring-amber-400/40'
    },
    {
      id: 'SPORTS',
      icon: Dumbbell,
      summary: 'Courts, fields, gym slots, and training zones',
      availability: '18 venues',
      accents: 'from-emerald-500/25 via-teal-500/10 to-transparent ring-emerald-400/40'
    },
    {
      id: 'LIBRARY',
      icon: Library,
      summary: 'Reading rooms, research pods, and media booths',
      availability: '9 zones',
      accents: 'from-indigo-500/25 via-violet-500/10 to-transparent ring-indigo-400/40'
    },
    {
      id: 'EVENT',
      icon: CalendarDays,
      summary: 'Seminars, exhibitions, clubs, and special events',
      availability: '11 upcoming',
      accents: 'from-rose-500/25 via-fuchsia-500/10 to-transparent ring-rose-400/40'
    }
  ];

  const [selectedType, setSelectedType] = useState(resourceTypes[0].id);

  const activeResourceType = useMemo(
    () => resourceTypes.find((type) => type.id === selectedType) ?? resourceTypes[0],
    [resourceTypes, selectedType]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="rounded-3xl border border-cyan-300/40 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 p-7 text-white shadow-[0_20px_60px_-25px_rgba(56,189,248,0.65)]">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-100">
          Booking Resources
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
          Book campus assets in one unified flow
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-blue-100">
          Create reservations faster with categorized resource types and smarter availability visibility.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-300">
          <Sparkles className="h-4 w-4" />
          Resource Types
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {resourceTypes.map((type, index) => {
            const Icon = type.icon;
            const isActive = selectedType === type.id;
            return (
              <motion.button
                key={type.id}
                type="button"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * index }}
                onClick={() => setSelectedType(type.id)}
                className={`group relative overflow-hidden rounded-3xl border p-5 text-left transition-all ${
                  isActive
                    ? 'border-white/50 bg-slate-900 text-white shadow-[0_20px_45px_-20px_rgba(15,23,42,0.8)]'
                    : 'border-slate-200/70 bg-white/80 hover:-translate-y-0.5 hover:border-slate-300 dark:border-slate-700/70 dark:bg-slate-900/70 dark:hover:border-slate-600'
                }`}
              >
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${type.accents} ${
                    isActive ? 'opacity-100' : 'opacity-70'
                  }`}
                />
                <div className="relative">
                  <div
                    className={`mb-4 inline-flex rounded-2xl p-2.5 ring-1 ${
                      isActive
                        ? 'bg-white/15 text-white ring-white/25'
                        : 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <p
                    className={`text-xs font-semibold uppercase tracking-[0.14em] ${
                      isActive ? 'text-slate-200' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {type.id}
                  </p>
                  <p className={`mt-1 text-sm font-medium ${isActive ? 'text-slate-100' : 'text-slate-600 dark:text-slate-300'}`}>
                    {type.summary}
                  </p>
                  <p className={`mt-3 text-xs font-semibold ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                    {type.availability}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      <Card className="overflow-hidden border border-slate-200/70 dark:border-slate-800">
        <CardHeader className="border-b border-slate-100/80 bg-gradient-to-r from-slate-50 to-cyan-50/70 dark:from-slate-900 dark:to-slate-900">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              Selected Type
            </p>
            <h2 className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">
              {activeResourceType.id}
            </h2>
          </div>
          <Button
            size="sm"
            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700"
            rightIcon={<ArrowUpRight className="h-4 w-4" />}
          >
            Continue
          </Button>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {['Live availability checks', 'Smart slot conflict detection', 'Instant confirmation + reminders'].map(
            (feature) => (
              <div
                key={feature}
                className="rounded-2xl border border-slate-200/80 bg-slate-50/70 px-4 py-3 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
              >
                {feature}
              </div>
            )
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
