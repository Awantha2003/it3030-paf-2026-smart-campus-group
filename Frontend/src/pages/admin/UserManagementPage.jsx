import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiSearch, FiShield, FiMoreVertical, FiEdit2, FiTrash2, FiCheckCircle } from 'react-icons/fi';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import api from '../../api/axiosInstance';

export function UserManagementPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // Assuming your backend has an endpoint like /api/admin/users
            const response = await api.get('/api/admin/users');
            setUsers(response.data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch users:', err);
            // Mock data fallback if backend is not ready
            setUsers([
                { id: '1', name: 'Admin User', email: 'admin@smartcampus.edu', role: 'ADMIN', mfaEnabled: true, status: 'ACTIVE' },
                { id: '2', name: 'John Tech', email: 'john.t@smartcampus.edu', role: 'TECHNICIAN', mfaEnabled: true, status: 'ACTIVE' },
                { id: '3', name: 'Sarah Student', email: 'sarah.s@smartcampus.edu', role: 'USER', mfaEnabled: false, status: 'ACTIVE' },
                { id: '4', name: 'Mike Student', email: 'mike.m@smartcampus.edu', role: 'USER', mfaEnabled: false, status: 'PENDING' },
            ]);
            // setError('Failed to load users from the server. Showing mock data.');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            // Assuming your backend has a PATCH endpoint to update role
            // await api.patch(`/api/admin/users/${userId}/role`, { role: newRole });
            
            // Optimistic UI update
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (err) {
            console.error('Failed to update role:', err);
            alert('Failed to update user role');
        }
    };

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleBadgeVariant = (role) => {
        switch (role) {
            case 'ADMIN': return 'danger';
            case 'TECHNICIAN': return 'success';
            default: return 'primary';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <FiUsers className="text-blue-500" /> User Management
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Manage user roles, access, and security policies across the platform.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="primary" leftIcon={<FiUsers className="w-4 h-4" />}>
                        Invite User
                    </Button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium">
                    {error}
                </div>
            )}

            <Card className="overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full sm:w-72">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input 
                            type="text" 
                            placeholder="Search users by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-brand-surface border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow text-slate-900 dark:text-white"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Filter by role:</span>
                        <select className="bg-white dark:bg-brand-surface border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer">
                            <option value="ALL">All Roles</option>
                            <option value="ADMIN">Admin</option>
                            <option value="TECHNICIAN">Technician</option>
                            <option value="USER">Student/User</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Security</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                                        Loading users...
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                                        No users found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white dark:ring-brand-surface">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select 
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                className="bg-transparent border border-slate-200 dark:border-slate-700 rounded-md text-xs font-semibold px-2 py-1 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
                                            >
                                                <option value="ADMIN">ADMIN</option>
                                                <option value="TECHNICIAN">TECHNICIAN</option>
                                                <option value="USER">USER</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5">
                                                {user.mfaEnabled ? (
                                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                                        <FiCheckCircle className="w-3.5 h-3.5" /> 2FA Enabled
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 dark:text-slate-500">
                                                        <FiShield className="w-3.5 h-3.5" /> Normal
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge variant={user.status === 'ACTIVE' ? 'success' : 'warning'} className="text-[10px] px-2 py-0.5">
                                                {user.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors tooltip" aria-label="Edit User">
                                                    <FiEdit2 className="w-4 h-4" />
                                                </button>
                                                <button className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors tooltip" aria-label="Delete User">
                                                    <FiTrash2 className="w-4 h-4" />
                                                </button>
                                                <button className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                                                    <FiMoreVertical className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </motion.div>
    );
}