import { Link } from 'react-router-dom';
import { Shield, ArrowRight, Zap, Globe, Heart, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-50 to-primary-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Shield className="h-16 w-16 text-primary-600" />
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
              ECOCIVIX AI
            </h1>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-700 mb-4">
              Safer. Smarter.
            </p>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-primary-600 mb-8">
              More Sustainable Communities.
            </p>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-12">
              Citizens report problems. AI helps understand and prioritize them. 
              Authorities act and citizens track progress.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Explore How It Works
                </Button>
              </Link>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary-200 rounded-full opacity-20 blur-3xl"></div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple four-step process to transform community issues into action
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="h-10 w-10 text-primary-600" />
              </div>
              <div className="text-6xl font-bold text-primary-200 mb-4">01</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Report</h3>
              <p className="text-gray-600">
                Spot a community problem and submit it with details
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe className="h-10 w-10 text-secondary-600" />
              </div>
              <div className="text-6xl font-bold text-secondary-200 mb-4">02</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Understand</h3>
              <p className="text-gray-600">
                AI analyzes the issue and the trained ML model evaluates priority
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="h-10 w-10 text-accent-600" />
              </div>
              <div className="text-6xl font-bold text-accent-200 mb-4">03</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Act</h3>
              <p className="text-gray-600">
                The right staff/authority receives the issue and takes action
              </p>
            </div>

            {/* Step 4 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <div className="text-6xl font-bold text-green-200 mb-4">04</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Track</h3>
              <p className="text-gray-600">
                Citizens can follow the issue from report to resolution
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Three Intelligence Pillars
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI understands multiple dimensions of every civic issue
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Civic Intelligence */}
            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
                <Zap className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Civic Intelligence
              </h3>
              <p className="text-gray-600 mb-6">
                Understanding infrastructure and community facilities
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Roads & Infrastructure</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Streetlights & Electricity</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Water & Sanitation</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Public Facilities</span>
                </li>
              </ul>
            </div>

            {/* Eco Intelligence */}
            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-secondary-100 rounded-lg flex items-center justify-center mb-6">
                <Globe className="h-8 w-8 text-secondary-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Eco Intelligence
              </h3>
              <p className="text-gray-600 mb-6">
                Environmental impact assessment and sustainability
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-secondary-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Waste Management</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-secondary-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Water Leakage</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-secondary-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Pollution Monitoring</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-secondary-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Cleanliness Tracking</span>
                </li>
              </ul>
            </div>

            {/* Community Safety */}
            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-accent-100 rounded-lg flex items-center justify-center mb-6">
                <Heart className="h-8 w-8 text-accent-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Community Safety
              </h3>
              <p className="text-gray-600 mb-6">
                Safety relevance analysis and emergency support
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-accent-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Safety Hazard Detection</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-accent-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Emergency Support</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-accent-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Location-Aware Reporting</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-accent-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Risk Assessment</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Make Your Community Better?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of citizens reporting issues and driving positive change
          </p>
          <Link to="/login">
            <Button size="lg" variant="secondary">
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
