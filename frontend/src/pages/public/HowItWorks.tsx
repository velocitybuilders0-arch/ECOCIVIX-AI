import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function HowItWorks() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
        
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-8">
          How ECOCIVIX AI Works
        </h1>
        
        <div className="bg-white rounded-xl p-8 shadow-sm mb-8">
          <p className="text-lg text-gray-600 mb-6">
            ECOCIVIX AI transforms how communities report and resolve civic issues through a simple four-step process powered by artificial intelligence.
          </p>
          
          <div className="space-y-6">
            <div className="border-l-4 border-primary-500 pl-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">1. Report</h3>
              <p className="text-gray-600">
                Citizens spot a community problem and submit it through our platform with details like title, description, location, and optional images.
              </p>
            </div>
            
            <div className="border-l-4 border-secondary-500 pl-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">2. Understand</h3>
              <p className="text-gray-600">
                Our AI analyzes the issue using a trained ML model to evaluate priority and provide contextual analysis including category, department, safety relevance, and environmental impact.
              </p>
            </div>
            
            <div className="border-l-4 border-accent-500 pl-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">3. Act</h3>
              <p className="text-gray-600">
                The appropriate staff or authority receives the issue based on AI analysis and takes action. The system ensures the right person handles the right problem.
              </p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">4. Track</h3>
              <p className="text-gray-600">
                Citizens can follow their reported issues from submission to resolution, seeing status updates, progress, and final outcomes in real-time.
              </p>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <Link to="/login">
            <Button size="lg">
              Start Reporting Issues
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
