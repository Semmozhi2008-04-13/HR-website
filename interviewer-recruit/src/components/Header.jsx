import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import citLogo from '../assets/cit-logo.png';

export default function Header({ toggleSidebar }) {
  const navigate = useNavigate();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formattedDateString = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const formattedTimeString = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    const trimmedSearch = searchTerm.trim();
    if (!trimmedSearch) {
      return;
    }

    const routeMatches = [
      { keywords: ['dashboard', 'home'], path: '/dashboard' },
      { keywords: ['assignedinterviews', 'interview', 'interviews'], path: '/assignedinterviews' },
      { keywords: ['schedule', 'interview', 'interviewschedule'], path: '/interviewschedule' },
      { keywords: ['candidateprofile', 'candidate', 'profile'], path: '/candidateprofile' },
      { keywords: ['evaluationforms', 'evaluation', 'form', 'forms'], path: '/evaluationforms' },
      { keywords: ['panelcollaboration', 'panel', 'collaboration', 'collab'], path: '/panelcollaboration' },
      { keywords: ['feedbackdecisions', 'feedbackdecisions', 'feedback', 'feedbacks', 'decision', 'decisions'], path: '/feedbackdecisions' },
    ];

    const normalizedSearch = trimmedSearch.toLowerCase();
    const matchedRoute = routeMatches.find((route) =>
      route.keywords.some((keyword) => normalizedSearch.includes(keyword))
    );

    if (matchedRoute) {
      navigate(matchedRoute.path);
      setSearchTerm('');
      return;
    }

    navigate(`/candidates?search=${encodeURIComponent(trimmedSearch)}`);
  };

  return (
    <header className="flex justify-between items-center w-full px-4 lg:px-8 h-20 bg-white border-b border-slate-100 sticky top-0 z-30 shadow-xs">

      <div className="flex items-center gap-3 shrink-0">

        <button
          onClick={toggleSidebar}
          className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-slate-50 border border-transparent hover:border-slate-200 rounded-xl shadow-xs transition-all duration-150 active:scale-95 flex items-center justify-center cursor-pointer"
          aria-label="Toggle Navigation Control Suite"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex items-center gap-2.5 bg-blue-50/70 border border-blue-100/40 px-3.5 py-1.5 rounded-lg select-none">
          <div className="w-5 h-5 overflow-hidden flex items-center justify-start shrink-0">
            <img
              src={citLogo}
              alt="CIT emblem"
              className="h-5 w-auto object-cover max-w-none scale-125 origin-left"
            />
          </div>
          {/* <span className="text-xs font-bold text-blue-900 uppercase tracking-widest font-sans hidden sm:inline">
            Smart Faculty Recruitment System
          </span>
          <span className="text-xs font-bold text-blue-900 uppercase tracking-widest font-sans inline sm:hidden">
            SFRS
          </span> */}
        </div>

      </div>

      {/* CENTER ZONE: [Search Bar] centered smoothly in the middle track layout space */}
      <form className="flex-1 max-w-xs md:max-w-sm mx-4" onSubmit={handleSearchSubmit}>
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
            search
          </span>
          <input
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50/80 border border-slate-100 rounded-full text-sm placeholder:text-gray-400/90 focus:outline-none focus:ring-2 focus:ring-blue-600/15 focus:border-blue-600 focus:bg-white transition-all duration-150"
            placeholder="Search candidates, pages..."
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
      </form>

      <div className="flex items-center gap-3 shrink-0 font-mono text-xs md:text-sm tracking-wide">

        <div className="bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl text-gray-600 font-semibold shadow-xs hidden md:flex items-center gap-2 select-none">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>{formattedDateString}</span>
          <span className="text-gray-300 font-light mx-1">|</span>
          <span className="text-indigo-600 font-bold">{formattedTimeString}</span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Text Information */}
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-semibold text-gray-800">Dr. Sharma</span>
            <span className="text-[11px] text-gray-500">Senior Interviewer</span>
          </div>

          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-800 items-center justify-center font-bold text-xs shadow-xs select-none shrink-0 hidden sm:flex">
            DS
          </div>
        </div>
       </div>

    </header>
  );
}
