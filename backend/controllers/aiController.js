import { getAIResponse, getCampusInfo } from '../utils/aiIntegration.js';

export const chatWithAI = async (req, res) => {
  try {
    const { message, conversationContext = [] } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Message cannot be empty' });
    }

    // First check if it's campus-specific info
    const campusInfo = getCampusInfo(message);
    
    let response;
    if (campusInfo) {
      response = campusInfo;
    } else {
      response = await getAIResponse(message, conversationContext);
    }

    res.status(200).json({
      success: true,
      response,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to process AI request'
    });
  }
};

export const getAILocationInfo = async (req, res) => {
  try {
    const { locationTitle } = req.query;

    if (!locationTitle) {
      return res.status(400).json({ success: false, message: 'Location title is required' });
    }

    const prompt = `Tell me about the campus location: ${locationTitle}. Include information about facilities, accessibility, and any special features.`;
    const response = await getAIResponse(prompt);

    res.status(200).json({
      success: true,
      response,
      location: locationTitle
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getNavigationAssistance = async (req, res) => {
  try {
    const { fromLocation, toLocation } = req.query;

    if (!fromLocation || !toLocation) {
      return res.status(400).json({ 
        success: false, 
        message: 'Both fromLocation and toLocation are required' 
      });
    }

    const prompt = `Give navigation assistance from ${fromLocation} to ${toLocation} on campus. Include landmarks and directions.`;
    const response = await getAIResponse(prompt);

    res.status(200).json({
      success: true,
      response,
      from: fromLocation,
      to: toLocation
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
