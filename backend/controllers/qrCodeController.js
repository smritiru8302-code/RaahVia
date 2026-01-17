import QRCode from '../models/QRCode.js';
import { recordQRCodeScan } from '../utils/qrCodeGenerator.js';

export const getQRCode = async (req, res) => {
  try {
    const qrCode = await QRCode.findById(req.params.id).populate('locationId');

    if (!qrCode) {
      return res.status(404).json({ success: false, message: 'QR code not found' });
    }

    res.status(200).json({
      success: true,
      qrCode
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getQRCodeByLocation = async (req, res) => {
  try {
    const { locationId } = req.params;
    const qrCode = await QRCode.findOne({ locationId, isActive: true }).populate('locationId');

    if (!qrCode) {
      return res.status(404).json({ success: false, message: 'QR code not found for this location' });
    }

    res.status(200).json({
      success: true,
      qrCode
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const scanQRCode = async (req, res) => {
  try {
    const { qrCodeId } = req.body;
    const userId = req.user?.id || null;
    const ipAddress = req.ip;

    const qrCode = await recordQRCodeScan(qrCodeId, userId, ipAddress);

    res.status(200).json({
      success: true,
      message: 'QR code scanned successfully',
      qrCode,
      location: await qrCode.populate('locationId')
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getQRCodeStats = async (req, res) => {
  try {
    const { locationId } = req.params;
    const qrCode = await QRCode.findOne({ locationId });

    if (!qrCode) {
      return res.status(404).json({ success: false, message: 'QR code not found' });
    }

    const stats = {
      totalScans: qrCode.scans,
      lastScanned: qrCode.lastScannedAt,
      scanHistory: qrCode.scanHistory.length,
      isActive: qrCode.isActive,
      createdAt: qrCode.createdAt
    };

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllQRCodes = async (req, res) => {
  try {
    const qrCodes = await QRCode.find({ isActive: true })
      .populate('locationId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: qrCodes.length,
      qrCodes
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
