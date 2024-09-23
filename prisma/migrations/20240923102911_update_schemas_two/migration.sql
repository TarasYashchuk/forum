/*
  Warnings:

  - You are about to drop the `user_likes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "user_likes" DROP CONSTRAINT "user_likes_likedUserId_fkey";

-- DropForeignKey
ALTER TABLE "user_likes" DROP CONSTRAINT "user_likes_userId_fkey";

-- DropTable
DROP TABLE "user_likes";
