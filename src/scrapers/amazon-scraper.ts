import scraperConfig from '../config/scraper';
import type { Job } from '../types';
import { generateJobHash } from '../utils/hashGenerator';
import logger from '../utils/logger';
import { BaseScraper } from './base';

export class AmazonScraper extends BaseScraper {
	constructor() {
		super('Amazon');
	}

	private parsePostedDate(dateText: string): Date {
		try {
			const NewdateText = dateText.replace('Posted ', '');

			const date = new Date(NewdateText);

			if (Number.isNaN(date.getTime())) {
				logger.error('Invalid date format:', NewdateText);
				return new Date();
			}

			return date;
		} catch (error) {
			logger.error('Error parsing date:', error);
			return new Date();
		}
	}

	public async scrape(): Promise<Job[]> {
		logger.info('Starting Amazon jobs scraper');
		const jobs: Job[] = [];
		try {
			const page = await this.createPage(scraperConfig.amazon.userAgent);

			//used loop if u want just initial number of pages and not all
			//remove loop if u want all pages , as if no result found it will stop automatically

			for (let pageNum = 1; pageNum <= scraperConfig.amazon.maxPages; pageNum++) {
				const offset = (pageNum - 1) * 10;
				await page.goto(
					`${scraperConfig.amazon.baseUrl}?offset=${offset}&result_limit=10&sort=relevant`,
					{
						waitUntil: 'networkidle2',
					}
				);

				try {
					await Promise.race([
						page.waitForSelector('.job-tile'),
						new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 30000)),
					]);
				} catch (error) {
					logger.info('Timed out waiting for job elements');
					break;
				}
				const jobElements = await page.$$('.job-tile');

				if (!jobElements || jobElements.length === 0) {
					logger.info('No job elements found on page, stopping scrape');
					break;
				}

				const hasNewElement = await page.evaluate(() => {
					return !!document.querySelector('.BNC4xeg0bPVAphPlrQXK');
				});

				if (hasNewElement) {
					logger.info('Found new Amazon jobs page format, stopping scrape');
					break;
				}
				logger.info(`Found ${jobElements.length} job elements on page ${pageNum}`);

				for (const jobElement of jobElements) {
					try {
						const title = await jobElement.$eval(
							'.job-title a',
							(el: Element) => el.textContent?.trim() || ''
						);
						const locationElement = await jobElement.$('.location-and-id ul li:first-child');
						const location = locationElement
							? await locationElement.evaluate((el: Element) => el.textContent?.trim() || '')
							: '';
						const description = await jobElement.$eval(
							'.qualifications-preview',
							(el: Element) => el.textContent?.trim() || ''
						);
						const postedDateText = await jobElement.$eval(
							'.posting-date',
							(el: Element) => el.textContent?.trim() || ''
						);
						const jobUrl = await jobElement.$eval(
							'.job-title a',
							(el: Element) => `https://www.amazon.jobs${el.getAttribute('href') || ''}`
						);

						const uniqueIdentifier = await generateJobHash({
							title,
							company: 'Amazon',
							location,
						});

						jobs.push({
							title,
							description,
							uniqueIdentifier,
							location,
							company: 'Amazon',
							jobUrl,
							postedDate: this.parsePostedDate(postedDateText),
							createdAt: new Date(),
							updatedAt: new Date(),
						});
					} catch (error) {
						logger.error('Error scraping Amazon job:', error);
					}
				}

				if (pageNum < scraperConfig.amazon.maxPages) {
					await new Promise((resolve) => setTimeout(resolve, 2000));
				}
			}

			logger.info(`Successfully scraped ${jobs.length} jobs from Amazon`);
		} catch (error) {
			logger.error(
				`Error scraping Amazon jobs: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		} finally {
			await this.closeBrowser();
		}

		return jobs;
	}
}
