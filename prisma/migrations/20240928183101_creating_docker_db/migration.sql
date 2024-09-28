-- CreateTable
CREATE TABLE "VisitorCount" (
    "id" TEXT NOT NULL,
    "visitDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "count" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "VisitorCount_pkey" PRIMARY KEY ("id")
);
