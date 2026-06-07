import React, { useState, useMemo } from 'react';
import {
    useReactTable, getCoreRowModel, flexRender
} from '@tanstack/react-table';
import { Calendar, CircleEllipsis, Hourglass,  Search } from 'lucide-react';
import KPICard from './reusable/KPICards';

const MOCK_DATA = [
    { id: 1, name: 'Dr. Sonia Singh', dept: 'Mathematics', role: 'Associate Professor', dateTime: '2026-06-06 09:00 AM', status: 'Completed', initial: 'SS', avatarBg: 'bg-blue-50 text-blue-600', statusClass: 'bg-green-100 text-green-800' },
    { id: 2, name: 'Dr. Liam Chen', dept: 'Information Tech', role: 'Assistant Professor', dateTime: '2026-06-06 10:00 AM', status: 'Completed', initial: 'LC', avatarBg: 'bg-blue-50 text-blue-600', statusClass: 'bg-green-100 text-green-800' },
    { id: 3, name: 'Dr. Reena Sen', dept: 'Computer Science', role: 'Professor', dateTime: '2026-06-06 11:30 AM', status: 'Ongoing', initial: 'RS', avatarBg: 'bg-blue-50 text-blue-600', statusClass: 'bg-blue-100 text-blue-800' },
    { id: 4, name: 'Dr. Priya P', dept: 'Mechanical Engg', role: 'Professor', dateTime: '2026-06-06 12:30 PM', status: 'Pending', initial: 'PP', avatarBg: 'bg-blue-50 text-blue-600', statusClass: 'bg-gray-100 text-gray-400' },
];

const Dashboard = () => {
    const [pageIndex, setPageIndex] = useState(0);
    const [search, setSearch] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const data = useMemo(() => {
        if (pageIndex > 0) return [];
        return MOCK_DATA.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
            const matchesDate = dateFilter ? item.dateTime.includes(dateFilter) : true;
            const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
            return matchesSearch && matchesDate && matchesStatus;
        });
    }, [pageIndex, search, dateFilter, statusFilter]);

    const columns = useMemo(() => [
        { accessorKey: 'name', header: 'Candidate Name', cell: info => (
            <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border border-blue-100 ${info.row.original.avatarBg}`}>{info.row.original.initial}</div>
                <span className="font-medium text-gray-900">{info.getValue()}</span>
            </div>
        )},
        { accessorKey: 'dept', header: 'Department' },
        { accessorKey: 'role', header: 'Role' },
        { accessorKey: 'dateTime', header: 'Date & Time' },
        { accessorKey: 'status', header: 'Status', cell: info => (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${info.row.original.statusClass}`}>{info.getValue()}</span>
        )},
    ], []);

    const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold mb-1">Interviewer Dashboard</h1>
            <p className="text-gray-500 mb-6">Manage candidate evaluations and department hiring panels.</p>

            {/* KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <KPICard title="Total Assigned" value="30" icon={Calendar} variant="assigned" />
                <KPICard title="Pending Evaluations" value="3" icon={Hourglass} variant="pending-eval" />
                <KPICard title="Progress" value="22" icon={CircleEllipsis} variant="progress" />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Search and Filters */}
                <div className="p-4 border-b flex gap-3">
                    <input 
                        type="text" 
                        placeholder="Search by name..." 
                        className="border rounded-md px-3 py-2 text-sm flex-grow"
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <input 
                        type="date" 
                        className="border rounded-md px-3 py-2 text-sm"
                        onChange={(e) => setDateFilter(e.target.value)}
                    />
                    <select className="border rounded-md px-3 py-2 text-sm" onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="All">Status: All</option>
                        <option value="Completed">Completed</option>
                        <option value="Ongoing">Ongoing</option>
                        <option value="Pending">Pending</option>
                    </select>
                </div>

                <table className="w-full text-sm text-left">
                    <thead className="text-gray-500 uppercase text-xs bg-gray-50/50">
                        {table.getHeaderGroups().map(hg => (
                            <tr key={hg.id}>{hg.headers.map(h => <th key={h.id} className="p-4">{flexRender(h.column.columnDef.header, h.getContext())}</th>)}</tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.length > 0 ? (
                            table.getRowModel().rows.map(row => (
                                <tr key={row.id} className="border-t hover:bg-gray-50">
                                    {row.getVisibleCells().map(cell => <td key={cell.id} className="p-4 text-gray-600">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="5" className="p-20 text-center text-gray-500 italic">No records found as of now.</td></tr>
                        )}
                    </tbody>
                </table>

                <div className="p-4 border-t flex gap-1">
                    {[0, 1, 2].map(idx => (
                        <button key={idx} onClick={() => setPageIndex(idx)} className={`px-3 py-1 border rounded text-sm ${pageIndex === idx ? 'bg-blue-700 text-white' : 'bg-white hover:bg-gray-50'}`}>
                            {idx + 1}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;