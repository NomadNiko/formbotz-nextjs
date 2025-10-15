'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Progress, Spinner } from 'flowbite-react';
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
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputBubbleRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    startSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicUrl]);

  // Only scroll when input becomes visible (after bot finishes responding)
  useEffect(() => {
    if (showInput && currentStep && inputBubbleRef.current) {
      const timer = setTimeout(() => {
        inputBubbleRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [showInput, currentStep]);

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
    setShowInput(false);

    if (delayMs === 0) {
      step.display.messages.forEach((msg) => {
        const interpolatedText = interpolateVariables(msg.text, data);
        addBotMessageImmediate(interpolatedText);
      });
      setShowInput(true);
    } else {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        step.display.messages.forEach((msg) => {
          const interpolatedText = interpolateVariables(msg.text, data);
          addBotMessageImmediate(interpolatedText);
        });
        setShowInput(true);
      }, delayMs);
    }
  };

  const addBotMessage = (text: string) => {
    const delayMs = getTypingDelayMs();

    if (delayMs === 0) {
      addBotMessageImmediate(text);
    } else {
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
          showStep(data.nextStep, data.collectedData || collectedData);
        }
      } else {
        if (data.validationError) {
          addBotMessage(data.error || 'Invalid input. Please try again.');
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
    // Let mobile keyboard appear naturally
    // The input is already in view from the scroll effect
  };

  const progress = form && form.steps ? Math.round(((currentStepIndex + 1) / form.steps.length) * 100) : 0;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950">
        <div className="relative h-screen w-full sm:h-[95vh] sm:max-w-[480px] sm:rounded-2xl sm:shadow-2xl overflow-hidden">
          <div className="flex h-full items-center justify-center bg-gray-50 dark:bg-gray-900">
            <Spinner size="xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950 p-4">
        <div className="relative w-full sm:max-w-[480px] sm:rounded-2xl sm:shadow-2xl overflow-hidden">
          <div className="flex items-center justify-center bg-gray-50 p-8 dark:bg-gray-900">
            <div className="max-w-md rounded-lg border border-red-200 bg-white p-6 dark:border-red-800 dark:bg-gray-800">
              <h2 className="text-xl font-bold text-red-600 dark:text-red-400">Error</h2>
              <p className="mt-2 text-gray-700 dark:text-gray-300">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const brandColor = form?.settings?.brandColor || '#3b82f6';
  const useDarkText = form?.settings?.useDarkText || false;
  const backgroundImageUrl = form?.settings?.backgroundImageUrl;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950">
      {/* Mobile Container - Centered on Desktop */}
      <div className="relative h-screen w-full sm:h-[95vh] sm:max-w-[480px] sm:rounded-2xl sm:shadow-2xl overflow-hidden">
        <div
          ref={chatContainerRef}
          className="flex h-full flex-col overflow-hidden bg-gray-50 dark:bg-gray-900"
          style={{
            height: '100%',
            maxHeight: '100%',
            ...(backgroundImageUrl ? {
              backgroundImage: `url(${backgroundImageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            } : {})
          }}
        >
      {/* Header - Fixed */}
      <div className="flex-shrink-0 border-b bg-white/95 px-4 py-3 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/95">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">
          {form?.name || 'Conversational Form'}
        </h1>
        {form?.settings?.enableProgressBar && !isComplete && (
          <div className="mt-2">
            <Progress progress={progress} size="sm" color="blue" />
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              Step {currentStepIndex + 1} of {form?.steps?.length || 0}
            </p>
          </div>
        )}
      </div>

      {/* Messages - Scrollable */}
      <div
        ref={messagesContainerRef}
        className="chat-messages-container flex-1 overflow-y-auto overscroll-contain px-4 py-4"
        style={{
          WebkitOverflowScrolling: 'touch',
          ...(backgroundImageUrl ? { backgroundColor: 'transparent' } : {})
        }}
      >
        <div className="mx-auto max-w-3xl space-y-3 pb-[20vh]">
          {messages.map((message) => {
            const messageParts = parseMessageLinks(message.text);

            return (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                    message.isBot
                      ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-white'
                      : ''
                  }`}
                  style={!message.isBot ? {
                    backgroundColor: brandColor,
                    color: useDarkText ? '#000000' : '#ffffff'
                  } : undefined}
                >
                  <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
                    {messageParts.map((part, index) => {
                      if (part.type === 'link' && part.url) {
                        return (
                          <a
                            key={index}
                            href={part.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`font-semibold underline hover:no-underline ${
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

          {/* Inline Input - Appears in message flow */}
          {!isComplete && currentStep && showInput && (
            <div ref={inputBubbleRef} className="px-4 py-2">
              {/* Choice Buttons */}
              {currentStep.input?.type === 'choice' && (
                <div className="flex flex-wrap gap-2 justify-start">
                  {currentStep.input.choices?.map((choice) => (
                    <button
                      key={choice.id}
                      onClick={() => handleChoiceClick(choice)}
                      disabled={isSubmitting}
                      className="rounded-full px-4 py-2.5 text-[15px] font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed active:opacity-75"
                      style={{
                        backgroundColor: brandColor,
                        color: useDarkText ? '#000000' : '#ffffff',
                        minHeight: '44px',
                      }}
                    >
                      {choice.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Country Code Select */}
              {currentStep.input?.type === 'text' && currentStep.input?.dataType === DataType.COUNTRY_CODE && (
                <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-800">
                  <div className="flex gap-2">
                    <select
                      className="min-w-0 flex-1 rounded-lg border-gray-300 px-3 py-2.5 text-base focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onFocus={handleInputFocus}
                      disabled={isSubmitting}
                      style={{ fontSize: '16px' }}
                    >
                      <option value="">Select your country...</option>
                      {countryCodes.map((country, index) => (
                        <option key={`${country.country}-${index}`} value={`${country.country}|${country.code}`}>
                          {country.country} ({country.code})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleSubmit()}
                      disabled={isSubmitting || !userInput}
                      className="flex-shrink-0 rounded-lg px-4 py-2.5 text-white disabled:opacity-50 disabled:cursor-not-allowed active:opacity-75"
                      style={{ backgroundColor: brandColor, minHeight: '44px' }}
                    >
                      <HiArrowRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Text Input */}
              {currentStep.input?.type === 'text' && currentStep.input?.dataType !== DataType.COUNTRY_CODE && (
                <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-800">
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      className="min-w-0 flex-1 rounded-lg border-gray-300 px-3 py-2.5 text-base focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                    <button
                      onClick={() => handleSubmit()}
                      disabled={isSubmitting || !userInput}
                      className="flex-shrink-0 rounded-lg px-4 py-2.5 text-white disabled:opacity-50 disabled:cursor-not-allowed active:opacity-75"
                      style={{ backgroundColor: brandColor, minHeight: '44px' }}
                    >
                      <HiArrowRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Continue Button (for input type 'none') */}
              {currentStep.input?.type === 'none' && (
                <div className="flex justify-start">
                  <button
                    onClick={() => handleSubmit('')}
                    disabled={isSubmitting}
                    className="rounded-full px-6 py-2.5 text-[15px] font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed active:opacity-75"
                    style={{
                      backgroundColor: brandColor,
                      color: useDarkText ? '#000000' : '#ffffff',
                      minHeight: '44px',
                    }}
                  >
                    Continue <HiArrowRight className="ml-2 inline h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </div>

        </div>
      </div>
    </div>
  );
}
