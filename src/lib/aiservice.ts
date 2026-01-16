import { GoogleGenerativeAI } from "@google/generative-ai";

// Define the response schema
export interface AnalysisFeedback {
    complaints: string[];
    interpretations: string[];
    areas: {
        name: string;
        fix: string;
    }[];
}


export interface GeminiAnalysisParams {
    previousAnalysis: any;
    language?: 'en' | 'es';
}

/**
 * Analyze judge complaints and generate fixes using Gemini AI
 */
export const analyzeComplaintsWithGemini = async (
    params: GeminiAnalysisParams
): Promise<AnalysisFeedback> => {
    try {
        // Initialize Gemini AI
        const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');
        const model = genAI.getGenerativeModel({
            model: "gemini-3-flash-preview",
            generationConfig: {
                temperature: 0.7,
                topK: 1,
                topP: 1,
                maxOutputTokens: 2048,
            },
        });

        // Construct the prompt with clear instructions
        const prompt = `
You are an expert equestrian coach analyzing competition feedback.

ANALYSIS DATA:
${JSON.stringify(params.previousAnalysis, null, 2)}

TASK:
1. Extract ALL judge complaints from the analysis
2. For each complaint, provide a clear interpretation (what it really means for the rider)
3. Identify specific areas where points were lost and provide actionable fixes

RULES:
- Complaints and interpretations must align by index (same number of items, matching pairs)
- Areas must be unique (no duplicates)
- Fixes must be actionable, specific, and practical
- Use clear, simple language
- Focus on dressage/show jumping fundamentals
- ${params.language === 'es' ? 'Respond in Spanish' : 'Respond in English'}

SCHEMA FORMAT:
{
  "complaints": ["judge complaint 1", "judge complaint 2", ...],
  "interpretations": ["interpretation for complaint 1", "interpretation for complaint 2", ...],
  "areas": [
    {"name": "specific area name", "fix": "actionable fix instruction"},
    {"name": "another area", "fix": "actionable fix instruction"}
  ]
}

EXAMPLES:
- Complaint: "Inconsistent contact"
- Interpretation: "The rider is not maintaining steady, elastic connection with the horse's mouth, causing tension and resistance"
- Area: { "name": "Contact Consistency", "fix": "Practice 20m circles focusing on maintaining even rein contact without pulling" }

IMPORTANT: Return ONLY valid JSON, no additional text.
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up the response (remove markdown code blocks if present)
        const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();

        // Parse the JSON response
        const feedback: AnalysisFeedback = JSON.parse(cleanText);

        // Validate the response structure
        if (!feedback.complaints || !feedback.interpretations || !feedback.areas) {
            throw new Error('Invalid response structure from AI');
        }

        if (feedback.complaints.length !== feedback.interpretations.length) {
            throw new Error('Complaints and interpretations must have same length');
        }

        // Ensure areas are unique
        const uniqueAreas = Array.from(
            new Map(feedback.areas.map(item => [item.name, item])).values()
        );
        console.log({
            ...feedback,
            areas: uniqueAreas
        });
        return {
            ...feedback,
            areas: uniqueAreas
        };

    } catch (error) {
        console.error('Error analyzing complaints with Gemini:', error);

        // Fallback response in case of API failure
        return getFallbackAnalysis(params.previousAnalysis, params.language);
    }
};

/**
 * Fallback analysis when AI service fails
 */
const getFallbackAnalysis = (analysis: any, language?: 'en' | 'es'): AnalysisFeedback => {
    const lang = language || 'en';
    const data = analysis[lang] || analysis.en;

    if (!data) {
        return {
            complaints: [],
            interpretations: [],
            areas: []
        };
    }

    // Extract complaints from generalComments
    const complaints: string[] = [];
    const interpretations: string[] = [];

    if (data.generalComments) {
        Object.values(data.generalComments).forEach((comment: any) => {
            if (comment && typeof comment === 'string') {
                complaints.push(comment);
                // Simple interpretation based on keywords
                let interpretation = "";
                if (comment.toLowerCase().includes('contact')) {
                    interpretation = lang === 'es'
                        ? "Necesita mejorar la conexión consistente con la boca del caballo"
                        : "Needs to improve consistent connection with the horse's mouth";
                } else if (comment.toLowerCase().includes('rhythm') || comment.toLowerCase().includes('ritmo')) {
                    interpretation = lang === 'es'
                        ? "El tempo y regularidad del aire necesitan más consistencia"
                        : "Tempo and regularity of the gait need more consistency";
                } else if (comment.toLowerCase().includes('transition') || comment.toLowerCase().includes('transición')) {
                    interpretation = lang === 'es'
                        ? "Las transiciones entre aires requieren más fluidez y precisión"
                        : "Transitions between gaits need more fluidity and precision";
                } else {
                    interpretation = lang === 'es'
                        ? "Aspecto que requiere atención específica en los entrenamientos"
                        : "Aspect requiring specific attention in training";
                }
                interpretations.push(interpretation);
            }
        });
    }

    // Extract areas from weaknesses or low scores
    const areas = data.weaknesses?.slice(0, 3).map((weakness: string) => ({
        name: weakness,
        fix: lang === 'es'
            ? `Practicar ejercicios específicos para mejorar: ${weakness.toLowerCase()}`
            : `Practice specific exercises to improve: ${weakness.toLowerCase()}`
    })) || [];

    return {
        complaints,
        interpretations,
        areas
    };
};