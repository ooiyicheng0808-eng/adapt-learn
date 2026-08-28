import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.post("/", async (req: Request, res: Response) => {
    try {
        const { email, courseName, accuracy, attempts = 1, username, profilePic } = req.body;
        
        if (!email || !courseName) {
            return res.status(400).json({ message: "email and courseName are required" });
        }

        let user = await prisma.user.findUnique({ where: { email } });
        // Implicitly register user if they don't exist
        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
                    username: username || email.split('@')[0],
                    role: 'learner',
                    profilePic: profilePic || null,
                    passwordHash: 'dummy' 
                }
            });
        }

        let topic = await prisma.topic.findFirst({ where: { courseName } });
        if (!topic) {
            topic = await prisma.topic.create({
                data: {
                    name: 'Core Concepts',
                    difficulty: 'Medium',
                    courseName
                }
            });
        }

        let progress = await prisma.userProgress.findFirst({
            where: { userId: user.id, topicId: topic.id }
        });

        if (progress) {
             progress = await prisma.userProgress.update({
                 where: { id: progress.id },
                 data: { accuracy, attempts: progress.attempts + attempts }
             });
        } else {
             progress = await prisma.userProgress.create({
                 data: { userId: user.id, topicId: topic.id, accuracy, attempts }
             });
        }

        res.json(progress);
    } catch (error) {
        console.error("Failed to save progress:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get all learner progress records for the seller dashboard
router.get("/learners", async (req: Request, res: Response) => {
    try {
        const progresses = await prisma.userProgress.findMany({
            include: {
                user: {
                    select: { id: true, username: true, email: true, profilePic: true }
                },
                topic: true
            },
            orderBy: { lastUpdated: 'desc' }
        });

        res.json(progresses);
    } catch (error) {
        console.error("Failed to fetch progress:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get detailed quiz attempts for the seller dashboard
router.get("/quiz-attempts", async (req: Request, res: Response) => {
    try {
        const attempts = await prisma.quizAttempt.findMany({
            include: {
                user: {
                    select: { id: true, username: true, email: true, profilePic: true }
                },
                course: {
                    select: { name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(attempts);
    } catch (error) {
        console.error("Failed to fetch quiz attempts:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// A temporary endpoint to seed some dummy data for the dashboard
router.post("/seed", async (req: Request, res: Response) => {
    try {
        let dummyUser = await prisma.user.findFirst({ where: { role: 'learner' } });
        if (!dummyUser) {
            dummyUser = await prisma.user.create({
                data: {
                    username: 'John Learner',
                    email: 'john@learner.com',
                    passwordHash: 'dummyhash123',
                    role: 'learner'
                }
            });
        }

        const dummyTopic = await prisma.topic.create({
            data: {
                name: 'State Management Lifecycle',
                difficulty: 'Hard',
                courseName: 'SUPPLY AND DEMANDS'
            }
        });

        await prisma.userProgress.create({
            data: {
                userId: dummyUser.id,
                topicId: dummyTopic.id,
                accuracy: 78.5,
                attempts: 12
            }
        });

        await prisma.attempt.create({
            data: {
                userId: dummyUser.id,
                questionId: 'q-1',
                isCorrect: false,
                timeTaken: 120
            }
        });
        
        await prisma.attempt.create({
            data: {
                userId: dummyUser.id,
                questionId: 'q-2',
                isCorrect: true,
                timeTaken: 45
            }
        });

        res.json({ message: "Seeded dummy progress and attempts" });
    } catch (error) {
         res.status(500).json({ message: "Seeding failed", error });
    }
});

export default router;
