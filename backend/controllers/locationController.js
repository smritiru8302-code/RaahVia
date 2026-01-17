import Location from '../models/Location.js';
import QRCode from '../models/QRCode.js';
import { generateQRCode } from '../utils/qrCodeGenerator.js';

export const getAllLocations = async (req, res) => {
  try {
    const { category, floor, block, search } = req.query;
    let filter = { isActive: true };

    if (category) filter.category = category;
    if (floor) filter.floor = floor;
    if (block) filter.block = block;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const locations = await Location.find(filter).sort({ title: 1 });

    res.status(200).json({
      success: true,
      count: locations.length,
      locations
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLocationById = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id).populate('reviews');

    if (!location) {
      return res.status(404).json({ success: false, message: 'Location not found' });
    }

    res.status(200).json({
      success: true,
      location
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createLocation = async (req, res) => {
  try {
    const location = await Location.create(req.body);

    // Generate QR code for location
    const qrCodeUrl = await generateQRCode(location._id, location);
    location.qrCodeUrl = qrCodeUrl;
    await location.save();

    // Save QR code to database
    await QRCode.create({
      code: location._id.toString(),
      locationId: location._id,
      codeUrl: qrCodeUrl
    });

    res.status(201).json({
      success: true,
      message: 'Location created successfully',
      location
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateLocation = async (req, res) => {
  try {
    let location = await Location.findById(req.params.id);

    if (!location) {
      return res.status(404).json({ success: false, message: 'Location not found' });
    }

    location = await Location.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Location updated successfully',
      location
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteLocation = async (req, res) => {
  try {
    const location = await Location.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!location) {
      return res.status(404).json({ success: false, message: 'Location not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Location deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLocationsByFloor = async (req, res) => {
  try {
    const { floor } = req.params;
    const locations = await Location.find({ floor, isActive: true }).sort({ block: 1 });

    res.status(200).json({
      success: true,
      count: locations.length,
      locations
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLocationsByBlock = async (req, res) => {
  try {
    const { block } = req.params;
    const locations = await Location.find({ block, isActive: true }).sort({ floor: 1 });

    res.status(200).json({
      success: true,
      count: locations.length,
      locations
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const searchLocations = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({ success: false, message: 'Query must be at least 2 characters' });
    }

    const locations = await Location.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { block: { $regex: query, $options: 'i' } }
      ],
      isActive: true
    }).limit(10);

    res.status(200).json({
      success: true,
      count: locations.length,
      locations
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
