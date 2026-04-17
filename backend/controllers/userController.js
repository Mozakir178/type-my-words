const User = require('../models/User');

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

exports.updatePreferences = async (req, res, next) => {
  try {
    const { theme, soundEnabled, fontSize, fontFamily } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { preferences: { theme, soundEnabled, fontSize, fontFamily } } },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({ success: true, data: { user: user.preferences } });
  } catch (error) {
    next(error);
  }
};

exports.updateAccount = async (req, res, next) => {
  try {
    const { username, email } = req.body;
    const updates = {};
    
    if (username) updates.username = username;
    if (email) updates.email = email;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

exports.deleteAccount = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    // Optional: delete user's tests
    // await TestResult.deleteMany({ userId: req.user._id });
    
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    next(error);
  }
};