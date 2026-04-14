import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  Search, 
  Bot, 
  Calendar, 
  Upload, 
  FileSearch,
  Users, 
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  const quickActions = [
    {
      name: 'Symptom Checker',
      description: 'Check your symptoms with AI',
      icon: Search,
      href: '/symptom-checker',
      color: 'bg-blue-500'
    },
    {
      name: 'AI Assistant',
      description: 'Chat with medical AI',
      icon: Bot,
      href: '/ai-assistant',
      color: 'bg-primary-600'
    },
    {
      name: 'Report Analyzer',
      description: 'Analyze medical PDF reports',
      icon: FileSearch,
      href: '/medical-analyzer',
      color: 'bg-green-600'
    },
    {
      name: 'Book Appointment',
      description: 'Schedule with specialists',
      icon: Calendar,
      href: '/appointments',
      color: 'bg-purple-500'
    }
  ];

  const healthStats = [
    {
      name: 'Health Score',
      value: '87%',
      change: '+5%',
      changeType: 'positive',
      icon: Activity
    },
    {
      name: 'Last Checkup',
      value: '2 weeks ago',
      change: 'On schedule',
      changeType: 'neutral',
      icon: Clock
    },
    {
      name: 'Active Symptoms',
      value: '0',
      change: 'All clear',
      changeType: 'positive',
      icon: CheckCircle
    },
    {
      name: 'Appointments',
      value: '1 upcoming',
      change: 'Next: Tomorrow',
      changeType: 'neutral',
      icon: Calendar
    }
  ];

  const recentActivity = [
    {
      type: 'symptom_check',
      title: 'Symptom check completed',
      description: 'Headache and fatigue - Low risk',
      time: '2 hours ago',
      status: 'completed'
    },
    {
      type: 'appointment',
      title: 'Appointment scheduled',
      description: 'Dr. Smith - Cardiology',
      time: '1 day ago',
      status: 'scheduled'
    },
    {
      type: 'file_upload',
      title: 'Lab results uploaded',
      description: 'Blood work results.pdf',
      time: '3 days ago',
      status: 'uploaded'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="mt-2 text-gray-600">
            Here's your health overview and quick actions.
          </p>
        </div>

        {/* Health Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {healthStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-primary-50 p-3 rounded-lg">
                    <Icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' : 
                    stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-gray-600 text-sm">{stat.name}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={index}
                    to={action.href}
                    className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md hover:border-primary-200 transition-all group"
                  >
                    <div className="flex items-center mb-4">
                      <div className={`${action.color} p-3 rounded-lg group-hover:scale-110 transition-transform`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.name}</h3>
                    <p className="text-gray-600">{action.description}</p>
                  </Link>
                );
              })}
            </div>

            {/* Health Tips */}
            <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-6 border border-primary-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Today's Health Tip</h3>
              <p className="text-gray-700 mb-4">
                Stay hydrated! Drinking adequate water helps maintain body temperature, 
                lubricates joints, and helps transport nutrients throughout your body.
              </p>
              <div className="flex items-center text-primary-600 text-sm font-medium">
                <TrendingUp className="h-4 w-4 mr-2" />
                Learn more about hydration
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6">
                <div className="space-y-6">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className={`p-2 rounded-full ${
                        activity.status === 'completed' ? 'bg-green-100' :
                        activity.status === 'scheduled' ? 'bg-blue-100' : 'bg-orange-100'
                      }`}>
                        {activity.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-600" />}
                        {activity.status === 'scheduled' && <Calendar className="h-4 w-4 text-blue-600" />}
                        {activity.status === 'uploaded' && <Upload className="h-4 w-4 text-orange-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                        <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t border-gray-100 px-6 py-3">
                <Link
                  to="/profile"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  View all activity →
                </Link>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="mt-6 bg-red-50 rounded-xl p-6 border border-red-100">
              <div className="flex items-center mb-3">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <h3 className="text-lg font-semibold text-red-900">Emergency</h3>
              </div>
              <p className="text-red-700 text-sm mb-4">
                In case of a medical emergency, call your local emergency services immediately.
              </p>
              <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
                Emergency Contact: 108
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}