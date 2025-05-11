/*
  Warnings:

  - You are about to drop the column `duration` on the `attendance` table. All the data in the column will be lost.
  - You are about to drop the column `photo_url` on the `attendance` table. All the data in the column will be lost.
  - Added the required column `checkInPhotoUrl` to the `Attendance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `attendance` DROP COLUMN `duration`,
    DROP COLUMN `photo_url`,
    ADD COLUMN `checkInPhotoUrl` VARCHAR(191) NOT NULL,
    ADD COLUMN `checkInTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `checkOutPhotoUrl` VARCHAR(191) NULL,
    ADD COLUMN `checkOutTime` DATETIME(3) NULL,
    ADD COLUMN `date` DATE NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateIndex
CREATE INDEX `Attendance_date_idx` ON `Attendance`(`date`);
