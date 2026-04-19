import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiCheck, FiX, FiClock, FiSearch, FiLayers, FiBox, FiActivity, FiBookOpen, FiAlertTriangle } from 'react-icons/fi';

import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { getAllFacilityBookings, updateFacilityBookingStatus } from '../../api/facilityBookings';
import { getAllResourceBookings, updateResourceBookingStatus } from '../../api/resourceBookings';

const RESOURCE_TYPES = [
  { type: 'FACILITY', label: 'FACILITY', icon: FiLayers, summary: 'Lecture halls, labs, studios, and meeting spaces' },
  { type: 'EQUIPMENT', label: 'EQUIPMENT', icon: FiBox, summary: 'Projectors, cameras, kits, and multimedia gear' },
  { type: 'SPORTS', label: 'SPORTS', icon: FiActivity, summary: 'Courts, fields, gym slots, and training zones' },
  { type: 'LIBRARY', label: 'LIBRARY', icon: FiBookOpen, summary: 'Reading rooms, research pods, and media booths' },
  { type: 'EVENT', label: 'EVENT', icon: FiCalendar, summary: 'Seminars, exhibitions, clubs, and special events' }
];

export function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResourceType, setSelectedResourceType] = useState('FACILITY');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadAllBookings();
  }, []);

  async function loadAllBookings() {
    setLoading(true);
    try {
      const [facResponse, resResponse] = await Promise.all([
        getAllFacilityBookings(),
        getAllResourceBookings()
      ]);

      const mappedFacs = (facResponse || []).map(b => ({ ...b, _isFacility: true }));
      const mappedRes = (resResponse || []).map(b => ({ ...b, _isFacility: false }));

      const combined = [...mappedFacs, ...mappedRes].sort((a, b) => {
        const dateA = new Date(`${a.bookingDate}T${a.bookingTime}`);
        const dateB = new Date(`${b.bookingDate}T${b.bookingTime}`);
        return dateB - dateA;
      });

      setBookings(combined);
    } catch (err) {
      alert('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }

  const handleApprove = async (booking) => {
    setIsUpdating(true);
    try {
      if (booking._isFacility) {
        await updateFacilityBookingStatus(booking.id, { status: 'APPROVED' });
      } else {
        await updateResourceBookingStatus(booking.id, { status: 'APPROVED' });
      }
      alert('Booking approved');
      loadAllBookings();
    } catch (err) {
      alert('Failed to approve booking');
    } finally {
      setIsUpdating(false);
    }
  };

  const openRejectModal = (booking) => {
    setSelectedBooking(booking);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      alert('Rejection reason is required');
      return;
    }

    setIsUpdating(true);
    try {
      if (selectedBooking._isFacility) {
        await updateFacilityBookingStatus(selectedBooking.id, { status: 'REJECTED', rejectionReason });
      } else {
        await updateResourceBookingStatus(selectedBooking.id, { status: 'REJECTED', rejectionReason });
      }
      alert('Booking rejected');
      setShowRejectModal(false);
      loadAllBookings();
    } catch (err) {
      alert('Failed to reject booking');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredBookings = bookings.filter(b => {
    const bType = b._isFacility ? 'FACILITY' : (b.resourceType || 'FACILITY');
    if (bType !== selectedResourceType) return false;

    if (selectedStatus !== 'ALL' && b.status !== selectedStatus) return false;

    const q = searchQuery.toLowerCase();
    return b.studentName?.toLowerCase().includes(q) ||
      b.studentId?.toLowerCase().includes(q) ||
      (b.lectureHallName || b.resourceName)?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FiCalendar className="text-cyan-500" /> Booking Approvals
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage facility and resource booking requests from students
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5 mb-8">
        {RESOURCE_TYPES.map((type) => {
          const Icon = type.icon;
          const isActive = selectedResourceType === type.type;
          const count = bookings.filter(b => (b._isFacility ? 'FACILITY' : (b.resourceType || 'FACILITY')) === type.type).length;

          return (
            <button
              key={type.type}
              type="button"
              onClick={() => setSelectedResourceType(type.type)}
              className={`group relative overflow-hidden rounded-3xl border p-5 text-left transition-all ${isActive
                  ? 'border-white/50 bg-slate-900 text-white shadow-lg'
                  : 'border-slate-200/70 bg-white/80 hover:-translate-y-0.5 hover:border-slate-300 dark:border-slate-700/70 dark:bg-slate-900/70 dark:hover:border-slate-600'
                }`}
            >
              <div className="relative">
                <div
                  className={`mb-4 inline-flex rounded-2xl p-2.5 ring-1 ${isActive
                      ? 'bg-white/15 text-white ring-white/25'
                      : 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700'
                    }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${isActive ? 'text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>
                  {type.label}
                </p>
                <p className={`mt-1 text-xs font-medium mb-3 ${isActive ? 'text-slate-100' : 'text-slate-600 dark:text-slate-300'}`}>
                  {type.summary}
                </p>
                <p className={`text-xs font-bold ${isActive ? 'text-cyan-300' : 'text-cyan-600 dark:text-cyan-400'}`}>
                  {count} request{count !== 1 ? 's' : ''}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'ALL', label: 'All Bookings' },
            { id: 'PENDING_APPROVAL', label: 'Pending' },
            { id: 'APPROVED', label: 'Approved' },
            { id: 'REJECTED', label: 'Rejected' },
            { id: 'CANCELLED', label: 'Cancelled' }
          ].map(status => (
            <button
              key={status.id}
              onClick={() => setSelectedStatus(status.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all ${
                selectedStatus === status.id 
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' 
                  : 'bg-white/50 text-slate-500 border border-slate-200/60 hover:border-slate-300 dark:bg-slate-900/50 dark:text-slate-400 dark:border-slate-800 dark:hover:border-slate-700'
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-96">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student, ID or resource..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:ring-2 focus:ring-cyan-500 transition-all outline-none"
          />
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            No bookings found
          </div>
        ) : (
          filteredBookings.map(booking => (
            <Card key={booking.id} className="overflow-hidden transition-shadow hover:shadow-md">
              <div className="flex flex-col md:flex-row p-5 gap-6">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {booking._isFacility ? booking.lectureHallName : booking.resourceName}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {booking.studentName} ({booking.studentId})
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      booking.status === 'PENDING_APPROVAL' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
                      booking.status === 'REJECTED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                      booking.status === 'CANCELLED' ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' :
                      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                    }`}>
                      {booking.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <FiClock className="w-4 h-4 text-slate-400" />
                      {booking.bookingDate} at {booking.bookingTime?.slice(0, 5)} ({booking.durationHours} hrs)
                    </div>
                    <div className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs">
                      {booking._isFacility ? 'FACILITY' : booking.resourceType}
                    </div>
                  </div>

                  {(booking.purpose || booking.faculty) && (
                    <p className="text-sm text-slate-500 italic mt-2">
                      "{booking.purpose || booking.faculty}"
                    </p>
                  )}
                  {booking.status === 'REJECTED' && booking.rejectionReason && (
                    <p className="text-sm text-red-600 mt-2 p-2 bg-red-50 dark:bg-red-900/10 rounded border border-red-100 dark:border-red-900/30">
                      <strong>Rejection Reason:</strong> {booking.rejectionReason}
                    </p>
                  )}
                  {booking.status === 'CANCELLED' && booking.cancellationReason && (
                    <div className="flex items-start gap-2 mt-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                      <FiAlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-amber-300">
                        <span className="font-bold">Student's Cancellation Reason:</span> {booking.cancellationReason}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 min-w-[200px] border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-6">
                  {booking.status === 'PENDING_APPROVAL' && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => openRejectModal(booking)}
                        disabled={isUpdating}
                        className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                        leftIcon={<FiX />}
                      >
                        Reject
                      </Button>
                      <Button
                        onClick={() => handleApprove(booking)}
                        disabled={isUpdating}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        leftIcon={<FiCheck />}
                      >
                        Approve
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <AnimatePresence>
        {showRejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Reject Booking</h3>
              </div>
              <form onSubmit={handleReject} className="p-6">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Reason for Rejection <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    required
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-red-500 outline-none"
                    placeholder="Please explain why this booking cannot be approved..."
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="ghost" onClick={() => setShowRejectModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isUpdating} className="bg-red-600 hover:bg-red-700 text-white">
                    Confirm Rejection
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
