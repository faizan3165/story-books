const express = require('express');
const router = express.Router();

const Story = require('../models/Story');

const { ensureAuth, ensureGuest } = require('../middleware/auth');

// @desc  Login/Landing
// @route GET /
router.get('/', ensureGuest, (req, res) => {
  res.render('login', {
    layout: 'login',
  });
});

// @desc  Dashboard
// @route GET /dashboard
router.get('/dashboard', ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({ user: req.user.id }).lean();
    res.render('dashboard', {
      name: req.user.displayName,
      image: req.user.image,
      id: req.user.id,
      stories
    });
  } catch (err) {
      console.log(err);
      res.render('error/500')
  }
});

module.exports = router;
