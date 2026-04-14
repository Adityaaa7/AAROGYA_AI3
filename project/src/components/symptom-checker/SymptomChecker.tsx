import React, { useState } from 'react';
import { Search, Plus, X, AlertTriangle, Info, Users, Clock } from 'lucide-react';

interface Symptom {
  id: string;
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
}

interface AIResponse {
  possibleConditions: Array<{
    name: string;
    probability: number;
    severity: 'low' | 'medium' | 'high';
    description: string;
  }>;
  recommendedSpecialists: Array<{
    type: string;
    reason: string;
  }>;
  urgency: 'low' | 'medium' | 'high';
  recommendations: string[];
}

export default function SymptomChecker() {
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [currentSymptom, setCurrentSymptom] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<'mild' | 'moderate' | 'severe'>('mild');
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [showResults, setShowResults] = useState(false);

  const commonSymptoms = [
    'Headache', 'Fever', 'Cough', 'Sore throat', 'Fatigue', 'Nausea',
    'Dizziness', 'Chest pain', 'Abdominal pain', 'Joint pain', 'Back pain',
    'Shortness of breath', 'Runny nose', 'Skin rash', 'Muscle aches'
  ];

  const addSymptom = () => {
    if (currentSymptom.trim() && !symptoms.find(s => s.name.toLowerCase() === currentSymptom.toLowerCase())) {
      const newSymptom: Symptom = {
        id: Date.now().toString(),
        name: currentSymptom.trim(),
        severity: selectedSeverity
      };
      setSymptoms([...symptoms, newSymptom]);
      setCurrentSymptom('');
    }
  };

  const removeSymptom = (id: string) => {
    setSymptoms(symptoms.filter(s => s.id !== id));
  };

  const addCommonSymptom = (symptomName: string) => {
    if (!symptoms.find(s => s.name.toLowerCase() === symptomName.toLowerCase())) {
      const newSymptom: Symptom = {
        id: Date.now().toString(),
        name: symptomName,
        severity: 'mild'
      };
      setSymptoms([...symptoms, newSymptom]);
    }
  };

  const analyzeSymptoms = async () => {
    if (symptoms.length === 0) return;
    
    setLoading(true);
    
    // TODO: Replace with your AI model integration
    // This is where you would call your AI model API
    // Example API call structure:
    
    try {
  const response = await fetch('http://127.0.0.1:7000/predict', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      symptoms: symptoms.map(s => s.name)
    }),
  });

  const result = await response.json();

  const possibleConditions = result?.top_predictions?.map((item: any) => ({
    name: item.disease,
    probability: item.confidence,
    severity: item.confidence > 70 ? 'high' : item.confidence > 30 ? 'moderate' : 'low',
    description: 'Based on provided symptoms.'
  })) || [
    {
      name: 'No prediction returned',
      probability: 0,
      severity: 'unknown',
      description: 'No diseases could be predicted from the symptoms.'
    }
  ];

  const aiResponse: AIResponse = {
    possibleConditions,
    recommendedSpecialists: [], // optional: logic to suggest specialists
    urgency: symptoms.some(s => s.severity === 'severe') || possibleConditions.some(c => c.severity === 'high') ? 'high' : 'low',
    recommendations: []
  };

  setAiResponse(aiResponse);
  setShowResults(true);
  setLoading(false);

} catch (error) {
  console.error('AI analysis failed:', error);

  setAiResponse({
    possibleConditions: [
      {
        name: 'Error fetching prediction',
        probability: 0,
        severity: 'unknown',
        description: 'There was an error while fetching disease prediction.'
      }
    ],
    recommendedSpecialists: [],
    urgency: 'low',
    recommendations: []
  });

  setShowResults(true);
  setLoading(false);
}






  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'severe': return 'bg-red-100 text-red-800';
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'border-green-200 bg-green-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'high': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">AI Symptom Checker</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Enter your symptoms and let our AI analyze them to provide insights about possible conditions 
            and recommend appropriate specialists. This is not a substitute for professional medical advice.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Symptom Input Section */}
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Your Symptoms</h2>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  value={currentSymptom}
                  onChange={(e) => setCurrentSymptom(e.target.value)}
                  placeholder="Enter a symptom..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  onKeyPress={(e) => e.key === 'Enter' && addSymptom()}
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value as 'mild' | 'moderate' | 'severe')}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="mild">Mild</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                </select>
                <button
                  onClick={addSymptom}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </button>
              </div>
            </div>

            {/* Common Symptoms */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Common Symptoms:</h3>
              <div className="flex flex-wrap gap-2">
                {commonSymptoms.map((symptom) => (
                  <button
                    key={symptom}
                    onClick={() => addCommonSymptom(symptom)}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-primary-100 hover:text-primary-700 transition-colors"
                  >
                    {symptom}
                  </button>
                ))}
              </div>
            </div>

            {/* Added Symptoms */}
            {symptoms.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Your Symptoms:</h3>
                <div className="flex flex-wrap gap-2">
                  {symptoms.map((symptom) => (
                    <div
                      key={symptom.id}
                      className="flex items-center gap-2 px-3 py-2 bg-primary-50 text-primary-800 rounded-lg border border-primary-200"
                    >
                      <span className="font-medium">{symptom.name}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(symptom.severity)}`}>
                        {symptom.severity}
                      </span>
                      <button
                        onClick={() => removeSymptom(symptom.id)}
                        className="text-primary-600 hover:text-primary-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Analyze Button */}
            <button
              onClick={analyzeSymptoms}
              disabled={symptoms.length === 0 || loading}
              className="w-full bg-primary-600 text-white py-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Analyzing Symptoms...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5" />
                  Analyze Symptoms with AI
                </>
              )}
            </button>
          </div>

          {/* AI Analysis Results */}
          {showResults && aiResponse && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">AI Analysis Results</h2>

              {/* Urgency Alert */}
              <div className={`p-4 rounded-lg border-2 mb-6 ${getUrgencyColor(aiResponse.urgency)}`}>
                <div className="flex items-center gap-3">
                  <AlertTriangle className={`h-5 w-5 ${getSeverityColor(aiResponse.urgency)}`} />
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {aiResponse.urgency === 'high' ? 'High Priority' : 
                       aiResponse.urgency === 'medium' ? 'Medium Priority' : 'Low Priority'}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {aiResponse.urgency === 'high' ? 'Consider seeking immediate medical attention' :
                       aiResponse.urgency === 'medium' ? 'Schedule an appointment with a healthcare provider' :
                       'Monitor symptoms and consider consulting a healthcare provider if they persist'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Possible Conditions */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary-600" />
                    Possible Conditions
                  </h3>
                  <div className="space-y-4">
                    {aiResponse.possibleConditions.map((condition, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900">{condition.name}</h4>
                          <span className="text-2xl font-bold text-primary-600">{condition.probability}%</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{condition.description}</p>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${getSeverityColor(condition.severity)}`}>
                          {condition.severity} risk
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Specialists */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary-600" />
                    Recommended Specialists
                  </h3>
                  <div className="space-y-4">
                    {aiResponse.recommendedSpecialists.map((specialist, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">{specialist.type}</h4>
                        <p className="text-sm text-gray-600">{specialist.reason}</p>
                      </div>
                    ))}
                  </div>

                  {/* Quick Book Appointment */}
                  <div className="mt-6">
                    <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                      <Clock className="h-4 w-4" />
                      Book Appointment
                    </button>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
                <div className="bg-blue-50 rounded-lg p-4">
                  <ul className="space-y-2">
                    {aiResponse.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-blue-800">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        {recommendation}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">
                  <strong>Disclaimer:</strong> This AI analysis is for informational purposes only and is not a substitute 
                  for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or 
                  other qualified health provider with any questions you may have regarding a medical condition.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}