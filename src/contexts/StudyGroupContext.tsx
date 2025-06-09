import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction, SystemProgram } from "@solana/web3.js";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

export interface StudyGroup {
  id: string;
  name: string;
  subject: string;
  description: string;
  maxMembers: number;
  currentMembers: number;
  stakeRequirement: number; // Fixed stake amount per group
  rewardPool: number;
  duration: number;
  isActive: boolean;
  createdAt: Date;
  creatorId: string;
  members: Member[];
  governanceSettings: GovernanceSettings;
  memberIds: string[]; // Track member IDs for easy lookup
}

export interface Member {
  publicKey: string;
  userId: string;
  stakeAmount: number; // Always equals group's stakeRequirement
  checkInCount: number;
  currentStreak: number;
  totalTipsReceived: number;
  participationScore: number;
  joinDate: Date;
  isActive: boolean;
  achievements: string[];
  lastCheckIn: Date | null;
}

export interface GovernanceProposal {
  id: string;
  groupId: string;
  proposer: string;
  proposalType:
    | "CHANGE_TOPIC"
    | "UPDATE_SCHEDULE"
    | "ADD_RESOURCE"
    | "MODIFY_STAKE";
  description: string;
  votesFor: number;
  votesAgainst: number;
  votingDeadline: Date;
  executionStatus: "PENDING" | "EXECUTED" | "REJECTED";
  requiredThreshold: number;
  voters: string[]; // Track who has voted to prevent double voting
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
  joinGroup: (groupId: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  dailyCheckIn: (groupId: string) => Promise<void>;
  tipMember: (
    groupId: string,
    recipient: string,
    amount: number,
    category: string
  ) => Promise<void>;
  createProposal: (
    groupId: string,
    proposalType: string,
    description: string
  ) => Promise<void>;
  voteOnProposal: (proposalId: string, voteChoice: boolean) => Promise<void>;
  claimRewards: (groupId: string) => Promise<void>;
  fetchStudyGroups: () => Promise<void>;
  getUserStats: () => {
    groupsJoined: number;
    totalTips: number;
    currentStreak: number;
    achievements: number;
  };
  isMemberOfGroup: (groupId: string) => boolean;
  canCheckInToday: (groupId: string) => boolean;
}

const StudyGroupContext = createContext<StudyGroupContextType | undefined>(
  undefined
);

export function useStudyGroup() {
  const context = useContext(StudyGroupContext);
  if (!context) {
    throw new Error("useStudyGroup must be used within a StudyGroupProvider");
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
      const groupsRef = collection(db, "studyGroups");
      const snapshot = await getDocs(groupsRef);

      const groups: StudyGroup[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        groups.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          members: data.members || [],
          memberIds: data.memberIds || [],
          governanceSettings: data.governanceSettings || {
            votingPeriod: 7,
            quorumThreshold: 60,
            proposalThreshold: 10,
          },
        } as StudyGroup);
      });

      setStudyGroups(groups);
    } catch (error) {
      console.error("Error fetching study groups:", error);
      toast.error("Failed to fetch study groups");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserGroups = async () => {
    if (!user) return;

    try {
      const groupsRef = collection(db, "studyGroups");
      const q = query(
        groupsRef,
        where("memberIds", "array-contains", user.uid)
      );
      const snapshot = await getDocs(q);

      const groups: StudyGroup[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        groups.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          members: data.members || [],
          memberIds: data.memberIds || [],
        } as StudyGroup);
      });

      setUserGroups(groups);
    } catch (error) {
      console.error("Error fetching user groups:", error);
    }
  };

  const createStudyGroup = async (groupData: Partial<StudyGroup>) => {
    if (!publicKey || !user) {
      toast.error("Please connect your wallet and sign in");
      return;
    }

    // Validate input data
    if (!groupData.name || groupData.name.trim().length === 0) {
      toast.error("Group name is required");
      return;
    }

    if (!groupData.subject || groupData.subject.trim().length === 0) {
      toast.error("Subject is required");
      return;
    }

    if (!groupData.description || groupData.description.trim().length === 0) {
      toast.error("Description is required");
      return;
    }

    // Enforce minimum stake requirement of 0.001 SOL
    if (!groupData.stakeRequirement || groupData.stakeRequirement < 0.001) {
      toast.error("Stake requirement must be at least 0.001 SOL");
      return;
    }

    if (!groupData.maxMembers || groupData.maxMembers < 2) {
      toast.error("Group must allow at least 2 members");
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
        memberIds: [], // Initialize empty member IDs array
        governanceSettings: {
          votingPeriod: 7,
          quorumThreshold: 60,
          proposalThreshold: 10,
        },
      };

      await addDoc(collection(db, "studyGroups"), newGroup);
      toast.success("Study group created successfully!");
      await fetchStudyGroups();
    } catch (error) {
      console.error("Error creating study group:", error);
      toast.error("Failed to create study group");
    } finally {
      setLoading(false);
    }
  };

  const isMemberOfGroup = (groupId: string): boolean => {
    if (!user) return false;
    const group = studyGroups.find((g) => g.id === groupId);
    return group ? group.memberIds.includes(user.uid) : false;
  };

  const joinGroup = async (groupId: string) => {
    if (!publicKey || !user) {
      toast.error("Please connect your wallet and sign in");
      return;
    }

    // Check if user is already a member
    if (isMemberOfGroup(groupId)) {
      toast.error("You are already a member of this group");
      return;
    }

    setLoading(true);
    try {
      const groupRef = doc(db, "studyGroups", groupId);
      const groupDoc = await getDoc(groupRef);

      if (!groupDoc.exists()) {
        toast.error("Group not found");
        return;
      }

      const group = { id: groupDoc.id, ...groupDoc.data() } as StudyGroup;

      // Validate group state
      if (!group.isActive) {
        toast.error("This group is no longer active");
        return;
      }

      if (group.currentMembers >= group.maxMembers) {
        toast.error("This group is full");
        return;
      }

      // Always use the group's fixed stake requirement
      const stakeAmount = group.stakeRequirement;
      if (!stakeAmount || stakeAmount < 0.001) {
        toast.error("Invalid group stake requirement");
        return;
      }

      // --- On-chain transfer logic ---
      // Replace this with your actual group reward pool address logic
      // For now, using a placeholder public key (replace with real group pool address)
      const GROUP_POOL_ADDRESS = new PublicKey(
        "11111111111111111111111111111111"
      ); // TODO: Replace
      const transaction = new Transaction().add(
        // This is a simple SOL transfer; replace with your Anchor program call if needed
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: GROUP_POOL_ADDRESS,
          lamports: Math.floor(stakeAmount * 1e9), // Convert SOL to lamports
        })
      );
      try {
        const signature = await sendTransaction(transaction, connection);
        await connection.confirmTransaction(signature, "confirmed");
      } catch {
        toast.error("SOL transfer failed or was rejected");
        setLoading(false);
        return;
      }
      // --- End on-chain transfer logic ---

      // Now update Firebase after successful on-chain transfer
      const newMember: Member = {
        publicKey: publicKey.toString(),
        userId: user.uid,
        stakeAmount: stakeAmount, // Use group's fixed stake requirement
        checkInCount: 0,
        currentStreak: 0,
        totalTipsReceived: 0,
        participationScore: 0,
        joinDate: new Date(),
        isActive: true,
        achievements: [],
        lastCheckIn: null,
      };

      const updatedMembers = [...group.members, newMember];
      const updatedMemberIds = [...group.memberIds, user.uid];

      await updateDoc(groupRef, {
        members: updatedMembers,
        memberIds: updatedMemberIds,
        currentMembers: updatedMembers.length,
        rewardPool: group.rewardPool + stakeAmount, // Add fixed stake amount
      });

      toast.success(`Successfully joined group! Staked ${stakeAmount} SOL`);
      await fetchStudyGroups();
      await fetchUserGroups();
    } catch (error) {
      console.error("Error joining group:", error);
      toast.error("Failed to join group");
    } finally {
      setLoading(false);
    }
  };

  const leaveGroup = async (groupId: string) => {
    if (!publicKey || !user) {
      toast.error("Please connect your wallet and sign in");
      return;
    }

    if (!isMemberOfGroup(groupId)) {
      toast.error("You are not a member of this group");
      return;
    }

    setLoading(true);
    try {
      const groupRef = doc(db, "studyGroups", groupId);
      const groupDoc = await getDoc(groupRef);

      if (!groupDoc.exists()) {
        toast.error("Group not found");
        return;
      }

      const group = { id: groupDoc.id, ...groupDoc.data() } as StudyGroup;

      const updatedMembers = group.members.filter((m) => m.userId !== user.uid);
      const updatedMemberIds = group.memberIds.filter((id) => id !== user.uid);

      // Find the leaving member to get their stake amount
      const leavingMember = group.members.find((m) => m.userId === user.uid);
      const stakeToRemove = leavingMember
        ? leavingMember.stakeAmount
        : group.stakeRequirement;

      await updateDoc(groupRef, {
        members: updatedMembers,
        memberIds: updatedMemberIds,
        currentMembers: updatedMembers.length,
        rewardPool: Math.max(0, group.rewardPool - stakeToRemove), // Ensure non-negative
      });

      toast.success("Successfully left the group");
      await fetchStudyGroups();
      await fetchUserGroups();
    } catch (error) {
      console.error("Error leaving group:", error);
      toast.error("Failed to leave group");
    } finally {
      setLoading(false);
    }
  };

  const canCheckInToday = (groupId: string): boolean => {
    if (!user) return false;

    const group = userGroups.find((g) => g.id === groupId);
    if (!group) return false;

    const member = group.members.find((m) => m.userId === user.uid);
    if (!member || !member.isActive) return false;

    if (!member.lastCheckIn) return true;

    const today = new Date();
    const lastCheckIn = new Date(member.lastCheckIn);

    // Check if it's a different day
    return today.toDateString() !== lastCheckIn.toDateString();
  };

  const dailyCheckIn = async (groupId: string) => {
    if (!publicKey || !user) {
      toast.error("Please connect your wallet and sign in");
      return;
    }

    if (!isMemberOfGroup(groupId)) {
      toast.error("You are not a member of this group");
      return;
    }

    if (!canCheckInToday(groupId)) {
      toast.error("You have already checked in today");
      return;
    }

    try {
      const groupRef = doc(db, "studyGroups", groupId);
      const groupDoc = await getDoc(groupRef);

      if (!groupDoc.exists()) {
        toast.error("Group not found");
        return;
      }

      const group = { id: groupDoc.id, ...groupDoc.data() } as StudyGroup;

      const memberIndex = group.members.findIndex((m) => m.userId === user.uid);
      if (memberIndex === -1) {
        toast.error("You are not a member of this group");
        return;
      }

      const currentMember = group.members[memberIndex];
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Calculate streak
      let newStreak = 1;
      if (currentMember.lastCheckIn) {
        const lastCheckInDate = new Date(currentMember.lastCheckIn);
        // If last check-in was yesterday, continue streak
        if (lastCheckInDate.toDateString() === yesterday.toDateString()) {
          newStreak = currentMember.currentStreak + 1;
        }
      }

      const updatedMembers = [...group.members];
      updatedMembers[memberIndex] = {
        ...updatedMembers[memberIndex],
        checkInCount: updatedMembers[memberIndex].checkInCount + 1,
        currentStreak: newStreak,
        participationScore: updatedMembers[memberIndex].participationScore + 10,
        lastCheckIn: today,
      };

      await updateDoc(groupRef, { members: updatedMembers });
      toast.success(
        `Daily check-in recorded! Current streak: ${newStreak} days 🎉`
      );
      await fetchStudyGroups();
      await fetchUserGroups();
    } catch (error) {
      console.error("Error recording check-in:", error);
      toast.error("Failed to record check-in");
    }
  };

  const tipMember = async (
    groupId: string,
    recipientUserId: string,
    amount: number,
    category: string
  ) => {
    if (!publicKey || !user) {
      toast.error("Please connect your wallet and sign in");
      return;
    }

    if (!isMemberOfGroup(groupId)) {
      toast.error("You are not a member of this group");
      return;
    }

    if (recipientUserId === user.uid) {
      toast.error("You cannot tip yourself");
      return;
    }

    if (amount <= 0) {
      toast.error("Tip amount must be positive");
      return;
    }

    try {
      const groupRef = doc(db, "studyGroups", groupId);
      const groupDoc = await getDoc(groupRef);

      if (!groupDoc.exists()) {
        toast.error("Group not found");
        return;
      }

      const group = { id: groupDoc.id, ...groupDoc.data() } as StudyGroup;

      const recipientIndex = group.members.findIndex(
        (m) => m.userId === recipientUserId
      );
      if (recipientIndex === -1) {
        toast.error("Recipient is not a member of this group");
        return;
      }

      const updatedMembers = [...group.members];
      updatedMembers[recipientIndex] = {
        ...updatedMembers[recipientIndex],
        totalTipsReceived:
          updatedMembers[recipientIndex].totalTipsReceived + amount,
        participationScore:
          updatedMembers[recipientIndex].participationScore + 5, // Bonus for receiving tips
      };

      await updateDoc(groupRef, { members: updatedMembers });

      // In a real implementation, this would send a tip transaction
      toast.success(`Sent ${amount} SOL tip for ${category}!`);
      await fetchStudyGroups();
      await fetchUserGroups();
    } catch (error) {
      console.error("Error sending tip:", error);
      toast.error("Failed to send tip");
    }
  };

  const createProposal = async (
    groupId: string,
    proposalType: string,
    description: string
  ) => {
    if (!publicKey || !user) {
      toast.error("Please connect your wallet and sign in");
      return;
    }

    if (!isMemberOfGroup(groupId)) {
      toast.error("You are not a member of this group");
      return;
    }

    if (!description || description.trim().length === 0) {
      toast.error("Proposal description is required");
      return;
    }

    try {
      const newProposal: Partial<GovernanceProposal> = {
        groupId,
        proposer: user.uid,
        proposalType: proposalType as any,
        description: description.trim(),
        votesFor: 0,
        votesAgainst: 0,
        votingDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        executionStatus: "PENDING",
        requiredThreshold: Math.ceil(
          studyGroups.find((g) => g.id === groupId)?.currentMembers || 1 * 0.6
        ), // 60% of members
        voters: [],
      };

      await addDoc(collection(db, "proposals"), newProposal);
      toast.success("Proposal created successfully!");
    } catch (error) {
      console.error("Error creating proposal:", error);
      toast.error("Failed to create proposal");
    }
  };

  const voteOnProposal = async (proposalId: string, voteChoice: boolean) => {
    if (!publicKey || !user) {
      toast.error("Please connect your wallet and sign in");
      return;
    }

    try {
      const proposalRef = doc(db, "proposals", proposalId);
      const proposalDoc = await getDoc(proposalRef);

      if (!proposalDoc.exists()) {
        toast.error("Proposal not found");
        return;
      }

      const proposal = {
        id: proposalDoc.id,
        ...proposalDoc.data(),
      } as GovernanceProposal;

      // Check if user is a member of the group
      if (!isMemberOfGroup(proposal.groupId)) {
        toast.error("You are not a member of this group");
        return;
      }

      // Check if user has already voted
      if (proposal.voters.includes(user.uid)) {
        toast.error("You have already voted on this proposal");
        return;
      }

      // Check if voting period is still active
      if (new Date() > new Date(proposal.votingDeadline)) {
        toast.error("Voting period has ended");
        return;
      }

      const updatedVoters = [...proposal.voters, user.uid];
      const updateData = {
        voters: updatedVoters,
        votesFor: voteChoice ? proposal.votesFor + 1 : proposal.votesFor,
        votesAgainst: !voteChoice
          ? proposal.votesAgainst + 1
          : proposal.votesAgainst,
      };

      await updateDoc(proposalRef, updateData);
      toast.success(`Vote ${voteChoice ? "for" : "against"} recorded!`);
    } catch (error) {
      console.error("Error voting on proposal:", error);
      toast.error("Failed to vote on proposal");
    }
  };

  const claimRewards = async (groupId: string) => {
    if (!publicKey || !user) {
      toast.error("Please connect your wallet and sign in");
      return;
    }

    if (!isMemberOfGroup(groupId)) {
      toast.error("You are not a member of this group");
      return;
    }

    try {
      const group = userGroups.find((g) => g.id === groupId);
      if (!group) {
        toast.error("Group not found");
        return;
      }

      const member = group.members.find((m) => m.userId === user.uid);
      if (!member) {
        toast.error("Member data not found");
        return;
      }

      // Calculate rewards based on participation score relative to total participation
      const totalParticipationScore = group.members.reduce(
        (sum, m) => sum + m.participationScore,
        0
      );

      if (totalParticipationScore === 0 || member.participationScore === 0) {
        toast.error("No rewards available");
        return;
      }

      const memberShare =
        (member.participationScore / totalParticipationScore) *
        group.rewardPool;

      if (memberShare <= 0) {
        toast.error("No rewards available");
        return;
      }

      // In a real implementation, this would claim available rewards
      toast.success(
        `Rewards calculated: ${memberShare.toFixed(4)} SOL available!`
      );
    } catch (error) {
      console.error("Error claiming rewards:", error);
      toast.error("Failed to claim rewards");
    }
  };

  const getUserStats = () => {
    if (!user) {
      return {
        groupsJoined: 0,
        totalTips: 0,
        currentStreak: 0,
        achievements: 0,
      };
    }

    const groupsJoined = userGroups.length;
    let totalTips = 0;
    let currentStreak = 0;
    let achievements = 0;

    userGroups.forEach((group) => {
      const userMember = group.members.find((m) => m.userId === user.uid);
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
    isMemberOfGroup,
    canCheckInToday,
  };

  return (
    <StudyGroupContext.Provider value={value}>
      {children}
    </StudyGroupContext.Provider>
  );
}
