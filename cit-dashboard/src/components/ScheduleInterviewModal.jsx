import { useState } from 'react';
import { apiPost } from '../services/api';
import toast from 'react-hot-toast';

export default function ScheduleInterviewModal({ onClose, onSuccess }) {
  const [candidateId, setCandidateId] = useState('');
  const [jobId, setJobId] = useState('');
  const [interviewType, setInterviewType] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewRound, setInterviewRound] = useState(1);
  const [interviewers, setInterviewers] = useState('');
  const [mode, setMode] = useState('online');
  const [meetingLink, setMeetingLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!candidateId || !jobId || !interviewType || !interviewDate) {
      toast.error('Please fill in all required fields');
      return;
    }
    setIsSubmitting(true);
    try {
      await apiPost('/api/interviews', {
        candidateId: Number(candidateId),
        jobId: Number(jobId),
        interviewType,
        interviewDate,
        interviewRound: Number(interviewRound),
        interviewers,
        mode,
        meetingLink,
      });
      toast.success('Interview scheduled');
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error('Failed to schedule interview');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Schedule Interview</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="number"
            placeholder="Candidate ID"
            value={candidateId}
            onChange={(e) => setCandidateId(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
          <input
            type="number"
            placeholder="Job ID"
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
          <input
            type="text"
            placeholder="Interview Type"
            value={interviewType}
            onChange={(e) => setInterviewType(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
          <input
            type="datetime-local"
            placeholder="Interview Date & Time"
            value={interviewDate}
            onChange={(e) => setInterviewDate(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
          <input
            type="number"
            placeholder="Round"
            value={interviewRound}
            onChange={(e) => setInterviewRound(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            min="1"
          />
          <input
            type="text"
            placeholder="Interviewers (comma separated)"
            value={interviewers}
            onChange={(e) => setInterviewers(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>
          <input
            type="url"
            placeholder="Meeting Link"
            value={meetingLink}
            onChange={(e) => setMeetingLink(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
