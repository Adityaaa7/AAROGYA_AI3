import React, { useState, useCallback } from 'react';
import { Upload, File, Image, X, CheckCircle, AlertCircle, Download, Eye } from 'lucide-react';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: Date;
  status: 'uploading' | 'completed' | 'error';
  progress: number;
  url?: string;
  category: 'lab_results' | 'prescription' | 'medical_image' | 'insurance' | 'other';
}

export default function FileUpload() {
  const [files, setFiles] = useState<UploadedFile[]>([
    {
      id: '1',
      name: 'Blood_Test_Results_Jan2024.pdf',
      size: 245760,
      type: 'application/pdf',
      uploadDate: new Date('2024-01-10'),
      status: 'completed',
      progress: 100,
      category: 'lab_results',
      url: '#'
    },
    {
      id: '2',
      name: 'X_Ray_Chest.jpg',
      size: 1024000,
      type: 'image/jpeg',
      uploadDate: new Date('2024-01-08'),
      status: 'completed',
      progress: 100,
      category: 'medical_image',
      url: '#'
    }
  ]);
  const [dragActive, setDragActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<UploadedFile['category']>('lab_results');
  const [filterCategory, setFilterCategory] = useState<UploadedFile['category'] | 'all'>('all');

  const categories = [
    { value: 'lab_results', label: 'Lab Results' },
    { value: 'prescription', label: 'Prescriptions' },
    { value: 'medical_image', label: 'Medical Images' },
    { value: 'insurance', label: 'Insurance Documents' },
    { value: 'other', label: 'Other' }
  ];

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (fileList: File[]) => {
    fileList.forEach((file) => {
      // Validate file type and size
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        return;
      }

      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      if (!allowedTypes.includes(file.type)) {
        alert(`File type ${file.type} is not supported.`);
        return;
      }

      const newFile: UploadedFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date(),
        status: 'uploading',
        progress: 0,
        category: selectedCategory
      };

      setFiles(prev => [...prev, newFile]);

      // Simulate file upload
      uploadFile(newFile, file);
    });
  };

  const uploadFile = async (fileData: UploadedFile, file: File) => {
    // TODO: Replace with actual file upload API
    const userToken = localStorage.getItem("healthcareToken");

    if (!userToken) {
      alert("User not authenticated");
      return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', fileData.category);
    formData.append('userId', user?.id || '');

    try {
      const response = await fetch(`http://localhost:5000/api/report/upload`, {
        method: 'POST',
        
        body: formData,
        // Track upload progress
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          updateFileProgress(fileData.id, progress);
        }
      });

      if (response.ok) {
        const result = await response.json();
        updateFileStatus(fileData.id, 'completed', result.url);
      } else {
        updateFileStatus(fileData.id, 'error');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      updateFileStatus(fileData.id, 'error');
    }
    

    // Mock upload progress for demo
    // const progressInterval = setInterval(() => {
    //   setFiles(prev => prev.map(f => {
    //     if (f.id === fileData.id) {
    //       const newProgress = Math.min(f.progress + 10, 100);
    //       return {
    //         ...f,
    //         progress: newProgress,
    //         status: newProgress === 100 ? 'completed' : 'uploading'
    //       };
    //     }
    //     return f;
    //   }));
    // }, 200);

    // setTimeout(() => {
    //   clearInterval(progressInterval);
    // }, 2000);
  };

  const deleteFile = (fileId: string) => {
    // TODO: Replace with actual API call to delete file
    /*
    fetch(`/api/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });
    */
    
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <Image className="h-8 w-8 text-blue-500" />;
    }
    return <File className="h-8 w-8 text-gray-500" />;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'lab_results': return 'bg-green-100 text-green-800';
      case 'prescription': return 'bg-blue-100 text-blue-800';
      case 'medical_image': return 'bg-purple-100 text-purple-800';
      case 'insurance': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredFiles = filterCategory === 'all' ? files : files.filter(f => f.category === filterCategory);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Medical File Upload</h1>
          <p className="text-gray-600">
            Securely upload and manage your medical documents, lab results, and images
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upload Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Files</h2>
                
                {/* Category Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as UploadedFile['category'])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Drop Zone */}
              <div className="p-6">
                <div
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    dragActive
                      ? 'border-primary-400 bg-primary-50'
                      : 'border-gray-300 hover:border-primary-400 hover:bg-primary-50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    multiple
                    onChange={handleChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Drop files here or click to browse
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Support for PDF, DOC, DOCX, JPG, PNG, GIF up to 10MB
                  </p>
                  <button className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                    Choose Files
                  </button>
                </div>

                {/* Upload Progress */}
                {files.some(f => f.status === 'uploading') && (
                  <div className="mt-6 space-y-3">
                    <h3 className="text-sm font-medium text-gray-700">Uploading...</h3>
                    {files.filter(f => f.status === 'uploading').map(file => (
                      <div key={file.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">{file.name}</span>
                          <span className="text-sm text-gray-600">{file.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${file.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* File Management */}
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">File Categories</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setFilterCategory('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      filterCategory === 'all' ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-50'
                    }`}
                  >
                    All Files ({files.length})
                  </button>
                  {categories.map(category => {
                    const count = files.filter(f => f.category === category.value).length;
                    return (
                      <button
                        key={category.value}
                        onClick={() => setFilterCategory(category.value as UploadedFile['category'])}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          filterCategory === category.value ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-50'
                        }`}
                      >
                        {category.label} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Storage Info */}
              <div className="p-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Storage Usage</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Used</span>
                    <span>2.4 GB / 5 GB</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary-600 h-2 rounded-full" style={{ width: '48%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* File List */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Your Files</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {filteredFiles.map((file) => (
              <div key={file.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getFileIcon(file.type)}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{file.name}</h3>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        <span>{formatFileSize(file.size)}</span>
                        <span>{file.uploadDate.toLocaleDateString()}</span>
                        <span className={`px-2 py-1 rounded-full ${getCategoryColor(file.category)}`}>
                          {categories.find(c => c.value === file.category)?.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {file.status === 'completed' && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    {file.status === 'error' && (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                    {file.status === 'completed' && (
                      <>
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                          <Download className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => deleteFile(file.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}