import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from '@supabase/supabase-js';
const VITE_GEMINI_API_KEY = "AIzaSyDZ6WsChZLWXldvn0OPKYSrVZhw5gs8Rtg";

// =====================
// Types
// =====================
export interface AnalysisFeedback {
    id?: string;
    complaints: string[];
    interpretations: string[];
    areas: {
        name: string;
        
        fix: string;
    }[];
    analysisHash?: string;
    createdAt?: Date;
    documentId?: string; // Document ID for primary query
}

export interface GeminiAnalysisParams {
    previousAnalysis: any;
    language?: 'en' | 'es';
    documentId?: string; // Document ID is required for Supabase operations
}


// =====================
// Constants
// =====================
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 800;

// =====================
// Supabase Configuration
// =====================
// Initialize Supabase client
const supabaseUrl = "https://arluwtznxjjmwjftnuhu.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFybHV3dHpueGpqbXdqZnRudWh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MTU3NzksImV4cCI6MjA4NDk5MTc3OX0.gxfuYd_e7RZqK79BC7iRcSjQSx3O0utJJCwUEcGDiz8";
const supabase = createClient(supabaseUrl, supabaseAnonKey);


// =====================
// Database Service (Supabase)
// =====================
class AnalysisSupabaseService {
    private static instance: AnalysisSupabaseService;

    static getInstance(): AnalysisSupabaseService {
        if (!AnalysisSupabaseService.instance) {
            AnalysisSupabaseService.instance = new AnalysisSupabaseService();
        }
        return AnalysisSupabaseService.instance;
    }

    // Create hash from analysis parameters
    generateAnalysisHash(params: GeminiAnalysisParams): string {
        if (!params.documentId) {
            throw new Error('documentId is required for Supabase operations');
        }

        const content = JSON.stringify({
            documentId: params.documentId,
            analysis: this.normalizeForHashing(params.previousAnalysis),
            language: params.language || 'en'
        });

        // Simple hash function
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return `analysis_${Math.abs(hash).toString(36)}`;
    }

    // Normalize data for consistent hashing
    private normalizeForHashing(data: any): any {
        if (typeof data !== 'object' || data === null) {
            return data;
        }

        if (Array.isArray(data)) {
            return data.map(item => this.normalizeForHashing(item)).sort();
        }

        const sortedObj: any = {};
        Object.keys(data)
            .sort()
            .forEach(key => {
                sortedObj[key] = this.normalizeForHashing(data[key]);
            });

        return sortedObj;
    }

    // Find existing analysis by document ID (Primary query method)
    async findAnalysisByDocumentId(documentId: string): Promise<AnalysisFeedback | null> {
        try {
            if (!documentId) {
                throw new Error('documentId is required');
            }

            const { data, error } = await supabase
                .from('analysis_feedback')
                .select('*')
                .eq('document_id', documentId)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (error) {
                if (error.code === 'PGRST116') { // No rows returned
                    return null;
                }
                console.error('Supabase query error:', error);
                return null;
            }

            if (data) {
                return this.mapSupabaseToFeedback(data);
            }

            return null;
        } catch (error) {
            console.error('Error fetching from Supabase:', error);
            return null;
        }
    }

    // Find existing analysis by hash (Alternative method)
    async findExistingAnalysis(hash: string): Promise<AnalysisFeedback | null> {
        try {
            const { data, error } = await supabase
                .from('analysis_feedback')
                .select('*')
                .eq('analysis_hash', hash)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    return null;
                }
                console.error('Supabase query error:', error);
                return null;
            }

            if (data) {
                return this.mapSupabaseToFeedback(data);
            }

