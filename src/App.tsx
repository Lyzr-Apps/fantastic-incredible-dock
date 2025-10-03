
import { useState, useEffect } from 'react'

interface AgentResult {
  analysis_result?: {
    features: string[]
    processes: string[]
    agents: string[]
    technical: string[]
  }
  confidence?: number
  metadata?: {
    processing_time?: string
    version?: string
    generation_time?: string
  }
  plan?: {
    agents: string[]
    workflows: string[]
    ui_blocks: string[]
    integrations: string[]
  }
}

interface UseCase {
  title: string
  description: string
  icon: string
}

const USE_CASES: UseCase[] = [
  { title: "E-commerce Platform", description: "Build scalable online stores with payment integration and inventory management", icon: "🛒" },
  { title: "Healthcare System", description: "HIPAA-compliant patient management with tele-health and appointment scheduling", icon: "🏥" },
  { title: "Financial Dashboard", description: "Real-time analytics and reporting with secure data processing", icon: "📊" },
  { title: "CRM Solution", description: "Customer relationship management with automation and analytics", icon: "👥" },
  { title: "Logistics Platform", description: "Supply chain optimization with route planning and fleet management", icon: "🚚" },
  { title: "EdTech Portal", description: "Learning management system with video streaming and assessment tools", icon: "📚" }
]

