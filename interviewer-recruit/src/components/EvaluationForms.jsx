import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Info, RotateCcw } from 'lucide-react';

// Centralized lookup for extra candidate details
const CANDIDATE_DETAILS = {
    "Dr. Reena Sen": {
        education: "PhD, IIT Kanpur",
        experience: "8+ Years",
        room: "MR - 402",
        time: "11:30 - 12:30"
    },
    "John Doe": {
        education: "MSc, MIT",
        experience: "5+ Years",
        room: "MR - 403",
        time: "12:30 - 01:30"
    }
};

const EvaluationForms = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const candidate = state?.candidate || null ;

    // Get details from lookup, fallback to defaults
    const details = candidate? (CANDIDATE_DETAILS[candidate?.candidate] || {
        education: "N/A",
        experience: "N/A",
        room: "MR - TBA",
        time: "TBA"
    }) : null;

    if (!candidate) {
        return (
            <div className="max-w-5xl mx-auto p-12 text-center">
                <h2 className="text-xl font-bold">No Candidate Selected</h2>
                <p className="text-gray-600 mt-2">Please go to the Interview Schedule to start an evaluation.</p>
                <button 
                    onClick={() => navigate('/interviewschedule')} 
                    className="mt-6 px-6 py-2 bg-blue-900 text-white rounded-lg"
                >
                    Go to Schedule
                </button>
            </div>
        );
    }

    const [loading, setLoading] = useState(true);
    const [scores, setScores] = useState({});
    const [observations, setObservations] = useState("");
    const [strengths, setStrengths] = useState("");
    const [improvement, setImprovement] = useState("");
    const [selectedRec, setSelectedRec] = useState(null);

    useEffect(() => {
        // Simple loading delay to match your app's behavior
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    const getInitials = (name) => {
        if (!name) return "??";
        const cleanName = name.replace(/(Dr\.|Mr\.|Ms\.|Mrs\.)/gi, "").trim();
        return cleanName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    const criteriaList = [
        "Subject Knowledge", "Teaching Ability", "Communication Skills",
        "Research Aptitude", "Problem Solving", "Confidence & Presentation"
    ];

    if (loading) return <div className="p-8 text-gray-400 animate-pulse">Loading evaluation form...</div>;

    return (
        <div className="max-w-5xl mx-auto p-6 bg-slate-50 min-h-screen">
            {/* Header */}
            <header className="bg-white p-6 rounded-xl border border-gray-200 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center font-bold text-purple-700 text-xl">
                        {getInitials(candidate?.candidate)}
                    </div>
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            {candidate?.candidate || "Unknown Candidate"}
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">Current Slot</span>
                        </h1>
                        <p className="text-sm text-gray-500 flex gap-4 mt-1">
                            <span>🎓 {details.education}</span>
                            <span>💻 {candidate?.dept || "N/A"}</span>
                            <span>💼 {details.experience}</span>
                        </p>
                    </div>
                </div>
                <div className="text-right text-sm text-gray-600">
                    <p>🕒 {details.time} (Current Slot)</p>
                    <p className="text-pink-600">📍 {details.room}</p>
                </div>
            </header>

            {/* Evaluation Criteria Grid */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-lg">Evaluation Criteria</h2>
                    <span className="text-sm text-gray-500">Scores: 1 (Poor) to 5 (Excellent)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {criteriaList.map((crit) => (
                        <div key={crit} className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium">{crit}</span>
                                <Info size={14} className="text-gray-400" />
                            </div>
                            <div className="flex border rounded overflow-hidden">
                                {[1, 2, 3, 4, 5].map((n) => (
                                    <button
                                        key={n}
                                        onClick={() => setScores(prev => ({ ...prev, [crit]: n }))}
                                        className={`flex-1 py-1 text-xs border-r last:border-0 transition-colors ${
                                            scores[crit] >= n 
                                                ? 'bg-blue-900 text-white' 
                                                : 'hover:bg-blue-50 bg-white'
                                        }`}
                                    >
                                        {n}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Detailed Observations */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 mb-6">
                <h2 className="font-bold mb-4">Detailed Observations</h2>
                <label className="text-sm font-medium">Interviewer Observations</label>
                <textarea
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    className="w-full border rounded-lg p-3 mt-1 mb-4 h-24"
                    placeholder="General notes about candidate's demeanor..."
                />
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium">Candidate Strengths</label>
                        <textarea value={strengths} onChange={(e) => setStrengths(e.target.value)} className="w-full border rounded-lg p-2 mt-1 h-20" placeholder="Highlights..." />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Areas for Improvement</label>
                        <textarea value={improvement} onChange={(e) => setImprovement(e.target.value)} className="w-full border rounded-lg p-2 mt-1 h-20" placeholder="Concerns..." />
                    </div>
                </div>
            </div>

            {/* Final Recommendation */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 flex justify-between items-center">
                <h2 className="font-bold">Final Recommendation</h2>
                <div className="flex gap-2">
                    {['Strongly Recommend', 'Recommend', 'Neutral', 'Reject'].map((rec) => (
                        <button
                            key={rec}
                            onClick={() => setSelectedRec(rec)}
                            className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                                selectedRec === rec ? 'bg-blue-900 text-white' : 'hover:bg-gray-50'
                            }`}
                        >{rec}</button>
                    ))}
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-between items-center mt-6">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-600">
                    <RotateCcw size={16} /> Reset Form
                </button>
                <div className="flex gap-4">
                    <button className="px-6 py-2 border rounded-lg font-semibold">Save Draft</button>
                    <button className="px-6 py-2 bg-blue-900 text-white rounded-lg font-semibold">Submit Evaluation</button>
                </div>
            </div>
        </div>
    );
};

export default EvaluationForms;