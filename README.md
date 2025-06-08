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

### Frontend Components

#### Pages
- **Landing**: Hero section with real-time stats
- **Dashboard**: User overview and quick actions
- **Groups**: Browse and join study groups
- **Profile**: Personal stats and achievements
- **Create Group**: Form to create new groups

#### Key Components
- **StudyGroupCard**: Group information with join functionality
- **GlassCard**: Reusable glassmorphism card component
- **WalletButton**: Solana wallet connection interface

## 💡 Real-World to Blockchain Mapping

| Real-World Action | dApp Equivalent |
|------------------|-----------------|
| Join a group | Stake SOL tokens |
| Participate in session | Daily check-in |
| Get praised by peer | Receive token tip |
| Vote on group topic | DAO proposal vote |
| Receive study rewards | Claim SOL rewards |

## 🎨 Design System

### Color Palette
- **Primary**: Indigo gradient (#6366f1 to #4f46e5)
- **Accent**: Purple gradient (#8b5cf6 to #7c3aed)
- **Background**: Deep black theme (#000000, #0a0a0a, #1a1a1a)
- **Text**: High contrast white and gray tones
- **Borders**: Subtle gray borders for definition

### Animations
- Smooth page transitions with Framer Motion
- Hover effects on interactive elements
- Loading states with skeleton screens
- Micro-interactions for user feedback

## 🔐 Security Features

- **Input Validation**: All user inputs validated on-chain
- **Access Controls**: Role-based permissions for group actions
- **Stake Protection**: Penalty system for early group exits
- **Transparent Governance**: All votes recorded on blockchain

## 🧪 Testing

Run the test suite:
```bash
anchor test
```

Frontend testing:
```bash
npm run test
# or
yarn test
```

## 📱 Mobile Responsiveness

The application is fully responsive with breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Solana Foundation for blockchain infrastructure
- Anchor framework for Solana development
- Firebase for backend services
- Framer Motion for animations
- Tailwind CSS for styling

## 📞 Support

For support, email support@solmate.com or join our Discord community.

---

Built with ❤️ for the decentralized learning revolution