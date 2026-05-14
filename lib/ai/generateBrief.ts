import { GoogleGenAI } from '@google/genai';
import { Brief } from '../types';

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing from environment variables');
  }
  return new GoogleGenAI({ apiKey });
};

export async function generateBriefFromInput(rawInput: string, files?: any[]): Promise<Partial<Brief>> {
  const systemInstruction = `
    You are an expert technical project manager and business analyst. 
    Your job is to take raw, messy input (text, images of wireframes/notes, and audio transcripts/files) 
    and convert it into a highly structured JSON project brief.

    Analyze any provided images for wireframes, UI components, or handwritten notes.
    Analyze any provided audio for requirements, feedback, or project context.
    Combine everything with the provided text input.

    You MUST return ONLY valid JSON matching this exact structure:
    {
      "title": "A short, descriptive title for the project",
      "summary": "A concise executive summary of the project",
      "goals": ["Goal 1", "Goal 2"],
      "requested_features": ["Feature 1", "Feature 2"],
      "ambiguities": ["Ambiguity 1", "Ambiguity 2"],
      "follow_up_questions": ["Question 1", "Question 2"],
      "complexity_estimate": "High", // Must be 'Low', 'Medium', or 'High'
      "complexity_reasoning": "A concise 1-sentence reasoning for the complexity estimate"
    }
  `;

  try {
    const parts: any[] = [];
    
    if (rawInput && rawInput.trim() !== '') {
      parts.push({ text: `Text Input: ${rawInput}` });
    }

    if (files && files.length > 0) {
      files.forEach(file => {
        parts.push({
          inlineData: {
            data: file.data,
            mimeType: file.mimeType
          }
        });
        parts.push({ text: `File Name: ${file.name} (${file.type})` });
      });
    }

    if (parts.length === 0) {
      throw new Error('No input (text or files) provided');
    }

    const response = await getAI().models.generateContent({
      model: 'gemini-1.5-flash',
      contents: parts,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.2,
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error('No text returned from Gemini');
    }

    const parsedData = JSON.parse(text);

    return {
      title: parsedData.title || 'Untitled Project',
      summary: parsedData.summary || 'No summary provided',
      goals: Array.isArray(parsedData.goals) ? parsedData.goals : [],
      requested_features: Array.isArray(parsedData.requested_features) ? parsedData.requested_features : [],
      ambiguities: Array.isArray(parsedData.ambiguities) ? parsedData.ambiguities : [],
      follow_up_questions: Array.isArray(parsedData.follow_up_questions) ? parsedData.follow_up_questions : [],
      status: 'pending',
      complexity_estimate: parsedData.complexity_estimate || 'Medium',
      complexity_reasoning: parsedData.complexity_reasoning || 'Standard project requirements.'
    };
  } catch (error: any) {
    console.error('Error generating brief with Gemini:', error);
    throw new Error(`AI Generation failed: ${error.message}`);
  }
}

export async function refineBrief(currentBrief: Partial<Brief>, clientFeedback: string): Promise<Partial<Brief>> {
  if (!clientFeedback || clientFeedback.trim() === '') {
    throw new Error('Feedback cannot be empty for refinement');
  }

  const systemInstruction = `
    You are an expert technical project manager. 
    You are given an existing project brief and specific feedback from a client requesting changes.
    Your goal is to REVISE the brief based on the feedback while maintaining the quality and structure of the original.

    Current Brief Data:
    Title: ${currentBrief.title}
    Summary: ${currentBrief.summary}
    Goals: ${JSON.stringify(currentBrief.goals)}
    Features: ${JSON.stringify(currentBrief.requested_features)}
    Ambiguities: ${JSON.stringify(currentBrief.ambiguities)}
    Questions: ${JSON.stringify(currentBrief.follow_up_questions)}

    Client Feedback:
    "${clientFeedback}"

    You MUST return ONLY valid JSON matching this exact structure, incorporating the requested changes:
    {
      "title": "A short, descriptive title",
      "summary": "Revised executive summary",
      "goals": ["Goal 1", "Goal 2"],
      "requested_features": ["Feature 1", "Feature 2"],
      "ambiguities": ["Remaining or new ambiguity 1"],
      "follow_up_questions": ["New follow-up question 1"],
      "complexity_estimate": "High", // 'Low', 'Medium', or 'High'
      "complexity_reasoning": "Updated reasoning"
    }
  `;

  try {
    const response = await getAI().models.generateContent({
      model: 'gemini-1.5-flash',
      contents: `Revise the brief according to this feedback: ${clientFeedback}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.2,
      }
    });

    const text = response.text;
    if (!text) throw new Error('No text returned from Gemini');

    const parsedData = JSON.parse(text);

    return {
      title: parsedData.title || currentBrief.title,
      summary: parsedData.summary || currentBrief.summary,
      goals: Array.isArray(parsedData.goals) ? parsedData.goals : currentBrief.goals,
      requested_features: Array.isArray(parsedData.requested_features) ? parsedData.requested_features : currentBrief.requested_features,
      ambiguities: Array.isArray(parsedData.ambiguities) ? parsedData.ambiguities : [],
      follow_up_questions: Array.isArray(parsedData.follow_up_questions) ? parsedData.follow_up_questions : [],
      status: 'pending',
      complexity_estimate: parsedData.complexity_estimate || currentBrief.complexity_estimate,
      complexity_reasoning: parsedData.complexity_reasoning || currentBrief.complexity_reasoning
    };
  } catch (error: any) {
    console.error('Error refining brief with Gemini:', error);
    throw new Error(`AI Refinement failed: ${error.message}`);
  }
}
