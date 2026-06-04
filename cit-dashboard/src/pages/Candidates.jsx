import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiGet } from '../services/api';

const PAGE_SIZE = 5;

const mock_candidate = [
  {
    name: 'Dr. Reena Sen',
    initials: 'RS',
    color: "bg-purple-100 text-purple-700",
    score: 94,
    exp: "8 Years",
    expYears: 8, 
    qual: "Ph.D. (IIT Kanpur)",
    match: 95,
    research: "14 Papers",
    researchCount: 14,
    department: "CSE",
    status: "SHORTLISTED"
  },
  {
    name: 'Dr. Liam Chen',
    initials: 'LC',
    color: "bg-purple-100 text-purple-700",
    score: 92,
    exp: "6 Years",
    expYears: 6, 
    qual: "M.Tech (NIT Trichy)",
    match: 90,
    research: "12 Papers",
    researchCount: 12,
    department: "ECE",
    status: "REVIEW"
  }
];

export default function CandidateContentArea() {
  const [candidates, setCandidates] = useState(mock_candidate);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchParams] = useSearchParams();
  const [typedSearchTerm, setTypedSearchTerm] = useState(null);
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('score');
  const [currentPage, setCurrentPage] = useState(1);
  const searchTerm = typedSearchTerm ?? searchParams.get('search') ?? '';

  useEffect(() => {
    let isMounted = true;

    apiGet('/api/candidates')
      .then((data) => {
        if (isMounted) {
          setCandidates(data);
          setLoadError('');
        }
      })
      .catch(() => {
        if (isMounted) setLoadError('Unable to load candidates from database.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredCandidates = candidates
    .filter((candidate) => {
      const matchesSearch = !normalizedSearch || [
      candidate.name,
      candidate.initials,
      candidate.department,
      candidate.score,
      candidate.exp,
      candidate.qual,
      candidate.match,
      candidate.research,
      candidate.status,
    ].some((value) => String(value).toLowerCase().includes(normalizedSearch));

      const matchesDepartment = departmentFilter === 'All' || candidate.department === departmentFilter;
      const matchesStatus = statusFilter === 'All' || candidate.status === statusFilter;

      return matchesSearch && matchesDepartment && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'experience') return b.expYears - a.expYears;
      if (sortBy === 'qualification') return a.qual.localeCompare(b.qual);
      if (sortBy === 'research') return b.researchCount - a.researchCount;
      return b.score - a.score;
    });

  const totalPages = Math.max(1, Math.ceil(filteredCandidates.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStart = (safeCurrentPage - 1) * PAGE_SIZE;
  const visibleCandidates = filteredCandidates.slice(pageStart, pageStart + PAGE_SIZE);

  const handleFilterChange = (setter, value) => {
    setter(value);
    setCurrentPage(1);
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto p-6 bg-[#f8fafc]">
      
      {/* Module Title & Descriptive Context Sub-Header */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-[20px] font-extrabold text-indigo-950 tracking-tight uppercase">
            AI-SCORED CANDIDATE LIST
          </h1>
          <div className="mt-2 flex items-center gap-4 text-gray-500 text-[13px] font-medium">
            <div className="flex items-center gap-1.5 text-slate-700">
              <span className="material-symbols-outlined text-[18px]">badge</span>
              <span className="font-semibold text-[14px]">Assistant Professor - CSE</span>
            </div>
            <div className="h-3.5 w-[1px] bg-gray-300"></div>
            <span>Vacancies: <span className="font-bold text-gray-800">10</span></span>
            <div className="h-3.5 w-[1px] bg-gray-300"></div>
            <span>Applications: <span className="font-bold text-gray-800">55</span></span>
          </div>
        </div>
        
        <button className="flex items-center gap-2 px-3.5 py-1.5 bg-white border border-gray-200 rounded text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
          <span className="material-symbols-outlined text-[18px]">file_download</span>
          <span>Export Report</span>
        </button>
      </div>

      {/* Bento-Style Filter Alignment Workspace Panel */}
      <div className="bg-white border border-gray-200 rounded-xl p-3.5 mb-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[300px]">
          <div className="relative w-full max-w-xs">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
            <input
              className="w-full pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded text-[13px] focus:ring-2 focus:ring-indigo-600/10 outline-none"
              placeholder="Candidate name..."
              type="text"
              value={searchTerm}
              onChange={(event) => {
                setTypedSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          
          <select
            className="bg-white border border-gray-200 rounded text-[13px] px-3 py-1.5 font-medium text-gray-600 outline-none"
            value={departmentFilter}
            onChange={(event) => handleFilterChange(setDepartmentFilter, event.target.value)}
          >
            <option value="All">Department: All</option>
            <option value="CSE">CSE</option>
            <option value="IT">IT</option>
            <option value="ECE">ECE</option>
            <option value="MECH">MECH</option>
          </select>
          <select
            className="bg-white border border-gray-200 rounded text-[13px] px-3 py-1.5 font-medium text-gray-600 outline-none"
            value={statusFilter}
            onChange={(event) => handleFilterChange(setStatusFilter, event.target.value)}
          >
            <option value="All">Status: All</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="PENDING">Pending</option>
            <option value="REVIEW">Review</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => handleFilterChange(setSortBy, 'experience')} className={`px-3 py-1.5 border rounded text-[12px] font-bold ${sortBy === 'experience' ? 'bg-indigo-900 text-white border-indigo-900' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>Experience</button>
          <button onClick={() => handleFilterChange(setSortBy, 'qualification')} className={`px-3 py-1.5 border rounded text-[12px] font-bold ${sortBy === 'qualification' ? 'bg-indigo-900 text-white border-indigo-900' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>Qualification</button>
          <button onClick={() => handleFilterChange(setSortBy, 'research')} className={`px-3 py-1.5 border rounded text-[12px] font-bold ${sortBy === 'research' ? 'bg-indigo-900 text-white border-indigo-900' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>Research</button>
          <button
            onClick={() => {
              setTypedSearchTerm('');
              setDepartmentFilter('All');
              setStatusFilter('All');
              setSortBy('score');
              setCurrentPage(1);
            }}
            className="p-1.5 text-indigo-900 hover:bg-gray-50 rounded border border-gray-100 ml-1"
            title="Reset filters"
          >
            <span className="material-symbols-outlined text-[20px]">filter_list</span>
          </button>
        </div>
      </div>

      {/* Main Candidate Responsive Dynamic Table Shell */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {loadError && <div className="px-6 py-3 bg-red-50 text-red-700 text-sm font-semibold">{loadError}</div>}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Candidate Name</th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">AI Score</th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Experience</th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Qualification</th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Skills Match</th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Research</th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visibleCandidates.map((candidate, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  {/* Avatar Profile Column */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-[13px] ${candidate.color}`}>
                        {candidate.initials}
                      </div>
                      <span className="text-[13px] font-bold text-gray-800">{candidate.name}</span>
                    </div>
                  </td>
                  
                  {/* Interactive Score Linear Slider Indicator */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-indigo-900 h-full rounded-full" style={{ width: `${candidate.score}%` }}></div>
                      </div>
                      <span className="text-[13px] font-bold text-indigo-900">{candidate.score}%</span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 text-[13px] text-gray-600 font-medium">{candidate.exp}</td>
                  <td className="px-6 py-4 text-[13px] text-gray-600 font-medium">{candidate.qual}</td>
                  <td className="px-6 py-4 text-[13px] text-gray-600 font-medium">{candidate.match} %</td>
                  <td className="px-6 py-4 text-[13px] text-gray-600 font-medium">{candidate.research}</td>
                  
                  {/* Inline Clean Status Badge Elements */}
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-teal-50 text-teal-700 text-[10px] font-bold rounded tracking-wide border border-teal-100">
                      {candidate.status}
                    </span>
                  </td>
                  
                  {/* Operational Action Control Triggers */}
                  <td className="px-6 py-4 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        // For now: navigate to interviews page. Later you can create interview drafts via API.
                        window.location.href = `/interviews`;
                      }}
                      className="px-4 py-1.5 border border-indigo-900 text-indigo-900 rounded text-[12px] font-bold hover:bg-indigo-900 hover:text-white transition-all shadow-sm"
                    >
                      <span className="material-symbols-outlined mr-1 align-middle" style={{ fontSize: 16 }}>calendar_month</span>
                      Schedule
                    </button>
                  </td>

                </tr>
              ))}
              {visibleCandidates.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-10 text-center text-sm font-semibold text-gray-500">
                    {isLoading ? 'Loading candidates from database...' : 'No candidates match your search.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-4 flex-wrap">
          <span className="text-sm font-medium text-gray-500">
            Showing {filteredCandidates.length === 0 ? 0 : pageStart + 1} to {Math.min(pageStart + PAGE_SIZE, filteredCandidates.length)} of {filteredCandidates.length} candidates
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={safeCurrentPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              className="px-3 py-1.5 border border-gray-200 rounded text-[12px] font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded text-[12px] font-bold ${safeCurrentPage === page ? 'bg-indigo-900 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                {page}
              </button>
            ))}
            <button
              disabled={safeCurrentPage === totalPages}
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              className="px-3 py-1.5 border border-gray-200 rounded text-[12px] font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
