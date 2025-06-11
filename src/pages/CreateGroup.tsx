import { motion } from "framer-motion";
import CreateGroupForm from "../components/groups/CreateGroupForm";

export default function CreateGroup() {
  return (
    <div className="min-h-screen bg-dark-950 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            Create Study Group
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Start your own decentralized study group and build a community of
            learners committed to success through blockchain-verified
            participation.
          </p>
        </motion.div>

        <CreateGroupForm />
      </div>
    </div>
  );
}
