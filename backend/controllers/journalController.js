const db = require('../database');
const { GoogleGenerativeAI } = require("@google/generative-ai");



exports.createJournal = (req, res) => {
    const { userId, ambience, text } = req.body;
    if (!userId || !ambience || !text) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    
    const emotion = req.body.emotion || null;
    const keywords = req.body.keywords ? JSON.stringify(req.body.keywords) : null;

    const query = `INSERT INTO journals (userId, ambience, text, emotion, keywords, date) VALUES (?, ?, ?, ?, ?, datetime('now'))`;
    db.run(query, [userId, ambience, text, emotion, keywords], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: "Journal created", id: this.lastID });
    });
};

exports.getJournals = (req, res) => {
    const { userId } = req.params;
    const query = `SELECT * FROM journals WHERE userId = ? ORDER BY date DESC`;
    db.all(query, [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        const journals = rows.map(r => ({
            ...r,
            keywords: r.keywords ? JSON.parse(r.keywords) : []
        }));
        
        res.json(journals);
    });
};

exports.analyzeText = async (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ error: "Text is required" });
    }

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        console.log("--- Analysis Request ---");
        console.log("Text length:", text.length);
        console.log("API Key present?", !!apiKey);
        
        const isPlaceholder = apiKey && (apiKey.includes('your_google_') || apiKey.includes('here'));

        if (!apiKey || isPlaceholder || apiKey === 'dummy_key') {
            console.warn(">>> Using MOCK analysis (No valid API Key detected) <<<");
            await new Promise(r => setTimeout(r, 800));
            
            const lowerText = text.toLowerCase();
            let mockEmotion = "calm";
            let mockKeywords = ["nature", "peace", "relaxation"];
            
            // Refined mock logic to be more sensitive for testing
            if (lowerText.match(/bad|worst|sad|annoy|frustrat|stress|terrible|angry/)) {
                mockEmotion = "frustrated";
                mockKeywords = ["frustration", "stress", "negative"];
            } else if (lowerText.match(/good|great|happy|awesome|nice|wonderful|love|best/)) {
                mockEmotion = "joyful";
                mockKeywords = ["happiness", "positivity", "uplifting"];
            }

            return res.json({
                emotion: mockEmotion,
                keywords: mockKeywords,
                summary: `Analyzed as ${mockEmotion}. (Test Mode)`
            });
        }

        console.log(">>> Attempting REAL AI Analysis with Gemini <<<");
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `
        Carefully analyze the emotion and sentiment of the following journal entry:
        "${text}"

        Focus strictly on the actual sentiment expressed in the text. Ensure that if the entry describes negative feelings (e.g., fear, stress, anger, sadness), the "emotion" and "keywords" reflect that accurately, rather than defaulting to a calm or peaceful state.

        Provide the analysis in STRICT JSON format with exactly three fields:
        {
          "emotion": "a single word describing the main emotion (e.g., joyful, calm, frustrated, terrified, sad, anxious)",
          "keywords": ["array", "of", "3-5", "lowercased", "keywords", "relevant", "to", "the", "text"],
          "summary": "a one sentence short explanation of the user's experience based solely on the provided text"
        }
        Do not include any other text or formatting.
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();
        
        const jsonStr = responseText.replace(/^```json/g, '').replace(/```$/g, '').trim();
        const analysis = JSON.parse(jsonStr);
        
        if (req.body.id) {
            const updateQuery = `UPDATE journals SET emotion = ?, keywords = ? WHERE id = ?`;
            db.run(updateQuery, [analysis.emotion, JSON.stringify(analysis.keywords), req.body.id], (err) => {
                if (err) console.error("Failed to update journal:", err);
            });
        }
        
        res.json(analysis);
    } catch (error) {
        console.error("LLM Error:", error);
        res.status(500).json({ 
            error: "Failed to perform AI analysis",
            emotion: "error",
            keywords: ["error", "fallback"],
            summary: "Analysis failed due to API error."
        });
    }
};

exports.getInsights = (req, res) => {
    const { userId } = req.params;
    const query = `SELECT * FROM journals WHERE userId = ?`;
    
    db.all(query, [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        const totalEntries = rows.length;
        if (totalEntries === 0) {
            return res.json({
                totalEntries: 0,
                topEmotion: "None",
                mostUsedAmbience: "None",
                recentKeywords: []
            });
        }

        const ambienceCounts = {};
        const emotionCounts = {};
        const keywordCounts = {};

        rows.forEach(row => {
            ambienceCounts[row.ambience] = (ambienceCounts[row.ambience] || 0) + 1;
            
            if (row.emotion) {
                const emo = row.emotion.toLowerCase();
                emotionCounts[emo] = (emotionCounts[emo] || 0) + 1;
            }
            
            if (row.keywords) {
                try {
                    const keys = JSON.parse(row.keywords);
                    keys.forEach(k => {
                        const kl = k.toLowerCase();
                        keywordCounts[kl] = (keywordCounts[kl] || 0) + 1;
                    });
                } catch(e){}
            }
        });

        let mostUsedAmbience = "None";
        if (Object.keys(ambienceCounts).length > 0) {
            mostUsedAmbience = Object.keys(ambienceCounts).reduce((a, b) => ambienceCounts[a] > ambienceCounts[b] ? a : b);
        }
            
        let topEmotion = "None";
        if (Object.keys(emotionCounts).length > 0) {
            topEmotion = Object.keys(emotionCounts).reduce((a, b) => emotionCounts[a] > emotionCounts[b] ? a : b);
        }

        const recentKeywords = Object.keys(keywordCounts)
            .sort((a, b) => keywordCounts[b] - keywordCounts[a])
            .slice(0, 5);

        res.json({
            totalEntries,
            topEmotion,
            mostUsedAmbience,
            recentKeywords
        });
    });
};
