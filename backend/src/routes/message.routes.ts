import { Router } from 'express';
import { getInbox, getConversation, sendMessage, getSellers } from '../controllers/message.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/inbox', getInbox);
router.get('/sellers', getSellers);
router.get('/conversation/:otherUserId', getConversation);
router.post('/', sendMessage);

export default router;
