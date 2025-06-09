import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Edit, 
  Trophy, 
  Coins, 
  Users, 
  Calendar,
  Star,
  Target,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useStudyGroup } from '../contexts/StudyGroupContext';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';

export default function Profile() {
  const { userProfile, updateProfile } = useAuth();
  const { getUserStats } = useStudyGroup();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: userProfile?.username || '',
    bio: userProfile?.bio || '',
    interests: userProfile?.interests || [],
  });

  const userStats = getUserStats();

  const achievements = [
    { name: 'First Steps', description: 'Joined your first study group', earned: userStats.groupsJoined > 0 },
    { name: 'Consistent Learner', description: '7-day study streak', earned: userStats.currentStreak >= 7 },
    { name: 'Helper', description: 'Sent 10 tips to other members', earned: userStats.totalTips >= 10 },
    { name: 'Popular Choice', description: 'Received 50 tips from peers', earned: userStats.totalTips >= 50 },
    { name: 'Group Leader', description: 'Created a successful study group', earned: false },
    { name: 'Democracy Advocate', description: 'Voted on 10 proposals', earned: false },
  ];

  const stats = [
    { label: 'Groups Joined', value: userStats.groupsJoined, icon: Users, color: 'text-primary-400' },
    { label: 'Total Tips Received', value: userStats.totalTips, icon: Coins, color: 'text-yellow-400' },
    { label: 'Current Streak', value: userStats.currentStreak, icon: Calendar, color: 'text-green-400' },
    { label: 'Achievements', value: achievements.filter(a => a.earned).length, icon: Trophy, color: 'text-accent-400' },
  ];

  const handleSave = async () => {
    await updateProfile(formData);
    setEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      username: userProfile?.username || '',
      bio: userProfile?.bio || '',
      interests: userProfile?.interests || [],
    });
    setEditing(false);
  };

  return (
    <div className="min-h-screen bg-dark-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GlassCard className="p-8 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <div className="w-20 h-20 bg-gradient-to-r from-accent-500 to-primary-500 rounded-full flex items-center justify-center">
                  <User className="h-10 w-10 text-white" />
                </div>
                <div>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      className="text-2xl font-bold bg-white/10 border border-gray-700 rounded px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                    />
                  ) : (
                    <h1 className="text-3xl font-bold text-white">{userProfile?.username}</h1>
                  )}
                  <p className="text-gray-300">{userProfile?.email}</p>
                  <p className="text-sm text-gray-400">
                    Member since {userProfile?.joinDate ? new Date(userProfile.joinDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                {editing ? (
                  <>
                    <Button variant="secondary\" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <Button variant="secondary" onClick={() => setEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>

            {/* Bio */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-white mb-2">Bio</h3>
              {editing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  className="w-full h-24 bg-white/10 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none"
                  placeholder="Tell us about yourself and your learning goals..."
                />
              ) : (
                <p className="text-gray-300">
                  {userProfile?.bio || 'No bio added yet. Click edit to add one!'}
                </p>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {stats.map((stat, index) => (
            <GlassCard key={index} className="p-4 text-center">
              <stat.icon className={`h-8 w-8 ${stat.color} mx-auto mb-2`} />
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-gray-300">{stat.label}</div>
            </GlassCard>
          ))}
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <GlassCard className="p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Trophy className="h-6 w-6 mr-2 text-accent-400" />
              Achievements
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`p-4 rounded-lg border ${
                    achievement.earned 
                      ? 'bg-gradient-to-r from-accent-500/20 to-primary-500/20 border-accent-500/30' 
                      : 'bg-white/5 border-gray-700'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${
                      achievement.earned ? 'bg-accent-500/20' : 'bg-gray-500/20'
                    }`}>
                      {achievement.earned ? (
                        <Star className="h-5 w-5 text-yellow-400" />
                      ) : (
                        <Target className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${
                        achievement.earned ? 'text-white' : 'text-gray-400'
                      }`}>
                        {achievement.name}
                      </h3>
                      <p className={`text-sm ${
                        achievement.earned ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        {achievement.description}
                      </p>
                    </div>
                    {achievement.earned && (
                      <TrendingUp className="h-4 w-4 text-green-400" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}