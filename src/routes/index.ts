import express from 'express';
import { getJobs } from '../controller/getJob';

const router = express.Router();

router.get('/jobs', getJobs);

export default router;
