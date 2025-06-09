import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useStudyGroup } from "../contexts/StudyGroupContext";
import StudyGroupCard from "../components/groups/StudyGroupCard";
import GlassCard from "../components/ui/GlassCard";
import Button from "../components/ui/Button";

export default function Groups() {
  const { studyGroups, fetchStudyGroups, joinGroup, loading, isMemberOfGroup } =
    useStudyGroup();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [sortBy, setSortBy] = useState("members");

  useEffect(() => {
    fetchStudyGroups();
  }, []);

  const subjects = [
    "All",
    "Programming",
    "Mathematics",
    "Science",
    "Technology",
    "Business",
  ];

  const filteredGroups = studyGroups
    .filter((group) => {
      const matchesSearch =
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSubject =
        !selectedSubject ||
        selectedSubject === "All" ||
        group.subject === selectedSubject;
      return matchesSearch && matchesSubject;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "members":
          return b.currentMembers - a.currentMembers;
        case "stake":
          return a.stakeRequirement - b.stakeRequirement;
        case "reward":
          return b.rewardPool - a.rewardPool;
        default:
          return 0;
      }
    });

  const handleJoinGroup = async (groupId: string) => {
    await joinGroup(groupId);
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Study Groups
              </h1>
              <p className="text-gray-300 text-lg">
                Discover and join study groups that match your interests
              </p>
            </div>
            <Link to="/create-group">
              <Button className="mt-4 sm:mt-0">
                <Plus className="h-4 w-4 mr-2" />
                Create Group
              </Button>
            </Link>
          </div>

          {/* Filters */}
          <GlassCard className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                    placeholder="Search groups..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                >
                  {subjects.map((subject) => (
                    <option
                      key={subject}
                      value={subject === "All" ? "" : subject}
                      className="bg-dark-800"
                    >
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                >
                  <option value="members" className="bg-dark-800">
                    Most Popular
                  </option>
                  <option value="stake" className="bg-dark-800">
                    Lowest Stake
                  </option>
                  <option value="reward" className="bg-dark-800">
                    Highest Rewards
                  </option>
                </select>
              </div>

              <div className="flex items-end">
                <Button variant="secondary" className="w-full">
                  <Filter className="h-4 w-4 mr-2" />
                  Advanced
                </Button>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Groups Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <GlassCard className="p-6 h-96">
                  <div className="h-6 bg-white/20 rounded mb-4"></div>
                  <div className="h-4 bg-white/10 rounded mb-2"></div>
                  <div className="h-4 bg-white/10 rounded mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-white/10 rounded"></div>
                    <div className="h-3 bg-white/10 rounded"></div>
                    <div className="h-3 bg-white/10 rounded"></div>
                  </div>
                </GlassCard>
              </div>
            ))}
          </div>
        ) : filteredGroups.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredGroups.map((group, index) => {
              const isMember = isMemberOfGroup(group.id);
              return (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <StudyGroupCard
                    group={group}
                    onJoin={handleJoinGroup}
                    onView={(id) => console.log("View group:", id)}
                    isMember={isMember}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <GlassCard className="p-12 text-center">
              <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-white mb-2">
                No Groups Found
              </h3>
              <p className="text-gray-300 mb-6">
                Try adjusting your search criteria or create a new study group.
              </p>
              <Link to="/create-group">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Group
                </Button>
              </Link>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </div>
  );
}
