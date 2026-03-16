const express = require('express');
const router = express.Router();
const journalController = require('../controllers/journalController');

router.post('/', journalController.createJournal);
router.get('/:userId', journalController.getJournals);
router.post('/analyze', journalController.analyzeText);
router.get('/insights/:userId', journalController.getInsights);

module.exports = router;
