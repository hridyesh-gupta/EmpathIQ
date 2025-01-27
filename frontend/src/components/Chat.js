import React, { useState, useEffect, useRef } from 'react';
import { chat } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import MarkdownMessage from './MarkdownMessage';
import './Chat.css';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      const response = await chat.getHistory();
      if (response.data.length > 0) {
        setMessages(response.data[0].messages);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setLoading(true);

    try {
      const response = await chat.sendMessage(userMessage);
      setMessages(response.data.chat.messages);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentClass = (sentiment) => {
    if (!sentiment) return '';
    return `sentiment-${sentiment.label}`;
  };

  const renderMessage = (message, index) => {
    const isBot = message.sender === 'bot';
    return (
      <div key={index} className={`message ${isBot ? 'bot' : 'user'}`}>
        <div className="message-content">
          {isBot ? (
            <MarkdownMessage content={message.content} />
          ) : (
            <p>{message.content}</p>
          )}
        </div>
        {message.sentiment && (
          <div className={`sentiment-indicator ${message.sentiment.label}`}>
            {message.sentiment.label}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Chat with EmpathIQ</h2>
        <span className="user-name">{user?.username}</span>
      </div>

      <div className="messages-container">
        {messages.map((message, index) => renderMessage(message, index))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={loading}
          className="message-input"
        />
        <button type="submit" disabled={loading || !input.trim()} className="send-button">
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default Chat; 