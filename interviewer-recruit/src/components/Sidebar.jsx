import { NavLink } from 'react-router-dom';
import citLogo from '../assets/cit-logo.png';

const Sidebar = ({ isOpen, closeSidebar, onLogout }) => {
  const navItemBase = "flex items-center gap-3.5 px-5 py-3 rounded-r-full transition-all duration-200 text-sm font-medium";

  const getNavClass = (isActive) =>
    `${navItemBase} ${isActive ? 'bg-purple-100 text-purple-800 font-bold' : 'text-gray-600 hover:text-gray-900 hover:bg-purple-50'}`;

  const navLinks = [
    { to: "/dashboard", icon: "dashboard", label: "Dashboard" },
    { to: "/assignedinterviews", icon: "assignment_ind", label: "Assigned Interviews" },
    { to: "/interviewschedule", icon: "calendar_today", label: "Interview Schedule" },
    { to: "/candidateprofile", icon: "badge", label: "Candidate Profiles" },
    { to: "/evaluationforms", icon: "rate_review", label: "Evaluation Form" },
    { to: "/panelcollaboration", icon: "groups", label: "Panel Collaboration" },
    { to: "/feedbackdecisions", icon: "speaker_notes", label: "Feedback & Decisions" },
  ];

  return (
    <>
      {/* Backdrop for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      <aside className={`
      fixed left-0 top-0 h-full w-[240px] z-50 bg-white border-r border-slate-200
      transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>

        {/* Brand Header */}
        <div className="h-24 flex items-center justify-center border-b border-slate-100 px-4">
          <img src={citLogo} alt="CIT Logo" className="h-14 object-contain" />
        </div>

        {/* Navigation Links */}
        <nav className="flex-grow py-6 flex flex-col gap-1">
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => window.innerWidth < 1024 && closeSidebar()}
              className={({ isActive }) => getNavClass(isActive)}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer Utilities */}

        <div className="border-t border-slate-100 p-4 space-y-2">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined">logout</span>
            <span>Logout</span>
          </button>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;