import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  Coins,
  Vote,
  Trophy,
  Shield,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import Button from "../components/ui/Button";
import GlassCard from "../components/ui/GlassCard";

export default function Landing() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalGroups: 0,
    totalStaked: 0,
  });

  useEffect(() => {
    fetchRealStats();
  }, []);

  const fetchRealStats = async () => {
    try {
      // Get total groups
      const groupsSnapshot = await getDocs(collection(db, "studyGroups"));
      const totalGroups = groupsSnapshot.size;

      // Get total users
      const usersSnapshot = await getDocs(collection(db, "users"));
      const totalUsers = usersSnapshot.size;

      // Calculate total staked (sum of all group reward pools)
      let totalStaked = 0;
      groupsSnapshot.forEach((doc) => {
        const data = doc.data();
        totalStaked += data.rewardPool || 0;
      });

      setStats({
        totalUsers,
        totalGroups,
        totalStaked: Math.round(totalStaked * 100) / 100, // Round to 2 decimal places
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const features = [
    {
      icon: Coins,
      title: "Stake to Commit",
      description:
        "Put skin in the game. Stake SOL tokens to join study groups and ensure serious participation.",
    },
    {
      icon: Users,
      title: "Collaborative Learning",
      description:
        "Study with like-minded peers, share knowledge, and grow together in focused groups.",
    },
    {
      icon: Vote,
      title: "Democratic Governance",
      description:
        "Vote on group decisions, propose changes, and shape the learning experience collectively.",
    },
    {
      icon: Trophy,
      title: "Earn Rewards",
      description:
        "Get rewarded for active participation, consistency, and helping fellow group members.",
    },
    {
      icon: Shield,
      title: "Blockchain Security",
      description:
        "Built on Solana for fast, secure, and transparent transactions and governance.",
    },
  ];

  const benefits = [
    "Higher engagement through financial commitment",
    "Transparent reward distribution",
    "Democratic decision making",
    "Achievement tracking and recognition",
    "Global community of learners",
    "Decentralized and censorship-resistant",
  ];

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-accent-600/10 to-primary-600/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              className="mb-8"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Users className="h-20 w-20 mx-auto text-accent-500" />
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-accent-400 via-primary-400 to-accent-400 bg-clip-text text-transparent">
                SOLmate
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              The first decentralized study group platform where commitment
              meets rewards. Stake tokens, learn together, and earn through
              active participation.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link to="/auth">
                <Button size="lg">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/groups">
                <Button variant="secondary" size="lg">
                  Browse Groups
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                {
                  number: stats.totalUsers.toString(),
                  label: "Active Learners",
                },
                { number: stats.totalGroups.toString(), label: "Study Groups" },
                { number: `${stats.totalStaked}`, label: "SOL Staked" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                >
                  <GlassCard className="p-6 text-center">
                    <div className="text-3xl font-bold text-white mb-2">
                      {stat.number}
                    </div>
                    <div className="text-gray-300">{stat.label}</div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Revolutionary Learning Experience
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Combining blockchain technology with collaborative learning to
              create the most engaging and rewarding study experience.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <GlassCard hover className="p-8 h-full">
                  <feature.icon className="h-12 w-12 text-accent-500 mb-6" />
                  <h3 className="text-xl font-semibold text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300">{feature.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-r from-accent-900/10 to-primary-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-white mb-6">
                Why Choose SOLmate?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Traditional study groups fail because there's no real
                commitment. We solve this with blockchain-based incentives and
                transparent governance.
              </p>

              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <GlassCard className="p-8">
                <h3 className="text-2xl font-bold text-white mb-6">
                  How It Works
                </h3>
                <div className="space-y-6">
                  {[
                    {
                      step: "1",
                      title: "Connect Wallet",
                      desc: "Link your Solana wallet to get started",
                    },
                    {
                      step: "2",
                      title: "Join Groups",
                      desc: "Stake SOL to join study groups that interest you",
                    },
                    {
                      step: "3",
                      title: "Participate",
                      desc: "Attend sessions, complete tasks, help others",
                    },
                    {
                      step: "4",
                      title: "Earn Rewards",
                      desc: "Get rewarded for consistent participation",
                    },
                  ].map((item, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-accent-500 to-primary-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {item.step}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">
                          {item.title}
                        </h4>
                        <p className="text-gray-300 text-sm">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <GlassCard className="p-12">
              <h2 className="text-4xl font-bold text-white mb-6">
                Ready to Transform Your Learning?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Join learners who are already earning while they study. Start
                your journey today!
              </p>
              <Link to="/auth">
                <Button size="lg" className="px-12 py-4 text-lg">
                  Start Learning & Earning
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </GlassCard>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
