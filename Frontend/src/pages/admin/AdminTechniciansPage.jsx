import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, ShieldPlus, Trash2, UserRoundPlus, Wrench, ShieldAlert, CheckCircle, RefreshCw, Briefcase, Building2, Search, UserCircle, KeyRound } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import {
  fetchTechnicians,
  fetchTechnicianUsers,
  createTechnician,
  updateTechnicianStatus,
  updateTechnicianUserStatus,
  deleteTechnician,
  deleteTechnicianUser
} from '../../api/technicians';

const initialForm = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  department: '',
  specialization: ''
};

export function AdminTechniciansPage() {
  const [technicians, setTechnicians] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actioningId, setActioningId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadTechnicians();
  }, []);

  function normalizeTechnicianRosterEntry(technician, source) {
    if (source === 'user') {
      return {
        id: technician.id,
        fullName: technician.name || technician.fullName || technician.email,
        email: technician.email || '',
        phone: technician.phone || 'Not provided',
        department: technician.department || 'Registered Technician Account',
        specialization: technician.specialization || 'General Support',
        active: Boolean(technician.enabled),
        currentLatitude: technician.currentLatitude ?? null,
        currentLongitude: technician.currentLongitude ?? null,
        currentLocation: technician.currentLocation || '',
        trackingUpdatedAt: technician.trackingUpdatedAt || null,
        createdAt: technician.createdAt || technician.updatedAt || null,
        updatedAt: technician.updatedAt || null,
        source: 'user'
      };
    }

    return {
      ...technician,
      phone: technician.phone || 'Not provided',
      department: technician.department || 'Operations',
      specialization: technician.specialization || 'General Support',
      source: 'technician'
    };
  }

  async function loadTechnicians() {
    setLoading(true);
    setError('');

    try {
      const [technicianMembers, technicianUsers] = await Promise.all([
        fetchTechnicians(),
        fetchTechnicianUsers()
      ]);

      const roster = [
        ...technicianMembers.map((technician) => normalizeTechnicianRosterEntry(technician, 'technician')),
        ...technicianUsers
          .filter(
            (user) =>
              !technicianMembers.some(
                (technician) => technician.email?.toLowerCase() === user.email?.toLowerCase()
              )
          )
          .map((user) => normalizeTechnicianRosterEntry(user, 'user'))
      ];

      setTechnicians(roster);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const createdTechnician = await createTechnician(formData);
      setTechnicians((current) => [
        normalizeTechnicianRosterEntry(createdTechnician, 'technician'),
        ...current
      ]);
      setFormData(initialForm);
      setSuccess(
        createdTechnician.credentialsEmailSent
          ? 'Technician onboarding successful. Credentials emailed.'
          : `Technician created, but email dispatch failed: ${createdTechnician.credentialsEmailStatus}`
      );
      setTimeout(() => setSuccess(''), 4000);
    } catch (saveError) {
      setError(saveError.message);
      setTimeout(() => setError(''), 5000);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus(technician) {
    setActioningId(technician.id);
    setError('');
    setSuccess('');

    try {
      if (technician.source === 'user') {
        await updateTechnicianUserStatus(technician.id, !technician.active);
        setTechnicians((current) =>
          current.map((item) =>
            item.id === technician.id
              ? {
                  ...item,
                  active: !technician.active
                }
              : item
          )
        );
      } else {
        const updatedTechnician = await updateTechnicianStatus(technician.id, !technician.active);
        setTechnicians((current) =>
          current.map((item) =>
            item.id === technician.id
              ? normalizeTechnicianRosterEntry(updatedTechnician, 'technician')
              : item
          )
        );
      }

      setSuccess(
        `${technician.fullName} is now marked ${!technician.active ? 'ACTIVE' : 'INACTIVE'}.`
      );
      setTimeout(() => setSuccess(''), 3000);
    } catch (actionError) {
      setError(actionError.message);
      setTimeout(() => setError(''), 4000);
    } finally {
      setActioningId('');
    }
  }

  async function handleDelete(technician) {
    const confirmed = window.confirm(`Permanently terminate account for ${technician.fullName}? This cannot be undone.`);
    if (!confirmed) {
      return;
    }

    setActioningId(technician.id);
    setError('');
    setSuccess('');

    try {
      if (technician.source === 'user') {
        await deleteTechnicianUser(technician.id);
      } else {
        await deleteTechnician(technician.id);
      }
      setTechnicians((current) => current.filter((item) => item.id !== technician.id));
      setSuccess(`Account for ${technician.fullName} securely deleted.`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (actionError) {
      setError(actionError.message);
      setTimeout(() => setError(''), 4000);
    } finally {
      setActioningId('');
    }
  }

  const activeCount = technicians.filter((technician) => technician.active).length;
  
  const filteredTechnicians = technicians.filter((tech) =>
    [tech.fullName, tech.department, tech.specialization, tech.email]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex h-[calc(100vh-2rem)] flex-col bg-slate-50/30 dark:bg-slate-900/10 rounded-2xl p-2 md:p-4 lg:p-6"
    >
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end justify-between px-2 shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-teal-400 tracking-tight">
            Personnel Roster
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Manage your campus technical support engineering team.
          </p>
        </div>
        <div className="flex gap-3 items-center">
           <div className="px-5 py-2.5 rounded-xl border border-blue-200/60 bg-blue-50/80 text-sm font-semibold text-blue-700 shadow-sm backdrop-blur-sm dark:border-blue-900/50 dark:bg-blue-900/30 dark:text-blue-300">
            Active Engineers: <span className="text-lg font-black">{activeCount}</span>
          </div>
          <Button
            className="shadow-md hover:shadow-lg transition-all"
            variant="outline"
            size="sm"
            onClick={loadTechnicians}
            isLoading={loading}
            leftIcon={<RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />}
          >
            Sync
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {(error || success) && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            className="mb-4 shrink-0 px-2"
          >
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-100/50 backdrop-blur-sm px-4 py-3 text-sm text-red-700 shadow-sm dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
                <ShieldAlert className="h-5 w-5 text-red-500" />
                <span className="font-medium">{error}</span>
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-100/50 backdrop-blur-sm px-4 py-3 text-sm text-emerald-700 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-300">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                <span className="font-medium">{success}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex min-h-0 flex-1 flex-col gap-6 lg:flex-row rounded-3xl overflow-hidden backdrop-blur-sm">
        
        {/* LEFT PANE - Add Technician Form */}
        <div className="flex w-full flex-col overflow-y-auto lg:w-[420px] shrink-0 scrollbar-hide py-2 px-1">
          <div className="rounded-3xl border border-white/60 bg-white/60 p-6 shadow-xl shadow-blue-100/30 backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/60 dark:shadow-none">
            <div className="mb-6 flex items-start gap-4 pb-5 border-b border-slate-200/60 dark:border-slate-700/60">
              <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-teal-500 p-3 text-white shadow-md">
                <ShieldPlus className="h-7 w-7" />
              </div>
              <div className="pt-1">
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Add New Engineer
                </h2>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                  Provision an account for a new technician to access the campus incident resolution system.
                </p>
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <Field
                icon={<UserCircle className="h-4 w-4 text-slate-400" />}
                label="Full Name"
                name="fullName"
                placeholder="Nimal Perera"
                value={formData.fullName}
                onChange={handleChange}
              />
              <Field
                icon={<Mail className="h-4 w-4 text-slate-400" />}
                label="Corporate Email"
                name="email"
                type="email"
                placeholder="engineer@campus.lk"
                value={formData.email}
                onChange={handleChange}
              />
              <div className="grid grid-cols-2 gap-4">
                <Field
                  icon={<Phone className="h-4 w-4 text-slate-400" />}
                  label="Contact Mobile"
                  name="phone"
                  placeholder="+94 77 123 4567"
                  value={formData.phone}
                  onChange={handleChange}
                />
                <Field
                  icon={<KeyRound className="h-4 w-4 text-slate-400" />}
                  label="Initial Password"
                  name="password"
                  type="password"
                  placeholder="Min 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              <Field
                icon={<Building2 className="h-4 w-4 text-slate-400" />}
                label="Assigned Department"
                name="department"
                placeholder="e.g. IT Services / Facilities"
                value={formData.department}
                onChange={handleChange}
              />
              <Field
                icon={<Briefcase className="h-4 w-4 text-slate-400" />}
                label="Core Specialization"
                name="specialization"
                placeholder="e.g. Networking and Hardware"
                value={formData.specialization}
                onChange={handleChange}
              />

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full h-12 shadow-md hover:shadow-xl transition-all rounded-xl font-bold text-[15px] bg-slate-900 hover:bg-black dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
                  leftIcon={<UserRoundPlus className="h-5 w-5" />}
                  isLoading={saving}
                >
                  {saving ? 'Provisioning Account...' : 'Provision Account'}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT PANE - Team List */}
        <div className="flex flex-1 flex-col overflow-hidden relative rounded-3xl border border-white/60 bg-white/40 shadow-xl shadow-cyan-100/20 backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/40">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/40 bg-white/50 px-6 py-5 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/60 z-10 shrink-0">
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent dark:from-white dark:to-slate-300">
                Current Operations Team
              </h2>
            </div>
            <div className="relative group w-48 xl:w-64">
              <Search className="absolute left-3 top-2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full rounded-xl border border-white bg-white/70 py-1.5 pl-9 pr-3 text-sm text-slate-900 shadow-sm outline-none transition-all focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800/70 dark:text-white"
              />
            </div>
          </div>

          {/* List Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full opacity-60">
                 <div className="h-10 w-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                 <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading roster profiles...</p>
              </div>
            ) : filteredTechnicians.length === 0 ? (
               <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                 <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                   <ShieldAlert className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                 </div>
                 <p className="text-lg font-bold text-slate-700 dark:text-slate-300">No matching personnel</p>
                 <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">No active or inactive staff matched your current terms.</p>
               </div>
            ) : (
              filteredTechnicians.map((technician, idx) => (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  key={technician.id}
                  className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 p-5 ${
                    technician.active 
                      ? 'border-white/50 bg-white hover:border-blue-200 hover:shadow-lg dark:border-slate-700/50 dark:bg-slate-800/80 dark:hover:border-blue-800' 
                      : 'border-slate-200/50 bg-slate-50 opacity-80 grayscale-[20%] dark:border-slate-800 dark:bg-slate-900/50'
                  }`}
                >
                  <div className="grid gap-4 md:grid-cols-[1.5fr_1.5fr_1fr_auto] items-center">
                    
                    {/* User Profile */}
                    <div className="flex items-center gap-4">
                      <div className={`shrink-0 rounded-2xl p-3.5 shadow-inner ${technician.active ? 'bg-gradient-to-br from-blue-100 to-cyan-50 text-blue-600 dark:from-blue-900/50 dark:to-cyan-900/20 dark:text-blue-400' : 'bg-slate-200 text-slate-500 dark:bg-slate-800'}`}>
                        <Wrench className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-base">
                          {technician.fullName}
                        </p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2">
                          <p className="text-xs font-semibold text-blue-500 dark:text-blue-400 tracking-wide uppercase">
                            {technician.specialization}
                          </p>
                          {technician.source === 'user' && (
                            <span className="rounded-md bg-violet-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                              Approved User
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Department & Email */}
                    <div className="space-y-1.5 border-l-2 border-transparent md:border-slate-100 md:pl-6 dark:md:border-slate-800">
                      <p className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                        <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{technician.department}</span>
                      </p>
                      <p className="flex items-center gap-2 text-xs font-medium text-slate-500">
                        <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{technician.email}</span>
                      </p>
                    </div>

                    {/* Contact & Meta */}
                    <div className="space-y-1.5 border-l-2 border-transparent md:border-slate-100 md:pl-6 dark:md:border-slate-800">
                      <p className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <Phone className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        {technician.phone}
                      </p>
                      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                        {technician.createdAt
                          ? `Listed ${new Date(technician.createdAt).toLocaleDateString()}`
                          : 'Listed date unavailable'}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3">
                      <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                         technician.active
                           ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400'
                           : 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-400'
                      }`}>
                         {technician.active ? 'Active' : 'Inactive'}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          className={`rounded-lg px-3 hover:-translate-y-0.5 transition-transform shadow-sm ${technician.active ? 'text-amber-600 bg-amber-50 hover:bg-amber-100 hover:text-amber-700 border border-amber-200' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'}`}
                          type="button"
                          size="sm"
                          variant="ghost"
                          isLoading={actioningId === technician.id}
                          onClick={() => handleToggleStatus(technician)}
                        >
                          {technician.active ? 'Suspend' : 'Activate'}
                        </Button>
                        <Button
                          className="rounded-lg px-2 hover:-translate-y-0.5 transition-transform"
                          type="button"
                          size="icon"
                          variant="danger"
                          isLoading={actioningId === technician.id}
                          onClick={() => handleDelete(technician)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Field({ icon, label, name, type = 'text', value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
        {icon && <span className="mr-1.5">{icon}</span>}
        {label}
      </span>
      <input
        required
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border-2 border-slate-200/60 bg-white/80 px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm outline-none transition-all placeholder:font-normal placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white dark:focus:bg-slate-900"
      />
    </label>
  );
}
