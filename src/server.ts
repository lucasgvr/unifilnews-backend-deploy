import { PrismaClient } from "@prisma/client";
import fastify from "fastify";
import { number, z } from 'zod'

const app = fastify();

const prisma = new PrismaClient();

app.get("/users", async () => {
    const users = await prisma.user.findMany();

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

    const { firstName, lastName, email, password, cpf, phone } = createUserSchema.parse(request.body);

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

app.listen({
    host: '0.0.0.0',
    port: process.env.PORT ? Number(process.env.PORT) : 3333
}).then(() => {
    console.log('HTTP Server Running')
})