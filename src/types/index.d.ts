export interface Job {
	uniqueIdentifier: string;
	title: string;
	company: string;
	location: string;
	description: string;
	postedDate?: Date;
	jobUrl: string;
	createdAt: Date;
	updatedAt: Date;
}