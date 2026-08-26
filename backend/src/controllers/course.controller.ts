import { Request, Response } from 'express';
import { prisma } from '../index';
import { sendCourseAlertEmail } from '../utils/email';

export const createCourse = async (req: Request, res: Response) => {
  try {
    const { name: courseName, syllabus, questions, price = 500 } = req.body;
    const sellerId = (req as any).user?.id;
    
    if (!sellerId) return res.status(401).json({ error: 'Unauthorized' });
    if (!courseName) return res.status(400).json({ error: 'Course name is required' });

    // Ensure the user is a seller
    const seller = await prisma.user.findUnique({ where: { id: sellerId } });
    if (seller?.role !== 'seller') {
      return res.status(403).json({ error: 'Only sellers can publish courses' });
    }

    // Save course and questions to database
    const newCourse = await prisma.course.create({ 
      data: { 
        name: courseName, 
        sellerId,
        syllabus: JSON.stringify(syllabus || []),
        price: Number(price),
        questions: questions && questions.length > 0 ? {
          create: questions.map((q: any) => ({
            questionText: q.questionText,
            options: JSON.stringify(q.options || []),
            correctAnswer: q.correctAnswer || 0
          }))
        } : undefined
      } 
    });

    // Fetch all learners
    const learners = await prisma.user.findMany({
      where: { role: 'learner' },
      select: { email: true, username: true }
    });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const courseUrl = `${frontendUrl}/catalogue`; // Or a specific course URL

    // Send emails asynchronously (in a real app, this should be offloaded to a queue like BullMQ)
    // We don't await all of them to prevent blocking the response, but we trigger the loop.
    res.status(201).json({ message: 'Course created and alerts are being sent.' });

    // Background processing
    for (const learner of learners) {
      if (learner.email) {
        try {
          await sendCourseAlertEmail(
            learner.email,
            learner.username || 'Learner',
            courseName,
            courseUrl
          );
        } catch (emailError) {
          console.error(`Failed to send course alert to ${learner.email}:`, emailError);
        }
      }
    }

  } catch (error) {
    console.error('Error creating course:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};
