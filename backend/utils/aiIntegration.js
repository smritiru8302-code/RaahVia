import axios from 'axios';

export const getAIResponse = async (userMessage, conversationContext = []) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.AI_MODEL || 'gpt-3.5-turbo';

    if (!apiKey) {
      console.warn('OpenAI API key not configured');
      return 'AI Assistant is not configured. Please set up your OpenAI API key.';
    }

    const messages = [
      {
        role: 'system',
        content: `You are a helpful campus navigation assistant for RaahVia. 
        You help students and visitors navigate the campus, find locations, 
        and provide information about facilities. Keep responses concise and helpful.`
      },
      ...conversationContext,
      { role: 'user', content: userMessage }
    ];

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model,
        messages,
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI API:', error.message);
    throw new Error('Failed to get AI response');
  }
};

export const getCampusInfo = (query) => {
  // This can be extended with more campus-specific knowledge
  const campusDatabase = {
    'pharmacy': 'The pharmacy block is located in the main campus area with accessible parking and wheelchair access.',
    'auditorium': 'The auditorium can hold 500+ students and is used for events and lectures.',
    'cafeteria': 'Multiple cafeterias are available across different blocks with various food options.',
    'library': 'The central library is open from 8 AM to 10 PM with extensive resources.',
    'sports': 'Sports facilities include a gym, cricket field, basketball court, and tennis courts.'
  };

  return campusDatabase[query.toLowerCase()] || null;
};
