import { useState } from 'react';

export default function JobManagementImpl() {
  const [formData, setFormData] = useState({
    jobTitle: '',
    department: '',
    specialization: '',
    qualifications: '',
    salary: '',
    minExperience: '',
    vacancies: '',
    startDate: '',
    endDate: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const sendJobToDatabase = async (statusType) => {
    if (!formData.jobTitle || !formData.department) {
      alert('Validation Error: Please fill in the core Job Title and Department fields.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          status: statusType,
        }),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`Server returned status code: ${response.status}${text ? ` - ${text}` : ''}`);
      }

      await response.json();
      alert(`Success: Vacancy successfully posted as [${statusType}] inside engine system database.`);

      setFormData({
        jobTitle: '',
        department: '',
        specialization: '',
        qualifications: '',
        salary: '',
        minExperience: '',
        vacancies: '',
        startDate: '',
        endDate: '',
      });
    } catch (err) {
      alert(`Pipeline error encountered: ${err?.message || 'Unknown network error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendJobToDatabase('PUBLISHED');
  };

  const handleSaveDraft = () => {
    sendJobToDatabase('DRAFT');
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
      <h1 className="text-2xl font-bold text-primary mb-8 font-headline">Vacancy Details</h1>

      <form onSubmit={handleSubmit} className="max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Job Title</label>
              <input
                name="jobTitle"
                type="text"
                required
                value={formData.jobTitle}
                onChange={handleInputChange}
                placeholder="e.g., Assistant Professor, Senior Lecturer"
                className="w-full border border-outline-variant rounded-lg px-4 py-2.5 focus:ring-primary focus:border-primary transition-all bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Department</label>
              <input
                name="department"
                type="text"
                required
                value={formData.department}
                onChange={handleInputChange}
                placeholder="e.g., School of Computer Science & Engineering"
                className="w-full border border-outline-variant rounded-lg px-4 py-2.5 focus:ring-primary focus:border-primary transition-all bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Specialization</label>
              <textarea
                name="specialization"
                rows="4"
                value={formData.specialization}
                onChange={handleInputChange}
                placeholder="e.g., Artificial Intelligence, Machine Learning, Deep Learning, NLP architectures"
                className="w-full border border-outline-variant rounded-lg px-4 py-2.5 focus:ring-primary focus:border-primary transition-all bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Qualifications</label>
              <textarea
                name="qualifications"
                rows="4"
                value={formData.qualifications}
                onChange={handleInputChange}
                placeholder="e.g., Ph.D. in Computer Science or core engineering domain with dynamic journal publications"
                className="w-full border border-outline-variant rounded-lg px-4 py-2.5 focus:ring-primary focus:border-primary transition-all bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Salary</label>
              <textarea
                name="salary"
                rows="4"
                value={formData.salary}
                onChange={handleInputChange}
                placeholder="e.g., ₹14,40,000 consolidated per annum (Basic pay ₹57,700 under Level 10 of the 7th CPC matrix)"
                className="w-full border border-outline-variant rounded-lg px-4 py-2.5 focus:ring-primary focus:border-primary transition-all bg-white"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Minimum years of experience</label>
              <input
                name="minExperience"
                type="text"
                placeholder="e.g., 2-5 years"
                value={formData.minExperience}
                onChange={handleInputChange}
                className="w-full border border-outline-variant rounded-lg px-4 py-2.5 focus:ring-primary focus:border-primary transition-all bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Number of Vacancies</label>
              <input
                name="vacancies"
                type="text"
                placeholder="e.g., 5"
                value={formData.vacancies}
                onChange={handleInputChange}
                className="w-full border border-outline-variant rounded-lg px-4 py-2.5 focus:ring-primary focus:border-primary transition-all bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Application Start</label>
              <div className="relative">
                <input
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full border border-outline-variant rounded-lg px-4 py-2.5 focus:ring-primary focus:border-primary transition-all bg-white text-gray-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Application deadline</label>
              <div className="relative">
                <input
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full border border-outline-variant rounded-lg px-4 py-2.5 focus:ring-primary focus:border-primary transition-all bg-white text-gray-700"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-6 mt-12 mb-20">
          <button
            type="button"
            disabled={submitting}
            onClick={handleSaveDraft}
            className="w-56 py-3 border border-outline rounded-lg text-gray-700 font-bold hover:bg-gray-50 transition-colors disabled:opacity-40"
          >
            {submitting ? 'Processing...' : 'Save as Draft'}
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="w-56 py-3 bg-primary text-white rounded-lg font-bold hover:opacity-90 transition-colors shadow-sm disabled:opacity-40"
          >
            {submitting ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </form>
    </div>
  );
}