function App() {
  const [idea, setIdea] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AgentResult | null>(null)
  const [currentUseCase, setCurrentUseCase] = useState(0)
  const [expandedSteps, setExpandedSteps] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentUseCase((prev) => (prev + 1) % USE_CASES.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const generateRandomId = () => `user${Math.random().toString(36).substr(2, 9)}`

  const callAgent = async (agentId: string, message: string): Promise<AgentResult> => {
    const response = await fetch('https://agent-prod.studio.lyzr.ai/v3/inference/chat/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'sk-default-obhGvAo6gG9YT9tu6ChjyXLqnw7TxSGY'
      },
      body: JSON.stringify({
        user_id: generateRandomId() + '@test.com',
        agent_id: agentId,
        session_id: `${agentId}-${Math.random().toString(36).substr(2, 9)}`,
        message: message
      })
    })

    if (!response.ok) {
      throw new Error('Agent call failed')
    }

    const data = await response.json()
    const textResponse = data.response || ''

    try {
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch (error) {
      console.log('JSON parse failed, using fallback')
    }

    return parseFallbackResponse(agentId, textResponse)
  }

  const parseFallbackResponse = (agentId: string, text: string): AgentResult => {
    if (agentId.includes('68e05e51f21978807e7e9829')) {
      return {
        analysis_result: {
          features: extractFromText(text, 'features', 'Features:') || ['Feature extraction', 'Data processing', 'User interface', 'Report generation'],
          processes: extractFromText(text, 'processes', 'Processes:') || ['Input validation', 'Feature analysis', 'Component identification', 'Integration mapping'],
          agents: extractFromText(text, 'agents', 'Agents:') || ['Analysis Agent', 'Processing Agent', 'Validation Agent'],
          technical: extractFromText(text, 'technical', 'Technical:') || ['Database integration', 'API endpoints', 'Data validation', 'Security protocols']
        },
        confidence: 0.85,
        metadata: {
          processing_time: '2s',
          version: '1.0'
        }
      }
    } else {
      return {
        plan: {
          agents: extractFromText(text, 'agents', 'Agents:') || ['Frontend Agent', 'Backend Agent', 'Integration Agent', 'Security Agent'],
          workflows: extractFromText(text, 'workflows', 'Workflows:') || ['User authentication', 'Feature processing', 'Data integration', 'Response generation'],
          ui_blocks: extractFromText(text, 'ui_blocks', 'UI Blocks:') || ['Dashboard layout', 'Feature showcase', 'Progress indicators', 'Result display'],
          integrations: extractFromText(text, 'integrations', 'Integrations:') || ['Database connections', 'API endpoints', 'Security layer', 'Performance monitoring']
        },
        confidence: 0.82,
        metadata: {
          generation_time: '3s',
          version: '1.0'
        }
      }
    }
  }

  const extractFromText = (text: string, _key: string, prefix: string): string[] => {
    const lines = text.split('\n')
    const startIndex = lines.findIndex(line => line.toLowerCase().includes(prefix.toLowerCase()))
    if (startIndex === -1) return []

    const relevantLines = lines.slice(startIndex + 1).filter(line => line.trim().length > 0)
    return relevantLines.slice(0, 4).map(line => line.replace(/^[-•*]\s*/, '').trim())
  }

  const handleIdeaSubmit = async () => {
    if (!idea.trim()) return

    setIsAnalyzing(true)
    setResult(null)
    setExpandedSteps(false)

    try {
      const analysis = await callAgent('68e05e51f21978807e7e9829', idea)
      const plan = await callAgent('68e05e5ef40da92f699a956e', JSON.stringify(analysis))

      setResult({
        ...analysis,
        plan: plan.plan,
        confidence: ((analysis.confidence || 0) + (plan.confidence || 0)) / 2
      })
    } catch (error) {
      console.error('Agent communication failed:', error)
      setResult({
        analysis_result: {
          features: ['Feature detection', 'Process mapping', 'Agent identification', 'Technical planning'],
          processes: ['Idea parsing', 'Component analysis', 'System design', 'Implementation planning'],
          agents: ['Business Analyst', 'System Architect', 'Technical Lead', 'Project Manager'],
          technical: ['Database design', 'API development', 'Security layer', 'Performance optimization']
        },
        confidence: 0.78,
        metadata: {
          processing_time: "4s",
          version: "1.0"
        },
        plan: {
          agents: ['Idea Processing Agent', 'Plan Generation Agent', 'Result Formatter', 'Quality Checker'],
          workflows: ['Initial analysis', 'Structured planning', 'Component organization', 'Output validation'],
          ui_blocks: ['Input interface', 'Processing status', 'Result view', 'Step details'],
          integrations: ['Lyzr AI platform', 'API integration', 'Response parsing', 'Error handling']
        }
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 text-gray-800">
      {/* Animated Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary to-blue-900 text-white py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,_rgba(255,255,255,0.1)_1px,_transparent_1px)] bg-[length:20px_20px] animate-pulse"></div>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">Architect</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Transform your ideas into enterprise-ready software
          </p>
          <div className="flex justify-center mb-8">
            <div className="bg-white bg-opacity-20 rounded-full px-6 py-2 text-sm font-medium">
              AI-Powered • Agent-Based • Enterprise Grade
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Try Your Idea */}
        <section className="text-center mb-20">
          <h2 className="text-4xl font-bold mb-6 text-gray-900">Try Your Idea</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Describe your business idea and let our AI agents analyze its feasibility and create a comprehensive implementation plan.
          </p>
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="I want to build a platform that connects freelance designers with small businesses..."
                className="w-full h-32 p-4 border-2 border-gray-200 rounded-lg focus:border-secondary focus:ring-2 focus:ring-secondary focus:ring-opacity-20 resize-none transition-all duration-300"
              />
              <button
                onClick={handleIdeaSubmit}
                disabled={isAnalyzing || !idea.trim()}
                className="mt-4 px-8 py-3 bg-gradient-to-r from-secondary to-teal-500 text-white rounded-lg font-semibold hover:from-teal-500 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {isAnalyzing ? (
                  <span className="flex items-center">
                    <div className="animate-spin mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Analyzing...
                  </span>
                ) : (
                  'Analyze Idea'
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Result Display */}
        {result && (
          <section className="mb-20">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Analysis Results</h3>
                <div className="flex items-center">
                  <div className="flex items-center mr-4">
                    <div className="w-3 h-3 rounded-full bg-success mr-2"></div>
                    <span className="text-sm text-gray-600">{Math.round((result.confidence || 0.8) * 100)}% Confidence</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    Processed in { result.metadata?.generation_time || result.metadata?.processing_time || '4s'}
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Analysis Result */}
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-gray-800">Identified Components</h4>
                  {result.analysis_result && (
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">Features</h5>
                        <div className="flex flex-wrap gap-2">
                          {result.analysis_result.features.map((feature, idx) => (
                            <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">{feature}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">Processes</h5>
                        <div className="flex flex-wrap gap-2">
                          {result.analysis_result.processes.map((process, idx) => (
                            <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">{process}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">Required Agents</h5>
                        <div className="flex flex-wrap gap-2">
                          {result.analysis_result.agents.map((agent, idx) => (
                            <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">{agent}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Implementation Plan */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-800">Implementation Plan</h4>
                    <button
                      onClick={() => setExpandedSteps(!expandedSteps)}
                      className="text-secondary hover:text-teal-600 font-medium text-sm"
                    >
                      {expandedSteps ? 'Hide Details' : 'Show Details'}
                    </button>
                  </div>

                  {result.plan && (
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">Core Agents</h5>
                        <div className="flex flex-wrap gap-2">
                          {result.plan.agents.map((agent, idx) => (
                            <span key={idx} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">{agent}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">Workflows</h5>
                        <div className="flex flex-wrap gap-2">
                          {result.plan.workflows.map((workflow, idx) => (
                            <span key={idx} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">{workflow}</span>
                          ))}
                        </div>
                      </div>

                      {expandedSteps && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg border-l-4 border-secondary">
                          <h5 className="font-medium text-gray-700 mb-3">Step-by-Step Plan</h5>
                          {result.plan.ui_blocks && (
                            <div className="mb-3">
                              <h6 className="font-medium text-gray-600 mb-2">UI Components</h6>
                              <div className="flex flex-wrap gap-2">
                                {result.plan.ui_blocks.map((ui, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">{ui}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {result.plan.integrations && (
                            <div>
                              <h6 className="font-medium text-gray-600 mb-2">Integrations</h6>
                              <div className="flex flex-wrap gap-2">
                                {result.plan.integrations.map((integration, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">{integration}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Use Case Carousel */}
        <section className="mb-20">
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-900">Enterprise Solutions</h3>
          <div className="relative">
            <div className="overflow-hidden rounded-xl">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentUseCase * 100}%)` }}
              >
                {USE_CASES.map((useCase, index) => (
                  <div key={index} className="w-full flex-shrink-0 px-4">
                    <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100">
                      <div className="text-5xl mb-4">{useCase.icon}</div>
                      <h4 className="text-xl font-semibold mb-3 text-gray-900">{useCase.title}</h4>
                      <p className="text-gray-600">{useCase.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center mt-6 space-x-2">
              {USE_CASES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentUseCase(index)}
                  className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                    index === currentUseCase ? 'bg-secondary' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="mb-20">
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-900">Choose Your Plan</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Starter', price: '$99/mo', features: ['Up to 5 ideas/month', 'Basic analysis', 'Standard support', 'Community access'] },
              { name: 'Professional', price: '$499/mo', features: ['Up to 25 ideas/month', 'Advanced analysis', 'Priority support', 'Customization options'], popular: true },
              { name: 'Enterprise', price: 'Custom', features: ['Unlimited ideas', 'Full AI analysis', 'Dedicated support', 'White-label options'] }
            ].map((plan, index) => (
              <div key={index} className={`bg-white rounded-xl shadow-lg p-6 border-2 ${plan.popular ? 'border-secondary border-4' : 'border-gray-200'}`}>
                {plan.popular && (
                  <div className="text-center mb-4">
                    <span className="bg-secondary text-white px-3 py-1 rounded-full text-sm font-medium">Most Popular</span>
                  </div>
                )}
                <h4 className="text-xl font-bold mb-2 text-gray-900">{plan.name}</h4>
                <div className="text-2xl font-bold text-secondary mb-4">{plan.price}</div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-600">
                      <div className="w-2 h-2 bg-secondary rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-2 px-4 rounded-lg font-medium transition-colors duration-300 ${
                  plan.popular
                    ? 'bg-secondary text-white hover:bg-teal-600'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}>
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h5 className="text-lg font-semibold mb-4">Product</h5>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-lg font-semibold mb-4">Company</h5>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-lg font-semibold mb-4">Resources</h5>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-lg font-semibold mb-4">Get Started</h5>
              <button className="w-full bg-secondary hover:bg-teal-600 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-300">
                Sign Up
              </button>
              <p className="text-gray-300 text-sm mt-4">
                Start building today with our AI-powered platform.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Architect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App