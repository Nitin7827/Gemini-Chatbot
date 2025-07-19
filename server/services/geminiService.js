const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async generateResponse(messages, options = {}) {
    try {
      // Check if API key is available
      if (!process.env.GEMINI_API_KEY) {
        console.error('GEMINI_API_KEY is not set in environment variables');
        return {
          success: false,
          error: 'API key not configured',
          content: 'API key not configured. Please check your environment variables.'
        };
      }

      // Convert messages to Gemini format
      const history = messages.slice(0, -1).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const currentMessage = messages[messages.length - 1];
      
      console.log('Sending message to Gemini:', currentMessage.content);
      
      // Start chat with history
      const chat = this.model.startChat({
        history: history,
        generationConfig: {
          maxOutputTokens: options.maxTokens || 2048,
          temperature: options.temperature || 0.7,
          topP: options.topP || 0.8,
          topK: options.topK || 40,
        },
      });

      // Send current message
      const result = await chat.sendMessage(currentMessage.content);
      const response = await result.response;
      const text = response.text();

      console.log('Gemini response received:', text.substring(0, 100) + '...');

      return {
        success: true,
        content: text,
        usage: {
          promptTokens: result.response.usageMetadata?.promptTokenCount || 0,
          responseTokens: result.response.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: result.response.usageMetadata?.totalTokenCount || 0
        }
      };
    } catch (error) {
      console.error('Gemini API Error Details:', {
        message: error.message,
        stack: error.stack,
        apiKey: process.env.GEMINI_API_KEY ? 'Set' : 'Not set'
      });
      return {
        success: false,
        error: error.message || 'Failed to generate response',
        content: 'I apologize, but I encountered an error while processing your request. Please try again.'
      };
    }
  }

  async generateStreamResponse(messages, onChunk) {
    try {
      const history = messages.slice(0, -1).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const currentMessage = messages[messages.length - 1];
      
      const chat = this.model.startChat({
        history: history,
        generationConfig: {
          maxOutputTokens: 2048,
          temperature: 0.7,
        },
      });

      const result = await chat.sendMessage(currentMessage.content);
      const stream = result.stream;

      for await (const chunk of stream) {
        const chunkText = chunk.text();
        if (chunkText) {
          onChunk(chunkText);
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Gemini Stream Error:', error);
      return {
        success: false,
        error: error.message || 'Failed to generate stream response'
      };
    }
  }

  async generateTitle(messages) {
    try {
      const prompt = `Generate a short, descriptive title (max 50 characters) for this conversation based on the first few messages. Return only the title, nothing else:\n\n${messages.slice(0, 3).map(m => `${m.role}: ${m.content}`).join('\n')}`;
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const title = response.text().trim();
      
      return title.length > 50 ? title.substring(0, 47) + '...' : title;
    } catch (error) {
      console.error('Title generation error:', error);
      return 'New Chat';
    }
  }
}

module.exports = new GeminiService(); 