            return null;
        } catch (error) {
            console.error('Error fetching from Supabase:', error);
            return null;
        }
    }

    // Save new analysis (Upsert based on documentId)
    async saveAnalysis(params: GeminiAnalysisParams, feedback: AnalysisFeedback): Promise<void> {
        try {
            if (!params.documentId) {
                throw new Error('documentId is required for saving analysis');
            }

            // Check if this is a fallback response
            if (this.isFallbackResponse(feedback)) {
                console.log('Skipping fallback response save');
                return;
            }

            // Generate hash if not provided
            const hash = feedback.analysisHash || this.generateAnalysisHash(params);

            // Prepare data for Supabase
            const supabaseData = {
                id: feedback.id || crypto.randomUUID(),
                document_id: params.documentId,
                analysis_hash: hash,
                complaints: JSON.stringify(feedback.complaints),
                interpretations: JSON.stringify(feedback.interpretations),
                areas: JSON.stringify(feedback.areas),
                created_at: new Date().toISOString()
            };

            // Upsert based on document_id
            const { data, error } = await supabase
                .from('analysis_feedback')
                .upsert(supabaseData, {
                    onConflict: 'document_id', // Use document_id as conflict resolution key
                    ignoreDuplicates: false
                })
                .select()
                .single();

            if (error) {
                console.error('Error saving to Supabase:', error);
                return;
            }

            console.log('Analysis saved to Supabase with ID:', data.id);
        } catch (error) {
            console.error('Error saving to Supabase:', error);
            // Silently fail - we don't want to break the flow
        }
    }

    // Update existing analysis by document ID
    async updateAnalysisByDocumentId(documentId: string, updates: Partial<AnalysisFeedback>): Promise<AnalysisFeedback | null> {
        try {
            if (!documentId) {
                throw new Error('documentId is required for update');
            }

            const updateData: any = {};

            if (updates.complaints !== undefined) {
                updateData.complaints = JSON.stringify(updates.complaints);
            }
            if (updates.interpretations !== undefined) {
                updateData.interpretations = JSON.stringify(updates.interpretations);
            }
            if (updates.areas !== undefined) {
                updateData.areas = JSON.stringify(updates.areas);
            }
            if (updates.analysisHash !== undefined) {
                updateData.analysis_hash = updates.analysisHash;
            }

            updateData.updated_at = new Date().toISOString();

            const { data, error } = await supabase
                .from('analysis_feedback')
                .update(updateData)
                .eq('document_id', documentId)
                .select()
                .single();

            if (error) {
                console.error('Error updating in Supabase:', error);
                return null;
            }

            return this.mapSupabaseToFeedback(data);
        } catch (error) {
            console.error('Error updating analysis:', error);
            return null;
        }
    }

    // Map Supabase response to AnalysisFeedback
    private mapSupabaseToFeedback(data: any): AnalysisFeedback {
        return {
            id: data.id,
            complaints: data.complaints ? JSON.parse(data.complaints) : [],
            interpretations: data.interpretations ? JSON.parse(data.interpretations) : [],
            areas: data.areas ? JSON.parse(data.areas) : [],
            analysisHash: data.analysis_hash,
            createdAt: new Date(data.created_at),
            documentId: data.document_id
        };
    }

    // Determine if response is a fallback
    private isFallbackResponse(feedback: AnalysisFeedback): boolean {
        // Check for empty responses
        if (feedback.complaints.length === 0 || feedback.interpretations.length === 0) {
            return true;
        }

        // Check for known fallback patterns
        const fallbackPatterns = [
            "Overall execution lacks consistency",
            "Technical precision needs improvement",
            "Communication between rider and horse is unclear",
            "Balance and control can be improved",
            "Exercises lack clarity and intention",
            "Performance shows instability"
        ];

        const hasFallbackPattern = feedback.interpretations.some(interpretation =>
            fallbackPatterns.some(pattern =>
                interpretation.toLowerCase().includes(pattern.toLowerCase())
            )
        );

        // Check for generic fixes
        const hasGenericFixes = feedback.areas.some(area =>
            area.fix.toLowerCase().includes('practice targeted exercises') ||
            area.fix.toLowerCase().includes('practicar ejercicios específicos')
        );

        return hasFallbackPattern || hasGenericFixes;
    }

    // Optional: Cleanup old analyses
    async cleanupOldAnalyses(daysToKeep: number = 30): Promise<void> {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

            const { error } = await supabase
                .from('analysis_feedback')
                .delete()
                .lt('created_at', cutoffDate.toISOString());

            if (error) {
                console.error('Error cleaning up old analyses:', error);
                return;
            }

            console.log(`Cleaned up analyses older than ${daysToKeep} days`);
        } catch (error) {
            console.error('Error cleaning up old analyses:', error);
        }
    }
}

// =====================
// Main Function (Enhanced for Supabase)
// =====================
export const analyzeComplaintsWithGemini = async (
    params: GeminiAnalysisParams
): Promise<AnalysisFeedback> => {
    const db = AnalysisSupabaseService.getInstance();

    // Validate documentId is provided for Supabase
    if (!params.documentId) {
        throw new Error('documentId is required for Supabase operations');
    }

    // Strategy 1: First check by document ID (primary method)
    const existingByDoc = await db.findAnalysisByDocumentId(params.documentId);
    if (existingByDoc) {
        console.log('Found analysis by document ID:', params.documentId);
        return existingByDoc;
    }

    // Strategy 2: Check by content hash as fallback
    const analysisHash = db.generateAnalysisHash(params);

    const existingByHash = await db.findExistingAnalysis(analysisHash);
    if (existingByHash) {
        console.log('Found analysis by content hash:', analysisHash);

        // Update the found analysis with the documentId for future queries
        const updatedAnalysis = await db.updateAnalysisByDocumentId(
            params.documentId,
            { ...existingByHash, documentId: params.documentId }
        );

        if (updatedAnalysis) {
            return updatedAnalysis;
        }

        return existingByHash;
    }

    // Generate new analysis
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const genAI = new GoogleGenerativeAI(
                VITE_GEMINI_API_KEY || ''
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

            const normalizedFeedback = normalizeFeedback(feedback);

            // Add metadata including documentId
            const finalFeedback: AnalysisFeedback = {
                ...normalizedFeedback,
                analysisHash,
                createdAt: new Date(),
                documentId: params.documentId
            };

            // Save to Supabase (non-blocking)
            db.saveAnalysis(params, finalFeedback)
                .then(() => console.log('Analysis saved successfully to Supabase'))
                .catch(err => console.error('Background save error:', err));

            return finalFeedback;

        } catch (error) {
            console.error(`Gemini attempt ${attempt} failed:`, error);

            if (attempt < MAX_RETRIES) {
                await delay(RETRY_DELAY_MS * attempt);
                continue;
            }
        }
    }

    // Final fallback after all retries fail
    const fallbackFeedback = normalizeFeedback(
        getFallbackAnalysis(params.previousAnalysis, params.language)
    );

    // Add documentId to fallback for consistency
    fallbackFeedback.documentId = params.documentId;

    console.log('Returning fallback response (not saved to DB)');

    return fallbackFeedback;
};

// =====================
// Helper Functions
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

const shuffleArray = <T,>(array: T[]): T[] => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};
