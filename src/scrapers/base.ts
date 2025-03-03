import puppeteer, { Browser, Page } from 'puppeteer';
import logger from '../utils/logger';
import { Job } from '../types';

export abstract class BaseScraper {
	protected browser: Browser | null = null;
	protected company: string;
	constructor(company: string) {
		this.company = company;
	}
	protected async initBrowser(): Promise<Browser> {
		try {
			this.browser = await puppeteer.launch({
				headless: true,
				args: ['--no-sandbox', '--disable-setuid-sandbox'],
			});
			return this.browser;
		} catch (error) {
			logger.error(`Error initializing browser for ${this.company}:`, error);
			throw error;
		}
	}
	protected async closeBrowser(): Promise<void> {
		try {
			if (this.browser) {
				this.browser.close();
				this.browser = null;
			}
		} catch (error) {
			logger.error(`Error closing browser for ${this.company}:`, error);
		}
	}
	protected async createPage(userAgent: string): Promise<Page> {
		const browser = await this.initBrowser();
		const page = await browser.newPage();

		await page.setUserAgent(userAgent);

		await page.setDefaultNavigationTimeout(60000);
		await page.setDefaultTimeout(60000);

		return page;
	}
	public abstract scrape(): Promise<Job[]>;
}
