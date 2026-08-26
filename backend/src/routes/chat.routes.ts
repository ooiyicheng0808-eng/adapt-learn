import { Router } from "express";
import { ChatController } from "../controllers/chat.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createSessionSchema, sendMessageSchema } from "../validations/chat.validation";

const router = Router();

router.use(authenticate);

router.post("/session", validate(createSessionSchema), ChatController.createSession);
router.get("/session", ChatController.getSessions);
router.get("/session/:sessionId", ChatController.getSessionMessages);
router.post("/message", validate(sendMessageSchema), ChatController.sendMessage);
router.post("/generate-course", ChatController.generateCourse);
router.post("/evaluate-quiz", ChatController.evaluateQuiz);

export default router;
