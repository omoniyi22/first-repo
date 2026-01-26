import { GoogleGenerativeAI } from "@google/generative-ai";
import { Pool } from 'pg';

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
    documentId?: string; // Add if you have document IDs
}

export interface GeminiAnalysisParams {
    previousAnalysis: any;
    language?: 'en' | 'es';
    documentId?: string; // Optional: Add this if you have document IDs
}

// =====================
// Constants
// =====================
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 800;

// =====================
// PostgreSQL Connection
// =====================
// Initialize PostgreSQL connection pool



const pool = new Pool({
    connectionString: "postgresql://neondb_owner:npg_C4bEayB0GUhZ@ep-weathered-thunder-ahjkekvt-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require", // <-- use your full URL
    ssl: {
        rejectUnauthorized: false, // needed for some managed DBs like Neon
    },
});

// Test connection
(async () => {
    try {
        const res = await pool.query('SELECT NOW()');
        console.log('DB connected:', res.rows[0]);
    } catch (err) {
        console.error('DB connection failed', err);
    }
})();
// =====================
// Database Service
// =====================
class AnalysisDatabaseService {
    private static instance: AnalysisDatabaseService;
    
    static getInstance(): AnalysisDatabaseService {
        if (!AnalysisDatabaseService.instance) {
            AnalysisDatabaseService.instance = new AnalysisDatabaseService();
        }
        return AnalysisDatabaseService.instance;
    }

    // Create hash from analysis parameters
    generateAnalysisHash(params: GeminiAnalysisParams): string {
        const content = JSON.stringify({
            // Normalize the analysis data for consistent hashing
            analysis: this.normalizeForHashing(params.previousAnalysis),
            language: params.language || 'en'
        });
        
        // Use SHA-256 for better uniqueness
        // In Node.js/browser, you could use crypto API
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

    // Find existing analysis by hash
    async findExistingAnalysis(hash: string): Promise<AnalysisFeedback | null> {
        try {
            const query = `
                SELECT 
                    id, 
                    analysis_hash as "analysisHash",
                    complaints,
                    interpretations,
                    areas,
                    created_at as "createdAt"
                FROM analysis_feedback 
                WHERE analysis_hash = $1 
                ORDER BY created_at DESC 
                LIMIT 1
            `;
            
            const result = await pool.query(query, [hash]);
            
            if (result.rows.length > 0) {
                const row = result.rows[0];
                return {
                    id: row.id,
                    complaints: row.complaints,
                    interpretations: row.interpretations,
                    areas: row.areas,
                    analysisHash: row.analysisHash,
                    createdAt: row.createdAt
                };
            }
            
            return null;
        } catch (error) {
            console.error('Error fetching from database:', error);
            // Don't throw - just return null to continue with new generation
            return null;
        }
    }

    // Alternative: Find by document ID if you have it
    async findAnalysisByDocumentId(documentId: string): Promise<AnalysisFeedback | null> {
        try {
            const query = `
                SELECT 
                    id, 
                    analysis_hash as "analysisHash",
                    complaints,
                    interpretations,
                    areas,
                    created_at as "createdAt"
                FROM analysis_feedback 
                WHERE document_id = $1 
                ORDER BY created_at DESC 
                LIMIT 1
            `;
            
            const result = await pool.query(query, [documentId]);
            
            if (result.rows.length > 0) {
                const row = result.rows[0];
                return {
                    id: row.id,
                    complaints: row.complaints,
                    interpretations: row.interpretations,
                    areas: row.areas,
                    analysisHash: row.analysisHash,
                    createdAt: row.createdAt
                };
            }
            
            return null;
        } catch (error) {
            console.error('Error fetching by document ID:', error);
            return null;
        }
    }

    // Save new analysis (skips fallbacks)
    async saveAnalysis(params: GeminiAnalysisParams, feedback: AnalysisFeedback): Promise<void> {
        try {
            // Check if this is a fallback response
            if (this.isFallbackResponse(feedback)) {
                console.log('Skipping fallback response save');
                return;
            }

            // Check if already exists
            const existing = await this.findExistingAnalysis(feedback.analysisHash!);
            if (existing) {
                console.log('Analysis already exists in DB:', existing.id);
                return;
            }

            const id = feedback.id || crypto.randomUUID();
            const hash = feedback.analysisHash || this.generateAnalysisHash(params);
            
            const query = `
                INSERT INTO analysis_feedback 
                (id, analysis_hash, complaints, interpretations, areas, created_at)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id
            `;

            const result = await pool.query(query, [
                id,
                hash,
                JSON.stringify(feedback.complaints),
                JSON.stringify(feedback.interpretations),
                JSON.stringify(feedback.areas),
                new Date()
            ]);
            
            console.log('Analysis saved to database with ID:', result.rows[0].id);
        } catch (error) {
            console.error('Error saving to database:', error);
            // Silently fail - we don't want to break the flow
        }
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
            const query = `
                DELETE FROM analysis_feedback 
                WHERE created_at < NOW() - INTERVAL '${daysToKeep} days'
            `;
            await pool.query(query);
            console.log(`Cleaned up analyses older than ${daysToKeep} days`);
        } catch (error) {
            console.error('Error cleaning up old analyses:', error);
        }
    }
}

// =====================
// Main Function (Enhanced)
// =====================
export const analyzeComplaintsWithGemini = async (
    params: GeminiAnalysisParams
): Promise<AnalysisFeedback> => {
    const db = AnalysisDatabaseService.getInstance();
    
    // Strategy 1: Check by document ID if provided
    if (params.documentId) {
        const existingByDoc = await db.findAnalysisByDocumentId(params.documentId);
        if (existingByDoc) {
            console.log('Found analysis by document ID:', params.documentId);
            return existingByDoc;
        }
    }
    
    // Strategy 2: Check by content hash
    const analysisHash = db.generateAnalysisHash(params);
    
    const existingByHash = await db.findExistingAnalysis(analysisHash);
    if (existingByHash) {
        console.log('Found analysis by content hash:', analysisHash);
        return existingByHash;
    }
    
    // Generate new analysis
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
            
            const normalizedFeedback = normalizeFeedback(feedback);
            
            // Add metadata
            const finalFeedback: AnalysisFeedback = {
                ...normalizedFeedback,
                analysisHash,
                createdAt: new Date()
            };
            
            // Save to database (non-blocking)
            db.saveAnalysis(params, finalFeedback)
                .then(() => console.log('Analysis saved successfully'))
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
    
    console.log('Returning fallback response (not saved to DB)');
    
    return fallbackFeedback;
};

// =====================
// Helper Functions (Unchanged)
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
    // ... existing fallback implementation remains the same ...
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

// =====================
// Setup Instructions
// =====================
/*
1. Install dependencies:
   npm install pg @google/generative-ai

2. Set environment variables:
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=equestrian_analysis
   DB_USER=postgres
   DB_PASSWORD=your_password
   VITE_GEMINI_API_KEY=your_gemini_key

3. Run the SQL schema in your PostgreSQL database

4. If you have document IDs, modify the schema:
   ALTER TABLE analysis_feedback 
   ADD COLUMN document_id VARCHAR(255),
   ADD INDEX idx_document_id (document_id);
*/