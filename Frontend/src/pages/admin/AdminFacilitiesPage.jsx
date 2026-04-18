import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLayers, FiSearch, FiPlus, FiEdit2, FiTrash2, FiMapPin, FiUsers, FiChevronDown, FiChevronUp, FiBox, FiBookOpen, FiActivity, FiCalendar } from 'react-icons/fi';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { getAllFacilities, deleteFacility, createFacility, updateFacility, getResourceSummary } from '../../api/facilities';
import { getEquipmentsByFacility, createEquipment, updateEquipment, deleteEquipment } from '../../api/equipments';

const RESOURCE_TYPE_OPTIONS = ['FACILITY', 'SPORTS', 'LIBRARY', 'EVENT'];

function formatResourceTypeLabel(rawType) {
    const normalized = String(rawType || '').toUpperCase();
    if (!normalized) {
        return 'FACILITY';
    }
    if (normalized === 'SPORTS_VENUE' || normalized === 'SPORTS') {
        return 'SPORTS';
    }
    if (normalized === 'LIBRARY_ZONE' || normalized === 'LIBRARY') {
        return 'LIBRARY';
    }
    if (normalized === 'SEMINAR_ROOM' || normalized === 'EVENT') {
        return 'EVENT';
    }
    return 'FACILITY';
}

