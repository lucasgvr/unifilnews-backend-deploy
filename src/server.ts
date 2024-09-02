import { PrismaClient } from "@prisma/client"
import fastify from "fastify"
import { z } from 'zod'

import fastifyCors from '@fastify/cors'

const app = fastify()

const prisma = new PrismaClient()

app.register(fastifyCors, {
    origin: "*",
    methods: ["GET", "POST", 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ["Content-Type", "Authorization"]
})

app.get("/users", async () => {
    const users = await prisma.user.findMany()

    return { users }
})

app.post("/users", async (request, reply) => {
    const createUserSchema = z.object({
        firstName: z.string(),
        lastName: z.string(),
        email: z.string().email(),
        password: z.string(),
        cpf: z.string().length(11),
        phone: z.string().length(11),
    })

    const { firstName, lastName, email, password, cpf, phone } = createUserSchema.parse(request.body)

    const existingUserByEmail = await prisma.user.findUnique({
        where: { email },
    })

    if (existingUserByEmail) {
        return reply.status(409).send({ message: 'Email already exists' })
    }

    // Check if user with the given CPF already exists
    const existingUserByCpf = await prisma.user.findUnique({
        where: { cpf },
    })

    if (existingUserByCpf) {
        return reply.status(409).send({ message: 'CPF already exists' })
    }

    await prisma.user.create({
        data: {
            firstName,
            lastName,
            email,
            password,
            cpf,
            phone
        }
    })

    return reply.status(201).send()
})

app.post("/login", async (request, reply) => {
    const loginSchema = z.object({
        email: z.string().email(),
        password: z.string()
    })

    const { email, password } = loginSchema.parse(request.body)

    const user = await prisma.user.findUnique({
        where: { email }
    })

    if (!user || user.password !== password) {
        return reply.status(401).send({ message: "Invalid email or password" })
    }

    return reply.send({ 
        message: "Login successful",
        user
    })
})

app.get("/users/:id", async (request, reply) => {
    const userIdSchema = z.object({
        id: z.string()
    })

    const { id } = userIdSchema.parse(request.params)

    const user = await prisma.user.findUnique({
        where: { id }
    })

    if (!user) {
        return reply.status(404).send({ message: "User not found" })
    }

    return { user }
})

app.put("/users/:id/edit", async (request, reply) => {
    const userIdSchema = z.object({
        id: z.string()
    })

    const updateUserSchema = z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().email().optional(),
        password: z.string().optional(),
        cpf: z.string().length(11).optional(),
        phone: z.string().length(11).optional(),
    })

    const { id } = userIdSchema.parse(request.params)
    const updateData = updateUserSchema.parse(request.body)

    const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData
    })

    return reply.send({ message: "User updated successfully", user: updatedUser })
})

app.get("/posts", async () => {
    const posts = await prisma.post.findMany()

    return { posts }
})

app.post("/posts", async (request, reply) => {
    const createPostSchema = z.object({
        userId: z.string(),
        postContent: z.string()
    })

    const { userId, postContent } = createPostSchema.parse(request.body);

    await prisma.post.create({
        data: {
            userId,
            postContent,
        }
    })
 
    return reply.status(201).send()
})

app.delete("/posts/:id", async (request, reply) => {
    try {
        const idSchema = z.object({
            id: z.string()
        })
    
        const { id } = idSchema.parse(request.params)
    
        await prisma.post.delete({
            where: { id }
        })

        await prisma.postComments.deleteMany({
            where: { postId: id }
        })

        await prisma.postLikes.deleteMany({
            where: { postId: id }
        })
    
        return reply.status(200).send({ message: "Post deleted successfully" })
    } catch (error) {
        return reply.status(400).send({ message: "Failed to delete post" })
    }
})

app.put("/posts/:id", async (request, reply) => {
    try {
        const editPostSchema = z.object({
            postContent: z.string(),
            createdAt: z.string()
        })
    
        const idSchema = z.object({
            id: z.string()
        })
    
        const { id } = idSchema.parse(request.params)
        const { postContent, createdAt } = editPostSchema.parse(request.body)
    
        await prisma.post.update({
            where: { id }, 
            data: {
                postContent,
                createdAt
            }
        })
    
        return reply.status(200).send({ message: "Post updated successfully" })
    } catch (error) {
        return reply.status(400).send({ message: "Failed to update post" })
    }
})

app.get("/posts/:id", async (request, reply) => {
    const postIdSchema = z.object({
        id: z.string()
    })

    const { id } = postIdSchema.parse(request.params)

    const post = await prisma.post.findUnique({
        where: { id }
    })

    if (!post) {
        return reply.status(404).send({ message: "Post not found" })
    }

    return { post }
})

