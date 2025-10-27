'use client';

import { useEffect, useState, useRef } from 'react';
import { Progress, Spinner } from 'flowbite-react';
import { HiArrowRight } from 'react-icons/hi';
import { Step, StepType, Form as IForm, TypingDelay, DataType } from '@/types';
import { interpolateVariables } from '@/lib/utils/interpolation';
import { parseMessageLinks } from '@/lib/utils/linkParser';
import { formatProjectName } from '@/lib/utils/formatting';
import TypingIndicator from '@/components/chat/TypingIndicator';
import { countryCodes } from '@/lib/data/countryCodes';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface ChatInterfaceProps {
  publicUrl: string;
  mode: 'full' | 'widget';
  skipPasswordProtection?: boolean;
  onClose?: () => void;
}

export default function ChatInterface({ publicUrl, mode, skipPasswordProtection = false, onClose }: ChatInterfaceProps) {
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
  const [replayContext, setReplayContext] = useState<{ replayStepId: string; targetStep: Step } | null>(null);
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [enteredPassword, setEnteredPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    // Check if password was previously verified in this session
    if (!skipPasswordProtection) {
      const verified = sessionStorage.getItem(`form_${publicUrl}_verified`);
      if (verified === 'true') {
        setIsPasswordVerified(true);
      }
    }
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
        setForm(data.form);

        // Check if form is password protected (skip for widget mode)
        if (!skipPasswordProtection) {
          const verified = sessionStorage.getItem(`form_${publicUrl}_verified`) === 'true';
          if (data.form.settings?.passwordProtected && !verified) {
            setIsPasswordProtected(true);
            setIsLoading(false);
            return;
          }
        }

        setSessionId(data.sessionId);
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

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!form || !enteredPassword) {
      setPasswordError('Please enter a password');
      return;
    }

    if (enteredPassword === form.settings?.password) {
      setIsPasswordVerified(true);
      sessionStorage.setItem(`form_${publicUrl}_verified`, 'true');
      setIsLoading(true);
      startSession(); // Restart session now that password is verified
    } else {
      setPasswordError('Incorrect password. Please try again.');
      setEnteredPassword('');
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

    // Check if this is a REPLAY step
    let stepToDisplay = step;

    if (step.type === StepType.REPLAY && step.replayTarget && form) {
      // Find the target step by ID
      const targetStep = form.steps.find(s => s.id === step.replayTarget);
      if (targetStep) {
        stepToDisplay = targetStep;
        setReplayContext({ replayStepId: step.id, targetStep });
      }
    } else {
      setReplayContext(null);
    }

    if (delayMs === 0) {
      stepToDisplay.display.messages.forEach((msg) => {
        const interpolatedText = interpolateVariables(msg.text, data);
        addBotMessageImmediate(interpolatedText);
      });
      setShowInput(true);
    } else {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        stepToDisplay.display.messages.forEach((msg) => {
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

    // Determine which step we're actually answering
    const stepToAnswer = replayContext ? replayContext.targetStep : currentStep;

    if (stepToAnswer.input?.type !== 'none' && (answerToSubmit === undefined || answerToSubmit === null || answerToSubmit === '')) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/chat/${publicUrl}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          stepId: stepToAnswer.id,
          answer: answerToSubmit,
          replayStepId: replayContext?.replayStepId,
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
          const finalData = data.collectedData || collectedData;
          if (form?.settings?.thankYouMessage) {
            const interpolatedMessage = interpolateVariables(form.settings.thankYouMessage, finalData);
            addBotMessage(interpolatedMessage);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Apply real-time formatting for PROJECT_NAME
    if (stepForInput?.input?.dataType === DataType.PROJECT_NAME) {
      setUserInput(formatProjectName(value, true)); // true = isRealtime, keep leading/trailing hyphens
    } else {
      setUserInput(value);
    }
  };

  const progress = form && form.steps ? Math.round(((currentStepIndex + 1) / form.steps.length) * 100) : 0;

  // Use target step for input if in replay context
  const stepForInput = replayContext ? replayContext.targetStep : currentStep;

  const brandColor = form?.settings?.brandColor || '#3b82f6';
  const useDarkText = form?.settings?.useDarkText || false;
  const backgroundImageUrl = form?.settings?.backgroundImageUrl;

  // Determine container sizing based on mode
  const containerClass = mode === 'widget'
    ? 'h-full w-full' // Widget mode: fill the iframe
    : 'h-screen w-full sm:h-[95vh] sm:max-w-[480px] sm:rounded-2xl sm:shadow-2xl overflow-hidden'; // Full mode: responsive centered

  if (isLoading) {
    return (
      <div className={`relative ${containerClass}`}>
        <div className="flex h-full items-center justify-center bg-gray-50 dark:bg-gray-900">
          <Spinner size="xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`relative ${containerClass}`}>
        <div className="flex items-center justify-center bg-gray-50 p-8 dark:bg-gray-900 h-full">
          <div className="max-w-md rounded-lg border border-red-200 bg-white p-6 dark:border-red-800 dark:bg-gray-800">
            <h2 className="text-xl font-bold text-red-600 dark:text-red-400">Error</h2>
            <p className="mt-2 text-gray-700 dark:text-gray-300">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Password protection screen (only shown in full mode, not widget mode)
  if (isPasswordProtected && !isPasswordVerified && !skipPasswordProtection) {
    return (
      <div className={`relative ${containerClass}`}>
        <div className="flex items-center justify-center bg-gray-50 p-8 dark:bg-gray-900 h-full">
          <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {form?.displayName || form?.name || 'Conversational Form'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              This form is password protected. Please enter the password to continue.
            </p>

            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-4">
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                  placeholder="Enter password"
                  value={enteredPassword}
                  onChange={(e) => setEnteredPassword(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              {passwordError && (
                <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400">
                  {passwordError}
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-lg px-5 py-2.5 text-center text-sm font-medium text-white focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
                style={{ backgroundColor: brandColor }}
              >
                Continue
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${containerClass}`}>
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
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              {form?.displayName || form?.name || 'Conversational Form'}
            </h1>
            {mode === 'widget' && onClose && (
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label="Close"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
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
            {!isComplete && stepForInput && showInput && (
              <div ref={inputBubbleRef} className="px-4 py-2">
                {/* Choice Buttons */}
                {stepForInput.input?.type === 'choice' && (
                  <div className="flex flex-wrap gap-2 justify-start">
                    {stepForInput.input.choices?.map((choice) => (
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
                {stepForInput.input?.type === 'text' && stepForInput.input?.dataType === DataType.COUNTRY_CODE && (
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
                {stepForInput.input?.type === 'text' && stepForInput.input?.dataType !== DataType.COUNTRY_CODE && (
                  <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-800">
                    <div className="flex gap-2">
                      <input
                        ref={inputRef}
                        type="text"
                        className="min-w-0 flex-1 rounded-lg border-gray-300 px-3 py-2.5 text-base focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        placeholder={stepForInput.input.placeholder || 'Type your answer...'}
                        value={userInput}
                        onChange={handleInputChange}
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
                {stepForInput.input?.type === 'none' && (
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
  );
}
