import dotenv from "dotenv";
import logger from "./utils/logger";
import { connectDB } from "./db";
import { ScraperService } from "./scrapers/scraperManager";
dotenv.config();

async function runScraper() {
  try {
    await connectDB();

    const scraperService = new ScraperService();

    logger.info("Starting manual scraper run");
    await scraperService.runAllScrapers();
    logger.info("Manual scraper run completed");

    process.exit(0);
  } catch (error) {
    logger.error("Error running manual scraper:", error);
    process.exit(1);
  }
}

runScraper();
