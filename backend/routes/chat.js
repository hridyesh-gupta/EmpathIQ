const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Chat = require('../models/Chat');
const auth = require('../middleware/auth');
const router = express.Router();

// Validate API key
if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is not set in environment variables');
  process.exit(1);
}

// Initialize Gemini API with error handling
let genAI;
let model;
try {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ model: "gemini-pro" });
  console.log('Successfully initialized Gemini API');
} catch (error) {
  console.error('Failed to initialize Gemini API:', error);
  process.exit(1);
}

// Helper function to analyze sentiment using Gemini
async function analyzeSentiment(text) {
  try {
    console.log('Analyzing sentiment for text:', text);
    const prompt = `Analyze the sentiment of the following text and respond with ONLY ONE WORD: positive, negative, or neutral.
Text: "${text}"`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const sentiment = response.text().toLowerCase().trim();
    console.log('Sentiment analysis result:', sentiment);
    
    if (!['positive', 'negative', 'neutral'].includes(sentiment)) {
      console.warn('Invalid sentiment received:', sentiment);
      return { score: 0, label: 'neutral' };
    }
    
    const score = sentiment === 'positive' ? 1 : sentiment === 'negative' ? -1 : 0;
    return { score, label: sentiment };
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    return { score: 0, label: 'neutral' };
  }
}

// Helper function to get AI response
async function getAIResponse(message, sentiment, previousMessages = []) {
  try {
    console.log('Getting AI response for message:', message);
    console.log('Current sentiment:', sentiment);
    
    const systemPrompt = `You are EmpathIQ, an empathetic and intelligent AI assistant that understands and responds to users' emotions while providing helpful, accurate, and detailed responses. You can help with any topic including studies, coding, health, emotional issues, and general advice. Consider the user's emotional state (${sentiment.label}) while responding.

Instructions for response formatting:
1. Use markdown formatting for better readability
2. Use headers (##) for main sections
3. Use bold (**) for important points
4. Use bullet points (*) for lists
5. Use code blocks (\`\`\`) for code snippets
6. Use proper paragraphs with line breaks
7. Use italics (_) for emphasis
8. Keep responses well-structured and visually organized

Current conversation context:
- User's emotional state: ${sentiment.label}
- Respond naturally and empathetically
- Provide detailed and helpful information
- Be supportive and understanding
- If asked about technical topics, provide accurate and detailed explanations
- If discussing emotional issues, be especially empathetic and supportive

Previous messages:
${previousMessages.slice(-5).map(msg => `${msg.sender}: ${msg.content}`).join('\n')}

User message: ${message}`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();
    console.log('Generated AI response:', text);
    return text;
  } catch (error) {
    console.error('AI response error:', error);
    if (error.message?.includes('API key')) {
      throw new Error('Invalid API key. Please check your GEMINI_API_KEY environment variable.');
    }
    throw error;
  }
}

// Start or continue chat
router.post('/', auth, async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.userId;

    // Find existing chat or create new one
    let chat = await Chat.findOne({ userId }).sort({ createdAt: -1 });
    if (!chat) {
      chat = new Chat({ userId });
    }

    // Analyze sentiment
    const sentiment = await analyzeSentiment(message);

    // Add user message with sentiment
    chat.messages.push({
      content: message,
      sender: 'user',
      sentiment
    });

    try {
      // Get AI response considering previous context
      const previousMessages = chat.messages.slice(-5); // Get last 5 messages for context
      const botResponse = await getAIResponse(message, sentiment, previousMessages);

      // Add bot response
      chat.messages.push({
        content: botResponse,
        sender: 'bot',
        sentiment: await analyzeSentiment(botResponse)
      });

      // Update overall chat sentiment
      const recentMessages = chat.messages.slice(-5);
      const avgSentiment = recentMessages.reduce((sum, msg) => sum + (msg.sentiment?.score || 0), 0) / recentMessages.length;
      chat.overallSentiment = avgSentiment > 0.3 ? 'positive' : avgSentiment < -0.3 ? 'negative' : 'neutral';

      await chat.save();
      res.json({ chat, botResponse });
    } catch (error) {
      console.error('Error in chat processing:', error);
      
      // Add a fallback bot response in case of API error
      const fallbackResponse = "I apologize, but I'm having trouble processing your request at the moment. Please try again.";
      chat.messages.push({
        content: fallbackResponse,
        sender: 'bot',
        sentiment: { score: 0, label: 'neutral' }
      });
      
      await chat.save();
      res.json({ chat, botResponse: fallbackResponse });
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      message: 'Error processing message', 
      error: error.message,
      details: error.response?.data 
    });
  }
});

// Get chat history
router.get('/history', auth, async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chat history', error: error.message });
  }
});

module.exports = router; 