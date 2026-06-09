import { useEffect, useState } from 'react';
import { apiDelete, apiGet } from '../services/api';

export default function Interview() {
  const [interviews, setInterviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let isMounted = true;
    apiGet('/api/interviews')
      .then((data) => {
        if (isMounted) {
          // Fallback to empty array if response data resolves undefined
          setInterviews(Array.isArray(data) ? data : data?.data || []);
          setLoadError('');
        }
      })
      .catch(() => {
        if (isMounted) setLoadError('Unable to load scheduled interviews from database.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCancel = (id) => {
    if (window.confirm('Are you sure you want to cancel this interview?')) {
      // Optimistic UI update: remove instantly from screen for snappy feel
      const originalInterviews = [...interviews];
      setInterviews(interviews.filter((item) => item.id !== id));

      apiDelete(`/api/interviews/${id}`).catch(() => {
        setLoadError('Interview cancelled locally, but database delete failed.');
        // Revert UI to original state if backend fails
        setInterviews(originalInterviews);
      });
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f7f9fc] antialiased text-[#191c1e] flex flex-col">
      <div className="bg-white border-b border-gray-200 overflow-hidden flex flex-col flex-1 w-full">
        <div className="px-8 py-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-[#000666] tracking-tight">Scheduled Interviews</h1>
        </div>
        {loadError && <div className="px-8 py-3 bg-red-50 text-red-700 text-sm font-semibold">{loadError}</div>}
        <InterviewTable data={interviews} onCancel={handleCancel} isLoading={isLoading} />
        <Pagination totalItems={interviews.length} currentShowing={interviews.length} />
      </div>
    </div>
  );
}

function InterviewTable({ data, onCancel, isLoading }) {
  // Utility tool helper to transform a raw name string into 2 clear capitalized initials
  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="overflow-x-auto flex-1 w-full">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-8 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Candidate Name</th>
            <th className="px-8 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Interview Type / Panel</th>
            <th className="px-8 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date &amp; Time</th>
            <th className="px-8 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Venue</th>
            <th className="px-8 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-8 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {data.map((row) => {
            // Process fallback values safely to handle fresh fields from the Scheduler component
            const candidateName = row.name || row.candidateName || "Assigned Candidate";
            const candidateInitials = row.initials || getInitials(candidateName);
            const avatarBgStyle = row.avatarBg || "bg-indigo-100 text-indigo-700";
            
            // Format dynamic date and times accurately
            const calculatedDateTime = row.dateTime || (row.date && row.time ? `${row.date} @ ${row.time}` : 'Not specified');
            const interviewContext = row.type ? `${row.type} Round` : (row.panel || 'Technical Panel');
            const targetVenue = row.venue || 'Virtual Meeting Rooms';
            
            // Normalize internal status names or default newly built appointments to 'Ongoing'
            const activeStatus = row.status || 'Ongoing';
            const designStatusStyle = row.statusStyle || (
              activeStatus === 'Ongoing' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
              activeStatus === 'Completed' ? 'bg-teal-50 text-teal-700 border border-teal-100' :
              'bg-slate-50 text-slate-700 border border-slate-100'
            );

            return (
              <tr key={row.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${avatarBgStyle}`}>
                      {candidateInitials}
                    </div>
                    <span className="font-semibold text-sm text-gray-900 truncate">{candidateName}</span>
                  </div>
                </td>
                <td className="px-8 py-5 text-sm text-gray-600 font-medium">{interviewContext}</td>
                <td className="px-8 py-5 text-sm text-gray-600 whitespace-nowrap">{calculatedDateTime}</td>
                <td className="px-8 py-5 text-sm text-gray-500">{targetVenue}</td>
                <td className="px-8 py-5">
                  <span className={`inline-flex px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap ${designStatusStyle}`}>
                    {activeStatus}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center justify-center gap-4">
                    <button className="text-[#000666] hover:scale-110 transition-transform flex items-center" title="View details">
                      <span className="material-symbols-outlined text-[20px]">visibility</span>
                    </button>
                    {activeStatus === 'Ongoing' ? (
                      <button 
                        onClick={() => onCancel(row.id)} 
                        className="px-4 py-1.5 bg-[#000666] text-white rounded-md text-xs font-semibold hover:bg-red-600 active:bg-red-700 transition-all min-w-[110px]"
                      >
                        Cancel
                      </button>
                    ) : (
                      <button className="px-4 py-1.5 border border-[#000666] text-[#000666] rounded-md text-xs font-semibold hover:bg-indigo-50 transition-all min-w-[110px]">
                        View Results
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
          
          {data.length === 0 && (
            <tr>
              <td colSpan="6" className="px-8 py-14 text-center text-sm font-semibold text-gray-500">
                {isLoading ? 'Loading interviews from database...' : 'No upcoming scheduled interviews found.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Pagination({ totalItems, currentShowing }) {
  return (
    <div className="px-8 py-5 bg-white flex flex-col md:flex-row justify-between items-center border-t border-gray-200 gap-4 mt-auto w-full">
      <span className="text-xs text-gray-500 font-medium">
        Showing {currentShowing} of {totalItems} scheduled interviews
      </span>
    </div>
  );
}