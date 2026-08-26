import { Router } from 'express';
import { createCourse } from '../controllers/course.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

// Route for a seller to publish a new course
router.post('/create', createCourse);

export default router;
