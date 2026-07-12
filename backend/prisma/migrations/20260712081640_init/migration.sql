-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'manager', 'employee');

-- CreateEnum
CREATE TYPE "DepartmentStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('CSR_ACTIVITY', 'CHALLENGE');

-- CreateEnum
CREATE TYPE "CategoryStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "ChallengeStatus" AS ENUM ('draft', 'active', 'under_review', 'completed', 'archived');

-- CreateEnum
CREATE TYPE "ChallengeDifficulty" AS ENUM ('easy', 'medium', 'hard', 'expert');

-- CreateEnum
CREATE TYPE "ComplianceSeverity" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateEnum
CREATE TYPE "ComplianceIssueStatus" AS ENUM ('open', 'in_progress', 'resolved', 'overdue');

-- CreateEnum
CREATE TYPE "AuditStatus" AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "RewardStatus" AS ENUM ('active', 'inactive', 'out_of_stock');

-- CreateEnum
CREATE TYPE "GoalStatus" AS ENUM ('active', 'completed', 'missed', 'cancelled');

-- CreateEnum
CREATE TYPE "PolicyStatus" AS ENUM ('draft', 'active', 'archived');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'employee',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "department_id" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "employee_count" INTEGER NOT NULL DEFAULT 0,
    "status" "DepartmentStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "parent_id" TEXT,
    "head_id" TEXT,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CategoryType" NOT NULL,
    "status" "CategoryStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emission_factors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "factor" DOUBLE PRECISION NOT NULL,
    "source" TEXT,
    "year" INTEGER NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emission_factors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_esg_profiles" (
    "id" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "description" TEXT,
    "environmental_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "social_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "governance_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "overall_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "certifications" TEXT[],
    "sustainable_materials" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_esg_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "environmental_goals" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "target_value" DOUBLE PRECISION NOT NULL,
    "current_value" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" "GoalStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "environmental_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "esg_policies" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "status" "PolicyStatus" NOT NULL DEFAULT 'draft',
    "effective_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "esg_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "badges" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "unlock_rule" TEXT NOT NULL,
    "icon" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rewards" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "points_required" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "status" "RewardStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rewards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "esg_config" (
    "id" TEXT NOT NULL,
    "organization_name" TEXT NOT NULL,
    "environmental_weight" DOUBLE PRECISION NOT NULL DEFAULT 40,
    "social_weight" DOUBLE PRECISION NOT NULL DEFAULT 30,
    "governance_weight" DOUBLE PRECISION NOT NULL DEFAULT 30,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "esg_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carbon_transactions" (
    "id" TEXT NOT NULL,
    "description" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "emission_amount" DOUBLE PRECISION NOT NULL,
    "scope" INTEGER NOT NULL,
    "transaction_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,
    "emission_factor_id" TEXT NOT NULL,

    CONSTRAINT "carbon_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "csr_activities" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "budget" DOUBLE PRECISION,
    "max_participants" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "category_id" TEXT NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "department_id" TEXT,

    CONSTRAINT "csr_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_participations" (
    "id" TEXT NOT NULL,
    "proof_url" TEXT,
    "approval_status" "ApprovalStatus" NOT NULL DEFAULT 'pending',
    "points_earned" INTEGER NOT NULL DEFAULT 0,
    "completion_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,
    "activity_id" TEXT NOT NULL,

    CONSTRAINT "employee_participations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenges" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "xp_reward" INTEGER NOT NULL DEFAULT 0,
    "difficulty" "ChallengeDifficulty" NOT NULL DEFAULT 'medium',
    "evidence_required" BOOLEAN NOT NULL DEFAULT false,
    "deadline" TIMESTAMP(3),
    "status" "ChallengeStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "category_id" TEXT NOT NULL,

    CONSTRAINT "challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenge_participations" (
    "id" TEXT NOT NULL,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "proof_url" TEXT,
    "approval_status" "ApprovalStatus" NOT NULL DEFAULT 'pending',
    "xp_awarded" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,
    "challenge_id" TEXT NOT NULL,

    CONSTRAINT "challenge_participations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "policy_acknowledgements" (
    "id" TEXT NOT NULL,
    "acknowledged_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "policy_id" TEXT NOT NULL,

    CONSTRAINT "policy_acknowledgements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audits" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "audit_date" TIMESTAMP(3) NOT NULL,
    "status" "AuditStatus" NOT NULL DEFAULT 'scheduled',
    "findings" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "lead_id" TEXT NOT NULL,

    CONSTRAINT "audits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_issues" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" "ComplianceSeverity" NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "status" "ComplianceIssueStatus" NOT NULL DEFAULT 'open',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "audit_id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,

    CONSTRAINT "compliance_issues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "department_scores" (
    "id" TEXT NOT NULL,
    "environmental_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "social_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "governance_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "scored_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "department_id" TEXT NOT NULL,

    CONSTRAINT "department_scores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "departments_code_key" ON "departments"("code");

-- CreateIndex
CREATE UNIQUE INDEX "employee_participations_user_id_activity_id_key" ON "employee_participations"("user_id", "activity_id");

-- CreateIndex
CREATE UNIQUE INDEX "challenge_participations_user_id_challenge_id_key" ON "challenge_participations"("user_id", "challenge_id");

-- CreateIndex
CREATE UNIQUE INDEX "policy_acknowledgements_user_id_policy_id_key" ON "policy_acknowledgements"("user_id", "policy_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_head_id_fkey" FOREIGN KEY ("head_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carbon_transactions" ADD CONSTRAINT "carbon_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carbon_transactions" ADD CONSTRAINT "carbon_transactions_emission_factor_id_fkey" FOREIGN KEY ("emission_factor_id") REFERENCES "emission_factors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "csr_activities" ADD CONSTRAINT "csr_activities_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "csr_activities" ADD CONSTRAINT "csr_activities_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "csr_activities" ADD CONSTRAINT "csr_activities_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_participations" ADD CONSTRAINT "employee_participations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_participations" ADD CONSTRAINT "employee_participations_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "csr_activities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge_participations" ADD CONSTRAINT "challenge_participations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge_participations" ADD CONSTRAINT "challenge_participations_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "challenges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policy_acknowledgements" ADD CONSTRAINT "policy_acknowledgements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policy_acknowledgements" ADD CONSTRAINT "policy_acknowledgements_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "esg_policies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audits" ADD CONSTRAINT "audits_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_issues" ADD CONSTRAINT "compliance_issues_audit_id_fkey" FOREIGN KEY ("audit_id") REFERENCES "audits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_issues" ADD CONSTRAINT "compliance_issues_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_scores" ADD CONSTRAINT "department_scores_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
