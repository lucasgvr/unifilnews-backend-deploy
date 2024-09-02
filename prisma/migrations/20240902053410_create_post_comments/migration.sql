-- CreateTable
CREATE TABLE "PostComments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "commentContent" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostComments_pkey" PRIMARY KEY ("id")
);
