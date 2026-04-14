"use client";
import React, { useState, useRef, ChangeEvent, FormEvent } from "react";
import { jsPDF } from "jspdf";
import { Bot, FileText, Upload, RefreshCw, Activity } from "lucide-react";

type PredictionResult = {
  disease: string;
  features: {
    [key: string]: number;
  };
};

const Model: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return setError("Please select a PDF file.");

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch("http://127.0.0.1:3000/predict-from-pdf", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Something went wrong");
      }

      const data: PredictionResult = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    if (!result) return;
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold").text("Disease Prediction Report", 20, 20);
    doc.setFont("helvetica", "normal").text(`Predicted Disease: ${result.disease}`, 20, 40);
    doc.text("Extracted Biomarker Values:", 20, 60);
    Object.entries(result.features).forEach(([k, v], i) => {
      doc.text(`${k.replace("_", " ")}: ${v}`, 20, 70 + i * 10);
    });
    doc.save("Disease_Prediction_Report.pdf");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-semibold text-center mb-6 text-gray-800">AI Medical Report Analyzer</h1>
        <p className="text-center text-gray-500 mb-12">
          Upload your medical PDF report and get AI-powered analysis with personalized insights and recommendations
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Upload UI */}
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit}>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Upload className="h-5 w-5 text-green-700" />
                  Upload Medical Report
                </h2>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {selectedFile ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-3">
                        <FileText className="h-8 w-8 text-green-700" />
                        <div>
                          <p className="font-medium text-gray-900">{selectedFile.name}</p>
                          <p className="text-sm text-gray-600">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3 justify-center">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2 text-green-700 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
                        >
                          Change File
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                          {loading ? (
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
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 transition-colors"
                        >
                          Choose PDF File
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
              </div>
            </form>
          </div>

          {/* AI Assistant Panel */}
          <div className="bg-white rounded-xl p-6 shadow text-center border">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">AI Medical Assistant</h3>
            <Bot className="mx-auto w-10 h-10 text-gray-400" />
            <p className="text-sm text-gray-500 mt-2">
              Upload and analyze a report to start chatting with the AI
            </p>
          </div>
        </div>

        {/* Result Section */}
        {result && (
          <div className="mt-12">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-semibold text-gray-800">
                Predicted Disease: <span className="text-green-700">{result.disease}</span>
              </h3>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md max-w-xl mx-auto mb-6">
              <h4 className="font-medium text-gray-700 mb-2">Extracted Features:</h4>
              <ul className="text-sm text-gray-600 list-disc ml-6">
                {Object.entries(result.features).map(([key, value]) => (
                  <li key={key}>{key.replace("_", " ")}: {value}</li>
                ))}
              </ul>
            </div>

            <div className="flex justify-center gap-4">
              
              <button onClick={generatePDF} className="px-4 py-2 bg-red-500 text-white rounded-md">
                Download Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Model;
