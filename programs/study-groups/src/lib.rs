use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("StudyGroupsProgram111111111111111111111111");

#[program]
pub mod study_groups {
    use super::*;

    pub fn initialize_program(ctx: Context<Initialize>) -> Result<()> {
        let program_state = &mut ctx.accounts.program_state;
        program_state.admin = ctx.accounts.admin.key();
        program_state.total_groups = 0;
        program_state.total_members = 0;
        program_state.is_initialized = true;
        Ok(())
    }

    pub fn create_study_group(
        ctx: Context<CreateStudyGroup>,
        name: String,
        subject: String,
        description: String,
        stake_amount: u64,
        max_members: u8,
        duration_days: u16,
    ) -> Result<()> {
        require!(name.len() <= 50, StudyGroupError::NameTooLong);
        require!(description.len() <= 500, StudyGroupError::DescriptionTooLong);
        require!(max_members >= 2 && max_members <= 50, StudyGroupError::InvalidMaxMembers);
        require!(stake_amount >= 10_000_000, StudyGroupError::StakeTooLow); // 0.01 SOL minimum

        let study_group = &mut ctx.accounts.study_group;
        let clock = Clock::get()?;

        study_group.group_id = ctx.accounts.program_state.total_groups;
        study_group.creator = ctx.accounts.creator.key();
        study_group.name = name;
        study_group.subject = subject;
        study_group.description = description;
        study_group.stake_requirement = stake_amount;
        study_group.max_members = max_members;
        study_group.current_members = 0;
        study_group.reward_pool = 0;
        study_group.created_at = clock.unix_timestamp;
        study_group.duration_days = duration_days;
        study_group.is_active = true;
        study_group.penalty_rate = 10; // 10% penalty for early exit

        // Update program state
        ctx.accounts.program_state.total_groups += 1;

        emit!(StudyGroupCreated {
            group_id: study_group.group_id,
            creator: study_group.creator,
            name: study_group.name.clone(),
            stake_requirement: stake_amount,
        });

        Ok(())
    }

    pub fn join_group(ctx: Context<JoinGroup>) -> Result<()> {
        let study_group = &mut ctx.accounts.study_group;
        let member_profile = &mut ctx.accounts.member_profile;
        let clock = Clock::get()?;

        require!(study_group.is_active, StudyGroupError::GroupNotActive);
        require!(study_group.current_members < study_group.max_members, StudyGroupError::GroupFull);

        // Transfer stake from member to group's reward pool
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.member_token_account.to_account_info(),
                to: ctx.accounts.group_token_account.to_account_info(),
                authority: ctx.accounts.member.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, study_group.stake_requirement)?;

        // Initialize member profile
        member_profile.member = ctx.accounts.member.key();
        member_profile.group_id = study_group.group_id;
        member_profile.stake_amount = study_group.stake_requirement;
        member_profile.check_in_count = 0;
        member_profile.current_streak = 0;
        member_profile.total_tips_received = 0;
        member_profile.participation_score = 0;
        member_profile.join_date = clock.unix_timestamp;
        member_profile.is_active = true;
        member_profile.last_check_in = 0;

        // Update group
        study_group.current_members += 1;
        study_group.reward_pool += study_group.stake_requirement;

        emit!(MemberJoined {
            group_id: study_group.group_id,
            member: ctx.accounts.member.key(),
            stake_amount: study_group.stake_requirement,
        });

