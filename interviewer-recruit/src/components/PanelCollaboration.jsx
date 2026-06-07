import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Paperclip, Send } from 'lucide-react';

const PanelCollaboration = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const candidate = state?.candidate;

    // Logic: Name-only initials
    const getInitials = (name) => {
        if (!name) return "??";
        const cleanName = name.replace(/(Dr\.|Mr\.|Ms\.|Mrs\.|Prof\.|PhD|MSc|BSc)\.?/gi, "").trim();
        const parts = cleanName.split(' ').filter(p => p.length > 0);
        if (parts.length === 0) return "??";
        return parts.length === 1 ? parts[0].substring(0, 2).toUpperCase() : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    // State
    const [notes, setNotes] = useState("");
    const [popup, setPopup] = useState(null);
    const [postedNotes, setPostedNotes] = useState([
        { name: "Dr. Aris Thorne", role: "Senior Faculty", text: "Dr. Sen's presentation on LLMs was exceptionally clear.", tag: "Teaching Focus" }
    ]);

    const handlePostNote = () => {
    // If empty, use '--', otherwise use the text provided
    const noteContent = notes.trim() === "" ? "--" : notes;

    setPostedNotes([...postedNotes, { 
        name: "You", 
        role: "Interviewer", 
        text: noteContent, 
        tag: "Observation" 
    }]);

    setNotes(""); // Clears the textarea
    setPopup("Note Posted Successfully!");
};

    if (!candidate) return <div className="p-10">No candidate selected.</div>;

    return (
        <div className="max-w-6xl mx-auto p-6 bg-slate-50 min-h-screen">
            <header className="bg-white p-4 rounded-xl border flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center font-bold text-purple-700">
                        {getInitials(candidate.candidate)}
                    </div>
                    <div>
                        <h1 className="font-bold text-lg">{candidate.candidate} <span className="text-gray-400 font-normal">(ID - {candidate.id || "N/A"})</span></h1>
                        <p className="text-sm text-gray-500">💻 {candidate.dept || "N/A"} | 🕒 {candidate.time || "N/A"}</p>
                    </div>
                </div>
                <button onClick={() => setPopup("Panel: Dr. Aris Thorne, Prof. David Chen, Dr. Sarah Lee, Dr. John Doe, Dr. Ray")} className="bg-purple-50 text-purple-700 px-4 py-2 rounded-full text-sm font-bold border border-purple-200">
                    5 Members ● In Discussion
                </button>
            </header>

            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-4">
                    <h2 className="font-bold border-b-2 border-blue-600 inline-block pb-1">Panel Discussion & Shared Notes</h2>
                    
                    {postedNotes.map((n, i) => (
                        <div key={i} className="bg-white p-4 rounded-lg border">
                            <div className="flex justify-between mb-2">
                                <p className="font-bold text-sm">{n.name} <span className="text-gray-400 font-normal">| {n.role}</span></p>
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded">{n.tag}</span>
                            </div>
                            <p className="text-sm text-gray-700 italic">"{n.text}"</p>
                        </div>
                    ))}

                    <div className="bg-white p-4 rounded-lg border border-dashed border-gray-300">
                        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full text-sm outline-none h-20" placeholder="Type your notes here..." />
                        <div className="flex justify-between items-center mt-4">
                            <button className="text-sm text-gray-500 flex items-center gap-2"><Paperclip size={16}/> Attach</button>
                            <button onClick={handlePostNote} className="bg-blue-900 text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2"><Send size={16}/> Post Note</button>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div onClick={() => setPopup("Consensus Status: High Agreement reached among 4 of 5 panel members.")} className="bg-blue-900 text-white p-6 rounded-xl cursor-pointer hover:bg-blue-800 transition">
                        <p className="text-xs uppercase opacity-75">Panel Consensus Status</p>
                        <p className="text-2xl font-bold my-2">4/5 Submitted</p>
                        <div className="bg-blue-800 py-2 rounded text-center text-sm font-bold">High Agreement</div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border">
                        <p className="text-sm font-bold mb-4">Average Panel Rating</p>
                        <p className="text-4xl font-bold text-blue-900">4.7<span className="text-lg text-gray-400">/5.0</span></p>
                    </div>

                    <button onClick={() => setPopup("Panel Discussion has been finalized.")} className="w-full bg-blue-900 text-white py-3 rounded-lg font-bold">Finalize Panel Decision</button>
                </div>
            </div>

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
};

export default PanelCollaboration;
