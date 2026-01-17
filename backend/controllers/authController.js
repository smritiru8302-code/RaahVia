import User from '../models/User.js';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
  try {
    const { name, email, password, phone, department } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create user
    user = await User.create({
      name,
      email,
      password,
      phone,
      department
    });

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('favoritePlaces');
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone, department, preferences } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, department, preferences, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addFavoritePlace = async (req, res) => {
  try {
    const { locationId } = req.body;

    const user = await User.findById(req.user.id);
    
    if (!user.favoritePlaces.includes(locationId)) {
      user.favoritePlaces.push(locationId);
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Location added to favorites',
      favoritePlaces: user.favoritePlaces
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const removeFavoritePlace = async (req, res) => {
  try {
    const { locationId } = req.body;

    const user = await User.findById(req.user.id);
    user.favoritePlaces = user.favoritePlaces.filter(id => id.toString() !== locationId);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Location removed from favorites',
      favoritePlaces: user.favoritePlaces
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getNavigationHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('navigationHistory.locationId');
    
    res.status(200).json({
      success: true,
      history: user.navigationHistory
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
