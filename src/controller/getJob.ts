import { Request, Response } from 'express';
import jobModel from '../models/job.model';
import logger from '../utils/logger';

export const getJobs = async (req: Request, res: Response): Promise<void> => {
	try {
		const page = parseInt(req.query.page as string) || 1;
		const limit = parseInt(req.query.limit as string) || 10;
		const company = req.query.company as string;
		const searchQuery = req.query.q as string;

		const query: any = {  };

		if (company) {
			query.company = { $regex: company, $options: 'i' };
		}

		if (searchQuery) {
			query.$or = [
				{ title: { $regex: searchQuery, $options: 'i' } },
				{ description: { $regex: searchQuery, $options: 'i' } },
			];
		}

		const jobs = await jobModel
			.find(query)
			.sort({ postedDate: -1 })
			.skip((page - 1) * limit)
			.limit(limit);

		const totalJobs = await jobModel.countDocuments(query);
		const totalPages = Math.ceil(totalJobs / limit);

		res.status(200).json({
			success: true,
			data: {
				jobs,
				pagination: {
					currentPage: page,
					totalPages,
					totalItems: totalJobs,
					itemsPerPage: limit,
				},
			},
		});
	} catch (error) {
		logger.error('Error fetching jobs:', error);
		res.status(500).json({
			success: false,
			error: 'Internal server error',
		});
	}
};
