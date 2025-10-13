'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Button, TextInput, Card, Progress, Spinner } from 'flowbite-react';
import { HiArrowRight, HiArrowLeft } from 'react-icons/hi';
import { Step, Form as IForm } from '@/types';
import { interpolateVariables } from '@/lib/utils/interpolation';

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

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [form, setForm] = useState<IForm | null>(null);
  const [currentStep, setCurrentStep] = useState<Step | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [collectedData, setCollectedData] = useState<Record<string, unknown>>({});
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState('');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    startSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicUrl]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    } catch (_err) {
      setError('Failed to connect to form');
    } finally {
      setIsLoading(false);
    }
  };

  const showStep = (step: Step, data: Record<string, unknown>) => {
    // Interpolate variables in messages
    step.display.messages.forEach((msg) => {
      const interpolatedText = interpolateVariables(msg.text, data);
      addBotMessage(interpolatedText);
    });
  };

  const addBotMessage = (text: string) => {
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

    if (!answerToSubmit && currentStep.input?.type !== 'none') {
      return;
    }

    // Add user message if text input
    if (currentStep.input?.type === 'text' && answerToSubmit) {
      addUserMessage(String(answerToSubmit));
    }

    setIsSubmitting(true);
    setUserInput('');

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

          // Delay before showing next step
          setTimeout(() => {
            showStep(data.nextStep, data.collectedData || collectedData);
          }, 500);
        }
      } else {
        setError(data.error || 'Failed to submit answer');
      }
    } catch (_err) {
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

  return (
    <div className="flex h-screen flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.isBot
                    ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-white'
                    : 'bg-blue-600 text-white'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.text}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      {!isComplete && currentStep && (
        <div className="border-t bg-white px-4 py-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="mx-auto max-w-3xl">
            {currentStep.input?.type === 'choice' && (
              <div className="flex flex-wrap gap-2">
                {currentStep.input.choices?.map((choice) => (
                  <Button
                    key={choice.id}
                    color="light"
                    disabled={isSubmitting}
                    onClick={() => handleChoiceClick(choice)}
                  >
                    {choice.label}
                  </Button>
                ))}
              </div>
            )}

            {currentStep.input?.type === 'text' && (
              <div className="flex gap-2">
                <TextInput
                  className="flex-1"
                  placeholder={currentStep.input.placeholder || 'Type your answer...'}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isSubmitting}
                />
                <Button
                  color="blue"
                  disabled={isSubmitting || !userInput}
                  onClick={() => handleSubmit()}
                >
                  <HiArrowRight className="h-5 w-5" />
                </Button>
              </div>
            )}

            {currentStep.input?.type === 'none' && !isComplete && (
              <Button
                color="blue"
                disabled={isSubmitting}
                onClick={() => handleSubmit('')}
              >
                Continue <HiArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