        Ok(())
    }

    pub fn daily_check_in(ctx: Context<DailyCheckIn>) -> Result<()> {
        let member_profile = &mut ctx.accounts.member_profile;
        let clock = Clock::get()?;
        let current_day = clock.unix_timestamp / 86400; // Convert to days
        let last_check_in_day = member_profile.last_check_in / 86400;

        require!(member_profile.is_active, StudyGroupError::MemberNotActive);
        require!(current_day > last_check_in_day, StudyGroupError::AlreadyCheckedInToday);

        // Update streak
        if current_day == last_check_in_day + 1 {
            member_profile.current_streak += 1;
        } else {
            member_profile.current_streak = 1;
        }

        member_profile.check_in_count += 1;
        member_profile.last_check_in = clock.unix_timestamp;
        member_profile.participation_score += 10; // Base points for check-in

        // Bonus points for streak
        if member_profile.current_streak >= 7 {
            member_profile.participation_score += 20;
        }

        emit!(DailyCheckInRecorded {
            member: ctx.accounts.member.key(),
            group_id: member_profile.group_id,
            streak: member_profile.current_streak,
        });

        Ok(())
    }

    pub fn tip_member(
        ctx: Context<TipMember>,
        amount: u64,
        category: TipCategory,
    ) -> Result<()> {
        require!(amount >= 1_000_000, StudyGroupError::TipTooSmall); // 0.001 SOL minimum
        require!(amount <= 100_000_000, StudyGroupError::TipTooLarge); // 0.1 SOL maximum

        let recipient_profile = &mut ctx.accounts.recipient_profile;
        
        // Transfer tip
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.sender_token_account.to_account_info(),
                to: ctx.accounts.recipient_token_account.to_account_info(),
                authority: ctx.accounts.sender.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, amount)?;

        // Update recipient profile
        recipient_profile.total_tips_received += amount;
        recipient_profile.participation_score += match category {
            TipCategory::Helpful => 15,
            TipCategory::Knowledgeable => 20,
            TipCategory::Motivational => 10,
            TipCategory::Collaborative => 12,
        };

        emit!(MemberTipped {
            sender: ctx.accounts.sender.key(),
            recipient: ctx.accounts.recipient.key(),
            amount,
            category,
        });

        Ok(())
    }

    pub fn create_proposal(
        ctx: Context<CreateProposal>,
        proposal_type: ProposalType,
        description: String,
    ) -> Result<()> {
        require!(description.len() <= 1000, StudyGroupError::DescriptionTooLong);

        let proposal = &mut ctx.accounts.proposal;
        let study_group = &ctx.accounts.study_group;
        let clock = Clock::get()?;

        proposal.proposal_id = study_group.group_id * 1000 + proposal.proposal_id; // Simple ID generation
        proposal.proposer = ctx.accounts.proposer.key();
        proposal.group_id = study_group.group_id;
        proposal.proposal_type = proposal_type;
        proposal.description = description;
        proposal.votes_for = 0;
        proposal.votes_against = 0;
        proposal.voting_deadline = clock.unix_timestamp + (7 * 24 * 60 * 60); // 7 days
        proposal.execution_status = ExecutionStatus::Pending;
        proposal.required_threshold = (study_group.current_members as u64 * 60) / 100; // 60% threshold

        emit!(ProposalCreated {
            proposal_id: proposal.proposal_id,
            proposer: proposal.proposer,
            group_id: proposal.group_id,
            proposal_type: proposal.proposal_type,
        });

        Ok(())
    }

    pub fn vote_on_proposal(
        ctx: Context<VoteOnProposal>,
        vote_choice: bool,
    ) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        let member_profile = &ctx.accounts.member_profile;
        let clock = Clock::get()?;

        require!(member_profile.is_active, StudyGroupError::MemberNotActive);
        require!(clock.unix_timestamp < proposal.voting_deadline, StudyGroupError::VotingPeriodEnded);
        require!(proposal.execution_status == ExecutionStatus::Pending, StudyGroupError::ProposalAlreadyExecuted);

        if vote_choice {
            proposal.votes_for += 1;
        } else {
            proposal.votes_against += 1;
        }

        emit!(VoteCast {
            proposal_id: proposal.proposal_id,
            voter: ctx.accounts.voter.key(),
            vote_choice,
        });

        Ok(())
    }

    pub fn execute_proposal(ctx: Context<ExecuteProposal>) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        let clock = Clock::get()?;

        require!(clock.unix_timestamp >= proposal.voting_deadline, StudyGroupError::VotingStillActive);
        require!(proposal.execution_status == ExecutionStatus::Pending, StudyGroupError::ProposalAlreadyExecuted);

        let total_votes = proposal.votes_for + proposal.votes_against;
        
        if proposal.votes_for >= proposal.required_threshold && proposal.votes_for > proposal.votes_against {
            proposal.execution_status = ExecutionStatus::Executed;
            
            emit!(ProposalExecuted {
                proposal_id: proposal.proposal_id,
                votes_for: proposal.votes_for,
                votes_against: proposal.votes_against,
            });
        } else {
            proposal.execution_status = ExecutionStatus::Rejected;
        }

        Ok(())
    }

    pub fn claim_rewards(ctx: Context<ClaimRewards>) -> Result<()> {
        let study_group = &ctx.accounts.study_group;
        let member_profile = &ctx.accounts.member_profile;
        let clock = Clock::get()?;

        require!(member_profile.is_active, StudyGroupError::MemberNotActive);
        
        // Calculate rewards based on participation score
        let member_share = (member_profile.participation_score as u64 * study_group.reward_pool) / 1000; // Simplified calculation
        
        require!(member_share > 0, StudyGroupError::NoRewardsAvailable);

        // Transfer rewards
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.group_token_account.to_account_info(),
                to: ctx.accounts.member_token_account.to_account_info(),
                authority: ctx.accounts.group_authority.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, member_share)?;

        emit!(RewardsClaimed {
            member: ctx.accounts.member.key(),
            group_id: study_group.group_id,
            amount: member_share,
        });

        Ok(())
    }

    pub fn leave_group(ctx: Context<LeaveGroup>) -> Result<()> {
        let study_group = &mut ctx.accounts.study_group;
        let member_profile = &mut ctx.accounts.member_profile;

        require!(member_profile.is_active, StudyGroupError::MemberNotActive);

        // Calculate penalty for early exit
        let penalty_amount = (member_profile.stake_amount * study_group.penalty_rate as u64) / 100;
        let refund_amount = member_profile.stake_amount - penalty_amount;

        // Transfer refund to member
        if refund_amount > 0 {
            let transfer_ctx = CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.group_token_account.to_account_info(),
                    to: ctx.accounts.member_token_account.to_account_info(),
                    authority: ctx.accounts.group_authority.to_account_info(),
                },
            );
            token::transfer(transfer_ctx, refund_amount)?;
        }

        // Update member and group state
        member_profile.is_active = false;
        study_group.current_members -= 1;
        study_group.reward_pool -= member_profile.stake_amount;

        emit!(MemberLeft {
            member: ctx.accounts.member.key(),
            group_id: study_group.group_id,
            refund_amount,
        });

        Ok(())
    }
}

