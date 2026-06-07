import React, { useMemo, useState, useEffect } from 'react';
import KPICard from './reusable/KPICards';
import { Users, CircleCheck, CircleEllipsis, Search } from 'lucide-react';
import {
    useReactTable, getCoreRowModel, getPaginationRowModel,
    getFilteredRowModel, flexRender
} from '@tanstack/react-table';

export default function FeedbackandDecisions() {
    const [popup, setPopup] = useState(null);
    const [finalDecision, setFinalDecision] = useState("");
    const handleSendToHR = () => {
        if (!selectedCandidate || !finalDecision) return;
        setPopup(`Decision (${finalDecision}) for ${selectedCandidate.candidate} has been sent to HR.`);
    };

    const [globalFilter, setGlobalFilter] = useState('');
    const [columnFilters, setColumnFilters] = useState([]);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [loading, setLoading] = useState(false);
    // Added pageIndex state to control pagination
    const [pageIndex, setPageIndex] = useState(0);

    const data = useMemo(() => [
        { candidate: 'Dr. Reena Sen', dept: 'Computer Science', role: 'Assoc. Prof', recommendation: 'Strong Recommend', decision: 'Sent to HR' },
        { candidate: 'Robert Kane', dept: 'Mathematics', role: 'Prof', recommendation: 'Recommended', decision: 'Waitlisted' },
        { candidate: 'Dr. Atkin Barne', dept: 'Chemistry', role: 'Prof', recommendation: 'Neutral', decision: 'Pending' },
        { candidate: 'Ms. Joly Mariam', dept: 'Physics', role: 'Assoc. Prof', recommendation: 'Recommended', decision: 'Waitlisted' },
        { candidate: 'Dr. Liam Chen', dept: 'Information Technology', role: 'Asst. Prof', recommendation: 'Strong Recommend', decision: 'Sent to HR' },
    ], []);

    const [pageData, setPageData] = useState(data);

    const getInitials = (name) => {
        const parts = name.replace(/(Dr\.|Ms\.|Mr\.|Mrs\.|Prof\.)/gi, '').trim().split(' ');
        return parts.length > 1
            ? (parts[0][0] + parts[1][0]).toUpperCase()
            : parts[0].substring(0, 2).toUpperCase();
    };

    const columns = useMemo(() => [
        {
            accessorKey: 'candidate',
            header: 'Name',
            cell: (info) => (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-800">
                        {getInitials(info.getValue())}
                    </div>
                    <span className="font-medium">{info.getValue()}</span>
                </div>
            )
        },
        { accessorKey: 'dept', header: 'Dept' },
        {
            accessorKey: 'role',
            header: 'Role',
        },
        {
            accessorKey: 'recommendation',
            header: 'Rec',
            cell: (info) => {
                const val = info.getValue();

                // Define style mapping
                const getStyles = (status) => {
                    switch (status) {
                        case 'Strong Recommend':
                            return 'bg-green-100 text-green-800';
                        case 'Neutral':
                            return 'bg-gray-100 text-gray-700'; // Neutral style
                        default:
                            return 'bg-blue-100 text-blue-800'; // Recommended/Default
                    }
                };

                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStyles(val)}`}>
                        {val === 'Strong Recommend' ? 'Strong Recommend' : val}
                    </span>
                );
            }
        },
        {
            accessorKey: 'decision',
            header: 'Status',
            cell: (info) => {
                const val = info.getValue();
                const isSentToHR = val === 'Sent to HR';

                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${isSentToHR ? 'bg-purple-100 text-purple-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {val}
                    </span>
                );
            }
        },
    ], []);

    const table = useReactTable({
        data: pageData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            globalFilter,
            columnFilters,
            pagination: { pageIndex, pageSize: 10 }
        },
        onGlobalFilterChange: setGlobalFilter,
        onColumnFiltersChange: setColumnFilters,
    });

    // Loading Simulation Effect
    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            // Page 0 has data, pages 1 and 2 (indices 1 & 2) are "empty" for simulation
            if (pageIndex === 0) {
                setPageData(data);
            } else {
                setPageData([]);
            }
            setLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, [pageIndex, data]);

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            <h1 className="text-2xl font-bold mb-1">Feedback & Decisions</h1>
            <p className="text-gray-500 mb-6">Finalize hiring decisions and manage HR submissions.</p>

            {/* KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <KPICard title="Candidates Reviewed" value="22" icon={Users} variant="reviewed" />
                <KPICard title="Finalized Decisions" value="19" icon={CircleCheck} variant="final-decision" />
                <KPICard title="Pending Decisions" value="3" icon={CircleEllipsis} variant="pending-decision" />
            </div>

            {/* Main Content */}
            <div className="flex gap-6 items-start w-full">
                <div className="flex-1 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input
                                placeholder="Filter by name..."
                                className="pl-10 pr-4 py-2 border rounded-lg w-full border-gray-200"
                                onChange={(e) => setGlobalFilter(e.target.value)}
                            />
                        </div>
                        <select className="border border-gray-200 rounded-lg px-4" onChange={(e) => table.getColumn('dept')?.setFilterValue(e.target.value)}>
                            <option value="">All Departments</option>
                            <option value="Computer Science">Computer Science</option>
                            <option value="Mathematics">Mathematics</option>
                            <option value="Chemistry">Chemistry</option>
                            <option value="Physics">Physics</option>
                            <option value="Information Technology">Information Technology</option>
                            <option value="Mechanical Engg">Mechanical Engg</option>

                        </select>
                    </div>

                    <div className="min-h-[256px]">
                        {loading ? (
                            <div className="h-64 flex items-center justify-center text-gray-400">Loading records...</div>
                        ) : table.getRowModel().rows.length === 0 ? (
                            <div className="h-64 flex items-center justify-center text-gray-500 italic">No records found as of now.</div>
                        ) : (
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase border-b border-gray-200">
                                    {table.getHeaderGroups().map(h => (
                                        <tr key={h.id}>{h.headers.map(c => <th key={c.id} className="p-4">{flexRender(c.column.columnDef.header, c.getContext())}</th>)}</tr>
                                    ))}
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {table.getRowModel().rows.map(row => (
                                        <tr
                                            key={row.id}
                                            className={`hover:bg-slate-50 cursor-pointer ${selectedCandidate?.candidate === row.original.candidate ? 'bg-blue-50' : ''}`}
                                            onClick={() => setSelectedCandidate(row.original)}
                                        >
                                            {row.getVisibleCells().map(cell => <td key={cell.id} className="p-4 text-sm">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    <div className="mt-4 flex gap-2">
                        <button
                            className="px-4 py-2 border rounded"
                            onClick={() => { table.previousPage(); setPageIndex(Math.max(0, pageIndex - 1)); }}
                            disabled={pageIndex === 0}
                        >Prev</button>
                        <button
                            className="px-4 py-2 border rounded"
                            onClick={() => { table.nextPage(); setPageIndex(Math.min(2, pageIndex + 1)); }}
                            disabled={pageIndex === 2}
                        >Next</button>
                    </div>
                </div>

                {/* HR Submission Panel */}
                <div className="w-80 flex-shrink-0 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="font-bold text-gray-800 mb-4">HR Submission Panel</h2>
                    {selectedCandidate ? (
                        <>
                            <div className="bg-blue-50 p-4 rounded-lg mb-4">
                                <p className="font-bold">{selectedCandidate.candidate}</p>
                                <p className="text-sm font-bold text-blue-600">Role: {selectedCandidate.role}</p>
                                <p className="text-sm">Dept: {selectedCandidate.dept}</p>
                            </div>

                            <label className="block text-xs font-bold text-gray-500 mb-1">Final Decision</label>
                            <select
                                className="w-full border rounded-lg p-2 mb-4 text-sm bg-white"
                                value={finalDecision}
                                onChange={(e) => setFinalDecision(e.target.value)}
                            >
                                <option value="">-- Select Decision --</option>
                                <option value="Strong Recommend">Strong Recommend</option>
                                <option value="Recommended">Recommended</option>
                                <option value="Waitlisted">Waitlisted</option>
                                <option value="Not Recommended">Not Recommended</option>

                            </select>

                            <textarea
                                className="w-full border rounded-lg p-3 h-24 mb-4 text-sm"
                                placeholder="Enter final committee notes..."
                            ></textarea>

                            <button
                                onClick={handleSendToHR}
                                disabled={!finalDecision}
                                className={`w-full py-2 rounded-lg font-bold transition-all ${finalDecision
                                        ? 'bg-blue-900 text-white hover:bg-blue-800'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                Send to HR
                            </button>
                        </>
                    ) : (
                        <p className="text-gray-400 italic text-sm text-center py-10">Select a candidate to view submission details.</p>
                    )}
                </div>
            </div>

            {/* Popup Overlay (Same as your PanelCollaboration) */}
            {popup && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setPopup(null)}>
                    <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full mx-4">
                        <h3 className="font-bold text-lg mb-2">Notification</h3>
                        <p className="text-sm text-gray-600 mb-6">{popup}</p>
                        <button onClick={() => setPopup(null)} className="w-full bg-slate-900 text-white py-2 rounded-lg font-bold">Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}