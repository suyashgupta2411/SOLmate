import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStudyGroup } from '../../contexts/StudyGroupContext';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';

export default function CreateGroupForm() {
  const { createStudyGroup, loading } = useStudyGroup();
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    description: '',
    maxMembers: 10,
    stakeRequirement: 0.1,
    duration: 30,
  });

  const subjects = [
    'Programming', 'Mathematics', 'Science', 'Technology', 'Business',
    'Language Learning', 'Art & Design', 'Music', 'Literature', 'History'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createStudyGroup(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <GlassCard className="p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Create Study Group</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Group Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Advanced JavaScript Study Group"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Subject
              </label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select a subject</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject} className="bg-dark-800">
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                placeholder="Describe what your study group will focus on..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Members
                </label>
                <input
                  type="number"
                  name="maxMembers"
                  value={formData.maxMembers}
                  onChange={handleChange}
                  min="2"
                  max="20"
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Stake (SOL)
                </label>
                <input
                  type="number"
                  name="stakeRequirement"
                  value={formData.stakeRequirement}
                  onChange={handleChange}
                  min="0.01"
                  max="10"
                  step="0.01"
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Duration (days)
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  min="7"
                  max="365"
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h4 className="text-blue-300 font-medium mb-2">Group Settings</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Members stake {formData.stakeRequirement} SOL to join</li>
                <li>• Group runs for {formData.duration} days</li>
                <li>• Rewards distributed based on participation</li>
                <li>• Democratic governance for group decisions</li>
              </ul>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full py-4 text-lg"
            >
              Create Study Group
            </Button>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
}