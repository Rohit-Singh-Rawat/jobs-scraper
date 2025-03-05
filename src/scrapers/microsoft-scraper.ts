import scraperConfig from "../config/scraper";
import type { Job } from "../types";
import { generateJobHash } from "../utils/hashGenerator";
import logger from "../utils/logger";
import { BaseScraper } from "./base";

export class MicrosoftScraper extends BaseScraper {
  constructor() {
    super("Microsoft");
  }
  private pageScraped = 0;
  private parsePostedDate(dateText: string): Date {
    try {
      const now = new Date();
      const match = dateText.match(
        /^(?:t)?(\d+)\s+(day|days|month|months|year|years)\s+ago$/,
      );

      if (!match) {
        return now;
      }

      const [, value, unit] = match;
      const amount = Number.parseInt(value);

      switch (unit) {
        case "day":
        case "days":
          now.setDate(now.getDate() - amount);
          break;
        case "month":
        case "months":
          now.setMonth(now.getMonth() - amount);
          break;
        case "year":
        case "years":
          now.setFullYear(now.getFullYear() - amount);
          break;
      }

      return now;
    } catch (error) {
      logger.error("Error parsing date:", error);
      return new Date();
    }
  }
  public async scrape(): Promise<Job[]> {
    logger.info("Starting Microsoft jobs scraper");
    const jobs: Job[] = [];
    try {
      const page = await this.createPage(scraperConfig.microsoft.userAgent);

      //used loop if u want just initial number of pages and not all
      //remove loop if u want all pages , as if no result found it will stop automatically

      for (
        let pageNum = 1;
        pageNum <= scraperConfig.microsoft.maxPages;
        pageNum++
      ) {
        logger.info(`Scraping page ${pageNum}`);

        await page.goto(
          `${scraperConfig.microsoft.baseUrl}?l=en_us&pg=${pageNum}&pgSz=20&o=Relevance`,
          {
            waitUntil: "networkidle2",
          },
        );
        await Promise.race([
          page.waitForSelector(".ms-List-cell"),
          page.waitForSelector(".BNC4xeg0bPVAphPlrQXK"),
        ]);

        const hasNewElement = await page.evaluate(() => {
          return !!document.querySelector(".BNC4xeg0bPVAphPlrQXK");
        });

        if (hasNewElement) {
          break;
        }

        const jobElements = await page.$$(".ms-List-cell");
        logger.info(
          `Found ${jobElements.length} job elements on page ${pageNum}`,
        );

        if (jobElements.length === 0) {
          logger.info("No job elements found on page, stopping scrape");
          break;
        }

        if (hasNewElement) {
          logger.info("Found new Microsoft jobs page format, stopping scrape");
          break;
        }

        for (const jobElement of jobElements) {
          try {
            const title = await jobElement.$eval(
              "h2.MZGzlrn8gfgSs8TZHhv2",
              (el) => el.textContent?.trim() || "",
            );

            const description = await jobElement.$eval(
              'span[aria-label="job description"]',
              (el) => el.textContent?.trim() || "",
            );
            const location = await jobElement.$eval(
              '[data-icon-name="POI"] + span',
              (el) => el.textContent?.trim() || "",
            );
            const postedDate = await jobElement.$eval(
              '[data-icon-name="Clock"] + span',
              (el) => el.textContent?.trim() || "",
            );
            const ariaLabel = await jobElement.$eval(
              'div[aria-label^="Job item"]',
              (el) => el.getAttribute("aria-label") || "",
            );
            const match = ariaLabel?.match(/Job item (\d+)/);
            const jobId = match ? Number.parseInt(match[1]) : 0;
            const url = `https://careers.microsoft.com/us/en/job/${jobId}?l=en_us&pg=${pageNum}&pgSz=20&o=Relevance`;
            jobs.push({
              title,
              description,
              uniqueIdentifier: await generateJobHash({
                title,
                company: "Microsoft",
                location,
              }),
              location,
              postedDate: this.parsePostedDate(postedDate),
              company: "Microsoft",
              jobUrl: url,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          } catch (error) {
            logger.error("Error scraping Microsoft job:", error);
          }
        }
      }
    } catch (error) {
      logger.error(
        `Error scraping Microsoft jobs: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      await this.closeBrowser();
    }

    return jobs;
  }
}
