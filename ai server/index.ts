import express from 'express';
import cors from 'cors';
import { analyzeComplaintsWithGemini } from './analysisService';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/analyze', async (req, res) => {
  try {
    const { previousAnalysis, language, documentId } = req.body;

    if (!previousAnalysis) {
      return res.status(400).json({ error: 'previousAnalysis is required' });
    }

    const feedback = await analyzeComplaintsWithGemini({
      previousAnalysis,
      language,
      documentId
    });

    return res.json(feedback);

  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
