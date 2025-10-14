'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Button, TextInput, Card, Progress, Spinner, Select } from 'flowbite-react';
import { HiArrowRight } from 'react-icons/hi';
import { Step, Form as IForm, TypingDelay, DataType } from '@/types';
import { interpolateVariables } from '@/lib/utils/interpolation';
import { parseMessageLinks } from '@/lib/utils/linkParser';
import TypingIndicator from '@/components/chat/TypingIndicator';
import { countryCodes } from '@/lib/data/countryCodes';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

export default function ChatPage() {
  const params = useParams();
  const publicUrl = params.publicUrl as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [form, setForm] = useState<IForm | null>(null);
  const [currentStep, setCurrentStep] = useState<Step | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [collectedData, setCollectedData] = useState<Record<string, unknown>>({});
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState('');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showInput, setShowInput] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [inputHeight, setInputHeight] = useState(0);

  useEffect(() => {
    startSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicUrl]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Handle mobile keyboard appearance and viewport changes
  useEffect(() => {
    const updateViewportHeight = () => {
      if (window.visualViewport) {
        setViewportHeight(window.visualViewport.height);
      } else {
        setViewportHeight(window.innerHeight);
      }
    };

    // Initial measurement
    updateViewportHeight();

    const handleResize = () => {
      updateViewportHeight();

      // Scroll to bottom when keyboard opens/closes
      requestAnimationFrame(() => {
        setTimeout(() => {
          scrollToBottom();
        }, 50);
      });
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      window.visualViewport.addEventListener('scroll', handleResize);
      window.addEventListener('resize', handleResize);
    } else {
      window.addEventListener('resize', handleResize);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Measure input container height
  useEffect(() => {
    const measureInput = () => {
      const inputContainer = document.getElementById('input-container');
      if (inputContainer) {
        setInputHeight(inputContainer.offsetHeight);
      }
    };

    measureInput();

    // Re-measure when input visibility changes
    const timer = setTimeout(measureInput, 100);

    return () => clearTimeout(timer);
  }, [showInput, currentStep]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startSession = async () => {
    try {
      const response = await fetch(`/api/chat/${publicUrl}/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (response.ok) {
        setSessionId(data.sessionId);
        setForm(data.form);
        setCollectedData(data.collectedData || {});
        setCurrentStepIndex(data.currentStepIndex || 0);

        if (data.form.steps && data.form.steps.length > 0) {
          const firstStep = data.form.steps[data.currentStepIndex || 0];
          setCurrentStep(firstStep);
          showStep(firstStep, data.collectedData || {});
        }
      } else {
        setError(data.error || 'Failed to start session');
      }
    } catch {
      setError('Failed to connect to form');
    } finally {
      setIsLoading(false);
    }
  };

  const getTypingDelayMs = (): number => {
    const delay = form?.settings?.typingDelay || TypingDelay.NORMAL;
    switch (delay) {
      case TypingDelay.NONE:
        return 0;
      case TypingDelay.SHORT:
        return 1500;
      case TypingDelay.NORMAL:
      default:
        return 2500;
    }
  };

  const showStep = (step: Step, data: Record<string, unknown>) => {
    const delayMs = getTypingDelayMs();

    // Hide input controls while showing the message
    setShowInput(false);

    if (delayMs === 0) {
      // No delay - show immediately
      step.display.messages.forEach((msg) => {
        const interpolatedText = interpolateVariables(msg.text, data);
        addBotMessageImmediate(interpolatedText);
      });
      // Show input controls immediately after message
      setShowInput(true);
    } else {
      // Show typing indicator
      setIsTyping(true);

      setTimeout(() => {
        setIsTyping(false);

        // Interpolate variables in messages
        step.display.messages.forEach((msg) => {
          const interpolatedText = interpolateVariables(msg.text, data);
          addBotMessageImmediate(interpolatedText);
        });

        // Show input controls after message appears
        setShowInput(true);
      }, delayMs);
    }
  };

  const addBotMessage = (text: string) => {
    const delayMs = getTypingDelayMs();

    if (delayMs === 0) {
      // No delay - show immediately
      addBotMessageImmediate(text);
    } else {
      // Show typing indicator
      setIsTyping(true);

      setTimeout(() => {
        setIsTyping(false);
        addBotMessageImmediate(text);
      }, delayMs);
    }
  };

  const addBotMessageImmediate = (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `bot-${Date.now()}`,
        text,
        isBot: true,
        timestamp: new Date(),
      },
    ]);
  };

  const addUserMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        text,
        isBot: false,
        timestamp: new Date(),
      },
    ]);
  };

  const handleSubmit = async (answer?: unknown) => {
    if (!sessionId || !currentStep) return;

    const answerToSubmit = answer !== undefined ? answer : userInput;

    // Only reject undefined/null, not other falsy values like false or 0
    if (currentStep.input?.type !== 'none' && (answerToSubmit === undefined || answerToSubmit === null || answerToSubmit === '')) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/chat/${publicUrl}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          stepId: currentStep.id,
          answer: answerToSubmit,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Validation passed - now add user message and clear input
        if (currentStep.input?.type === 'text' && answerToSubmit) {
          addUserMessage(String(answerToSubmit));
        }
        setUserInput('');

        if (data.isComplete) {
          setIsComplete(true);
          if (form?.settings?.thankYouMessage) {
            addBotMessage(form.settings.thankYouMessage);
          } else {
            addBotMessage('Thank you for your submission!');
          }
        } else if (data.nextStep) {
          setCurrentStep(data.nextStep);
          setCollectedData(data.collectedData || collectedData);
          setCurrentStepIndex((prev) => prev + 1);

          // Show next step (with typing delay)
          showStep(data.nextStep, data.collectedData || collectedData);
        }
      } else {
        // Handle validation errors differently - show as bot message and allow retry
        if (data.validationError) {
          addBotMessage(data.error || 'Invalid input. Please try again.');
          // Keep user input in the field so they can edit it
        } else {
          setError(data.error || 'Failed to submit answer');
        }
      }
    } catch {
      setError('Failed to submit answer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChoiceClick = (choice: { id: string; label: string; value: unknown }) => {
    addUserMessage(choice.label);
    handleSubmit(choice.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInputFocus = () => {
    // When input is focused, scroll to bottom after a short delay
    // This ensures the input is visible above the keyboard
    setTimeout(() => {
      scrollToBottom();
      // On mobile, also scroll the window to ensure visibility
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }, 300);
  };

  const progress =
    form && form.steps
      ? Math.round(((currentStepIndex + 1) / form.steps.length) * 100)
      : 0;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="max-w-md">
          <h2 className="text-xl font-bold text-red-600">Error</h2>
          <p>{error}</p>
        </Card>
      </div>
    );
  }

  const brandColor = form?.settings?.brandColor || '#3b82f6';
  const useDarkText = form?.settings?.useDarkText || false;
  const backgroundImageUrl = form?.settings?.backgroundImageUrl;

  const containerHeight = viewportHeight > 0 ? viewportHeight : window.innerHeight;

  return (
    <div
      className="relative flex flex-col bg-gray-50 dark:bg-gray-900"
      style={{
        height: `${containerHeight}px`,
        maxHeight: `${containerHeight}px`,
        overflow: 'hidden',
        ...(backgroundImageUrl ? {
          backgroundImage: `url(${backgroundImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        } : {})
      }}
    >
      {/* Header */}
      <div
        className="border-b bg-white/90 backdrop-blur-sm px-3 py-2 sm:px-6 sm:py-4 dark:border-gray-700 dark:bg-gray-800/90 flex-shrink-0"
        style={{
          paddingTop: 'max(0.5rem, env(safe-area-inset-top, 0.5rem))',
        }}
      >
        <h1 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white">
          {form?.name || 'Conversational Form'}
        </h1>
        {form?.settings?.enableProgressBar && !isComplete && (
          <div className="mt-1 sm:mt-2">
            <Progress progress={progress} size="sm" color="blue" />
            <p className="mt-0.5 sm:mt-1 text-xs text-gray-600 dark:text-gray-400">
              Step {currentStepIndex + 1} of {form?.steps?.length || 0}
            </p>
          </div>
        )}
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-3 py-3 sm:px-4 sm:py-6 overscroll-contain"
        style={{
          WebkitOverflowScrolling: 'touch',
          paddingBottom: showInput && inputHeight > 0 ? `${inputHeight + 8}px` : '12px',
          ...(backgroundImageUrl ? { backgroundColor: 'transparent' } : {})
        }}
      >
        <div className="mx-auto max-w-3xl space-y-2 sm:space-y-4">
          {messages.map((message) => {
            const messageParts = parseMessageLinks(message.text);

            return (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-lg px-3 py-2 sm:px-4 sm:py-2 ${
                    message.isBot
                      ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-white'
                      : ''
                  }`}
                  style={!message.isBot ? {
                    backgroundColor: brandColor,
                    color: useDarkText ? '#000000' : '#ffffff'
                  } : undefined}
                >
                  <p className="whitespace-pre-wrap text-sm sm:text-base">
                    {messageParts.map((part, index) => {
                      if (part.type === 'link' && part.url) {
                        return (
                          <a
                            key={index}
                            href={part.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`underline hover:no-underline font-semibold ${
                              message.isBot
                                ? 'text-blue-600 dark:text-blue-400'
                                : ''
                            }`}
                            style={!message.isBot ? {
                              color: useDarkText ? '#000000' : '#ffffff'
                            } : undefined}
                          >
                            {part.content}
                          </a>
                        );
                      }
                      return <span key={index}>{part.content}</span>;
                    })}
                  </p>
                </div>
              </div>
            );
          })}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      {!isComplete && currentStep && showInput && (
        <div
          id="input-container"
          className="fixed bottom-0 left-0 right-0 border-t bg-white/90 backdrop-blur-sm px-3 py-2 sm:px-4 sm:py-4 dark:border-gray-700 dark:bg-gray-800/90 z-50"
          style={{
            paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0.5rem))',
          }}
        >
          <div className="mx-auto max-w-3xl">
            {currentStep.input?.type === 'choice' && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {currentStep.input.choices?.map((choice) => (
                  <Button
                    key={choice.id}
                    color="light"
                    size="sm"
                    disabled={isSubmitting}
                    onClick={() => handleChoiceClick(choice)}
                    className="text-sm sm:text-base"
                  >
                    {choice.label}
                  </Button>
                ))}
              </div>
            )}

            {currentStep.input?.type === 'text' && currentStep.input?.dataType === DataType.COUNTRY_CODE && (
              <div className="flex gap-2">
                <Select
                  className="flex-1"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onFocus={handleInputFocus}
                  disabled={isSubmitting}
                  autoComplete="off"
                  style={{ fontSize: '16px' }}
                >
                  <option value="">Select your country...</option>
                  {countryCodes.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.country} ({country.code})
                    </option>
                  ))}
                </Select>
                <Button
                  color="blue"
                  size="sm"
                  disabled={isSubmitting || !userInput}
                  onClick={() => handleSubmit()}
                  className="flex-shrink-0"
                >
                  <HiArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </div>
            )}

            {currentStep.input?.type === 'text' && currentStep.input?.dataType !== DataType.COUNTRY_CODE && (
              <div className="flex gap-2">
                <TextInput
                  ref={inputRef}
                  className="flex-1"
                  placeholder={currentStep.input.placeholder || 'Type your answer...'}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onFocus={handleInputFocus}
                  disabled={isSubmitting}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  style={{ fontSize: '16px' }}
                />
                <Button
                  color="blue"
                  size="sm"
                  disabled={isSubmitting || !userInput}
                  onClick={() => handleSubmit()}
                  className="flex-shrink-0"
                >
                  <HiArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </div>
            )}

            {currentStep.input?.type === 'none' && !isComplete && (
              <Button
                color="blue"
                size="sm"
                disabled={isSubmitting}
                onClick={() => handleSubmit('')}
                className="w-full sm:w-auto text-sm sm:text-base"
              >
                Continue <HiArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
