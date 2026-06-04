import { useState } from 'react';

const Jobmanagement = () => {
  // Local state parameters to handle active inputs
  const [formData, setFormData] = useState({
    jobTitle: '',
    department: '',
    specialization: '',
    qualifications: '',
    salary: '',
    minExperience: '',
    vacancies: '',
    startDate: '',
    endDate: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Connect to backend later; this ensures the button is “real” once your DB is ready.
    try {
      // await apiPost('/api/jobs', { ...formData, status: 'PUBLISHED' });
      alert('Publish clicked. Integrate backend POST /api/jobs when ready.');
    } catch (err) {
      alert(`Publish failed: ${err?.message || 'Unknown error'}`);
    }
  };

  const handleSaveDraft = async () => {
    try {
      // await apiPost('/api/jobs', { ...formData, status: 'DRAFT' });
      alert('Save as Draft clicked. Integrate backend POST /api/jobs when ready.');
    } catch (err) {
      alert(`Draft save failed: ${err?.message || 'Unknown error'}`);
    }
  };


  return (
    <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
      <h1 className="text-2xl font-bold text-primary mb-8 font-headline">Vacancy Details</h1>
      
      <form onSubmit={handleSubmit} className="max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          
          {/* Left Column */}
          <div className="space-y-6">
            {/* Job Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Job Title</label>
              <input 
                name="jobTitle"
                type="text" 
                value={formData.jobTitle}
                onChange={handleInputChange}
                placeholder="e.g., Assistant Professor, Senior Lecturer"
                className="w-full border border-outline-variant rounded-lg px-4 py-2.5 focus:ring-primary focus:border-primary transition-all bg-white" 
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Department</label>
              <input 
                name="department"
                type="text" 
                value={formData.department}
                onChange={handleInputChange}
                placeholder="e.g., School of Computer Science & Engineering"
                className="w-full border border-outline-variant rounded-lg px-4 py-2.5 focus:ring-primary focus:border-primary transition-all bg-white" 
              />
            </div>

            {/* Specialization */}
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

            {/* Qualifications */}
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

            {/* Salary */}
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

          {/* Right Column */}
          <div className="space-y-6">
            {/* Min Experience */}
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

            {/* Number of Vacancies */}
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

            {/* Application Start Date */}
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

            {/* Application Deadline */}
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

        {/* Form Action Triggers */}
        <div className="flex items-center space-x-6 mt-12 mb-20">
          <button 
            type="button" 
            onClick={handleSaveDraft}
            className="w-56 py-3 border border-blue-200 bg-blue-100 text-blue-900 rounded-lg font-bold hover:bg-blue-700 hover:text-white hover:border-blue-700 transition-colors duration-200 shadow-sm"          >
            Save as Draft
          </button>
          <button 
            type="submit" 
            className="w-56 py-3 border border-blue-200 bg-blue-100 text-blue-900 rounded-lg font-bold hover:bg-blue-700 hover:text-white hover:border-blue-700 transition-colors duration-200 shadow-sm"
          >Publish</button>
        </div>
      </form>
    </div>
  );
};

export default Jobmanagement;