// Account structures
#[account]
pub struct ProgramState {
    pub admin: Pubkey,
    pub total_groups: u64,
    pub total_members: u64,
    pub is_initialized: bool,
}

#[account]
pub struct StudyGroup {
    pub group_id: u64,
    pub creator: Pubkey,
    pub name: String,
    pub subject: String,
    pub description: String,
    pub stake_requirement: u64,
    pub max_members: u8,
    pub current_members: u8,
    pub reward_pool: u64,
    pub created_at: i64,
    pub duration_days: u16,
    pub is_active: bool,
    pub penalty_rate: u8,
}

#[account]
pub struct MemberProfile {
    pub member: Pubkey,
    pub group_id: u64,
    pub stake_amount: u64,
    pub check_in_count: u32,
    pub current_streak: u32,
    pub total_tips_received: u64,
    pub participation_score: u32,
    pub join_date: i64,
    pub is_active: bool,
    pub last_check_in: i64,
}

#[account]
pub struct GovernanceProposal {
    pub proposal_id: u64,
    pub proposer: Pubkey,
    pub group_id: u64,
    pub proposal_type: ProposalType,
    pub description: String,
    pub votes_for: u64,
    pub votes_against: u64,
    pub voting_deadline: i64,
    pub execution_status: ExecutionStatus,
    pub required_threshold: u64,
}

// Enums
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ProposalType {
    ChangeTopic,
    UpdateSchedule,
    AddResource,
    ModifyStake,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ExecutionStatus {
    Pending,
    Executed,
    Rejected,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum TipCategory {
    Helpful,
    Knowledgeable,
    Motivational,
    Collaborative,
}

// Context structures
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = admin, space = 8 + 32 + 8 + 8 + 1)]
    pub program_state: Account<'info, ProgramState>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateStudyGroup<'info> {
    #[account(init, payer = creator, space = 8 + 1000)] // Adjust space as needed
    pub study_group: Account<'info, StudyGroup>,
    #[account(mut)]
    pub program_state: Account<'info, ProgramState>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct JoinGroup<'info> {
    #[account(mut)]
    pub study_group: Account<'info, StudyGroup>,
    #[account(init, payer = member, space = 8 + 500)]
    pub member_profile: Account<'info, MemberProfile>,
    #[account(mut)]
    pub member: Signer<'info>,
    #[account(mut)]
    pub member_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub group_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DailyCheckIn<'info> {
    #[account(mut)]
    pub member_profile: Account<'info, MemberProfile>,
    pub member: Signer<'info>,
}

#[derive(Accounts)]
pub struct TipMember<'info> {
    #[account(mut)]
    pub recipient_profile: Account<'info, MemberProfile>,
    #[account(mut)]
    pub sender: Signer<'info>,
    #[account(mut)]
    pub sender_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub recipient_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct CreateProposal<'info> {
    #[account(init, payer = proposer, space = 8 + 1500)]
    pub proposal: Account<'info, GovernanceProposal>,
    pub study_group: Account<'info, StudyGroup>,
    #[account(mut)]
    pub proposer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct VoteOnProposal<'info> {
    #[account(mut)]
    pub proposal: Account<'info, GovernanceProposal>,
    pub member_profile: Account<'info, MemberProfile>,
    pub voter: Signer<'info>,
}