export function AdminFacilitiesPage() {
    const [facilities, setFacilities] = useState([]);
    const [summary, setSummary] = useState({ FACILITY: 0, EQUIPMENT: 0, SPORTS: 0, LIBRARY: 0, EVENT: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentFacility, setCurrentFacility] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Equipment specific state
    const [expandedFacilityId, setExpandedFacilityId] = useState(null);
    const [equipments, setEquipments] = useState({}); // { facilityId: [equipments] }
    const [isEqModalOpen, setIsEqModalOpen] = useState(false);
    const [currentEq, setCurrentEq] = useState(null);
    const [targetFacilityId, setTargetFacilityId] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [facilitiesData, summaryData] = await Promise.all([
                getAllFacilities(),
                getResourceSummary()
            ]);
            setFacilities(facilitiesData);
            setSummary(summaryData);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch data:', err);
            setError(`Failed to load dashboard data. ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = async (facilityId) => {
        if (expandedFacilityId === facilityId) {
            setExpandedFacilityId(null);
            return;
        }

        setExpandedFacilityId(facilityId);
        if (!equipments[facilityId]) {
            try {
                const data = await getEquipmentsByFacility(facilityId);
                setEquipments(prev => ({ ...prev, [facilityId]: data }));
            } catch (err) {
                console.error('Failed to fetch equipments:', err);
            }
        }
    };

    const handleOpenEqModal = (facilityId, eq = null) => {
        setTargetFacilityId(facilityId);
        setCurrentEq(eq);
        setIsEqModalOpen(true);
    };

    const handleEqSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.target);
        const data = {
            facilityId: targetFacilityId,
            name: formData.get('name'),
            description: formData.get('description'),
            totalQuantity: parseInt(formData.get('totalQuantity')),
            approvalRequired: formData.get('approvalRequired') === 'on',
            imageUrl: formData.get('imageUrl')
        };

        try {
            if (currentEq) {
                await updateEquipment(currentEq.id, data);
            } else {
                await createEquipment(data);
            }
            const updatedEqs = await getEquipmentsByFacility(targetFacilityId);
            setEquipments(prev => ({ ...prev, [targetFacilityId]: updatedEqs }));
            await fetchData();
            setIsEqModalOpen(false);
        } catch (err) {
            alert('Failed: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEqDelete = async (facilityId, eqId) => {
        if (!window.confirm('Delete this equipment?')) return;
        try {
            await deleteEquipment(eqId);
            const updatedEqs = await getEquipmentsByFacility(facilityId);
            setEquipments(prev => ({ ...prev, [facilityId]: updatedEqs }));
            await fetchData();
        } catch (err) {
            alert('Failed: ' + err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this facility? This action cannot be undone.')) return;

        try {
            await deleteFacility(id);
            await fetchData();
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
            spaceType: String(formData.get('spaceType') || 'FACILITY').toUpperCase(),
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
            await fetchData();
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
                        <FiLayers className="text-orange-500" /> Facilities & Equipment
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Manage campus spaces and assign specific bookable gear to each facility.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="primary" onClick={() => handleOpenModal()} leftIcon={<FiPlus className="w-4 h-4" />}>
                        Add Facility
                    </Button>
                </div>
            </div>

            <div className="pt-4">
                <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
                    <span className="w-1 h-4 bg-orange-500 rounded-full"></span> Resource Types
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                    { label: 'FACILITY', count: summary.FACILITY, sub: 'Spaces', icon: <FiLayers />, color: 'blue' },
                    { label: 'EQUIPMENT', count: summary.EQUIPMENT, sub: 'Items', icon: <FiBox />, color: 'orange' },
                    { label: 'SPORTS', count: summary.SPORTS, sub: 'Venues', icon: <FiActivity />, color: 'emerald' },
                    { label: 'LIBRARY', count: summary.LIBRARY, sub: 'Zones', icon: <FiBookOpen />, color: 'purple' },
                    { label: 'EVENT', count: summary.EVENT, sub: 'Events', icon: <FiCalendar />, color: 'rose' }
                ].map((item, i) => (
                    <Card key={i} className="p-4 flex flex-col items-center text-center group hover:scale-105 transition-transform border-none shadow-sm dark:bg-slate-900/50">
                        <div className={`w-10 h-10 rounded-2xl mb-3 flex items-center justify-center text-white bg-${item.color}-500 shadow-lg shadow-${item.color}-500/20`}>
                            {item.icon}
                        </div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{item.label}</h4>
                        <p className="text-xl font-black text-slate-900 dark:text-white leading-none">{item.count}</p>
                        <p className="text-[9px] text-slate-500 dark:text-slate-500 font-bold uppercase mt-1 tracking-tighter">{item.sub}</p>
                    </Card>
                ))}
            </div>
        </div>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium">
                    {error}
                </div>
            )}

            <Card className="overflow-hidden border-none shadow-xl shadow-slate-200/50 dark:shadow-none">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full sm:w-72">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input 
                            type="text" 
                            placeholder="Search code, name, building..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-shadow text-slate-900 dark:text-white"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
                                <th className="w-10 px-6 py-4"></th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Facility</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Location</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Capacity</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                                        Loading...
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
                                    <React.Fragment key={facility.id}>
                                        <tr className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors ${expandedFacilityId === facility.id ? 'bg-orange-50/20 dark:bg-orange-900/10' : ''}`}>
                                            <td className="px-6 py-4">
                                                <button onClick={() => toggleExpand(facility.id)} className="text-slate-400 hover:text-orange-500">
                                                    {expandedFacilityId === facility.id ? <FiChevronUp /> : <FiChevronDown />}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700">
                                                        {facility.imageUrl ? (
                                                            <img src={facility.imageUrl} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                                <FiLayers size={20} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white uppercase leading-none mb-1">{facility.code}</p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">{facility.name}</p>
                                                        <Badge variant="primary" className="text-[9px] px-1 py-0 mt-1">
                                                            {formatResourceTypeLabel(facility.spaceType)}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                                        <FiMapPin className="text-slate-400 w-3 h-3" /> {facility.building} (B-{facility.block})
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 ml-4 font-mono">FLOOR {facility.floor}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                                                    <FiUsers className="text-slate-400" /> {facility.capacity} pax
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button 
                                                        onClick={() => handleOpenModal(facility)}
                                                        className="p-2 text-slate-400 hover:text-orange-500 transition-colors"
                                                        title="Edit Facility"
                                                    >
                                                        <FiEdit2 className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(facility.id)}
                                                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                                        title="Delete Facility"
                                                    >
                                                        <FiTrash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {/* EXPANDED CONTENT: EQUIPMENT LIST */}
                                        <AnimatePresence>
                                            {expandedFacilityId === facility.id && (
                                                <tr>
                                                    <td colSpan="5" className="px-12 py-6 bg-slate-50/50 dark:bg-slate-900/50 overflow-hidden">
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            className="space-y-4"
                                                        >
                                                            <div className="flex justify-between items-center px-2">
                                                                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                                                    <FiBox className="text-orange-500" /> Assigned Equipment
                                                                </h3>
                                                                <Button 
                                                                    size="sm" 
                                                                    variant="outline" 
                                                                    className="text-[10px] h-7 px-3"
                                                                    onClick={() => handleOpenEqModal(facility.id)}
                                                                    leftIcon={<FiPlus className="w-3 h-3" />}
                                                                >
                                                                    Assign Gear
                                                                </Button>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                                {equipments[facility.id]?.length === 0 ? (
                                                                    <p className="text-xs text-slate-400 italic py-4 col-span-full text-center bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                                                                        No equipment assigned to this facility yet.
                                                                    </p>
                                                                ) : (
                                                                    equipments[facility.id]?.map((eq) => (
                                                                        <div key={eq.id} className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow group relative pr-12">
                                                                            <div className="absolute top-4 right-4 flex flex-col gap-2">
                                                                                <button onClick={() => handleOpenEqModal(facility.id, eq)} className="text-slate-300 hover:text-orange-500 transition-colors">
                                                                                    <FiEdit2 size={12} />
                                                                                </button>
                                                                                <button onClick={() => handleEqDelete(facility.id, eq.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                                                                                    <FiTrash2 size={12} />
                                                                                </button>
                                                                            </div>
                                                                            <div className="flex items-center gap-4">
                                                                                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
                                                                                    <FiBox size={18} />
                                                                                </div>
                                                                                <div>
                                                                                    <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{eq.name}</p>
                                                                                    <div className="flex items-center gap-2 mt-1">
                                                                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Availability:</span>
                                                                                        <span className={`text-[10px] font-black ${eq.availableQuantity > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                                                            {eq.availableQuantity} / {eq.totalQuantity}
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="mt-3 flex items-center gap-2">
                                                                                {eq.approvalRequired && <Badge variant="warning" className="text-[8px] px-1 py-0">Approval Req.</Badge>}
                                                                                <Badge variant="success" className="text-[8px] px-1 py-0">{eq.status}</Badge>
                                                                            </div>
                                                                        </div>
                                                                    ))
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    </td>
                                                </tr>
                                            )}
                                        </AnimatePresence>
                                    </React.Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* FACILITY MODAL */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseModal} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden relative">
                            <form onSubmit={handleSubmit}>
                                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                        <div className="p-2 bg-orange-500 rounded-lg text-white">
                                            {currentFacility ? <FiEdit2 /> : <FiPlus />}
                                        </div>
                                        {currentFacility ? 'Edit Facility' : 'Add New Space'}
                                    </h2>
                                    <button type="button" onClick={handleCloseModal} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                        <FiPlus className="rotate-45 w-6 h-6 text-slate-400" />
                                    </button>
                                </div>

                                <div className="p-8 max-h-[70vh] overflow-y-auto space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Unique Code</label>
                                            <input required name="code" defaultValue={currentFacility?.code} placeholder="e.g. ENG-A-LH1" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all dark:text-white placeholder:text-slate-300" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Display Name</label>
                                            <input required name="name" defaultValue={currentFacility?.name} placeholder="e.g. Lecture Hall 01" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all dark:text-white placeholder:text-slate-300" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="space-y-2 text-left">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 block">Building</label>
                                            <input required name="building" defaultValue={currentFacility?.building} placeholder="Engineering" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all dark:text-white placeholder:text-slate-300" />
                                        </div>
                                        <div className="space-y-2 text-left">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 block">Block</label>
                                            <input required name="block" defaultValue={currentFacility?.block} placeholder="A" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all dark:text-white placeholder:text-slate-300" />
                                        </div>
                                        <div className="space-y-2 text-left">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 block">Floor</label>
                                            <input required type="number" name="floor" defaultValue={currentFacility?.floor} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all dark:text-white" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Resource Type</label>
                                            <select name="spaceType" defaultValue={formatResourceTypeLabel(currentFacility?.spaceType) || 'FACILITY'} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all dark:text-white">
                                                {RESOURCE_TYPE_OPTIONS.map((typeOption) => (
                                                    <option key={typeOption} value={typeOption}>
                                                        {typeOption}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Max Seating</label>
                                            <input required type="number" name="capacity" defaultValue={currentFacility?.capacity} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all dark:text-white" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">General Features (Comma separated)</label>
                                        <input name="amenities" defaultValue={currentFacility?.amenities?.join(', ')} placeholder="AC, Wi-Fi, Smart Board, Receptacles" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all dark:text-white placeholder:text-slate-300" />
                                    </div>
                                </div>

                                <div className="p-6 bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                                    <button type="button" onClick={handleCloseModal} className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-400 hover:bg-white dark:hover:bg-slate-800 transition-all">Cancel</button>
                                    <button type="submit" disabled={isSubmitting} className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-bold shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70">{isSubmitting ? 'Saving...' : currentFacility ? 'Update Changes' : 'Create Space'}</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* EQUIPMENT MODAL */}
            <AnimatePresence>
                {isEqModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEqModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative">
                            <form onSubmit={handleEqSubmit}>
                                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                        <FiBox className="text-orange-500" />
                                        {currentEq ? 'Update Equipment' : 'Assign New Gear'}
                                    </h2>
                                    <button type="button" onClick={() => setIsEqModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold">✕</button>
                                </div>

                                <div className="p-6 space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400">Equipment Name</label>
                                        <input required name="name" defaultValue={currentEq?.name} placeholder="e.g. Wireless Microphone" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all dark:text-white" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-slate-400">Total Count</label>
                                            <input required type="number" name="totalQuantity" defaultValue={currentEq?.totalQuantity} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all dark:text-white" />
                                        </div>
                                        <div className="flex items-center gap-2 mt-6">
                                            <input type="checkbox" name="approvalRequired" defaultChecked={currentEq?.approvalRequired} className="w-4 h-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500" />
                                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Needs Approval</label>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400">Brief Description</label>
                                        <textarea name="description" defaultValue={currentEq?.description} rows="2" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all dark:text-white" />
                                    </div>
                                </div>

                                <div className="p-6 bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                                    <button type="submit" disabled={isSubmitting} className="w-full py-3 rounded-xl bg-slate-900 dark:bg-orange-500 text-white text-sm font-bold hover:opacity-90 transition-all">
                                        {isSubmitting ? 'Syncing...' : 'Save Equipment'}
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
