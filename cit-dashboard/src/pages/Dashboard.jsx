import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../services/api';
import ScheduleInterviewModal from '../components/ScheduleInterviewModal';
import toast from 'react-hot-toast';
const iconByName = {
  group: 'groups',
  business: 'business',
  person_add: 'person_add',
  description: 'description',
  groups: 'groups',
  auto_awesome: 'auto_awesome',
};

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    metrics: [],
    scheduleRows: [],
    timelineEvents: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [loadError, setLoadError] = useState('');

  const fetchDashboard = async () => {
    setIsLoading(true);
    try {
      const data = await apiGet('/api/dashboard');
      setDashboardData(data);
      setLoadError('');
    } catch (err) {
      setLoadError('Unable to load dashboard data from database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetchDashboard();
    return () => {
      isMounted = false;
    };
  }, []);

  const { metrics, scheduleRows, timelineEvents } = dashboardData;

  return (
    <div className="p-8 flex-1 overflow-y-auto bg-white custom-scrollbar">
      {loadError && <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{loadError}</div>}

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {metrics.map((metric) => (
          <div key={metric.id} className="border rounded-xl p-4 flex flex-col items-center justify-center text-center bg-white shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-center mb-1 text-indigo-600">
              <span className="material-symbols-outlined text-[22px]">{iconByName[metric.icon] || 'analytics'} </span>
              <span className="ml-2 text-xs text-gray-500 font-semibold">{metric.title}</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">{metric.value}</div>
          </div>
        ))}
        {metrics.length === 0 && (
          <div className="col-span-full border rounded-xl p-6 text-center text-sm font-semibold text-gray-500">
            {isLoading ? 'Loading dashboard data from database...' : 'No dashboard metrics found.'}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 border rounded-2xl p-6 bg-white shadow-sm overflow-x-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Today's Schedule</h2>
            <a className="text-indigo-600 font-semibold text-sm hover:underline" href="#all">View All</a>
          </div>
          <table className="w-full text-left min-w-[500px]">
            <thead className="text-[10px] text-gray-400 uppercase tracking-wider font-bold border-b border-gray-50">
              <tr>
                <th className="pb-3">Candidate</th>
                <th className="pb-3">Job Role</th>
                <th className="pb-3">Skills</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {scheduleRows.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 last:border-none hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 align-middle">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] ${row.avatarBg}`}>
                        {row.initial}
                      </div>
                      <div className="font-semibold text-gray-700 leading-tight">{row.name}</div>
                    </div>
                  </td>
                  <td className="py-4 text-gray-600 align-middle">{row.role}</td>
                  <td className="py-4 text-gray-600 font-medium align-middle">Match</td>
                  <td className="py-4 align-middle">
                    <span className={`px-2 py-1 rounded-full font-semibold text-[10px] ${row.statusClass}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="py-4 align-middle cursor-pointer hover:underline">
                    <span className="text-indigo-700 font-bold">{row.action}</span>
                  </td>
                </tr>
              ))}
              {scheduleRows.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-sm font-semibold text-gray-500">
                    {isLoading ? 'Loading schedule from database...' : 'No schedule rows found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="border rounded-2xl p-6 bg-white shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Pending Actions</h2>
            <div className="space-y-3">
              {scheduleRows.slice(0, 2).map((row) => (
                <div key={row.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500 cursor-pointer hover:bg-gray-100 transition-colors">
                  <div>
                    <div className="text-xs font-bold text-gray-700">{row.action} {row.name}</div>
                    <div className="text-[10px] text-gray-400">Synced from database</div>
                  </div>
                  <span className="material-symbols-outlined text-gray-400 text-[18px]">chevron_right</span>
                </div>
              ))}
              </div>
            </div>

            {/* Export Report Button */}
            <button
              onClick={async () => {
                try {
                  const data = await apiGet('/api/candidates/top?limit=100');
                  const headers = Object.keys(data[0] || {});
                  const csvRows = [
                    headers.join(','),
                    ...data.map(row => headers.map(h => `"${String(row[h]).replace(/"/g, '""')}"`).join(','))
                  ];
                  const csvContent = csvRows.join('\n');
                  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.setAttribute('download', 'candidates_report.csv');
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                  toast.success('Report exported');
                } catch (err) {
                  toast.error('Failed to export report');
                }
              }}
              className="w-full bg-[#28a745] text-white py-3 rounded-lg flex items-center justify-center space-x-2 font-semibold text-sm hover:bg-green-800 active:scale-[0.98] transition-all shadow-sm mb-2"
            >
              <span className="material-symbols-outlined">download</span>
              <span>Export Report</span>
            </button>

            {/* Generate Offer Button */}
            <button
              onClick={async () => {
                try {
                  const payload = {
                    candidateId: 3,
                    position: 'Assistant Professor',
                    salary: 1440000,
                    joiningDate: '2026-07-01',
                  };
                  const res = await apiPost('/api/offers', payload);
                  toast.success(`Offer generated with ID: ${res.offer_id}`);
                } catch (err) {
                  toast.error('Failed to generate offer');
                }
              }}
              className="w-full bg-[#6A0DAD] text-white py-3 rounded-lg flex items-center justify-center space-x-2 font-semibold text-sm hover:bg-purple-800 active:scale-[0.98] transition-all shadow-sm mt-2"
            >
              <span className="material-symbols-outlined">description</span>
              <span>Generate Offer</span>
            </button>

            <div className="border rounded-2xl p-6 bg-white shadow-sm">
          
            <h2 className="text-lg font-bold text-gray-800 mb-6">Upcoming Timeline</h2>
            <div className="relative pl-4 space-y-6 before:content-[''] before:absolute before:left-[21px] before:top-2 before:bottom-2 before:w-[1px] before:bg-gray-200">
              {timelineEvents.map((event) => (
                <div key={event.id} className="relative flex items-start group">
                  <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 z-10 border-2 border-white ring-4 ${event.active ? 'bg-blue-700 ring-blue-100' : 'bg-gray-300 ring-transparent'}`}></div>
                  <div className="ml-4">
                    <div className="text-xs font-bold text-gray-800">{event.date}</div>
                    <div className="text-xs text-gray-500">{event.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Schedule Interview Modal Trigger */}
          <button
            onClick={() => setShowScheduleModal(true)}
            className="w-full bg-[#0014B4] text-white py-3 rounded-lg flex items-center justify-center space-x-2 font-semibold text-sm hover:bg-blue-800 active:scale-[0.98] transition-all shadow-sm"
          >
            <span className="material-symbols-outlined">calendar_month</span>
            <span>Schedule Interview</span>
          </button>
          {showScheduleModal && (
            <ScheduleInterviewModal
                onClose={() => setShowScheduleModal(false)}
                onSuccess={() => {
                  setShowScheduleModal(false);
                  toast.success('Interview scheduled successfully');
                  fetchDashboard();
                }}
              />
            )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
