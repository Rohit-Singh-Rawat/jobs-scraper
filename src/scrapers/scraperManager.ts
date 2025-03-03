import jobModel from '../models/job.model';
import { Job } from '../types';
import logger from '../utils/logger';
import { MicrosoftScraper } from './microsoft-scraper';
import { GoogleScraper } from './google-scaper';
import { AmazonScraper } from './amazon-scraper';

export class ScraperService {
	private async saveJobs(jobs: Job[]): Promise<void> {
		try {
			for (const job of jobs) {
				const existingJob = await jobModel.findOne({ uniqueIdentifier: job.uniqueIdentifier });

				if (existingJob) {
					if (job.postedDate && existingJob.postedDate && 
						job.postedDate.getDate() !== existingJob.postedDate.getDate()) {
						await jobModel.updateOne(
							{ uniqueIdentifier: job.uniqueIdentifier },
							{
								$set: {
									...job,
									updatedAt: new Date(),
									createdAt: existingJob.createdAt,
									isActive: true,
								},
							}
						);
						logger.debug(
							`Updated job: ${job.title} - Posted date changed from ${existingJob.postedDate} to ${job.postedDate}`
						);
					} else {
						logger.debug(`Skipped update for ${job.title} - Same posted date`);
					}
				} else {
					await jobModel.create(job);
					logger.debug(`Created new job: ${job.title}`);
				}
			}
		} catch (error) {
			logger.error('Error saving jobs:', error);
			throw error;
		}
	}

	public async runAllScrapers(): Promise<void> {
		logger.info('Starting all scrapers');

		try {
			await this.runMicrosoftScraper();
			await this.runGoogleScraper();
			await this.runAmazonScraper();

			logger.info('All scrapers completed');
		} catch (error) {
			logger.error('Error running scrapers:', error);
		}
	}

	private async runMicrosoftScraper(): Promise<void> {
		try {
			const scraper = new MicrosoftScraper();
			const jobs = await scraper.scrape();
			await this.saveJobs(jobs);
			logger.info(`Saved ${jobs.length} Microsoft jobs`);
		} catch (error) {
			logger.error('Microsoft scraper service error:', error);
		}
	}

	private async runGoogleScraper(): Promise<void> {
		try {
			const scraper = new GoogleScraper();
			const jobs = await scraper.scrape();
			await this.saveJobs(jobs);
			logger.info(`Saved ${jobs.length} Google jobs`);
		} catch (error) {
			logger.error('Google scraper service error:', error);
		}
	}

	private async runAmazonScraper(): Promise<void> {
		try {
			const scraper = new AmazonScraper();
			const jobs = await scraper.scrape();
			await this.saveJobs(jobs);
			logger.info(`Saved ${jobs.length} Amazon jobs`);
		} catch (error) {
			logger.error('Amazon scraper service error:', error);
		}
	}
}
