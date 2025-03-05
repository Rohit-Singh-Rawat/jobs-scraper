import cron from "node-cron";
import logger from "../utils/logger";
import type { ScraperService } from "../scrapers/scraperManager";

export class CronService {
  private scraperService: ScraperService;
  private cronExpression: string;

  constructor(scraperService: ScraperService, cronExpression?: string) {
    this.scraperService = scraperService;
    this.cronExpression =
      cronExpression || process.env.SCRAPE_INTERVAL || "0 */4 * * *"; // Default: hourly
  }

  public startCronJobs(): void {
    logger.info(`Setting up cron job with expression: ${this.cronExpression}`);

    cron.schedule(this.cronExpression, async () => {
      logger.info("Running scheduled job scraper");
      try {
        await this.scraperService.runAllScrapers();
        logger.info("Scheduled job scraper completed");
      } catch (error) {
        logger.error("Error in scheduled job scraper:", error);
      }
    });

    logger.info("Cron jobs started");
  }
}
