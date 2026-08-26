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
    const courses = await import('../index').then(m => m.prisma.course.findMany({
      include: { seller: { select: { username: true } }, questions: true }
    }));
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to get a specific course
router.get('/:id', async (req, res) => {
  try {
    const course = await import('../index').then(m => m.prisma.course.findUnique({
      where: { id: req.params.id },
      include: { seller: { select: { username: true } }, questions: true }
    }));
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
    const prisma = (await import('../index')).prisma;
    
    // If the ID is short (hardcoded product ID like '1', '2'), we create a proxy course in the DB
    if (courseId.length < 10) {
      // Check if it already exists to avoid duplicates
      let course = await prisma.course.findFirst({ where: { name: courseName || `Course ${courseId}` }});
      if (!course) {
        course = await prisma.course.create({
          data: {
            name: courseName || `Course ${courseId}`,
            sellerId,
            price: 500,
          }
        });
      }
      courseId = course.id;
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
