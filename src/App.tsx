import React, { useState, useEffect, useRef } from 'react'
import parseLLMJson from './utils/jsonParser'

interface Message {
  id: string
  type: 'user' | 'fortune'
  content: string
  timestamp: Date
  confidence?: number
  metadata?: any
}

interface AgentResponse {
  result: {
    fortune?: string
    styled_text?: string
    confidence: number
    metadata: any
  }
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [typingText, setTypingText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const generateRandomId = () => {
    return Math.random().toString(36).substr(2, 9)
  }

  const callAgent = async (agentId: string, message: string): Promise<AgentResponse> => {
    const response = await fetch('https://agent-prod.studio.lyzr.ai/v3/inference/chat/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'sk-default-obhGvAo6gG9YT9tu6ChjyXLqnw7TxSGY'
      },
      body: JSON.stringify({
        user_id: `user${generateRandomId()}@test.com`,
        agent_id: agentId,
        session_id: `session-${generateRandomId()}`,
        message: message
      })
    })

    if (!response.ok) {
      throw new Error('Agent request failed')
    }

    const data = await response.json()
    return parseLLMJson(JSON.stringify(data))
  }

  const simulateTyping = async (text: string) => {
    setTypingText('')
    const words = text.split(' ')
    let currentText = ''

    for (let i = 0; i < words.length; i++) {
      currentText += (i === 0 ? '' : ' ') + words[i]
      setTypingText(currentText)
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50))
    }
  }

  const generateFortune = async () => {
    if (!inputText.trim() || isLoading) return

    const userMessage: Message = {
      id: generateRandomId(),
      type: 'user',
      content: inputText,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsLoading(true)

    try {
      // Step 1: Generate fortune
      const fortuneResponse = await callAgent('68e01d10f21978807e7e979c', inputText)
      let fortune = fortuneResponse.result.fortune || 'The mists of time cloud my vision...'

      // Step 2: Apply persona styling
      const personaResponse = await callAgent('68e01d1c010a31eba98903e4', fortune)
      let styledFortune = personaResponse.result.styled_text || fortune

      // Simulate typing effect for the fortune
      await simulateTyping(styledFortune)

      const fortuneMessage: Message = {
        id: generateRandomId(),
        type: 'fortune',
        content: styledFortune,
        timestamp: new Date(),
        confidence: personaResponse.result.confidence,
        metadata: personaResponse.result.metadata
      }

      setMessages(prev => [...prev, fortuneMessage])
      setTypingText('')
    } catch (error) {
      console.error('Error generating fortune:', error)
      let errorMessage: Message = {
        id: generateRandomId(),
        type: 'fortune',
        content: 'The crystal ball is clouded. Please try again later...',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
      setTypingText('')
    } finally {
      setIsLoading(false)
    }
  }

  const clearHistory = () => {
    setMessages([])
  }

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      generateFortune()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 relative overflow-hidden">
      {/* Mystical background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-2 h-2 bg-purple-400 rounded-full animate-pulse opacity-60"></div>
        <div className="absolute top-20 right-20 w-1 h-1 bg-yellow-300 rounded-full animate-ping opacity-40"></div>
        <div className="absolute bottom-20 left-20 w-2 h-2 bg-purple-300 rounded-full animate-pulse opacity-50"></div>
        <div className="absolute bottom-10 right-10 w-1 h-1 bg-yellow-400 rounded-full animate-ping opacity-30"></div>
        <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-purple-500 rounded-full animate-pulse opacity-40"></div>
        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-yellow-300 rounded-full animate-ping opacity-50"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300 mb-4 font-serif">
            🔮 Mystical Fortune Teller
          </h1>
          <p className="text-purple-200 text-lg md:text-xl mb-2 font-sans">
            Ask your question and peer into the crystal ball
          </p>
          <p className="text-purple-300 text-sm font-sans">
            The spirits are listening to your queries...
          </p>
        </div>

        {/* Chat Messages */}
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-2xl p-6 mb-6 max-h-96 overflow-y-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔮</div>
              <p className="text-purple-200 text-lg mb-2">The crystal ball awaits your question...</p>
              <p className="text-purple-300 text-sm">Type your query below and let me reveal your destiny!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl rounded-2xl px-6 py-4 ${
                    message.type === 'user'
                      ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white'
                      : 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-gray-900'
                  } shadow-lg`}
                >
                  <p className={`${message.type === 'user' ? 'font-sans' : 'font-serif text-lg'} leading-relaxed`}>
                    {message.content}
                  </p>
                  <p className={`text-xs mt-2 opacity-70 ${message.type === 'user' ? 'text-purple-200' : 'text-gray-700'}`}>
                    {getCurrentTime()}
                  </p>
                </div>
              </div>
            ))
          )}

          {/* Typing indicator */}
          {typingText && (
            <div className="flex justify-start">
              <div className="max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl rounded-2xl px-6 py-4 bg-gradient-to-br from-yellow-400 to-yellow-500 text-gray-900 shadow-lg">
                <p className="font-serif text-lg leading-relaxed">{typingText}</p>
                <div className="flex space-x-1 mt-2">
                  <div className="w-2 h-2 bg-gray-700 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-700 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-700 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Section */}
        <div className="space-y-4">
          <div className="flex space-x-4">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="What does your future hold? Ask a question..."
              className="flex-1 bg-gray-800 bg-opacity-70 backdrop-blur-sm border border-purple-600 rounded-xl px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-sans"
              disabled={isLoading}
            />
            <button
              onClick={generateFortune}
              disabled={isLoading || !inputText.trim()}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-lg disabled:opacity-50 font-sans"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Gazing...</span>
                </div>
              ) : (
                '🔮 Reveal'
              )}
            </button>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={() => setInputText('Give me a general fortune')}
              className="text-purple-300 hover:text-purple-200 text-sm transition-colors duration-200 font-sans"
            >
              ✨ Quick Fortune
            </button>

            <button
              onClick={clearHistory}
              className="text-purple-300 hover:text-purple-200 text-sm transition-colors duration-200 flex items-center space-x-1 font-sans"
            >
              <span>🗑️</span>
              <span>Clear History</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-purple-400 text-xs font-sans">
            For entertainment purposes only • The future is not set in stone
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
