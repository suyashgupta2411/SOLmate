import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Coins, 
  Trophy,
  Calendar,
  Target,
  Zap,
  Star
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useStudyGroup } from '../contexts/StudyGroupContext';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import StudyGroupCard from '../components/groups/StudyGroupCard';

export default function Dashboard() {
  const { userProfile } = useAuth();
  const { userGroups, fetchStudyGroups, loading, dailyCheckIn, getUserStats } = useStudyGroup();

  useEffect(() => {
    fetchStudyGroups();
  }, []);

  const stats = getUserStats();
  
  const dashboardStats = [
    {
      icon: Users,
      label: 'Groups Joined',
      value: stats.groupsJoined,
      color: 'text-primary-400',
    },
    {
      icon: Coins,
      label: 'Tips Received',
      value: stats.totalTips,
      color: 'text-yellow-400',
    },
    {
      icon: Trophy,
      label: 'Achievements',
      value: stats.achievements,
      color: 'text-accent-400',
    },
    {
      icon: Zap,
      label: 'Current Streak',
      value: stats.currentStreak,
      color: 'text-green-400',
    },
  ];

  const recentActivity = [
    { type: 'checkin', message: 'Daily check-in completed', time: '2 hours ago' },
    { type: 'tip', message: 'Received 0.01 SOL tip from @alice', time: '4 hours ago' },
    { type: 'achievement', message: 'Earned "Consistent Learner" badge', time: '1 day ago' },
    { type: 'vote', message: 'Voted on study schedule proposal', time: '2 days ago' },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'checkin': return <Calendar className="h-4 w-4 text-green-400" />;
      case 'tip': return <Coins className="h-4 w-4 text-yellow-400" />;
      case 'achievement': return <Trophy className="h-4 w-4 text-accent-400" />;
      case 'vote': return <Target className="h-4 w-4 text-primary-400" />;
      default: return <Star className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {userProfile?.username || 'Learner'}! 👋
          </h1>
          <p className="text-gray-300 text-lg">
            Here's your learning progress and recent activity.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardStats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <GlassCard hover className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">{stat.label}</p>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <GlassCard className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button 
                  variant="primary" 
                  className="w-full justify-start"
                  onClick={() => userGroups.length > 0 && dailyCheckIn(userGroups[0].id)}
                  disabled={userGroups.length === 0}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Daily Check-in
                </Button>
                <Button variant="secondary" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Browse Groups
                </Button>
                <Button variant="secondary" className="w-full justify-start">
                  <Trophy className="h-4 w-4 mr-2" />
                  View Achievements
                </Button>
              </div>
            </GlassCard>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-2"
          >
            <GlassCard className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
              {userGroups.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="mt-1">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm">{activity.message}</p>
                        <p className="text-gray-400 text-xs">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">No recent activity. Join a study group to get started!</p>
                </div>
              )}
            </GlassCard>
          </motion.div>
        </div>

        {/* Active Groups */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Your Study Groups</h2>
            <Button variant="secondary">View All</Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <GlassCard className="p-6 h-80">
                    <div className="h-4 bg-white/20 rounded mb-4"></div>
                    <div className="h-3 bg-white/10 rounded mb-2"></div>
                    <div className="h-3 bg-white/10 rounded mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-white/10 rounded"></div>
                      <div className="h-3 bg-white/10 rounded"></div>
                    </div>
                  </GlassCard>
                </div>
              ))}
            </div>
          ) : userGroups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userGroups.slice(0, 3).map((group) => (
                <StudyGroupCard
                  key={group.id}
                  group={group}
                  showJoinButton={false}
                  onView={(id) => console.log('View group:', id)}
                />
              ))}
            </div>
          ) : (
            <GlassCard className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No Study Groups Yet
              </h3>
              <p className="text-gray-300 mb-4">
                Join your first study group to start earning rewards!
              </p>
              <Button>Browse Groups</Button>
            </GlassCard>
          )}
        </motion.div>
      </div>
    </div>
  );
}