#[derive(Accounts)]
pub struct ExecuteProposal<'info> {
    #[account(mut)]
    pub proposal: Account<'info, GovernanceProposal>,
}

#[derive(Accounts)]
pub struct ClaimRewards<'info> {
    pub study_group: Account<'info, StudyGroup>,
    pub member_profile: Account<'info, MemberProfile>,
    pub member: Signer<'info>,
    #[account(mut)]
    pub member_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub group_token_account: Account<'info, TokenAccount>,
    /// CHECK: This is the group's authority for token transfers
    pub group_authority: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct LeaveGroup<'info> {
    #[account(mut)]
    pub study_group: Account<'info, StudyGroup>,
    #[account(mut)]
    pub member_profile: Account<'info, MemberProfile>,
    pub member: Signer<'info>,
    #[account(mut)]
    pub member_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub group_token_account: Account<'info, TokenAccount>,
    /// CHECK: This is the group's authority for token transfers
    pub group_authority: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
}

// Events
#[event]
pub struct StudyGroupCreated {
    pub group_id: u64,
    pub creator: Pubkey,
    pub name: String,
    pub stake_requirement: u64,
}

#[event]
pub struct MemberJoined {
    pub group_id: u64,
    pub member: Pubkey,
    pub stake_amount: u64,
}

#[event]
pub struct DailyCheckInRecorded {
    pub member: Pubkey,
    pub group_id: u64,
    pub streak: u32,
}

#[event]
pub struct MemberTipped {
    pub sender: Pubkey,
    pub recipient: Pubkey,
    pub amount: u64,
    pub category: TipCategory,
}

#[event]
pub struct ProposalCreated {
    pub proposal_id: u64,
    pub proposer: Pubkey,
    pub group_id: u64,
    pub proposal_type: ProposalType,
}

#[event]
pub struct VoteCast {
    pub proposal_id: u64,
    pub voter: Pubkey,
    pub vote_choice: bool,
}

#[event]
pub struct ProposalExecuted {
    pub proposal_id: u64,
    pub votes_for: u64,
    pub votes_against: u64,
}

#[event]
pub struct RewardsClaimed {
    pub member: Pubkey,
    pub group_id: u64,
    pub amount: u64,
}

#[event]
pub struct MemberLeft {
    pub member: Pubkey,
    pub group_id: u64,
    pub refund_amount: u64,
}

// Error codes
#[error_code]
pub enum StudyGroupError {
    #[msg("Group name is too long")]
    NameTooLong,
    #[msg("Description is too long")]
    DescriptionTooLong,
    #[msg("Invalid max members count")]
    InvalidMaxMembers,
    #[msg("Stake amount is too low")]
    StakeTooLow,
    #[msg("Group is not active")]
    GroupNotActive,
    #[msg("Group is full")]
    GroupFull,
    #[msg("Member is not active")]
    MemberNotActive,
    #[msg("Already checked in today")]
    AlreadyCheckedInToday,
    #[msg("Tip amount is too small")]
    TipTooSmall,
    #[msg("Tip amount is too large")]
    TipTooLarge,
    #[msg("Voting period has ended")]
    VotingPeriodEnded,
    #[msg("Proposal already executed")]
    ProposalAlreadyExecuted,
    #[msg("Voting is still active")]
    VotingStillActive,
    #[msg("No rewards available")]
    NoRewardsAvailable,
}