import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import useTranslationWithFallback from '../../hooks/useTranslationWithFallback';
import { MessageCircle, Send, Bot, User, Lightbulb, Globe, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { apiCall } from '../../services/api';

/**
 * Selena Chat Component - AI Onboarding Assistant
 * 
 * This component provides an interactive chat interface with Selena,
 * the AI onboarding agent, offering real-time help during registration
 * and platform orientation.
 */
const SelenaChat = ({ 
  isOpen, 
  onClose, 
  currentStep = null, 
  sessionId = null,
  onSessionCreated = null 
}) => {
  const { i18n } = useTranslation();
  const { t, getDirection } = useTranslationWithFallback('onboarding');
  
  // Component state
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  
  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);
  
  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Initialize chat session when component mounts
  useEffect(() => {
    if (isOpen && !session) {
      initializeSession();
    }
  }, [isOpen]);
  
  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);
  
  /**
   * Initialize a new onboarding session with Selena
   */
  const initializeSession = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiCall('/api/onboard-agent/start-session', 'POST', {
        language: i18n.language,
        user_context: {
          current_step: currentStep,
          source: 'onboarding_chat'
        }
      });
      
      if (response.success) {
        setSession({
          id: response.session_id,
          progress: response.progress,
          currentStep: response.current_step
        });
        
        // Add welcome message
        setMessages([{
          id: 1,
          role: 'assistant',
          content: response.message,
          timestamp: new Date(),
          agent: 'Selena'
        }]);
        
        // Notify parent component
        onSessionCreated?.(response.session_id);
      } else {
        throw new Error(response.fallback_message || 'Failed to start session');
      }
    } catch (error) {
      console.error('Failed to initialize Selena session:', error);
      setError(error.message);
      
      // Add fallback welcome message
      const fallbackMessage = i18n.language === 'ar' ? 
        'مرحباً! أنا سيلينا، مرشدتك في لودوس. كيف يمكنني مساعدتك؟' :
        'Hello! I\'m Selena, your LUDUS guide. How can I help you?';
      
      setMessages([{
        id: 1,
        role: 'assistant',
        content: fallbackMessage,
        timestamp: new Date(),
        agent: 'Selena',
        fallback: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Send message to Selena
   */
  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    
    const messageText = inputMessage.trim();
    setInputMessage('');
    
    // Add user message to chat
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiCall('/api/onboard-agent/chat', 'POST', {
        message: messageText,
        session_id: session?.id,
        language: i18n.language,
        current_step: currentStep,
        user_context: {
          source: 'onboarding_chat',
          step: currentStep
        }
      });
      
      if (response.success) {
        // Add Selena's response
        const assistantMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: response.message,
          timestamp: new Date(),
          agent: 'Selena',
          suggestions: response.suggestions || [],
          nextActions: response.next_actions || [],
          culturalTips: response.cultural_tips
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        setSuggestions(response.suggestions || []);
        
      } else {
        throw new Error(response.fallback_response || 'Failed to get response');
      }
    } catch (error) {
      console.error('Failed to send message to Selena:', error);
      
      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: error.message || (i18n.language === 'ar' ? 
          'أعتذر، أواجه صعوبة فنية. حاول مرة أخرى.' :
          'Sorry, I\'m having technical difficulties. Please try again.'),
        timestamp: new Date(),
        agent: 'Selena',
        error: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Handle suggestion click
   */
  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
    inputRef.current?.focus();
  };
  
  /**
   * Handle Enter key press
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  /**
   * Format timestamp for display
   */
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString(
      i18n.language === 'ar' ? 'ar-SA' : 'en-SA',
      { hour: '2-digit', minute: '2-digit' }
    );
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" 
         dir={getDirection()}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">
                {t('selena.name')}
              </h3>
              <p className="text-sm text-gray-500">
                {t('selena.title')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Language indicator */}
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Globe className="w-3 h-3" />
              <span>{i18n.language.toUpperCase()}</span>
            </div>
            
            {/* Close button */}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
        
        {/* Chat Messages */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {/* Avatar */}
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              
              {/* Message bubble */}
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-purple-500 text-white'
                  : message.error
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content}
                </div>
                
                {/* Cultural tips */}
                {message.culturalTips && (
                  <div className="mt-2 p-2 bg-blue-50 rounded-lg text-xs text-blue-800">
                    <Lightbulb className="w-3 h-3 inline mr-1" />
                    {message.culturalTips}
                  </div>
                )}
                
                {/* Timestamp */}
                <div className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-purple-200' : 'text-gray-500'
                }`}>
                  {formatTime(message.timestamp)}
                  {message.fallback && (
                    <span className="ml-1 text-orange-500">(Offline)</span>
                  )}
                </div>
              </div>
              
              {/* User avatar */}
              {message.role === 'user' && (
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
              )}
            </div>
          ))}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-gray-100 px-4 py-2 rounded-2xl">
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">
                    {i18n.language === 'ar' ? 'سيلينا تكتب...' : 'Selena is typing...'}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="px-4 py-2 border-t border-gray-100">
            <div className="text-xs text-gray-500 mb-2">
              {i18n.language === 'ar' ? 'اقتراحات سريعة:' : 'Quick suggestions:'}
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-xs px-3 py-1 bg-purple-50 text-purple-700 rounded-full hover:bg-purple-100 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Input Area */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={i18n.language === 'ar' ? 
                'اكتب رسالتك لسيلينا...' : 
                'Type your message to Selena...'
              }
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              dir={getDirection()}
            />
            <Button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-4 py-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          {/* Quick action buttons */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => handleSuggestionClick(
                i18n.language === 'ar' ? 'كيف أسجل في المنصة؟' : 'How do I register on the platform?'
              )}
              className="text-xs px-3 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors"
            >
              {t('selena.assistance.registration')}
            </button>
            <button
              onClick={() => handleSuggestionClick(
                i18n.language === 'ar' ? 'ساعدني في إعداد ملفي الشخصي' : 'Help me set up my profile'
              )}
              className="text-xs px-3 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 transition-colors"
            >
              {t('selena.assistance.profile')}
            </button>
            <button
              onClick={() => handleSuggestionClick(
                i18n.language === 'ar' ? 'اشرح لي ميزات المنصة' : 'Explain the platform features'
              )}
              className="text-xs px-3 py-1 bg-orange-50 text-orange-700 rounded-full hover:bg-orange-100 transition-colors"
            >
              {t('selena.assistance.features')}
            </button>
          </div>
          
          {/* Error display */}
          {error && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              <strong>{t('common.error')}:</strong> {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Selena Chat Button - Floating action button to open chat
 */
export const SelenaChatButton = ({ currentStep, className = '' }) => {
  const { i18n } = useTranslation();
  const { t } = useTranslationWithFallback('onboarding');
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  
  // Show unread indicator for new users
  useEffect(() => {
    if (!sessionId) {
      setHasUnread(true);
    }
  }, []);
  
  const handleSessionCreated = (newSessionId) => {
    setSessionId(newSessionId);
    setHasUnread(false);
  };
  
  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 ${i18n.language === 'ar' ? 'left-6' : 'right-6'} 
          w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 
          text-white rounded-full shadow-lg hover:shadow-xl 
          transform hover:scale-105 transition-all duration-200 
          flex items-center justify-center z-40 ${className}`}
        title={t('selena.title')}
      >
        <MessageCircle className="w-6 h-6" />
        
        {/* Unread indicator */}
        {hasUnread && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-bold">!</span>
          </div>
        )}
        
        {/* Pulse animation for attention */}
        {hasUnread && (
          <div className="absolute inset-0 rounded-full bg-purple-400 animate-ping opacity-75"></div>
        )}
      </button>
      
      {/* Chat Interface */}
      <SelenaChat
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        currentStep={currentStep}
        sessionId={sessionId}
        onSessionCreated={handleSessionCreated}
      />
    </>
  );
};

export default SelenaChat;