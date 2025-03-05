import scraperConfig from "../config/scraper";
import type { Job } from "../types";
import { generateJobHash } from "../utils/hashGenerator";
import logger from "../utils/logger";
import { BaseScraper } from "./base";

export class GoogleScraper extends BaseScraper {
  constructor() {
    super("Google");
  }
  private pageScraped = 0;

  public async scrape(): Promise<Job[]> {
    logger.info("Starting Google jobs scraper");
    const jobs: Job[] = [];
    try {
      const page = await this.createPage(scraperConfig.google.userAgent);

      //used loop if u want just initial number of pages and not all
      //remove loop if u want all pages , as if no result found it will stop automatically

      for (
        let pageNum = 1;
        pageNum <= scraperConfig.google.maxPages;
        pageNum++
      ) {
        logger.info(`Scraping page ${pageNum}`);
        await page.goto(
          `${scraperConfig.google.baseUrl}?sort_by=relevance&page=${pageNum}`,
          {
            waitUntil: "networkidle2",
          },
        );
        await Promise.race([
          page.waitForSelector("li.lLd3Je"),
          page.waitForSelector("h2.r4nke"),
        ]);

        const hasNoResults = await page.evaluate(() => {
          return !!document.querySelector("h2.r4nke");
        });

        if (hasNoResults) {
          break;
        }

        const jobElements = await page.$$("li.lLd3Je");
        logger.info(
          `Found ${jobElements.length} job elements on page ${pageNum}`,
        );

        if (jobElements.length === 0) {
          break;
        }

        for (const jobElement of jobElements) {
          try {
            const title = await jobElement.$eval(
              "h3.QJPWVe",
              (el) => el.textContent?.trim() || "",
            );

            const description = await jobElement.$eval("div.Xsxa1e", (el) => {
              const h4Text = el.querySelector("h4")?.textContent || "";
              const listItems = Array.from(el.querySelectorAll("li")).map(
                (li) => li.textContent?.trim() || "",
              );
              return `${h4Text}\n${listItems.join("\n")}`;
            });
            const location = await jobElement.$$eval(
              "span.r0wTof",
              (elements) =>
                elements.map((el) => el.textContent?.trim() || "").join(", "),
            );

            const url = await jobElement.$eval(
              "a.WpHeLc",
              (el) =>
                `https://www.google.com/about/careers/applications${el.getAttribute("href") || ""}`,
            );

            jobs.push({
              title,
              description,
              uniqueIdentifier: await generateJobHash({
                title,
                company: "Google",
                location,
              }),
              location,
              company: "Google",
              jobUrl: url,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          } catch (error) {
            logger.error("Error scraping Google job:", error);
          }
        }
      }
    } catch (error) {
      logger.error(
        `Error scraping Google jobs: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      await this.closeBrowser();
    }

    return jobs;
  }
}
