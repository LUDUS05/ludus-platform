/**
 * @fileoverview Selena-Onboard AI Chat Widget
 * 
 * Purpose: Provides an interactive chat interface with the Selena-Onboard AI agent
 * during the user onboarding process. Offers contextual help, registration assistance,
 * and cultural guidance with full Arabic/English support.
 * 
 * Business Context: This widget enhances the onboarding experience by providing
 * real-time AI assistance, reducing support tickets and improving completion rates
 * for new users on the LUDUS platform.
 * 
 * @version 1.0.0
 * @since 2025-09-28
 * @author LUDUS Development Team - Selena-Onboard Implementation
 */

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Send, 
  X, 
  Bot, 
  User, 
  Languages,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { Button } from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import selenaService from '../../services/selenaService';

const SelenaChatWidget = ({ 
  isOpen, 
  onToggle, 
  currentOnboardingStep = 'welcome',
  language = 'ar',
  onLanguageChange,
  className = ''
}) => {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize Selena session when widget opens
  useEffect(() => {
    if (isOpen && !sessionId) {
      initializeSelenaSession();
    }
  }, [isOpen]);

  // Focus input when widget opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const initializeSelenaSession = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const result = await selenaService.startSession({
        language,
        cultural_context: 'saudi'
      });
      
      if (result.success) {
        setSessionId(result.session.session_id);
        
        // Add Selena's welcome message
        const welcomeMessage = {
          id: Date.now(),
          type: 'agent',
          content: result.session.message,
          suggestions: result.session.suggestions || [],
          timestamp: new Date(),
          progress: result.session.progress_percentage,
          step: result.session.current_step
        };
        
        setMessages([welcomeMessage]);
      } else {
        throw new Error(result.error || 'Failed to start Selena session');
      }
    } catch (error) {
      console.error('Error initializing Selena session:', error);
      setError(error.message);
      
      // Add fallback welcome message
      const fallbackMessage = {
        id: Date.now(),
        type: 'agent',
        content: language === 'ar' 
          ? 'مرحباً! أنا سيلينا، مساعدتك في لودوس. كيف يمكنني مساعدتك اليوم؟'
          : 'Hello! I\'m Selena, your LUDUS assistant. How can I help you today?',
        suggestions: language === 'ar' 
          ? ['مساعدة في التسجيل', 'إعداد الملف الشخصي', 'جولة في المنصة']
          : ['Registration help', 'Profile setup', 'Platform tour'],
        timestamp: new Date(),
        fallback: true
      };
      
      setMessages([fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError('');

    try {
      // Determine which service method to use based on message content
      const messageContent = inputMessage.toLowerCase();
      let result;
      
      if (messageContent.includes('password') || messageContent.includes('كلمة مرور') || 
          messageContent.includes('registration') || messageContent.includes('تسجيل')) {
        result = await selenaService.getRegistrationHelp(userMessage.content, language, sessionId);
      } else if (messageContent.includes('profile') || messageContent.includes('ملف') ||
                 messageContent.includes('شخصي')) {
        result = await selenaService.getProfileSetupHelp(userMessage.content, language, sessionId);
      } else if (messageContent.includes('feature') || messageContent.includes('tour') ||
                 messageContent.includes('ميزات') || messageContent.includes('جولة')) {
        result = await selenaService.getFeatureTour(userMessage.content, language, sessionId);
      } else if (messageContent.includes('culture') || messageContent.includes('saudi') ||
                 messageContent.includes('ثقافة') || messageContent.includes('سعودي')) {
        result = await selenaService.getCulturalGuidance(userMessage.content, language, sessionId);
      } else {
        result = await selenaService.sendMessage(userMessage.content, language, sessionId);
      }
      
      if (result.success) {
        const agentResponse = result.response;
        
        const agentMessage = {
          id: Date.now() + 1,
          type: 'agent',
          content: agentResponse.reply || agentResponse.message,
          suggestions: agentResponse.suggestions || [],
          nextSteps: agentResponse.next_steps || [],
          helpfulTips: agentResponse.helpful_tips || [],
          timestamp: new Date(),
          progress: agentResponse.progress_percentage,
          step: agentResponse.current_step,
          fallback: result.fallback || false
        };
        
        setMessages(prev => [...prev, agentMessage]);
      } else {
        // Use fallback response if available
        if (result.fallback) {
          const agentMessage = {
            id: Date.now() + 1,
            type: 'agent',
            content: result.fallback.message || result.fallback.reply,
            suggestions: result.fallback.suggestions || [],
            timestamp: new Date(),
            fallback: true
          };
          
          setMessages(prev => [...prev, agentMessage]);
        } else {
          throw new Error(result.error || 'Failed to get response from Selena');
        }
      }
    } catch (error) {
      console.error('Error sending message to Selena:', error);
      setError(error.message);
      
      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        type: 'agent',
        content: language === 'ar' 
          ? 'أعتذر، أواجه صعوبة تقنية حالياً. يمكنك المحاولة مرة أخرى أو التواصل مع الدعم.'
          : 'Sorry, I\'m having technical difficulties. You can try again or contact support.',
        timestamp: new Date(),
        error: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
    setTimeout(() => sendMessage(), 100);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleLanguage = () => {
    const newLanguage = language === 'ar' ? 'en' : 'ar';
    if (onLanguageChange) {
      onLanguageChange(newLanguage);
    }
    i18n.changeLanguage(newLanguage);
  };

  // Widget toggle button
  const WidgetToggle = () => (
    <motion.button
      onClick={onToggle}
      className={`fixed bottom-6 ${i18n.language === 'ar' ? 'left-6' : 'right-6'} z-50 
        bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-full shadow-lg 
        hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {isOpen ? (
        <X size={24} />
      ) : (
        <div className="relative">
          <Bot size={24} />
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      )}
    </motion.button>
  );

  // Chat interface
  const ChatInterface = () => (
    <motion.div
      className={`fixed bottom-24 ${i18n.language === 'ar' ? 'left-6' : 'right-6'} z-40 
        w-96 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl overflow-hidden`}
      initial={{ opacity: 0, y: 100, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 100, scale: 0.9 }}
      transition={{ duration: 0.3, type: "spring" }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="relative">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Sparkles size={20} />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
            </div>
            <div>
              <h3 className="font-semibold">
                {language === 'ar' ? 'سيلينا' : 'Selena'}
              </h3>
              <p className="text-xs opacity-90">
                {language === 'ar' ? 'مساعدتك في الإعداد' : 'Onboarding Assistant'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <button
              onClick={toggleLanguage}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title={language === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
            >
              <Languages size={16} />
            </button>
            <button
              onClick={onToggle}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.type === 'user' ? 
              (i18n.language === 'ar' ? 'justify-start' : 'justify-end') : 
              (i18n.language === 'ar' ? 'justify-end' : 'justify-start')
            }`}
          >
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
              message.type === 'user'
                ? 'bg-blue-500 text-white'
                : message.error
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-gray-100 text-gray-800'
            }`}>
              <div className="flex items-start space-x-2 rtl:space-x-reverse">
                {message.type === 'agent' && (
                  <div className="flex-shrink-0 mt-1">
                    {message.error ? (
                      <HelpCircle size={16} className="text-red-500" />
                    ) : (
                      <Bot size={16} className="text-purple-500" />
                    )}
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  {/* Progress indicator */}
                  {message.progress && !message.error && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>{language === 'ar' ? 'التقدم' : 'Progress'}</span>
                        <span>{message.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${message.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <p className="text-xs text-gray-500 font-medium">
                        {language === 'ar' ? 'اقتراحات:' : 'Suggestions:'}
                      </p>
                      {message.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="block w-full text-left text-xs bg-white/50 hover:bg-white/80 
                            px-2 py-1 rounded-lg transition-colors border border-gray-200 hover:border-purple-300"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* Next Steps */}
                  {message.nextSteps && message.nextSteps.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <p className="text-xs text-gray-500 font-medium">
                        {language === 'ar' ? 'الخطوات التالية:' : 'Next Steps:'}
                      </p>
                      {message.nextSteps.map((step, index) => (
                        <div key={index} className="text-xs text-gray-600 flex items-center space-x-1 rtl:space-x-reverse">
                          <span className="w-4 h-4 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Helpful Tips */}
                  {message.helpfulTips && message.helpfulTips.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 font-medium mb-1">
                        {language === 'ar' ? '💡 نصائح مفيدة:' : '💡 Helpful Tips:'}
                      </p>
                      {message.helpfulTips.map((tip, index) => (
                        <p key={index} className="text-xs text-gray-600 mb-1">• {tip}</p>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(message.timestamp).toLocaleTimeString(
                      language === 'ar' ? 'ar-SA' : 'en-US',
                      { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        timeZone: 'Asia/Riyadh'
                      }
                    )}
                  </p>
                </div>
                {message.type === 'user' && (
                  <div className="flex-shrink-0 mt-1">
                    <User size={16} className="text-white" />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-2xl">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Bot size={16} className="text-purple-500" />
                <LoadingSpinner size="sm" />
                <span className="text-sm">
                  {language === 'ar' ? 'سيلينا تكتب...' : 'Selena is typing...'}
                </span>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t bg-gray-50 p-4">
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-3 p-2 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200"
          >
            {error}
          </motion.div>
        )}
        
        <div className="flex space-x-2 rtl:space-x-reverse">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={language === 'ar' ? 'اكتب رسالتك هنا...' : 'Type your message here...'}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none 
              focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            disabled={isLoading}
            dir={language === 'ar' ? 'rtl' : 'ltr'}
          />
          <Button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 
              hover:to-pink-600 text-white px-4 py-2 rounded-lg transition-all duration-200 
              transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
          >
            <Send size={16} />
          </Button>
        </div>
        
        {/* Quick actions */}
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            { 
              key: 'registration', 
              label: language === 'ar' ? 'مساعدة التسجيل' : 'Registration Help',
              icon: '📝'
            },
            { 
              key: 'profile', 
              label: language === 'ar' ? 'الملف الشخصي' : 'Profile Setup',
              icon: '👤'
            },
            { 
              key: 'tour', 
              label: language === 'ar' ? 'جولة المنصة' : 'Platform Tour',
              icon: '🎯'
            },
            { 
              key: 'culture', 
              label: language === 'ar' ? 'التوجيه الثقافي' : 'Cultural Guide',
              icon: '🇸🇦'
            }
          ].map((action) => (
            <button
              key={action.key}
              onClick={() => handleSuggestionClick(action.label)}
              className="text-xs bg-white hover:bg-purple-50 text-gray-700 px-3 py-1 
                rounded-full border border-gray-200 hover:border-purple-300 transition-colors 
                flex items-center space-x-1 rtl:space-x-reverse"
            >
              <span>{action.icon}</span>
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );

  return (
    <>
      <WidgetToggle />
      <AnimatePresence>
        {isOpen && <ChatInterface />}
      </AnimatePresence>
    </>
  );
};

export default SelenaChatWidget;