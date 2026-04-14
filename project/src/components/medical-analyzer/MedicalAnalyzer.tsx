import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  Bot, 
  Send, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  TrendingDown,
  Minus,
  User,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react';

interface TestResult {
  name: string;
  value: number;
  severity: 'Low' | 'Normal' | 'High';
  unit?: string;
}

interface MedicalSummary {
  values: Record<string, number>;
  gender: string;
  severity: Record<string, string>;
  conditions: string[];
}

interface ChatMessage {
  id: string;
  message: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export default function MedicalAnalyzer() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [summary, setSummary] = useState<MedicalSummary | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Test features that your model analyzes
  const TEST_FEATURES = [
    'HEMOGLOBIN', 'TESTOSTERONE', 'IRON', 'HDL CHOLESTEROL', 'TRIGLYCERIDES',
    'TRANSFERRIN SATURATION', 'UIBC', 'TSH', 'VITAMIN D', 'VITAMIN B12',
    'LDL', 'CREATININE', 'SGOT', 'SGPT', 'HbA1c', 'UREA'
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
    } else {
      alert('Please upload a PDF file only.');
    }
  };

  const analyzeReport = async () => {
    if (!uploadedFile) return;

    setAnalyzing(true);
    
    try {
      // TODO: Replace with your Flask API endpoint
      const formData = new FormData();
      formData.append('pdf', uploadedFile);

      const response = await fetch('http://127.0.0.1:9000/analyze', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setSummary(data.summary);
        
        // Add initial AI greeting
        const welcomeMessage: ChatMessage = {
          id: Date.now().toString(),
          message: `🤖 Hello! I've analyzed your medical report. I found ${data.summary.conditions.length} potential conditions. You can ask me about any test results or conditions. How can I help you understand your report better?`,
          sender: 'ai',
          timestamp: new Date()
        };
        setChatMessages([welcomeMessage]);
      } else {
        throw new Error('Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Failed to analyze the report. Please make sure your Flask server is running on localhost:5000');
    } finally {
      setAnalyzing(false);
    }
  };

  const sendChatMessage = async () => {
    if (!currentMessage.trim() || !summary) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message: currentMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setChatLoading(true);

    try {
      // TODO: Replace with your Flask chat endpoint
      const response = await fetch('http://127.0.0.1:9000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: currentMessage
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          message: data.reply,
          sender: 'ai',
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: '🤖 Sorry, I encountered an error. Please make sure the Flask server is running.',
        sender: 'ai',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'High':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'Low':
        return <TrendingDown className="h-4 w-4 text-orange-500" />;
      case 'Normal':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'Low':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'Normal':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-600';
    }
  };

  const getConditionColor = (index: number) => {
    const colors = [
      'bg-red-100 text-red-800',
      'bg-orange-100 text-orange-800',
      'bg-yellow-100 text-yellow-800',
      'bg-blue-100 text-blue-800',
      'bg-purple-100 text-purple-800'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">AI Medical Report Analyzer</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Upload your medical PDF report and get AI-powered analysis with personalized insights and recommendations
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upload and Analysis Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* File Upload */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary-600" />
                Upload Medical Report
              </h2>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                {uploadedFile ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-3">
                      <FileText className="h-8 w-8 text-primary-600" />
                      <div>
                        <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                        <p className="text-sm text-gray-600">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors"
                      >
                        Change File
                      </button>
                      <button
                        onClick={analyzeReport}
                        disabled={analyzing}
                        className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                      >
                        {analyzing ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Activity className="h-4 w-4" />
                            Analyze Report
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto" />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Upload your medical report
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Support for PDF files containing lab test results
                      </p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        Choose PDF File
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Analysis Results */}
            {summary && (
              <div className="space-y-6">
                {/* Patient Info */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-primary-600" />
                    Patient Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">Gender:</span>
                      <span className="text-sm font-semibold text-gray-900 capitalize">
                        {summary.gender}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-600">Analysis Date:</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {new Date().toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Test Results */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary-600" />
                    Test Results ({Object.keys(summary.values).length} tests found)
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(summary.values).map(([test, value]) => {
                      const severity = summary.severity[test] || 'Normal';
                      return (
                        <div
                          key={test}
                          className={`p-4 rounded-lg border-2 ${getSeverityColor(severity)}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-sm">{test}</h4>
                            {getSeverityIcon(severity)}
                          </div>
                          <div className="space-y-1">
                            <p className="text-lg font-bold">{value}</p>
                            <p className="text-xs font-medium">{severity}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Predicted Conditions */}
                {summary.conditions.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      AI Predicted Conditions
                    </h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {summary.conditions.map((condition, index) => (
                        <div
                          key={condition}
                          className={`p-3 rounded-lg ${getConditionColor(index)}`}
                        >
                          <p className="font-medium text-sm">{condition}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">
                        💡 <strong>Tip:</strong> Ask the AI chatbot about any of these conditions for personalized advice and recommendations.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* AI Chatbot */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-fit lg:sticky lg:top-8">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary-600" />
                AI Medical Assistant
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Ask questions about your test results
              </p>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 space-y-4 max-h-96 overflow-y-auto">
              {chatMessages.length === 0 ? (
                <div className="text-center py-8">
                  <Bot className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 text-sm">
                    Upload and analyze a report to start chatting with the AI
                  </p>
                </div>
              ) : (
                <>
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.sender === 'ai' && (
                        <div className="bg-primary-600 p-2 rounded-full h-fit">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-xs p-3 rounded-lg text-sm ${
                          msg.sender === 'user'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.message}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {msg.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      {msg.sender === 'user' && (
                        <div className="bg-gray-600 p-2 rounded-full h-fit">
                          <User className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex gap-3 justify-start">
                      <div className="bg-primary-600 p-2 rounded-full h-fit">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-gray-100 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <RefreshCw className="h-3 w-3 animate-spin text-primary-600" />
                          <span className="text-xs text-gray-600">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Chat Input */}
            {summary && (
              <div className="p-4 border-t border-gray-100">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    placeholder="Ask about your test results..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                    disabled={chatLoading}
                  />
                  <button
                    onClick={sendChatMessage}
                    disabled={!currentMessage.trim() || chatLoading}
                    className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                
                {/* Quick Questions */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {['What is my hemoglobin?', 'Any vitamin deficiency?', 'Diabetes risk?'].map((question) => (
                    <button
                      key={question}
                      onClick={() => setCurrentMessage(question)}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-primary-100 hover:text-primary-700 transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Integration Instructions */}
        
      </div>
    </div>
  );
}