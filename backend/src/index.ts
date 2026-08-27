import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import chatRoutes from "./routes/chat.routes";
import progressRoutes from "./routes/progress.routes";
import messageRoutes from "./routes/message.routes";
import courseRoutes from "./routes/course.routes";

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/course", courseRoutes);

app.get("/", (req, res) => {
    res.send("API is running...");
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});