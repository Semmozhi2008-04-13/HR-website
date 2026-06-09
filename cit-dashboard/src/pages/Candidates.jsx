import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiGet, apiPost } from '../services/api';
import toast from 'react-hot-toast';

const PAGE_SIZE = 5;

export default function CandidateContentArea() {
  const [candidates, setCandidates] = useState([]);
  const [totalItems, setTotalItems] = useState(0); 
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [searchParams] = useSearchParams();
  const [typedSearchTerm, setTypedSearchTerm] = useState(null);
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('score');
  const [currentPage, setCurrentPage] = useState(1);

  // Tracks which candidate's schedule modal is currently open
  const [activeDropdownCandidateId, setActiveDropdownCandidateId] = useState(null);
  const [schedulingData, setSchedulingData] = useState({ date: '', time: '', type: 'Technical' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef(null);

  const searchTerm = typedSearchTerm ?? searchParams.get('search') ?? '';

  // Close modal when clicking outside the modal box container
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setActiveDropdownCandidateId(null);
      }
    }
    if (activeDropdownCandidateId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdownCandidateId]);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const queryParams = new URLSearchParams({
      page: currentPage,
      limit: PAGE_SIZE,
      search: searchTerm.trim(),
      department: departmentFilter,
      status: statusFilter,
      sort: sortBy
    });

    apiGet(`/api/candidates?${queryParams.toString()}`)
      .then((res) => {
        if (isMounted) {
          if (Array.isArray(res)) {
            setCandidates(res);
            setTotalItems(res.length);
          } else if (res && res.data) {
            setCandidates(res.data);
            setTotalItems(res.total || res.data.length);
          }
          setLoadError('');
        }
      })
      .catch((err) => {
        if (isMounted) {
          setLoadError(err?.message || 'Failed to fetch candidate details.');
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentPage, searchTerm, departmentFilter, statusFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  const handleFilterChange = (setter, value) => {
    setter(value);
    setCurrentPage(1); 
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleOpenDropdown = (candidate) => {
    setSchedulingData({ date: '', time: '', type: 'Technical' });
    setActiveDropdownCandidateId(candidate.id);
  };

  const handleSubmitSchedule = async (candidateId) => {
    if (!schedulingData.date || !schedulingData.time) {
      toast.error('Please fill out both date and time.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiPost('/api/interviews', {
        candidateId,
        date: schedulingData.date,
        time: schedulingData.time,
        type: schedulingData.type,
      });
      toast.success('Interview scheduled successfully');
      setActiveDropdownCandidateId(null);
    } catch (err) {
      toast.error(err?.message || 'Failed to schedule interview');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto p-6 bg-[#f8fafc]">
      
      {/* Container Layout wrappers wrapped with conditional blur class if modal is open */}
      <div className={`transition-all duration-300 ${activeDropdownCandidateId !== null ? 'blur-[4px] pointer-events-none select-none' : ''}`}>
        
        {/* Clean Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-[20px] font-extrabold text-indigo-950 tracking-tight uppercase">
            AI-SCORED CANDIDATE LIST
          </h1>
          <div className="my-2">
  <button
    onClick={() => toast.success('Report processed and downloaded successfully.')}
    className="w-full bg-[#28a745] text-white py-3 rounded-xl flex items-center justify-center space-x-2 font-bold text-sm tracking-tight hover:bg-green-700 active:scale-[0.98] transition-all shadow-sm"
  >
    <span className="material-symbols-outlined text-[18px] font-normal shrink-0">
      download
    </span>
    <span>Export Report</span>
  </button>
</div>
          
        </div>
 
        {/* Fixed Alignment Workspace Panel */}
        <div className="bg-white border border-gray-200 rounded-xl p-3.5 mb-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-[300px]">
            <div className="relative w-full max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
              <input
                className="w-full pl-9 pr-4 h-10 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-indigo-600/10 outline-none transition-all"
                placeholder="Search candidates by name, qualification, or skills..."
                type="text"
                value={searchTerm}
                onChange={(event) => {
                  setTypedSearchTerm(event.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            
            <div className="relative">
              <select
                className="appearance-none bg-white border border-gray-200 rounded-lg text-[13px] pl-3 pr-8 h-10 font-medium text-gray-600 outline-none cursor-pointer hover:border-gray-300 transition-colors min-w-[140px]"
                value={departmentFilter}
                onChange={(event) => handleFilterChange(setDepartmentFilter, event.target.value)}
              >
                <option value="All">Department: All</option>
                <option value="CSE">CSE</option>
                <option value="IT">IT</option>
                <option value="ECE">ECE</option>
                <option value="MECH">MECH</option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-[18px]">
                keyboard_arrow_down
              </span>
            </div>

            <div className="relative">
              <select
                className="appearance-none bg-white border border-gray-200 rounded-lg text-[13px] pl-3 pr-8 h-10 font-medium text-gray-600 outline-none cursor-pointer hover:border-gray-300 transition-colors min-w-[120px]"
                value={statusFilter}
                onChange={(event) => handleFilterChange(setStatusFilter, event.target.value)}
              >
                <option value="All">Status: All</option>
                <option value="SHORTLISTED">Shortlisted</option>
                <option value="PENDING">Pending</option>
                <option value="REVIEW">Review</option>
                <option value="REJECTED">Rejected</option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-[18px]">
                keyboard_arrow_down
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => handleFilterChange(setSortBy, 'experience')} className={`px-3 h-10 border rounded-lg text-[12px] font-bold transition-all ${sortBy === 'experience' ? 'bg-indigo-900 text-white border-indigo-900' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>Experience</button>
            <button onClick={() => handleFilterChange(setSortBy, 'qualification')} className={`px-3 h-10 border rounded-lg text-[12px] font-bold transition-all ${sortBy === 'qualification' ? 'bg-indigo-900 text-white border-indigo-900' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>Qualification</button>
            <button onClick={() => handleFilterChange(setSortBy, 'research')} className={`px-3 h-10 border rounded-lg text-[12px] font-bold transition-all ${sortBy === 'research' ? 'bg-indigo-900 text-white border-indigo-900' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>Research</button>
            <button
              onClick={() => {
                setTypedSearchTerm('');
                setDepartmentFilter('All');
                setStatusFilter('All');
                setSortBy('score');
                setCurrentPage(1);
              }}
              className="w-10 h-10 flex items-center justify-center text-indigo-900 hover:bg-gray-50 rounded-lg border border-gray-100 ml-1 transition-colors"
              title="Reset filters"
            >
              <span className="material-symbols-outlined text-[20px]">filter_list</span>
            </button>
          </div>
        </div>

        {/* Main Candidate Table */}
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
                {!isLoading && candidates.map((candidate, idx) => (
                  <tr key={candidate.id || idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-[13px] ${candidate.color || 'bg-purple-100 text-purple-700'}`}>
                          {candidate.initials || getInitials(candidate.name)}
                        </div>
                        <span className="text-[13px] font-bold text-gray-800">{candidate.name || '-'}</span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-indigo-900 h-full rounded-full" style={{ width: `${candidate.score || 0}%` }}></div>
                        </div>
                        <span className="text-[13px] font-bold text-indigo-900">{candidate.score || 0}%</span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 text-[13px] text-gray-600 font-medium">{candidate.exp || '0 Years'}</td>
                    <td className="px-6 py-4 text-[13px] text-gray-600 font-medium">{candidate.qual || '-'}</td>
                    <td className="px-6 py-4 text-[13px] text-gray-600 font-medium">{candidate.match || 0} %</td>
                    <td className="px-6 py-4 text-[13px] text-gray-600 font-medium">{candidate.research || '0 Papers'}</td>
                    
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded tracking-wide border ${
                        candidate.status === 'SHORTLISTED' ? 'bg-teal-50 text-teal-700 border-teal-100' :
                        candidate.status === 'REVIEW' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        candidate.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                        'bg-slate-50 text-slate-700 border-slate-100'
                      }`}>
                        {candidate.status || 'PENDING'}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleOpenDropdown(candidate)}
                        className="px-4 py-1.5 border border-indigo-900 text-indigo-900 rounded text-[12px] font-bold hover:bg-indigo-900 hover:text-white transition-all shadow-sm flex items-center mx-auto gap-1"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>calendar_month</span>
                        Schedule
                      </button>
                    </td>
                  </tr>
                ))}
                
                {(isLoading || candidates.length === 0) && (
                  <tr>
                    <td colSpan="8" className="px-6 py-10 text-center text-sm font-semibold text-gray-500">
                      {isLoading ? 'Loading candidates...' : 'No data entries match your exact filters.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-4 flex-wrap">
            <span className="text-sm font-medium text-gray-500">
              Showing {candidates.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1} to {Math.min(currentPage * PAGE_SIZE, totalItems)} of {totalItems} candidates
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                className="px-3 py-1.5 border border-gray-200 rounded text-[12px] font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded text-[12px] font-bold ${currentPage === page ? 'bg-indigo-900 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  {page}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                className="px-3 py-1.5 border border-gray-200 rounded text-[12px] font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Portal/Overlay: Centered and Blurred Modal Form */}
      {activeDropdownCandidateId !== null && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            ref={modalRef} 
            className="w-full max-w-md bg-white border border-gray-100 rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-extrabold text-indigo-950 tracking-tight flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-900 text-[20px]">event</span>
                SCHEDULE INTERVIEW
              </h3>
              <button 
                type="button"
                onClick={() => setActiveDropdownCandidateId(null)}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Date</label>
                <input 
                  type="date" 
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-xs text-gray-800 font-medium focus:ring-2 focus:ring-indigo-600/10 outline-none" 
                  value={schedulingData.date}
                  onChange={(e) => setSchedulingData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Time</label>
                <input 
                  type="time" 
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-xs text-gray-800 font-medium focus:ring-2 focus:ring-indigo-600/10 outline-none" 
                  value={schedulingData.time}
                  onChange={(e) => setSchedulingData(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Interview Type</label>
                <select 
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-xs text-gray-800 font-medium focus:ring-2 focus:ring-indigo-600/10 outline-none bg-white"
                  value={schedulingData.type}
                  onChange={(e) => setSchedulingData(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="Technical">Technical Interview</option>
                  <option value="HR">HR Round</option>
                  <option value="Managerial">Managerial Round</option>
                </select>
              </div>

              <div className="flex gap-3 pt-3 border-t border-gray-100 mt-5">
                <button 
                  type="button"
                  onClick={() => setActiveDropdownCandidateId(null)}
                  className="flex-1 py-2.5 text-xs font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSubmitSchedule(activeDropdownCandidateId)}
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-indigo-900 hover:bg-indigo-950 disabled:opacity-50 rounded-lg transition-colors shadow-sm"
                >
                  {isSubmitting ? 'Scheduling...' : 'Confirm Schedule'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}