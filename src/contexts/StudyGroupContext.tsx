import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

export interface StudyGroup {
  id: string;
  name: string;
  subject: string;
  description: string;
  maxMembers: number;
  currentMembers: number;
  stakeRequirement: number;
  rewardPool: number;
  duration: number;
  isActive: boolean;
  createdAt: Date;
  creatorId: string;
  members: Member[];
  governanceSettings: GovernanceSettings;
}

export interface Member {
  publicKey: string;
  userId: string;
  stakeAmount: number;
  checkInCount: number;
  currentStreak: number;
  totalTipsReceived: number;
  participationScore: number;
  joinDate: Date;
  isActive: boolean;
  achievements: string[];
}

export interface GovernanceProposal {
  id: string;
  groupId: string;
  proposer: string;
  proposalType: 'CHANGE_TOPIC' | 'UPDATE_SCHEDULE' | 'ADD_RESOURCE' | 'MODIFY_STAKE';
  description: string;
  votesFor: number;
  votesAgainst: number;
  votingDeadline: Date;
  executionStatus: 'PENDING' | 'EXECUTED' | 'REJECTED';
  requiredThreshold: number;
}

interface GovernanceSettings {
  votingPeriod: number;
  quorumThreshold: number;
  proposalThreshold: number;
}

interface StudyGroupContextType {
  studyGroups: StudyGroup[];
  userGroups: StudyGroup[];
  loading: boolean;
  createStudyGroup: (groupData: Partial<StudyGroup>) => Promise<void>;
  joinGroup: (groupId: string, stakeAmount: number) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  dailyCheckIn: (groupId: string) => Promise<void>;
  tipMember: (groupId: string, recipient: string, amount: number, category: string) => Promise<void>;
  createProposal: (groupId: string, proposalType: string, description: string) => Promise<void>;
  voteOnProposal: (proposalId: string, voteChoice: boolean) => Promise<void>;
  claimRewards: (groupId: string) => Promise<void>;
  fetchStudyGroups: () => Promise<void>;
  getUserStats: () => { groupsJoined: number; totalTips: number; currentStreak: number; achievements: number };
}

const StudyGroupContext = createContext<StudyGroupContextType | undefined>(undefined);

export function useStudyGroup() {
  const context = useContext(StudyGroupContext);
  if (!context) {
    throw new Error('useStudyGroup must be used within a StudyGroupProvider');
  }
  return context;
}

interface StudyGroupProviderProps {
  children: ReactNode;
}

