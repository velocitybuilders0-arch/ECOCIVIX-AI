import { Link } from 'react-router-dom';
import { ArrowLeft, Zap, Globe, Heart, Brain, Shield, MapPin } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function Features() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
        
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-8">
          ECOCIVIX AI Features
        </h1>
        
        <p className="text-xl text-gray-600 mb-12 max-w-3xl">
          Our platform combines advanced AI, machine learning, and civic intelligence to create smarter, safer, and more sustainable communities.
        </p>
        
        {/* Core Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <Brain className="h-12 w-12 text-primary-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered Analysis</h3>
            <p className="text-gray-600">
              Advanced AI analyzes every issue to provide contextual insights, categorization, and intelligent recommendations.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <Shield className="h-12 w-12 text-secondary-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">ML Priority Model</h3>
            <p className="text-gray-600">
              Trained machine learning model evaluates issue urgency and priority based on historical data and patterns.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <MapPin className="h-12 w-12 text-accent-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Location Intelligence</h3>
            <p className="text-gray-600">
              GPS and location-based reporting ensures issues are routed to the correct department and geographical area.
            </p>
          </div>
        </div>
        
        {/* Intelligence Pillars */}
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Three Intelligence Pillars</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-primary-50 rounded-xl p-6">
            <Zap className="h-12 w-12 text-primary-600 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Civic Intelligence</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Roads & Infrastructure</li>
              <li>• Streetlights & Electricity</li>
              <li>• Water & Sanitation</li>
              <li>• Public Facilities</li>
            </ul>
          </div>
          
          <div className="bg-secondary-50 rounded-xl p-6">
            <Globe className="h-12 w-12 text-secondary-600 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Eco Intelligence</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Waste Management</li>
              <li>• Water Leakage</li>
              <li>• Pollution Monitoring</li>
              <li>• Cleanliness Tracking</li>
            </ul>
          </div>
          
          <div className="bg-accent-50 rounded-xl p-6">
            <Heart className="h-12 w-12 text-accent-600 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Community Safety</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Safety Hazard Detection</li>
              <li>• Emergency Support</li>
              <li>• Location-Aware Reporting</li>
              <li>• Risk Assessment</li>
            </ul>
          </div>
        </div>
        
        {/* User Roles */}
        <h2 className="text-3xl font-bold text-gray-900 mb-8">For Everyone</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Citizens</h3>
            <p className="text-gray-600">
              Report issues, track progress, and see real community impact
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Staff</h3>
            <p className="text-gray-600">
              View assigned issues, update status, and provide field updates
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Admins</h3>
            <p className="text-gray-600">
              Manage all issues, assign staff, view analytics, and optimize operations
            </p>
          </div>
        </div>
        
        <div className="text-center">
          <Link to="/login">
            <Button size="lg">
              Get Started Today
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
