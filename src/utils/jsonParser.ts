interface LLMResponse {
  result?: any
  response?: any
  error?: string
}

function parseLLMJson(response: string): LLMResponse {
  try {
    // Handle different response formats
    let text = response;

    // If it's already JSON string
    if (typeof response === 'string') {
      // Try to parse directly first
      try {
        return JSON.parse(response);
      } catch {
        text = response;
      }
    }

    // Extract JSON from markdown code blocks
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }

    // Extract JSON from any code blocks
    const codeBlockMatch = text.match(/```([\s\S]*?)```/);
    if (codeBlockMatch) {
      return JSON.parse(codeBlockMatch[1]);
    }

    // Extract JSON object from text
    const objectMatch = text.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      return JSON.parse(objectMatch[0]);
    }

    // Return as-is if no JSON structure found
    return { result: text };

  } catch (error) {
    console.log('JSON parsing failed:', error);
    return {
      error: 'Failed to parse LLM response'
    };
  }
}

export default parseLLMJson;