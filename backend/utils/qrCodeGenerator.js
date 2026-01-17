import QRCode from 'qrcode';
import QRCodeModel from '../models/QRCode.js';

export const generateQRCode = async (locationId, locationData) => {
  try {
    // Create QR code data
    const qrCodeData = {
      locationId,
      title: locationData.title,
      block: locationData.block,
      floor: locationData.floor,
      timestamp: new Date().toISOString()
    };

    // Generate QR code URL
    const qrCodeUrl = await QRCode.toDataURL(JSON.stringify(qrCodeData), {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return qrCodeUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

export const generateQRCodeImage = async (locationId, locationData) => {
  try {
    const qrCodeData = {
      locationId,
      title: locationData.title,
      block: locationData.block,
      floor: locationData.floor,
      timestamp: new Date().toISOString()
    };

    // Generate QR code as PNG buffer
    const buffer = await QRCode.toBuffer(JSON.stringify(qrCodeData), {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 1,
      width: 300
    });

    return buffer;
  } catch (error) {
    console.error('Error generating QR code image:', error);
    throw new Error('Failed to generate QR code image');
  }
};

export const recordQRCodeScan = async (qrCodeId, userId, ipAddress) => {
  try {
    const qrCode = await QRCodeModel.findById(qrCodeId);
    
    if (!qrCode) {
      throw new Error('QR Code not found');
    }

    qrCode.scans += 1;
    qrCode.lastScannedBy = userId;
    qrCode.lastScannedAt = new Date();
    
    qrCode.scanHistory.push({
      userId,
      timestamp: new Date(),
      ipAddress
    });

    await qrCode.save();
    return qrCode;
  } catch (error) {
    console.error('Error recording QR code scan:', error);
    throw error;
  }
};
