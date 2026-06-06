import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
} from '@tanstack/react-table';

const ALL_CANDIDATES = [
    { candidate: 'Ms. Joly Mariam', role: 'Assoc. Prof', dept: 'Physics', venue: 'MR - 204', status: 'Completed', date: '2026-06-01' },
    { candidate: 'Dr. Atkin Barne', role: 'Professor', dept: 'Chemistry', venue: 'MR - 104', status: 'Completed', date: '2026-06-03' },
    { candidate: 'Dr. Liam Chen', role: 'Asst. Prof', dept: 'Information Technology', venue: 'MR - 302', status: 'Completed', date: '2026-06-05' },
    { candidate: 'Dr. Reena Sen', role: 'Assoc. Prof', dept: 'Computer Science', venue: 'MR - 402', status: 'Ongoing', date: '2026-06-06' },
    { candidate: 'Dr. Senthil K', role: 'Professor', dept: 'Mechanical Engineering', venue: 'MR - 304', status: 'Upcoming', date: '2026-06-08' },
];

export default function InterviewSchedule() {

    const navigate = useNavigate();

    const [pageIndex, setPageIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [showEmpty, setShowEmpty] = useState(false);

    const [roleFilter, setRoleFilter] = useState('');
    const [deptFilter, setDeptFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [dateFilter, setDateFilter] = useState('');
    const [resultPopup, setResultPopup] = useState(null);

    const data = useMemo(() => {
        if (pageIndex > 0) return [];
        return ALL_CANDIDATES.filter(item => {
            const matchesRole = roleFilter ? item.role === roleFilter : true;
            const matchesDept = deptFilter ? item.dept === deptFilter : true;
            const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
            const matchesDate = dateFilter ? item.date === dateFilter : true;

            return matchesRole && matchesDept && matchesStatus && matchesDate;
        });
    }, [pageIndex, roleFilter, deptFilter, statusFilter, dateFilter]);

    useEffect(() => {
        if (pageIndex > 0) {
            setIsLoading(true);
            setShowEmpty(false);
            const timer = setTimeout(() => { setIsLoading(false); setShowEmpty(true); }, 800);
            return () => clearTimeout(timer);
        } else {
            setIsLoading(false);
            setShowEmpty(false);
        }
    }, [pageIndex]);

    const columns = useMemo(() => [
        {
            accessorKey: 'candidate',
            header: 'Candidate Name',
            cell: (info) => {
                const name = info.getValue();
                const getInitials = (n) => {
                    const cleanName = n.replace(/^(Dr\.|Prof\.|Ms\.|Mr\.|Mrs\.)\s+/i, '');
                    const parts = cleanName.split(' ');
                    return parts.map(p => p[0]).join('').toUpperCase().substring(0, 2);
                };
                return (
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-600 text-xs border border-blue-100">
                            {getInitials(name)}
                        </div>
                        <span className="font-medium text-gray-900">{name}</span>
                    </div>
                );
            }
        },
        { accessorKey: 'date', header: 'Date' },
        { accessorKey: 'role', header: 'Role' },
        { accessorKey: 'dept', header: 'Department of Interest' },
        { accessorKey: 'venue', header: 'Venue' },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: (info) => {
                const val = info.getValue();
                const colors = { Completed: 'bg-green-100 text-green-800', Ongoing: 'bg-blue-100 text-blue-800', Upcoming: 'bg-gray-100 text-gray-400' };
                return <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[val] || 'bg-gray-100'}`}>{val}</span>;
            }
        },
        {
            accessorKey: 'actions',
            header: 'Actions',
            cell: (info) => {
                const rowData = info.row.original;
                const isCompleted = rowData.status === 'Completed';

                return (
                    <div className="flex flex-col gap-2 items-start">
                        {isCompleted ? (
                            <button
                                onClick={() => setResultPopup(rowData)} // Open popup with candidate data
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg border h-8 w-32 flex items-center justify-center bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                            >
                                View Results
                            </button>
                        ) : (
                            <button
                                onClick={() => navigate('/evaluationforms', { state: { candidate: rowData } })}
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg border h-8 w-32 flex items-center justify-center bg-blue-700 text-white"
                            >
                                Evaluate
                            </button>
                        )}
                        <button
                            onClick={() => {
                                if (isCompleted) {
                                    setPopup("Panel Discussions are closed"); // Trigger your existing popup state
                                } else {
                                    navigate('/panelcollaboration', { state: { candidate: rowData } });
                                }
                            }}
                            className={`px-3 py-1.5 text-xs font-semibold border rounded-lg h-8 w-32 flex items-center justify-center transition-all ${isCompleted
                                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                                }`}
                        >
                            Panel
                        </button>
                    </div>
                );
            }
        }
    ], [navigate]);

    const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold mb-1">Interview Schedule</h1>
            <p className="text-gray-500 mb-6">Plan and coordinate faculty recruitment timelines efficiently.</p>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="font-semibold text-gray-700">Scheduled Interviews</h2>
                    <div className="flex gap-2">
                        <input
                            type="date"
                            className="border rounded-md px-2 py-1 text-sm text-gray-600"
                            onChange={(e) => setDateFilter(e.target.value)}
                        />
                        <select className="border rounded-md px-2 py-1 text-sm text-gray-600" onChange={(e) => setRoleFilter(e.target.value)}>
                            <option value="">All Roles</option>
                            <option value="Professor">Professor</option>
                            <option value="Assoc. Prof">Assoc. Professor</option>
                            <option value="Asst. Prof">Asst. Professor</option>
                        </select>
                        <select className="border rounded-md px-2 py-1 text-sm text-gray-600" onChange={(e) => setDeptFilter(e.target.value)}>
                            <option value="">All Departments</option>
                            <option value="Physics">Physics</option>
                            <option value="Chemistry">Chemistry</option>
                            <option value="Information Technology">Information Technology</option>
                            <option value="Computer Science">Computer Science</option>
                            <option value="Mechanical Engineering">Mechanical Engineering</option>
                        </select>
                        <select className="border rounded-md px-3 py-2 text-sm" onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="All">Status: All</option>
                            <option value="Completed">Completed</option>
                            <option value="Ongoing">Ongoing</option>
                            <option value="Upcoming">Upcoming</option>
                        </select>
                    </div>
                </div>

                {isLoading ? (
                    <div className="p-20 text-center text-gray-400">Loading records...</div>
                ) : (
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
                                        {row.getVisibleCells().map(cell => (
                                            <td key={`${row.id}-${cell.column.id}`} className="p-4 text-gray-600">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={7} className="p-20 text-center text-gray-500 italic">No records found</td></tr>
                            )}
                        </tbody>
                    </table>
                )}

                <div className="p-4 border-t flex justify-between items-center text-sm">
                    <span className="text-gray-500">Showing {table.getRowModel().rows.length} results</span>
                    <div className="flex gap-1">
                        {[0, 1, 2].map(idx => (
                            <button key={idx} onClick={() => setPageIndex(idx)} className={`px-3 py-1 border rounded ${pageIndex === idx ? 'bg-blue-700 text-white' : 'bg-white hover:bg-gray-50'}`}>
                                {idx + 1}
                            </button>
                        ))}
                    </div>
                </div>

                {resultPopup && (
                    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setResultPopup(null)}>
                        <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
                            <h3 className="font-bold text-lg mb-4 text-gray-800">Final Decision</h3>
                            <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
                                <h3 className="font-bold text-lg mb-4 text-gray-800">Final Decision</h3>

                                <div className="space-y-3 mb-6">
                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                        <p className="text-xs text-gray-400 uppercase font-bold">Candidate</p>
                                        <p className="text-sm font-semibold text-gray-800">{resultPopup.candidate}</p>
                                    </div>

                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                                        <p className="text-xs text-blue-400 uppercase font-bold">Official Status</p>
                                        {/* If you have a specific 'decision' field, use resultPopup.decision here */}
                                        <p className="text-sm font-bold text-blue-900">{resultPopup.status}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setResultPopup(null)}
                                    className="w-full bg-slate-900 text-white py-2 rounded-lg font-bold hover:bg-slate-800 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}