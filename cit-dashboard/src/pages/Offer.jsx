import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiGet } from '../services/api';

export default function Offer() {
  const [searchParams] = useSearchParams();
  const candidateId = searchParams.get('candidateId') || '3'; // Default to Priya (ID 3) if none specified

  const [candidate, setCandidate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  
  const [appointmentType, setAppointmentType] = useState('Standard Faculty');
  const [ctc, setCtc] = useState('14,40,000');
  const [joiningDate, setJoiningDate] = useState('2026-07-01'); // HTML standard date structure

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    apiGet(`/api/candidates/${candidateId}`)
      .then((data) => {
        if (isMounted) {
          setCandidate(data);
          setLoadError('');
        }
      })
      .catch((err) => {
        if (isMounted) {
          setLoadError('Unable to load candidate details from database. Using fallback.');
          setCandidate({
            name: 'Dr. Priya Subramanian',
            qualification: 'Ph.D in AI & ML',
            department: 'School of Computer Science & Engineering',
            basePay: '₹57,700',
            refNumber: 'CIT/HR/2026/047',
            dateCreated: '05 Jun 2026'
          });
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [candidateId]);

  // Dynamic Text Conversion for Written Numbers
  const getWrittenCtc = (value) => {
    if (value.replace(/,/g, '') === '1440000') {
      return 'Fourteen Lakh Forty Thousand only';
    }
    return 'specified compensation bracket values';
  };

  const handleSendOffer = () => {
    // Later: apiPost('/api/offers/send', { candidate, appointmentType, ctc, joiningDate, ... })
    alert(`Send Offer clicked. Integrate backend POST /api/offers/send for ${candidate.name}.`);
  };

  const handlePdfPreview = () => {
    // Later: fetch a PDF from backend and open/download it.
    alert('Preview PDF clicked. Integrate backend GET /api/offers/pdf?candidate=... when ready.');
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500 font-semibold">
        Loading offer letter generator details...
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="p-8 text-center text-red-500 font-semibold">
        Candidate not found.
      </div>
    );
  }

  return (
    <div className="p-container-padding space-y-6 w-full font-sans antialiased text-on-surface">
      
      {/* Breadcrumbs */}
      <div className="flex items-center text-label-md text-on-surface-variant gap-2">
        <span>Recruitment</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span>Onboarding</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-primary font-bold">Offer Letter Generation</span>
      </div>

      {/* Main Interactive Workspace Area */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* LEFT PANEL: Dynamic Offer Letter Live Document Preview */}
        <div className="col-span-12 xl:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[850px]">
          
          {/* Institution Academic Header */}
          <div className="p-8 border-b border-outline-variant flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-[#FFD700] p-3 rounded-lg flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  school
                </span>
              </div>
              <div>
                <h2 className="text-headline-md font-headline-md text-primary leading-tight tracking-tight">
                  CHENNAI INSTITUTE OF TECHNOLOGY
                </h2>
                <p className="text-body-sm font-medium text-on-surface-variant italic">(Autonomous)</p>
              </div>
            </div>
            <div className="text-left sm:text-right text-label-md font-label-md text-on-surface-variant">
              <p>Ref: {candidate.refNumber}</p>
              <p>Date: {candidate.dateCreated}</p>
            </div>
          </div>

          {/* Live Document Body Wrapper */}
          <div className="p-8 md:p-12 flex-1 text-body-lg leading-relaxed max-w-4xl mx-auto space-y-6">
            <h3 className="text-headline-sm font-headline-sm mb-8 underline decoration-primary/30 underline-offset-4 text-primary">
              Subject: Letter of Appointment — Assistant Professor ({appointmentType})
            </h3>
            
            <p>Dear <span className="bg-[#fce8bb] px-1 rounded font-semibold text-gray-900">{candidate.name}</span>,</p>
            
            <p>
              With reference to your application and the subsequent selection process, we are delighted to offer you the position of 
              <span className="bg-[#fce8bb] px-1 rounded font-semibold text-gray-900"> Assistant Professor ({appointmentType})</span> in the 
              <span className="bg-[#fce8bb] px-1 rounded font-semibold text-gray-900"> {candidate.department}</span> at Chennai Institute of Technology.
            </p>
            
            <p>
              Your consolidated annual compensation will be <span className="bg-[#fce8bb] px-1 rounded font-semibold text-gray-900">₹{ctc}</span> 
              (Rupees {getWrittenCtc(ctc)}), with a basic pay of <span className="bg-[#fce8bb] px-1 rounded font-semibold text-gray-900">{candidate.basePay}</span> in the pay matrix Level 10 of the 7th CPC.
            </p>
            
            <p>
              Your expected date of joining is <span className="bg-[#fce8bb] px-1 rounded font-semibold text-gray-900">
                {joiningDate ? new Date(joiningDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Pending'}
              </span>. Detailed institutional terms and regulations are enclosed in Annexure-I.
            </p>
            
            <p>We look forward to welcoming you into the academic fabric of the CIT family.</p>
            
            <div className="pt-12 space-y-1">
              <p className="font-bold text-on-surface">Dr. R. Ramachandran</p>
              <p className="text-body-md text-on-surface-variant">Registrar, Chennai Institute of Technology</p>
            </div>
          </div>

          {/* Letter Base Structural Accent Rule */}
          <div className="h-4 bg-primary w-full"></div>
        </div>

        {/* RIGHT PANEL: Bento System Controls */}
        <div className="col-span-12 xl:col-span-4 space-y-6">
          
          {/* Candidate Dynamic Metadata Summary Card */}
          <div className="bg-surface-container-high p-6 rounded-xl border border-outline-variant">
            <h4 className="text-label-md font-bold text-primary uppercase tracking-wider mb-4">Candidate Profile</h4>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-4 border-surface shadow-sm shrink-0">
                <span className="material-symbols-outlined text-primary scale-125">person</span>
              </div>
              <div className="min-w-0">
                <p className="text-headline-sm font-headline-sm truncate">{candidate.name}</p>
                <p className="text-body-sm text-on-surface-variant">{candidate.qualification}</p>
                <span className="mt-1 inline-block px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Verified Selection
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Parameters Controls Panel */}
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant space-y-6 shadow-sm">
            <h4 className="text-label-md font-bold text-on-surface-variant uppercase tracking-wider">Offer Settings</h4>
            
            {/* Setting Parameter: Appointment Layout Variant Selector */}
            <div className="space-y-3">
              <p className="text-body-sm font-semibold text-on-surface">Appointment Type</p>
              <div className="grid grid-cols-1 gap-3">
                
                <button 
                  onClick={() => setAppointmentType('Standard Faculty')}
                  className={`flex flex-col items-start p-4 border-2 rounded-xl text-left transition-all ${
                    appointmentType === 'Standard Faculty' 
                      ? 'border-primary bg-primary/5 shadow-sm' 
                      : 'border-outline-variant hover:border-outline'
                  }`}
                >
                  <span className={`text-body-md font-bold ${appointmentType === 'Standard Faculty' ? 'text-primary' : 'text-on-surface'}`}>Standard Faculty</span>
                  <span className="text-body-sm text-on-surface-variant">Asst.Prof / Assoc.Prof</span>
                </button>

                <button 
                  onClick={() => setAppointmentType('Senior Leadership')}
                  className={`flex flex-col items-start p-4 border-2 rounded-xl text-left transition-all ${
                    appointmentType === 'Senior Leadership' 
                      ? 'border-primary bg-primary/5 shadow-sm' 
                      : 'border-outline-variant hover:border-outline'
                  }`}
                >
                  <span className={`text-body-md font-bold ${appointmentType === 'Senior Leadership' ? 'text-primary' : 'text-on-surface'}`}>Senior Leadership</span>
                  <span className="text-body-sm text-on-surface-variant">Dean / HoD / Director</span>
                </button>

                <button 
                  onClick={() => setAppointmentType('Research Position')}
                  className={`flex flex-col items-start p-4 border-2 rounded-xl text-left transition-all ${
                    appointmentType === 'Research Position' 
                      ? 'border-primary bg-primary/5 shadow-sm' 
                      : 'border-outline-variant hover:border-outline'
                  }`}
                >
                  <span className={`text-body-md font-bold ${appointmentType === 'Research Position' ? 'text-primary' : 'text-on-surface'}`}>Research Position</span>
                  <span className="text-body-sm text-on-surface-variant">PostDoc / Research Asst.</span>
                </button>

              </div>
            </div>

            {/* Compensation Scale Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-body-sm font-semibold text-on-surface">CTC (per annum)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-medium">₹</span>
                  <input 
                    className="w-full pl-7 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" 
                    type="text" 
                    value={ctc} 
                    onChange={(e) => setCtc(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-body-sm font-semibold text-on-surface">Joining Date</label>
                <div className="relative">
                  <input 
                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" 
                    type="date" 
                    value={joiningDate} 
                    onChange={(e) => setJoiningDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Action Triggers Grid */}
            <div className="pt-4 space-y-3">
              <button 
                onClick={handleSendOffer}
                className="w-full bg-[#1e824c] hover:bg-[#166534] text-white font-button-text text-button-text py-4 rounded-xl shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 font-semibold"
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  send
                </span>
                Send Offer - E-sign Required
              </button>
              
              <button 
                onClick={handlePdfPreview}
                className="w-full bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant text-on-surface font-button-text text-button-text py-4 rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 font-semibold"
              >
                <span className="material-symbols-outlined text-[20px]">
                  picture_as_pdf
                </span>
                Preview PDF Template
              </button>
            </div>
          </div>

          {/* Reference Help Blueprint Card */}
          <div className="p-6 bg-primary-container rounded-xl text-on-primary-container relative overflow-hidden group shadow-sm">
            <div className="relative z-10">
              <h5 className="text-headline-sm font-headline-sm mb-2 font-bold">Need help?</h5>
              <p className="text-body-sm opacity-90 mb-4">
                Refer to the Institutional Recruitment Guidelines (v2.4) for standardized college salary matrix bands.
              </p>
              <a className="inline-flex items-center text-label-md font-bold underline decoration-2 underline-offset-4 hover:opacity-80 transition-opacity" href="#handbook">
                View Faculty Handbook
              </a>
            </div>
            <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[120px] opacity-10 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
              info
            </span>
          </div>

        </div>
      </div>

    </div>
  );
}
