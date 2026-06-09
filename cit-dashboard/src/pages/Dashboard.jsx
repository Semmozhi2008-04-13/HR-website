import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../services/api';
import toast from 'react-hot-toast';

// Icon mapping explicitly structured to match the visual symbols in image_511c00.png
const iconByName = {
  'Total Faculty': 'groups',
  'Vacancies': 'work',
  'Urgent Hiring': 'person_add',
  'Applications': 'description',
  'Interviews': 'co_present',
  'Selections': 'emoji_events', 
};

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    metrics: [
      { id: 'faculty', title: 'Total Faculty', value: '245' },
      { id: 'vacancies', title: 'Vacancies', value: '20' },
      { id: 'urgent', title: 'Urgent Hiring', value: '8' },
      { id: 'apps', title: 'Applications', value: '62' },
      { id: 'interviews', title: 'Interviews', value: '12' },
      { id: 'selections', title: 'Selections', value: '5' }
    ],
    scheduleRows: [
      { id: 1, name: 'Dr. Atkin Barne', initial: 'AB', role: 'Professor - CSE', avatarBg: 'bg-indigo-100 text-indigo-800', status: 'Completed', statusClass: 'bg-green-50 text-green-700', action: 'View Results' },
      { id: 2, name: 'Sarah Jenkins', initial: 'SJ', role: 'Assistant Professor - ECE', avatarBg: 'bg-purple-100 text-purple-800', status: 'In Progress', statusClass: 'bg-amber-50 text-amber-700', action: 'Join Interview' },
      { id: 3, name: 'Michael Chang', initial: 'MC', role: 'Research Head - IT', avatarBg: 'bg-emerald-100 text-emerald-800', status: 'Scheduled', statusClass: 'bg-blue-50 text-blue-700', action: 'View Profile' },
      { id: 4, name: 'Dr. Emily Watson', initial: 'EW', role: 'Associate Professor - Biotech', avatarBg: 'bg-pink-100 text-pink-800', status: 'Completed', statusClass: 'bg-green-50 text-green-700', action: 'View Results' }
    ],
    selectedCandidates: [
      { id: 101, name: 'Dr. Atkin Barne', role: 'Professor', dept: 'CSE' },
      { id: 102, name: 'Sarah Jenkins', role: 'Assistant Professor', dept: 'ECE' },
      { id: 103, name: 'Michael Chang', role: 'Research Head', dept: 'IT' }
    ],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const fetchDashboard = async (isBackgroundSilent = false) => {
    if (!isBackgroundSilent) setIsLoading(true);
    try {
      const data = await apiGet('/api/dashboard');
      
      setDashboardData(prev => {
        const updatedMetrics = prev.metrics.map(templateMetric => {
          const incomingData = data.metrics?.find(
            m => m.title?.toLowerCase() === templateMetric.title.toLowerCase()
          );
          return incomingData ? { ...templateMetric, value: incomingData.value } : templateMetric;
        });

        return {
          ...prev,
          ...data,
          metrics: updatedMetrics,
          scheduleRows: data.scheduleRows || prev.scheduleRows,
          selectedCandidates: data.selectedCandidates || prev.selectedCandidates
        };
      });
      setLoadError('');
    } catch (err) {
      if (!isBackgroundSilent) {
        console.log('Using simulated placeholder dashboard data states.');
      }
    } finally {
      if (!isBackgroundSilent) setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetchDashboard(false);

    const autoUpdateInterval = setInterval(() => {
      if (isMounted) {
        fetchDashboard(true);
      }
    }, 30000); 

    return () => {
      isMounted = false;
      clearInterval(autoUpdateInterval);
    };
  }, []);

  const { metrics, scheduleRows, selectedCandidates } = dashboardData;

  const handleGenerateOfferEmail = async (candidate) => {
    try {
      const payload = {
        candidateId: candidate.id,
        name: candidate.name,
        position: candidate.role,
        salary: 1440000,
        joiningDate: '2026-07-01',
      };
      
      const res = await apiPost('/api/offers', payload);
      toast.success(`Offer generated! Email dispatched successfully to ${candidate.name}.`);
      fetchDashboard(true);
    } catch (err) {
      toast.error(`Failed to generate offer or dispatch email to ${candidate.name}`);
    }
  };

  return (
    <div className="p-8 flex-1 overflow-y-auto bg-white custom-scrollbar">
      {loadError && (
        <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {loadError}
        </div>
      )}


      {/* Metrics Row - Uniform grid sizes matching layout views */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4 mb-8 w-full">
        {metrics.map((metric) => (
          <div 
            key={metric.id} 
            className="border border-gray-200 rounded-xl pt-3.5 pb-3 px-4 bg-white shadow-sm transition-all hover:shadow-md flex flex-col justify-between items-start h-full"
          >
            <div className="flex items-center justify-start space-x-1.5 text-purple-700 mb-2 w-full">
              <span className="material-symbols-outlined text-[18px] font-normal shrink-0">
                {iconByName[metric.title] || 'analytics'}
              </span>
              <span className="text-[11px] font-semibold text-gray-600 whitespace-nowrap tracking-wide">
                {metric.title}
              </span>
            </div>
            <div className="text-[28px] font-semibold text-gray-800 tracking-tight text-center w-full leading-none">
              {metric.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content Area: Today's Schedule Table */}
        <div className="lg:col-span-8 border border-gray-200 rounded-2xl p-6 bg-white shadow-sm overflow-x-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">Today's Schedule</h2>
            <a className="text-indigo-600 font-bold text-sm hover:underline" href="#all">View All</a>
          </div>
          <table className="w-full text-left min-w-[500px]">
            <thead className="text-[11px] text-gray-400 uppercase tracking-widest font-bold border-b border-gray-200 bg-gray-50/70">
              <tr>
                <th className="p-3">Candidate</th>
                <th className="p-3">Job Role</th>
                <th className="p-3">Skills</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {scheduleRows.map((row) => (
                <tr key={row.id} className="border-b border-gray-100 last:border-none hover:bg-gray-50/40 transition-colors">
                  <td className="py-4 px-3 align-middle">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] ${row.avatarBg}`}>
                        {row.initial}
                      </div>
                      <div className="font-bold text-gray-800 leading-tight">{row.name}</div>
                    </div>
                  </td>
                  <td className="py-4 px-3 text-gray-600 align-middle font-medium">{row.role}</td>
                  <td className="py-4 px-3 text-gray-600 font-medium align-middle">Match</td>
                  <td className="py-4 px-3 align-middle">
                    <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${row.statusClass}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="py-4 px-3 align-middle cursor-pointer hover:underline">
                    <span className="text-indigo-700 font-bold">{row.action}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sidebar Interaction Columns */}
        <div className="lg:col-span-4 space-y-6">
          {/* Pending Actions Section - Updated with requested work assignments */}
          <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-4 tracking-tight">Pending Actions</h2>
            <div className="space-y-3">
              {/* Task 1: Review AI Shortlisting */}
              <div className="flex items-center justify-between p-3 bg-gray-50/80 rounded-lg border-l-4 border-indigo-600 cursor-pointer hover:bg-gray-100/80 transition-colors">
                <div>
                  <div className="text-xs font-bold text-gray-800">Review AI Shortlisting</div>
                  <div className="text-[10px] text-gray-400 font-medium mt-0.5">Deadline: Today, 4:00 PM</div>
                </div>
                <span className="material-symbols-outlined text-gray-400 text-[18px]">chevron_right</span>
              </div>

              {/* Task 2: Schedule Interviews */}
              <div className="flex items-center justify-between p-3 bg-gray-50/80 rounded-lg border-l-4 border-amber-500 cursor-pointer hover:bg-gray-100/80 transition-colors">
                <div>
                  <div className="text-xs font-bold text-gray-800">Schedule Interviews</div>
                  <div className="text-[10px] text-gray-400 font-medium mt-0.5">8 urgent profiles awaiting slots</div>
                </div>
                <span className="material-symbols-outlined text-gray-400 text-[18px]">chevron_right</span>
              </div>
            </div>
          </div>

         

          <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm flex flex-col">
            <h2 className="text-lg font-bold text-gray-800 mb-1 tracking-tight">Selected Candidates</h2>
            <p className="text-[11px] text-gray-400 mb-4 font-semibold">Generate official email offers directly into queue</p>
            
            <div className="space-y-3 max-h-[280px] overflow-y-auto custom-scrollbar pr-1">
              {selectedCandidates.map((candidate) => (
                <div key={candidate.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-2 hover:bg-slate-100/70 transition-colors">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-gray-800 truncate">{candidate.name}</div>
                    <div className="text-[10px] text-gray-500 font-semibold truncate mt-0.5">
                      {candidate.role} • <span className="text-indigo-600 font-bold">{candidate.dept}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleGenerateOfferEmail(candidate)}
                    className="h-8 px-3 bg-[#6A0DAD] text-white rounded-md flex items-center gap-1 font-bold text-[11px] hover:bg-purple-800 active:scale-95 transition-all shadow-sm shrink-0"
                  >
                    <span className="material-symbols-outlined text-[14px]">mail</span>
                    <span>Offer</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;