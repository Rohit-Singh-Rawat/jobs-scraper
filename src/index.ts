import express, {
  type Express,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import compression from "compression";
import { rateLimit } from "express-rate-limit";
import logger from "./utils/logger";
import router from "./routes";
import dotenv from "dotenv";
import { ScraperService } from "./scrapers/scraperManager";
import { CronService } from "./services/cron-job";
import { connectDB } from "./db";

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

const start = async () => {
  try {
    await connectDB();

    app.use(
      rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 200,
        standardHeaders: true,
        legacyHeaders: false,
        message: { error: "Too many requests, please try again later" },
      }),
    );
    app.get("/health", (_req: Request, res: Response) => {
      res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });

    app.use("/api/v1", router);

    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      logger.error("Unhandled error:", err);
      res.status(500).json({ error: "Internal server error" });
    });

    const scraperService = new ScraperService();
    const cronService = new CronService(scraperService);

    cronService.startCronJobs();

    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

start();
