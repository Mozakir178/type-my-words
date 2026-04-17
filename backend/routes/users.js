const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getProfile,
  updatePreferences,
  updateAccount,
  deleteAccount
} = require('../controllers/userController');

router.use(protect);

router.get('/me', getProfile);
router.patch('/preferences', updatePreferences);
router.patch('/update', updateAccount);
router.delete('/delete', deleteAccount);

module.exports = router;