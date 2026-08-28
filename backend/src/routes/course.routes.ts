import { Router } from 'express';
import { createCourse } from '../controllers/course.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

// Route for a seller to publish a new course
router.post('/create', createCourse);

// Route to get all courses
router.get('/all', async (req, res) => {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    const courses = await prisma.course.findMany({
      include: { seller: { select: { username: true } }, questions: true }
    });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to get a specific course
router.get('/:id', async (req, res) => {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: { seller: { select: { username: true } }, questions: true }
    });
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route for seller to add questions to an existing course
router.post('/:id/questions', async (req, res) => {
  try {
    const { questions, courseName } = req.body;
    let courseId = req.params.id;
    const sellerId = (req as any).user?.id || 'dummy-seller'; // fallback if no auth
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    // Ensure course exists (supports both UUIDs and short hardcoded IDs)
    let course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      let dummySeller = await prisma.user.findFirst({ where: { role: 'seller' } });
      if (!dummySeller) {
        dummySeller = await prisma.user.create({
          data: { email: 'community@seller.com', username: 'Community Seller', role: 'seller', passwordHash: 'none' }
        });
      }
      course = await prisma.course.create({
        data: {
          id: courseId, // Ensure exact ID is used
          name: courseName || `Course ${courseId}`,
          sellerId: dummySeller.id,
          price: 500,
        }
      });
    }

    // Add questions
    for (const q of questions) {
      await prisma.question.create({
        data: {
          courseId,
          questionText: q.questionText,
          options: JSON.stringify(q.options),
          correctAnswer: q.correctAnswer
        }
      });
    }
    res.json({ message: 'Questions added successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
