import React from "react";
// import { motion } from "framer-motion";
import { Users, Clock, Coins, TrendingUp } from "lucide-react";
import { StudyGroup } from "../../contexts/StudyGroupContext";
import GlassCard from "../ui/GlassCard";
import Button from "../ui/Button";

interface StudyGroupCardProps {
  group: StudyGroup;
  onJoin?: (groupId: string) => void;
  onView?: (groupId: string) => void;
  showJoinButton?: boolean;
  isMember?: boolean;
}

export default function StudyGroupCard({
  group,
  onJoin,
  onView,
  showJoinButton = true,
  isMember = false,
}: StudyGroupCardProps) {
  const participationRate =
    group.maxMembers > 0
      ? Math.round((group.currentMembers / group.maxMembers) * 100)
      : 0;

  return (
    <GlassCard hover className="p-6 h-full flex flex-col">
      <div className="flex-1">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {group.name}
            </h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-500/20 text-accent-300 border border-accent-500/30">
              {group.subject}
            </span>
          </div>
          <div className="flex items-center text-green-400">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">{participationRate}%</span>
          </div>
        </div>

        <p className="text-gray-300 text-sm mb-6 line-clamp-3">
          {group.description}
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center text-gray-300">
            <Users className="h-4 w-4 mr-2 text-primary-400" />
            <span className="text-sm">
              {group.currentMembers}/{group.maxMembers}
            </span>
          </div>
          <div className="flex items-center text-gray-300">
            <Clock className="h-4 w-4 mr-2 text-accent-400" />
            <span className="text-sm">{group.duration} days</span>
          </div>
          <div className="flex items-center text-gray-300">
            <Coins className="h-4 w-4 mr-2 text-yellow-400" />
            <span className="text-sm">{group.stakeRequirement} SOL</span>
          </div>
          <div className="flex items-center text-gray-300">
            <TrendingUp className="h-4 w-4 mr-2 text-green-400" />
            <span className="text-sm">{group.rewardPool} SOL pool</span>
          </div>
        </div>
      </div>

      <div className="flex space-x-3">
        {onView && (
          <Button
            variant="secondary"
            onClick={() => onView(group.id)}
            className="flex-1"
          >
            View Details
          </Button>
        )}
        {showJoinButton &&
          onJoin &&
          group.currentMembers < group.maxMembers && (
            <Button
              variant="primary"
              onClick={() => onJoin(group.id)}
              className="flex-1"
              disabled={isMember}
            >
              {isMember ? "Joined" : "Join Group"}
            </Button>
          )}
      </div>
    </GlassCard>
  );
}
