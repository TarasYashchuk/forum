-- Create the post_statuses table
CREATE TABLE "post_statuses" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "post_statuses_pkey" PRIMARY KEY ("id")
);

-- Create a unique index on the name column
CREATE UNIQUE INDEX "post_statuses_name_key" ON "post_statuses"("name");

-- Insert statuses into the post_statuses table
INSERT INTO "public"."post_statuses" ("id", "name") VALUES (1, 'active');
INSERT INTO "public"."post_statuses" ("id", "name") VALUES (2, 'hided');
INSERT INTO "public"."post_statuses" ("id", "name") VALUES (3, 'archived');

-- Add the statusId column as optional
ALTER TABLE "public"."posts" ADD COLUMN "statusId" INTEGER;

-- Update existing records to have a default value (active)
UPDATE "public"."posts" SET "statusId" = 1 WHERE "statusId" IS NULL;

-- Make the statusId column required
ALTER TABLE "public"."posts" ALTER COLUMN "statusId" SET NOT NULL;

-- Add the foreign key constraint for statusId
ALTER TABLE "public"."posts" ADD CONSTRAINT "posts_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "public"."post_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
