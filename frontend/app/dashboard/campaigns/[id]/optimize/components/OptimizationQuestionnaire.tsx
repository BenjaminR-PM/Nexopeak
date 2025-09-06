'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  AlertCircle,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';

interface QuestionOption {
  value: string;
  label: string;
  description?: string;
}

interface Question {
  key: string;
  text: string;
  type: 'multiple_choice' | 'scale' | 'text' | 'boolean';
  category: string;
  order_index: number;
  required: boolean;
  options?: QuestionOption[];
  multiple_select?: boolean;
  scale_min?: number;
  scale_max?: number;
  scale_labels?: Record<string, string>;
}

interface QuestionnaireData {
  campaign_id: string;
  total_questions: number;
  categories: Record<string, string[]>;
  questions: Question[];
  estimated_time_minutes: number;
}

interface OptimizationQuestionnaireProps {
  campaignId: string;
  onSubmit: (responses: Record<string, any>) => void;
  loading: boolean;
}

export default function OptimizationQuestionnaire({
  campaignId,
  onSubmit,
  loading
}: OptimizationQuestionnaireProps) {
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuestionnaire();
  }, [campaignId]);

  const fetchQuestionnaire = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/campaigns/${campaignId}/optimize/questionnaire`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setQuestionnaire(data);
      } else {
        setFetchError('Failed to load questionnaire');
      }
    } catch (err) {
      setFetchError('Failed to load questionnaire');
    }
  };

  const currentQuestion = questionnaire?.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === (questionnaire?.questions.length || 0) - 1;
  const progress = questionnaire ? ((currentQuestionIndex + 1) / questionnaire.questions.length) * 100 : 0;

  const handleResponse = (value: any) => {
    if (!currentQuestion) return;

    const newResponses = { ...responses };
    newResponses[currentQuestion.key] = value;
    setResponses(newResponses);

    // Clear any existing error for this question
    if (errors[currentQuestion.key]) {
      const newErrors = { ...errors };
      delete newErrors[currentQuestion.key];
      setErrors(newErrors);
    }
  };

  const validateCurrentQuestion = (): boolean => {
    if (!currentQuestion) return true;

    const response = responses[currentQuestion.key];
    
    if (currentQuestion.required && (response === undefined || response === null || response === '')) {
      setErrors(prev => ({
        ...prev,
        [currentQuestion.key]: 'This question is required'
      }));
      return false;
    }

    if (currentQuestion.type === 'multiple_choice' && currentQuestion.multiple_select) {
      if (currentQuestion.required && (!Array.isArray(response) || response.length === 0)) {
        setErrors(prev => ({
          ...prev,
          [currentQuestion.key]: 'Please select at least one option'
        }));
        return false;
      }
    }

    return true;
  };

  const goToNextQuestion = () => {
    if (validateCurrentQuestion() && currentQuestionIndex < (questionnaire?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    if (!questionnaire) return;

    // Validate all required questions
    const newErrors: Record<string, string> = {};
    let hasErrors = false;

    questionnaire.questions.forEach(question => {
      const response = responses[question.key];
      
      if (question.required && (response === undefined || response === null || response === '')) {
        newErrors[question.key] = 'This question is required';
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setErrors(newErrors);
      // Go to first question with error
      const firstErrorIndex = questionnaire.questions.findIndex(q => newErrors[q.key]);
      if (firstErrorIndex >= 0) {
        setCurrentQuestionIndex(firstErrorIndex);
      }
      return;
    }

    onSubmit(responses);
  };

  const renderQuestionInput = () => {
    if (!currentQuestion) return null;

    const currentResponse = responses[currentQuestion.key];
    const hasError = !!errors[currentQuestion.key];

    switch (currentQuestion.type) {
      case 'multiple_choice':
        if (currentQuestion.multiple_select) {
          return (
            <div className="space-y-3">
              {currentQuestion.options?.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                    currentResponse?.includes(option.value)
                      ? 'border-blue-500 bg-blue-50'
                      : hasError
                      ? 'border-red-300 hover:border-red-400'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={currentResponse?.includes(option.value) || false}
                    onChange={(e) => {
                      const currentValues = currentResponse || [];
                      if (e.target.checked) {
                        handleResponse([...currentValues, option.value]);
                      } else {
                        handleResponse(currentValues.filter((v: string) => v !== option.value));
                      }
                    }}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{option.label}</div>
                    {option.description && (
                      <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          );
        } else {
          return (
            <div className="space-y-3">
              {currentQuestion.options?.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                    currentResponse === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : hasError
                      ? 'border-red-300 hover:border-red-400'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name={currentQuestion.key}
                    value={option.value}
                    checked={currentResponse === option.value}
                    onChange={(e) => handleResponse(e.target.value)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{option.label}</div>
                    {option.description && (
                      <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          );
        }

      case 'scale':
        const scaleMin = currentQuestion.scale_min || 1;
        const scaleMax = currentQuestion.scale_max || 5;
        const scaleLabels = currentQuestion.scale_labels || {};

        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{scaleLabels[scaleMin.toString()] || scaleMin}</span>
              <span className="text-sm text-gray-600">{scaleLabels[scaleMax.toString()] || scaleMax}</span>
            </div>
            
            <div className="flex justify-between gap-2">
              {Array.from({ length: scaleMax - scaleMin + 1 }, (_, i) => {
                const value = scaleMin + i;
                return (
                  <label
                    key={value}
                    className={`flex-1 text-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      currentResponse === value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : hasError
                        ? 'border-red-300 hover:border-red-400'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={currentQuestion.key}
                      value={value}
                      checked={currentResponse === value}
                      onChange={(e) => handleResponse(parseInt(e.target.value))}
                      className="sr-only"
                    />
                    <div className="font-medium">{value}</div>
                    {scaleLabels[value.toString()] && (
                      <div className="text-xs text-gray-600 mt-1">
                        {scaleLabels[value.toString()]}
                      </div>
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        );

      case 'text':
        return (
          <textarea
            value={currentResponse || ''}
            onChange={(e) => handleResponse(e.target.value)}
            placeholder="Enter your response..."
            className={`w-full p-3 border rounded-lg resize-none ${
              hasError ? 'border-red-300' : 'border-gray-300'
            }`}
            rows={4}
          />
        );

      case 'boolean':
        return (
          <div className="flex gap-4">
            <label className={`flex-1 p-4 border rounded-lg cursor-pointer text-center transition-colors ${
              currentResponse === true
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : hasError
                ? 'border-red-300 hover:border-red-400'
                : 'border-gray-200 hover:border-gray-300'
            }`}>
              <input
                type="radio"
                name={currentQuestion.key}
                checked={currentResponse === true}
                onChange={() => handleResponse(true)}
                className="sr-only"
              />
              <div className="font-medium">Yes</div>
            </label>
            
            <label className={`flex-1 p-4 border rounded-lg cursor-pointer text-center transition-colors ${
              currentResponse === false
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : hasError
                ? 'border-red-300 hover:border-red-400'
                : 'border-gray-200 hover:border-gray-300'
            }`}>
              <input
                type="radio"
                name={currentQuestion.key}
                checked={currentResponse === false}
                onChange={() => handleResponse(false)}
                className="sr-only"
              />
              <div className="font-medium">No</div>
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  if (fetchError) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          {fetchError}
        </AlertDescription>
      </Alert>
    );
  }

  if (!questionnaire) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Header */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Campaign Optimization Questionnaire</h2>
              <p className="text-gray-600">
                Question {currentQuestionIndex + 1} of {questionnaire.questions.length}
              </p>
            </div>
            <Badge variant="outline">
              {Math.round(questionnaire.estimated_time_minutes)} min remaining
            </Badge>
          </div>
          
          <Progress value={progress} className="mb-2" />
          
          <div className="flex justify-between text-sm text-gray-600">
            <span>{Math.round(progress)}% Complete</span>
            <span>{questionnaire.questions.length - currentQuestionIndex - 1} questions left</span>
          </div>
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg mb-2">
                {currentQuestion?.text}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {currentQuestion?.category.replace('_', ' ')}
                </Badge>
                {currentQuestion?.required && (
                  <Badge variant="destructive" className="text-xs">
                    Required
                  </Badge>
                )}
              </div>
            </div>
            
            <Button variant="ghost" size="sm" className="text-gray-400">
              <HelpCircle className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Error Message */}
          {errors[currentQuestion?.key || ''] && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {errors[currentQuestion?.key || '']}
              </AlertDescription>
            </Alert>
          )}

          {/* Question Input */}
          {renderQuestionInput()}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={goToPreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              {Object.keys(responses).length} of {questionnaire.questions.filter(q => q.required).length} required answered
            </div>

            {isLastQuestion ? (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="min-w-[120px]"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={goToNextQuestion}
                disabled={currentQuestion?.required && !responses[currentQuestion.key]}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Question Overview */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-sm">Question Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-8 gap-2">
            {questionnaire.questions.map((question, index) => (
              <button
                key={question.key}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`aspect-square rounded-lg border-2 text-xs font-medium transition-colors ${
                  index === currentQuestionIndex
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : responses[question.key] !== undefined
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : question.required
                    ? 'border-gray-300 bg-gray-50 text-gray-600'
                    : 'border-gray-200 bg-white text-gray-400'
                }`}
              >
                {index + 1}
                {responses[question.key] !== undefined && (
                  <CheckCircle2 className="h-3 w-3 mx-auto mt-1" />
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
