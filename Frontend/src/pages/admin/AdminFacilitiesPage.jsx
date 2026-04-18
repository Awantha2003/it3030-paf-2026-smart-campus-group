import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLayers, FiSearch, FiPlus, FiEdit2, FiTrash2, FiMapPin, FiUsers, FiInfo, FiExternalLink } from 'react-icons/fi';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { getAllFacilities, deleteFacility, createFacility, updateFacility } from '../../api/facilities';

export function AdminFacilitiesPage() {
    const [facilities, setFacilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentFacility, setCurrentFacility] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchFacilities();
    }, []);

    const fetchFacilities = async () => {
        setLoading(true);
        try {
            const data = await getAllFacilities();
            setFacilities(data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch facilities:', err);
            setError(`Failed to load facilities. ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this facility? This action cannot be undone.')) return;

        try {
            await deleteFacility(id);
            setFacilities(facilities.filter(f => f.id !== id));
        } catch (err) {
            alert('Failed to delete facility: ' + err.message);
        }
    };

    const handleOpenModal = (facility = null) => {
        setCurrentFacility(facility);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentFacility(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.target);
        const data = {
            code: formData.get('code'),
            name: formData.get('name'),
            building: formData.get('building'),
            block: formData.get('block'),
            floor: parseInt(formData.get('floor')),
            spaceType: formData.get('spaceType'),
            capacity: parseInt(formData.get('capacity')),
            description: formData.get('description'),
            amenities: formData.get('amenities').split(',').map(s => s.trim()).filter(s => s),
            imageUrl: formData.get('imageUrl')
        };

        try {
            if (currentFacility) {
                await updateFacility(currentFacility.id, data);
            } else {
                await createFacility(data);
            }
            await fetchFacilities();
            handleCloseModal();
        } catch (err) {
            alert('Operation failed: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredFacilities = facilities.filter(f => 
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        f.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.building.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <FiLayers className="text-orange-500" /> Facilities Management
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Configure and manage campus resources, lecture halls, and laboratories.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="primary" onClick={() => handleOpenModal()} leftIcon={<FiPlus className="w-4 h-4" />}>
                        Add Facility
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
                            placeholder="Search code, name, building..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-brand-surface border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-shadow text-slate-900 dark:text-white"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Facility</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Location</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Capacity</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                                        Loading facilities...
                                    </td>
                                </tr>
                            ) : filteredFacilities.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                                        No facilities found.
                                    </td>
                                </tr>
                            ) : (
                                filteredFacilities.map((facility) => (
                                    <tr key={facility.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700">
                                                    {facility.imageUrl ? (
                                                        <img src={facility.imageUrl} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                            <FiLayers />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white uppercase">{facility.code}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{facility.name}</p>
                                                    <Badge variant="primary" className="text-[9px] mt-1">{facility.spaceType}</Badge>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                                    <FiMapPin className="text-slate-400" /> {facility.building} (B-{facility.block})
                                                </span>
                                                <span className="text-[10px] text-slate-500 ml-4">Floor {facility.floor}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                                                <FiUsers className="text-slate-400" /> {facility.capacity} pax
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge variant={facility.status === 'OPERATIONAL' ? 'success' : 'warning'}>
                                                {facility.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => handleOpenModal(facility)}
                                                    className="p-2 text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
                                                    title="Edit Facility"
                                                >
                                                    <FiEdit2 className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(facility.id)}
                                                    className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                                    title="Delete Facility"
                                                >
                                                    <FiTrash2 className="w-4 h-4" />
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

            {/* CREATE/EDIT MODAL */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleCloseModal}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden relative"
                        >
                            <form onSubmit={handleSubmit}>
                                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        {currentFacility ? <FiEdit2 className="text-orange-500" /> : <FiPlus className="text-orange-500" />}
                                        {currentFacility ? 'Edit Facility' : 'Add New Facility'}
                                    </h2>
                                    <button type="button" onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                        <FiPlus className="rotate-45 w-6 h-6" />
                                    </button>
                                </div>

                                <div className="p-8 max-h-[70vh] overflow-y-auto space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">Code (Unique)</label>
                                            <input 
                                                required 
                                                name="code" 
                                                defaultValue={currentFacility?.code}
                                                placeholder="e.g. ENG-A-LH1"
                                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all dark:text-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">Display Name</label>
                                            <input 
                                                required 
                                                name="name" 
                                                defaultValue={currentFacility?.name}
                                                placeholder="e.g. Lecture Hall 01"
                                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">Building</label>
                                            <input 
                                                required 
                                                name="building" 
                                                defaultValue={currentFacility?.building}
                                                placeholder="e.g. Engineering"
                                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all dark:text-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">Block</label>
                                            <input 
                                                required 
                                                name="block" 
                                                defaultValue={currentFacility?.block}
                                                placeholder="e.g. A"
                                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all dark:text-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">Floor</label>
                                            <input 
                                                required 
                                                type="number" 
                                                name="floor" 
                                                defaultValue={currentFacility?.floor}
                                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">Type</label>
                                            <select 
                                                name="spaceType" 
                                                defaultValue={currentFacility?.spaceType || 'LECTURE_HALL'}
                                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all dark:text-white"
                                            >
                                                <option value="LECTURE_HALL">Lecture Hall</option>
                                                <option value="LAB">Laboratory</option>
                                                <option value="MEETING_ROOM">Meeting Room</option>
                                                <option value="AUDITORIUM">Auditorium</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">Max Capacity</label>
                                            <input 
                                                required 
                                                type="number" 
                                                name="capacity" 
                                                defaultValue={currentFacility?.capacity}
                                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">Description</label>
                                        <textarea 
                                            name="description" 
                                            defaultValue={currentFacility?.description}
                                            rows="3"
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all dark:text-white"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">Amenities (Comma separated)</label>
                                        <input 
                                            name="amenities" 
                                            defaultValue={currentFacility?.amenities?.join(', ')}
                                            placeholder="Projector, Air Conditioning, Whiteboard"
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all dark:text-white"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">Image URL</label>
                                        <input 
                                            name="imageUrl" 
                                            defaultValue={currentFacility?.imageUrl}
                                            placeholder="https://example.com/image.jpg"
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div className="p-6 bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                                    <button 
                                        type="button" 
                                        onClick={handleCloseModal}
                                        className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={isSubmitting}
                                        className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-bold shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70"
                                    >
                                        {isSubmitting ? 'Saving...' : currentFacility ? 'Update Facility' : 'Create Facility'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