app.post("/posts/:id/like", async (request, reply) => {
    try {
        const likeSchema = z.object({
            userId: z.string()
        })
      
        const postIdSchema = z.object({
            id: z.string()
        })
      
        const { id } = postIdSchema.parse(request.params)
        const { userId } = likeSchema.parse(request.body)
      
    
        const existingLike = await prisma.postLikes.findMany({
            where: {
                userId: userId,
                postId: id
            }
        })
    
        if (existingLike.length > 0) {
            await prisma.postLikes.deleteMany({
                where: {
                    userId: userId,
                    postId: id
                }
            })
    
            return reply.status(200).send({ message: "Post unliked successfully" });
        } else {
            await prisma.postLikes.create({
                data: {
                    userId: userId,
                    postId: id
                }
            })
    
            return reply.status(200).send({ message: "Post liked successfully" });
        }
    } catch (error) {
        return reply.status(400).send({ message: "Failed to like/unlike post" })
    }
})

app.get("/posts/:id/likeCount", async (request, reply) => {
    try {
        const postIdSchema = z.object({
            id: z.string(),
        })
    
        const { id } = postIdSchema.parse(request.params);
    
        const likeCount = await prisma.postLikes.count({
            where: {
                postId: id
            }
        })
    
        return reply.status(200).send({ likeCount })
    } catch (error) {
        return reply.status(400).send({ message: "Failed to get like count" })
    }
})

app.post("/posts/:id/liked", async (request, reply) => {
    try {
        const likeSchema = z.object({
            userId: z.string()
        })
      
        const postIdSchema = z.object({
            id: z.string()
        })
      
        const { id } = postIdSchema.parse(request.params)
        const { userId } = likeSchema.parse(request.body)

        const like = await prisma.postLikes.findFirst({
            where: {
                userId: userId,
                postId: id,
            }
        });

        const isLiked = like ? true : false;

        return reply.status(200).send({ isLiked });
    } catch (error) {
        return reply.status(400).send({ message: "Failed to check if post is liked" })
    }
})

app.get("/posts/:id/comments", async (request, reply) => {
    try {
        const postIdSchema = z.object({
            id: z.string()
        })

        const { id } = postIdSchema.parse(request.params)

        const comments = await prisma.postComments.findMany({
            where: {
                postId: id,
            }
        })

        return reply.status(200).send({ comments });
    } catch (error) {
        return reply.status(400).send({ message: "Failed to retrieve comments" })
    }
})

app.post("/posts/:id/comments", async (request, reply) => {
    try {
        const commentSchema = z.object({
            userId: z.string(),
            commentContent: z.string().min(1),
        })

        const postIdSchema = z.object({
            id: z.string()
        })

        const { userId, commentContent } = commentSchema.parse(request.body)
        const { id } = postIdSchema.parse(request.params)

        await prisma.postComments.create({
            data: {
                userId,
                postId: id,
                commentContent,
            },
        })

        return reply.status(201).send({ message: "Comment created successfully" })
    } catch (error) {
        return reply.status(400).send({ message: "Failed to create comment" })
    }
})

app.delete("/posts/comments/:id", async (request, reply) => {
    try {
        const commentSchema = z.object({
            id: z.string(),
        })

        const { id } = commentSchema.parse(request.params)

        await prisma.postComments.delete({
            where: { id },
        })

        return reply.status(200).send({ message: "Comment deleted successfully" })
    } catch (error) {
        return reply.status(400).send({ message: "Failed to delete comment" })
    }
})

app.put("/posts/comments/:id", async (request, reply) => {
    try {
        const editCommentSchema = z.object({
            commentContent: z.string(),
            createdAt: z.string()
        })
    
        const idSchema = z.object({
            id: z.string()
        })
    
        const { id } = idSchema.parse(request.params)
        const { commentContent, createdAt } = editCommentSchema.parse(request.body)
    
        await prisma.postComments.update({
            where: { id }, 
            data: {
                commentContent,
                createdAt
            }
        })
    
        return reply.status(200).send({ message: "Comment updated successfully" })
    } catch (error) {
        return reply.status(400).send({ message: "Failed to update comment" })
    }
})

app.get("/posts/comments/:id", async (request, reply) => {
    const commentIdSchema = z.object({
        id: z.string()
    })

    const { id } = commentIdSchema.parse(request.params)

    const comment = await prisma.postComments.findUnique({
        where: { id }
    })

    if (!comment) {
        return reply.status(404).send({ message: "Comment not found" })
    }

    return { comment }
})

app.listen({
    host: '0.0.0.0',
    port: process.env.PORT ? Number(process.env.PORT) : 3333
}).then(() => {
    console.log('HTTP Server Running')
})