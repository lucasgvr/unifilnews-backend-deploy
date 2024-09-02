-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postContent" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);
