import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Upload, MapPin, X, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { analyzeIssueApi } from '../../services/api/issues';
import { issueSchema } from '../../utils/validation';
import type { DualAIAnalysisResult } from '../../types/issues';

export function Report() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<DualAIAnalysisResult | null>(null);
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});
  const [submitError, setSubmitError] = useState('');

  const categories = [
    'ROADS_INFRASTRUCTURE',
    'WATER_SANITATION',
    'WASTE_MANAGEMENT',
    'STREETLIGHTS_ELECTRICITY',
    'PUBLIC_SAFETY',
    'PARKS_ENVIRONMENT',
    'PUBLIC_FACILITIES',
    'OTHER_CIVIC',
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleAnalyze = async () => {
    setErrors({});
    setSubmitError('');

    const result = issueSchema.safeParse({ title, description, category });
    if (!result.success) {
      const fieldErrors: { title?: string; description?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === 'title') fieldErrors.title = err.message;
        if (err.path[0] === 'description') fieldErrors.description = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setAnalyzing(true);
    try {
      const result = await analyzeIssueApi(title, description, location);
      setAnalysis(result);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    if (!analysis) return;
    // TODO: Implement issue submission
    navigate('/app/issues');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Report an Issue</h1>
          <p className="text-gray-600 mt-1">Describe the problem and our AI will help prioritize it</p>
        </div>
        <Link to="/app">
          <Button variant="outline">Cancel</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Issue Details</h2>
            
            <div className="space-y-4">
              <Input
                label="Issue Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Broken streetlight near park"
                error={errors.title}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue in detail..."
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter location or use GPS"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Photo (Optional)
                </label>
                {imagePreview ? (
                  <div className="relative mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-1 bg-white rounded-full shadow hover:bg-gray-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      <label className="text-primary-600 hover:text-primary-700 cursor-pointer">
                        Click to upload
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                      {' '}or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                onClick={handleAnalyze}
                loading={analyzing}
                disabled={!title || !description}
                className="flex-1"
              >
                {analyzing ? 'Analyzing...' : 'Analyze Priority'}
              </Button>
            </div>

            {submitError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                {submitError}
              </div>
            )}
          </div>
        </div>

        {/* Analysis Section */}
        <div className="space-y-6">
          {analyzing && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-center py-8">
                <Loader2 className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Analyzing Issue</h3>
                <p className="text-gray-600">Our AI is evaluating priority and context...</p>
              </div>
            </div>
          )}

          {analysis && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900">Analysis Complete</h2>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Priority</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {Math.round(analysis.confidence * 100)}% confidence
                      </span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{analysis.priority}</div>
                </div>

                {analysis.aiAnalysis && (
                  <>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-700 mb-2">Category</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {analysis.aiAnalysis.category?.replace(/_/g, ' ')}
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-700 mb-2">Recommended Department</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {analysis.aiAnalysis.department}
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-700 mb-2">Suggested Action</div>
                      <div className="text-sm text-gray-900">{analysis.aiAnalysis.suggestedAction}</div>
                    </div>
                  </>
                )}

                <Button onClick={handleSubmit} className="w-full" size="lg">
                  Submit Issue
                </Button>
              </div>
            </div>
          )}

          {!analysis && !analyzing && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Awaiting Analysis</h3>
                <p className="text-gray-600">Fill in the issue details and click "Analyze Priority" to get AI-powered insights</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
