-- CreateTable
CREATE TABLE "PostLikes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,

    CONSTRAINT "PostLikes_pkey" PRIMARY KEY ("id")
);