export function StudyGroupProvider({ children }: StudyGroupProviderProps) {
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [userGroups, setUserGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchStudyGroups();
      fetchUserGroups();
    }
  }, [user]);

  const fetchStudyGroups = async () => {
    setLoading(true);
    try {
      const groupsRef = collection(db, 'studyGroups');
      const snapshot = await getDocs(groupsRef);
      
      const groups: StudyGroup[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        groups.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          members: data.members || [],
          governanceSettings: data.governanceSettings || {
            votingPeriod: 7,
            quorumThreshold: 60,
            proposalThreshold: 10,
          },
        } as StudyGroup);
      });
      
      setStudyGroups(groups);
    } catch (error) {
      console.error('Error fetching study groups:', error);
      toast.error('Failed to fetch study groups');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserGroups = async () => {
    if (!user) return;
    
    try {
      const groupsRef = collection(db, 'studyGroups');
      const q = query(groupsRef, where('members', 'array-contains', { userId: user.uid }));
      const snapshot = await getDocs(q);
      
      const groups: StudyGroup[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        groups.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          members: data.members || [],
        } as StudyGroup);
      });
      
      setUserGroups(groups);
    } catch (error) {
      console.error('Error fetching user groups:', error);
    }
  };

  const createStudyGroup = async (groupData: Partial<StudyGroup>) => {
    if (!publicKey || !user) {
      toast.error('Please connect your wallet and sign in');
      return;
    }

    setLoading(true);
    try {
      const newGroup = {
        ...groupData,
        creatorId: user.uid,
        currentMembers: 0,
        rewardPool: 0,
        isActive: true,
        createdAt: new Date(),
        members: [],
        governanceSettings: {
          votingPeriod: 7,
          quorumThreshold: 60,
          proposalThreshold: 10,
        },
      };

      await addDoc(collection(db, 'studyGroups'), newGroup);
      toast.success('Study group created successfully!');
      await fetchStudyGroups();
    } catch (error) {
      console.error('Error creating study group:', error);
      toast.error('Failed to create study group');
    } finally {
      setLoading(false);
    }
  };

  const joinGroup = async (groupId: string, stakeAmount: number) => {
    if (!publicKey || !user) {
      toast.error('Please connect your wallet and sign in');
      return;
    }

    setLoading(true);
    try {
      const groupRef = doc(db, 'studyGroups', groupId);
      const group = studyGroups.find(g => g.id === groupId);
      
      if (!group) {
        toast.error('Group not found');
        return;
      }

      const newMember: Member = {
        publicKey: publicKey.toString(),
        userId: user.uid,
        stakeAmount,
        checkInCount: 0,
        currentStreak: 0,
        totalTipsReceived: 0,
        participationScore: 0,
        joinDate: new Date(),
        isActive: true,
        achievements: [],
      };

      const updatedMembers = [...group.members, newMember];
      
      await updateDoc(groupRef, {
        members: updatedMembers,
        currentMembers: updatedMembers.length,
        rewardPool: group.rewardPool + stakeAmount,
      });

      toast.success(`Successfully joined group! Staked ${stakeAmount} SOL`);
      await fetchStudyGroups();
      await fetchUserGroups();
    } catch (error) {
      console.error('Error joining group:', error);
      toast.error('Failed to join group');
    } finally {
      setLoading(false);
    }
  };

  const leaveGroup = async (groupId: string) => {
    if (!publicKey || !user) {
      toast.error('Please connect your wallet and sign in');
      return;
    }

    setLoading(true);
    try {
      const groupRef = doc(db, 'studyGroups', groupId);
      const group = studyGroups.find(g => g.id === groupId);
      
      if (!group) {
        toast.error('Group not found');
        return;
      }

      const updatedMembers = group.members.filter(m => m.userId !== user.uid);
      
      await updateDoc(groupRef, {
        members: updatedMembers,
        currentMembers: updatedMembers.length,
      });

      toast.success('Successfully left the group');
      await fetchStudyGroups();
      await fetchUserGroups();
    } catch (error) {
      console.error('Error leaving group:', error);
      toast.error('Failed to leave group');
    } finally {
      setLoading(false);
    }
  };

  const dailyCheckIn = async (groupId: string) => {
    if (!publicKey || !user) {
      toast.error('Please connect your wallet and sign in');
      return;
    }

    try {
      const groupRef = doc(db, 'studyGroups', groupId);
      const group = studyGroups.find(g => g.id === groupId);
      
      if (!group) {
        toast.error('Group not found');
        return;
      }

      const memberIndex = group.members.findIndex(m => m.userId === user.uid);
      if (memberIndex === -1) {
        toast.error('You are not a member of this group');
        return;
      }

      const updatedMembers = [...group.members];
      updatedMembers[memberIndex] = {
        ...updatedMembers[memberIndex],
        checkInCount: updatedMembers[memberIndex].checkInCount + 1,
        currentStreak: updatedMembers[memberIndex].currentStreak + 1,
        participationScore: updatedMembers[memberIndex].participationScore + 10,
      };

      await updateDoc(groupRef, { members: updatedMembers });
      toast.success('Daily check-in recorded! 🎉');
      await fetchStudyGroups();
      await fetchUserGroups();
    } catch (error) {
      console.error('Error recording check-in:', error);
      toast.error('Failed to record check-in');
    }
  };

  const tipMember = async (groupId: string, recipient: string, amount: number, category: string) => {
    if (!publicKey || !user) {
      toast.error('Please connect your wallet and sign in');
      return;
    }

    try {
      // In a real implementation, this would send a tip transaction
      toast.success(`Sent ${amount} SOL tip for ${category}!`);
    } catch (error) {
      console.error('Error sending tip:', error);
      toast.error('Failed to send tip');
    }
  };

  const createProposal = async (groupId: string, proposalType: string, description: string) => {
    if (!publicKey || !user) {
      toast.error('Please connect your wallet and sign in');
      return;
    }

    try {
      // In a real implementation, this would create a governance proposal
      toast.success('Proposal created successfully!');
    } catch (error) {
      console.error('Error creating proposal:', error);
      toast.error('Failed to create proposal');
    }
  };

  const voteOnProposal = async (proposalId: string, voteChoice: boolean) => {
    if (!publicKey || !user) {
      toast.error('Please connect your wallet and sign in');
      return;
    }

    try {
      // In a real implementation, this would record the vote
      toast.success(`Vote ${voteChoice ? 'for' : 'against'} recorded!`);
    } catch (error) {
      console.error('Error voting on proposal:', error);
      toast.error('Failed to vote on proposal');
    }
  };

  const claimRewards = async (groupId: string) => {
    if (!publicKey || !user) {
      toast.error('Please connect your wallet and sign in');
      return;
    }

    try {
      // In a real implementation, this would claim available rewards
      toast.success('Rewards claimed successfully!');
    } catch (error) {
      console.error('Error claiming rewards:', error);
      toast.error('Failed to claim rewards');
    }
  };

  const getUserStats = () => {
    if (!user) {
      return { groupsJoined: 0, totalTips: 0, currentStreak: 0, achievements: 0 };
    }

    const groupsJoined = userGroups.length;
    let totalTips = 0;
    let currentStreak = 0;
    let achievements = 0;

    userGroups.forEach(group => {
      const userMember = group.members.find(m => m.userId === user.uid);
      if (userMember) {
        totalTips += userMember.totalTipsReceived;
        currentStreak = Math.max(currentStreak, userMember.currentStreak);
        achievements += userMember.achievements.length;
      }
    });

    return { groupsJoined, totalTips, currentStreak, achievements };
  };

  const value: StudyGroupContextType = {
    studyGroups,
    userGroups,
    loading,
    createStudyGroup,
    joinGroup,
    leaveGroup,
    dailyCheckIn,
    tipMember,
    createProposal,
    voteOnProposal,
    claimRewards,
    fetchStudyGroups,
    getUserStats,
  };

  return (
    <StudyGroupContext.Provider value={value}>
      {children}
    </StudyGroupContext.Provider>
  );
}