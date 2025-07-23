import express from 'express';
import { getCompanyById, getTrendingCompanies, searchCompanies } from '../controllers/companyController';

const router = express.Router();

// Get trending/popular companies
router.get('/trending', getTrendingCompanies);

// Search companies with filters
router.get('/search', searchCompanies);

// Get all companies (alias for trending)
router.get('/', getTrendingCompanies);

// Get company by ID
router.get('/:id', getCompanyById);

export default router;
