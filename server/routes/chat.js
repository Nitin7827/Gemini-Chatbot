const express = require('express');
const { body, validationResult } = require('express-validator');
const Chat = require('../models/Chat');
const { auth, optionalAuth } = require('../middleware/auth');
const geminiService = require('../services/geminiService');

const router = express.Router();

// Get all chats for user
router.get('/', auth, async (req, res) => {
  try {
    const chats = await Chat.find({ 
      userId: req.user._id, 
      isActive: true 
    })
    .select('title lastMessageAt createdAt')
    .sort({ lastMessageAt: -1 });

    res.json({ chats });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
});

// Get specific chat with messages
router.get('/:chatId', auth, async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      userId: req.user._id,
      isActive: true
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.json({ chat });
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({ error: 'Failed to fetch chat' });
  }
});

// Create new chat
router.post('/', auth, [
  body('message').notEmpty().withMessage('Message is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { message, model = 'gemini-pro' } = req.body;

    // Create new chat
    const chat = new Chat({
      userId: req.user._id,
      model,
      messages: [{ role: 'user', content: message }]
    });

    await chat.save();

    // Generate AI response
    console.log('Generating AI response for new chat...');
    const aiResponse = await geminiService.generateResponse(chat.messages);
    console.log('AI Response result:', { success: aiResponse.success, error: aiResponse.error });
    
    if (aiResponse.success) {
      chat.messages.push({ role: 'assistant', content: aiResponse.content });
      await chat.save();

      // Generate title for the chat
      const title = await geminiService.generateTitle(chat.messages);
      chat.title = title;
      await chat.save();
    }

    res.status(201).json({ 
      chat,
      aiResponse: aiResponse.success ? aiResponse.content : aiResponse.error || 'Failed to generate response'
    });
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({ error: 'Failed to create chat' });
  }
});

// Send message to existing chat
router.post('/:chatId/messages', auth, [
  body('message').notEmpty().withMessage('Message is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { message } = req.body;
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      userId: req.user._id,
      isActive: true
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Add user message
    chat.messages.push({ role: 'user', content: message });
    await chat.save();

    // Generate AI response
    const aiResponse = await geminiService.generateResponse(chat.messages);
    
    if (aiResponse.success) {
      chat.messages.push({ role: 'assistant', content: aiResponse.content });
      await chat.save();
    }

    res.json({ 
      message: aiResponse.success ? aiResponse.content : 'Failed to generate response',
      usage: aiResponse.usage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Stream message response
router.post('/:chatId/stream', auth, [
  body('message').notEmpty().withMessage('Message is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { message } = req.body;
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      userId: req.user._id,
      isActive: true
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Add user message
    chat.messages.push({ role: 'user', content: message });
    await chat.save();

    // Set up SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    let fullResponse = '';

    const onChunk = (chunk) => {
      fullResponse += chunk;
      res.write(`data: ${JSON.stringify({ chunk, done: false })}\n\n`);
    };

    // Generate streaming response
    const result = await geminiService.generateStreamResponse(chat.messages, onChunk);
    
    if (result.success) {
      // Add assistant message to chat
      chat.messages.push({ role: 'assistant', content: fullResponse });
      await chat.save();
      
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    } else {
      res.write(`data: ${JSON.stringify({ error: result.error, done: true })}\n\n`);
    }

    res.end();
  } catch (error) {
    console.error('Stream message error:', error);
    res.write(`data: ${JSON.stringify({ error: 'Failed to generate response', done: true })}\n\n`);
    res.end();
  }
});

// Update chat title
router.put('/:chatId/title', auth, [
  body('title').notEmpty().withMessage('Title is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title } = req.body;
    const chat = await Chat.findOneAndUpdate(
      {
        _id: req.params.chatId,
        userId: req.user._id,
        isActive: true
      },
      { title },
      { new: true }
    );

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.json({ message: 'Title updated successfully', chat });
  } catch (error) {
    console.error('Update title error:', error);
    res.status(500).json({ error: 'Failed to update title' });
  }
});

// Delete chat
router.delete('/:chatId', auth, async (req, res) => {
  try {
    const chat = await Chat.findOneAndUpdate(
      {
        _id: req.params.chatId,
        userId: req.user._id,
        isActive: true
      },
      { isActive: false },
      { new: true }
    );

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({ error: 'Failed to delete chat' });
  }
});

// Public chat endpoint (no authentication required)
router.post('/public/chat', optionalAuth, [
  body('message').notEmpty().withMessage('Message is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { message } = req.body;
    const messages = [{ role: 'user', content: message }];

    const aiResponse = await geminiService.generateResponse(messages);
    
    res.json({ 
      response: aiResponse.success ? aiResponse.content : 'Failed to generate response',
      usage: aiResponse.usage
    });
  } catch (error) {
    console.error('Public chat error:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

module.exports = router; 