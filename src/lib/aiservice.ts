import { GoogleGenerativeAI } from "@google/generative-ai";

// =====================
// Types
// =====================
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

// =====================
// Constants
// =====================
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 800;

// =====================
// Main Function
// =====================
export const analyzeComplaintsWithGemini = async (
    params: GeminiAnalysisParams
): Promise<AnalysisFeedback> => {

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const genAI = new GoogleGenerativeAI(
                import.meta.env.VITE_GEMINI_API_KEY || ''
            );

            const model = genAI.getGenerativeModel({
                model: "gemini-3-flash-preview",
                generationConfig: {
                    temperature: 0.7,
                    topK: 1,
                    topP: 1,
                    maxOutputTokens: 2048,
                },
            });

            const prompt = `
You are an expert equestrian coach analyzing competition feedback.

ANALYSIS DATA:
${JSON.stringify(params.previousAnalysis, null, 2)}

TASK:
1. Extract ALL judge complaints from the analysis
2. For each complaint, provide a clear interpretation
3. Identify areas where points were lost and give actionable fixes

RULES:
- Complaints and interpretations must align by index
- Avoid repeating the same complaint wording
- Merge similar complaints into one clear statement
- Areas must be unique
- Use simple, practical language
- ${params.language === 'es' ? 'Respond in Spanish' : 'Respond in English'}

SCHEMA:
{
  "complaints": [],
  "interpretations": [],
  "areas": [
    { "name": "", "fix": "" }
  ]
}

IMPORTANT: Return ONLY valid JSON.
`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const cleanText = text
                .replace(/```json\n?|\n?```/g, '')
                .trim();

            const feedback: AnalysisFeedback = JSON.parse(cleanText);

            validateFeedback(feedback);

            return normalizeFeedback(feedback);

        } catch (error) {
            console.error(`Gemini attempt ${attempt} failed`, error);

            if (attempt < MAX_RETRIES) {
                await delay(RETRY_DELAY_MS * attempt);
                continue;
            }
        }
    }

    // Final fallback after all retries fail
    return normalizeFeedback(
        getFallbackAnalysis(params.previousAnalysis, params.language)
    );
};

// =====================
// Helpers
// =====================
const delay = (ms: number) =>
    new Promise(resolve => setTimeout(resolve, ms));

const validateFeedback = (feedback: AnalysisFeedback) => {
    if (
        !feedback ||
        !Array.isArray(feedback.complaints) ||
        !Array.isArray(feedback.interpretations) ||
        !Array.isArray(feedback.areas)
    ) {
        throw new Error('Invalid AI response structure');
    }

    if (feedback.complaints.length !== feedback.interpretations.length) {
        throw new Error('Complaints and interpretations length mismatch');
    }
};

// =====================
// Normalization / Mixing
// =====================
const normalizeFeedback = (feedback: AnalysisFeedback): AnalysisFeedback => {
    const complaintMap = new Map<string, string>();
    const interpretationMap = new Map<string, string>();

    feedback.complaints.forEach((complaint, index) => {
        const key = normalizeText(complaint);

        if (!complaintMap.has(key)) {
            complaintMap.set(key, complaint);
            interpretationMap.set(key, feedback.interpretations[index]);
        }
    });

    const complaints = Array.from(complaintMap.values());
    const interpretations = Array.from(interpretationMap.values());

    const areas = Array.from(
        new Map(
            feedback.areas.map(a => [
                normalizeText(a.name),
                a
            ])
        ).values()
    );

    return {
        complaints,
        interpretations,
        areas
    };
};

const normalizeText = (text: string) =>
    text
        .toLowerCase()
        .replace(/[’']/g, '')
        .replace(/[^a-z0-9 ]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

// =====================
// Fallback (RANDOMIZED)
// =====================
const getFallbackAnalysis = (
    analysis: any,
    language: 'en' | 'es' = 'en'
): AnalysisFeedback => {

    const data = analysis?.[language] || analysis?.en;

    if (!data) {
        return { complaints: [], interpretations: [], areas: [] };
    }

    const interpretationPool =
        language === 'es'
            ? [
                "La ejecución carece de consistencia general",
                "La precisión técnica necesita mayor atención",
                "La comunicación entre jinete y caballo es limitada",
                "El control y equilibrio pueden mejorar",
                "Falta claridad en la ejecución de los ejercicios",
                "El rendimiento muestra falta de estabilidad"
            ]
            : [
                "Overall execution lacks consistency",
                "Technical precision needs improvement",
                "Communication between rider and horse is unclear",
                "Balance and control can be improved",
                "Exercises lack clarity and intention",
                "Performance shows instability"
            ];

    const shuffledInterpretations = shuffleArray([...interpretationPool]);

    const complaints: string[] = [];
    const interpretations: string[] = [];

    let interpretationIndex = 0;

    if (data.generalComments) {
        Object.values(data.generalComments).forEach((comment: any) => {
            if (typeof comment !== 'string') return;

            complaints.push(comment);

            interpretations.push(
                shuffledInterpretations[
                    interpretationIndex % shuffledInterpretations.length
                ]
            );

            interpretationIndex++;
        });
    }

    const areas =
        data.weaknesses?.slice(0, 3).map((w: string) => ({
            name: w,
            fix:
                language === 'es'
                    ? `Practicar ejercicios específicos para mejorar ${w.toLowerCase()}`
                    : `Practice targeted exercises to improve ${w.toLowerCase()}`
        })) || [];

    return {
        complaints,
        interpretations,
        areas
    };
};

// =====================
// Utilities
// =====================
const shuffleArray = <T,>(array: T[]): T[] => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};
