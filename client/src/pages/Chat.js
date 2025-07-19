import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Loader2, Trash2, Edit3 } from 'lucide-react';
import useChatStore from '../store/chatStore';
import Message from '../components/Message';
import toast from 'react-hot-toast';

const Chat = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  
  const {
    currentChat,
    fetchChat,
    createChat,
    sendMessage,
    streamMessage,
    updateChatTitle,
    deleteChat,
    isLoading,
    isStreaming
  } = useChatStore();

  useEffect(() => {
    if (chatId) {
      fetchChat(chatId).catch(() => {
        toast.error('Failed to load chat');
        navigate('/chat');
      });
    } else {
      // Clear current chat when no chatId (new chat)
      useChatStore.getState().clearCurrentChat();
    }
  }, [chatId, fetchChat, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages, streamingMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || isTyping) return;

    const messageText = message.trim();
    setMessage('');
    setIsTyping(true);

    try {
      if (!currentChat) {
        // Create new chat
        await createChat(messageText);
      } else {
        // Send message to existing chat
        if (isStreaming) {
          // Use streaming for better UX
          setStreamingMessage('');
          await streamMessage(currentChat._id, messageText, (chunk) => {
            setStreamingMessage(prev => prev + chunk);
          });
          setStreamingMessage('');
        } else {
          await sendMessage(currentChat._id, messageText);
        }
      }
    } catch (error) {
      toast.error('Failed to send message');
      console.error('Send message error:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleDeleteChat = async () => {
    if (!currentChat) return;
    
    if (window.confirm('Are you sure you want to delete this chat?')) {
      try {
        await deleteChat(currentChat._id);
        toast.success('Chat deleted successfully');
        navigate('/chat');
      } catch (error) {
        toast.error('Failed to delete chat');
      }
    }
  };

  const handleEditTitle = async () => {
    if (!currentChat) return;
    
    const newTitle = prompt('Enter new title:', currentChat.title);
    if (newTitle && newTitle.trim() !== currentChat.title) {
      try {
        await updateChatTitle(currentChat._id, newTitle.trim());
        toast.success('Title updated successfully');
      } catch (error) {
        toast.error('Failed to update title');
      }
    }
  };

  const renderMessages = () => {
    if (!currentChat?.messages?.length) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Welcome to Gemini Chat
            </h3>
            <p className="text-gray-600 mb-4">
              Start a conversation by typing a message below
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>• Ask questions about any topic</p>
              <p>• Get help with coding problems</p>
              <p>• Have creative conversations</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 overflow-y-auto">
        {currentChat.messages.map((msg, index) => (
          <Message key={index} message={msg} />
        ))}
        
        {/* Streaming message */}
        {streamingMessage && (
          <Message 
            message={{
              role: 'assistant',
              content: streamingMessage,
              timestamp: new Date()
            }}
            isStreaming={true}
          />
        )}
        
        {/* Typing indicator */}
        {isTyping && !streamingMessage && (
          <div className="flex gap-3 p-4 bg-gray-50">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
            <div className="flex-1">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      {currentChat && (
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">
              {currentChat.title}
            </h2>
            <button
              onClick={handleEditTitle}
              className="p-1 text-gray-400 hover:text-gray-600"
              title="Edit title"
            >
              <Edit3 className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={handleDeleteChat}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
            title="Delete chat"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Messages */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      ) : (
        renderMessages()
      )}

      {/* Input */}
      <div className="border-t border-gray-200 bg-white p-4">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows="1"
              style={{ minHeight: '40px', maxHeight: '120px' }}
              disabled={isTyping}
            />
          </div>
          <button
            type="submit"
            disabled={!message.trim() || isTyping}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isTyping ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat; 