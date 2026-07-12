-- AlterTable
ALTER TABLE "users" ADD COLUMN     "employment_type" TEXT,
ADD COLUMN     "gender" TEXT;

-- CreateTable
CREATE TABLE "training_records" (
    "id" TEXT NOT NULL,
    "training_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "completion_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "training_records_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "training_records" ADD CONSTRAINT "training_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
