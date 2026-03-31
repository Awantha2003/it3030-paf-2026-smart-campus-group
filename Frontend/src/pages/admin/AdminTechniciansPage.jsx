import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, ShieldPlus, UserRoundPlus, Wrench } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { fetchTechnicians, createTechnician } from '../../api/technicians';

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
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadTechnicians();
  }, []);

  async function loadTechnicians() {
    setLoading(true);
    setError('');

    try {
      const data = await fetchTechnicians();
      setTechnicians(data);
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
      setTechnicians((current) => [createdTechnician, ...current]);
      setFormData(initialForm);
      setSuccess(
        createdTechnician.credentialsEmailSent
          ? 'Technician member added and credentials email sent.'
          : `Technician member added, but email sending failed: ${createdTechnician.credentialsEmailStatus}`
      );
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Technician Members
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Add and review the technicians available for campus support work.
          </p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-300">
          Active technicians: <span className="font-semibold">{technicians.length}</span>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_1.4fr]">
        <Card className="p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-brand-purple/10 p-3 text-brand-purple dark:text-purple-300">
              <ShieldPlus className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Add Technician
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Create a technician member profile for admin assignment flows.
              </p>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Field
              label="Full name"
              name="fullName"
              placeholder="Nimal Perera"
              value={formData.fullName}
              onChange={handleChange}
            />
            <Field
              label="Email"
              name="email"
              type="email"
              placeholder="technician@campus.lk"
              value={formData.email}
              onChange={handleChange}
            />
            <Field
              label="Phone"
              name="phone"
              placeholder="+94 77 123 4567"
              value={formData.phone}
              onChange={handleChange}
            />
            <Field
              label="Password"
              name="password"
              type="password"
              placeholder="Minimum 8 characters"
              value={formData.password}
              onChange={handleChange}
            />
            <Field
              label="Department"
              name="department"
              placeholder="IT Services"
              value={formData.department}
              onChange={handleChange}
            />
            <Field
              label="Specialization"
              name="specialization"
              placeholder="Networking and hardware"
              value={formData.specialization}
              onChange={handleChange}
            />

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-300">
                {success}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              leftIcon={<UserRoundPlus className="h-4 w-4" />}
              isLoading={saving}
            >
              Add Technician Member
            </Button>
          </form>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Current Technician Team
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Members added by admins appear here immediately.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={loadTechnicians} disabled={loading}>
              Refresh
            </Button>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {loading ? (
              <div className="px-6 py-10 text-sm text-slate-500 dark:text-slate-400">
                Loading technician members...
              </div>
            ) : technicians.length === 0 ? (
              <div className="px-6 py-10 text-sm text-slate-500 dark:text-slate-400">
                No technicians have been added yet.
              </div>
            ) : (
              technicians.map((technician) => (
                <div
                  key={technician.id}
                  className="grid gap-4 px-6 py-5 md:grid-cols-[1.2fr_1fr_1fr_auto]"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-blue-100 p-3 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        <Wrench className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {technician.fullName}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {technician.specialization}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    <p className="font-medium text-slate-900 dark:text-white">
                      {technician.department}
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-slate-400" />
                      {technician.email}
                    </p>
                  </div>

                  <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-400" />
                      {technician.phone}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Added {new Date(technician.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-start justify-start md:justify-end">
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                      Active
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </motion.div>
  );
}

function Field({ label, name, type = 'text', value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}
      </span>
      <input
        required
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
      />
    </label>
  );
}
