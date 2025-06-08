# SOLmate - Decentralized Study Groups Platform

A Solana-based decentralized study group platform where students stake SOL tokens to join groups, earn rewards for participation, tip each other, and vote on group decisions through blockchain-verified engagement.

## 🌟 Features

### Core Functionality

- **Stake-to-Join**: Members stake SOL tokens to join study groups, ensuring commitment
- **Participation Rewards**: Earn rewards based on consistent participation and engagement
- **Peer Tipping System**: Send categorized tips to helpful group members
- **Democratic Governance**: Vote on group decisions through DAO proposals
- **Achievement Tracking**: Unlock achievements for reaching study milestones
- **Streak Tracking**: Build daily study streaks with bonus rewards

### Technical Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Blockchain**: Solana + Anchor Framework
- **Wallet Integration**: Phantom/Solflare wallet adapters
- **Backend**: Firebase (Authentication + Firestore)
- **Styling**: Deep black theme with contrasting text
- **Animations**: Framer Motion for smooth transitions

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Yarn or npm
- Solana CLI tools
- Anchor CLI
- Phantom or Solflare wallet

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd solmate-study-groups
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
```

3. **Set up Firebase**

- Create a Firebase project
- Enable Authentication (Email/Password + Google OAuth)
- Create Firestore database
- Update `src/config/firebase.ts` with your config

4. **Build and deploy Solana program**

```bash
anchor build
anchor deploy --provider.cluster devnet
```

5. **Start the development server**

```bash
npm run dev
# or
yarn dev
```

## 🏗️ Architecture

### Solana Program Structure

#### Account Types

- **StudyGroup**: Group metadata, stake requirements, member list
- **MemberProfile**: Individual member data, participation scores, streaks
- **GovernanceProposal**: DAO proposals for group decisions

#### Key Instructions

- `create_study_group()` - Create new study groups
- `join_group()` - Stake tokens and join groups
- `daily_check_in()` - Record daily participation
- `tip_member()` - Send categorized tips to members
- `vote_on_proposal()` - Participate in governance
- `claim_rewards()` - Withdraw earned rewards

#### Key Components

- **StudyGroupCard**: Group information with join functionality
- **GlassCard**: Reusable glassmorphism card component
- **WalletButton**: Solana wallet connection interface

## 💡 Real-World to Blockchain Mapping

| Real-World Action      | dApp Equivalent   |
| ---------------------- | ----------------- |
| Join a group           | Stake SOL tokens  |
| Participate in session | Daily check-in    |
| Get praised by peer    | Receive token tip |
| Vote on group topic    | DAO proposal vote |
| Receive study rewards  | Claim SOL rewards |
