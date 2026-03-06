const express = require('express');
const Groq = require('groq-sdk');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

dotenv.config();

const supabase = require('./supabase');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// --- Auth middleware: extract user_id from Supabase JWT ---
async function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Not authenticated.' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) return res.status(401).json({ error: 'Invalid session.' });
        req.userId = user.id;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Authentication failed.' });
    }
}

// --- Validate Supabase schema on startup ---
(async () => {
    const requiredCols = ['id', 'user_id', 'file_name', 'stored_name', 'report_type', 'analysis', 'file_size', 'mime_type', 'created_at'];
    const missing = [];
    for (const col of requiredCols) {
        const { error } = await supabase.from('medical_reports').select(col).limit(0);
        if (error) missing.push(col);
    }
    if (missing.length > 0) {
        console.error('\n⚠️  Supabase "medical_reports" table is missing columns:', missing.join(', '));
        console.error('   Run this SQL in your Supabase Dashboard → SQL Editor:\n');
        console.error(`   ALTER TABLE medical_reports
     ADD COLUMN IF NOT EXISTS user_id UUID,
     ADD COLUMN IF NOT EXISTS file_name TEXT,
     ADD COLUMN IF NOT EXISTS stored_name TEXT,
     ADD COLUMN IF NOT EXISTS analysis TEXT,
     ADD COLUMN IF NOT EXISTS file_size INTEGER,
     ADD COLUMN IF NOT EXISTS mime_type TEXT;\n`);
    } else {
        console.log('✅ medical_reports table schema OK.');
    }
})();

// --- File upload config ---
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        cb(null, uniqueName);
    }
});

const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (allowedTypes.includes(file.mimetype)) cb(null, true);
        else cb(new Error('Only PDF, JPG, PNG, WEBP files are allowed'));
    }
});

// --- Upload & Analyze Report ---
app.post('/api/reports/upload', requireAuth, upload.single('report'), async (req, res) => {
    console.log('--- Report Upload ---');
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

        const filePath = req.file.path;
        const mimeType = req.file.mimetype;
        const originalName = req.file.originalname;

        // Read file as base64 for Groq vision
        const fileBuffer = fs.readFileSync(filePath);
        const base64Data = fileBuffer.toString('base64');

        const prompt = `You are MediEase, a medical report analyzer. Analyze this medical report thoroughly.

STRICT RULES:
- Use simple language anyone can understand.
- Be accurate and clear.
- Do NOT invent data not present in the report. If you cannot read the report clearly, say so.

Provide the response in this EXACT markdown structure:

### Report Type
What kind of report this is (e.g., Blood Test, X-Ray, MRI, Prescription, etc.)

### Summary
A 2-3 sentence plain-English summary of the report's key findings.

### Key Findings
- List each important finding as a bullet point
- Include values and whether they are normal, borderline, or abnormal

### Health Insights
- 2-3 bullet points explaining what these findings mean for the patient's health

### Recommendations
- 2-3 actionable recommendations based on the findings`;

        const result = await groq.chat.completions.create({
            messages: [{
                role: "user",
                content: [
                    { type: "text", text: prompt },
                    { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Data}` } }
                ]
            }],
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            temperature: 0.3,
        });

        const analysis = result.choices[0].message.content;

        // Extract report type from analysis
        const typeMatch = analysis.match(/###\s*Report Type\s*\n+(.+)/i);
        const reportType = typeMatch ? typeMatch[1].trim() : 'Medical Report';

        // Store report in Supabase
        const { data: report, error: dbError } = await supabase
            .from('medical_reports')
            .insert({
                user_id: req.userId,
                file_name: originalName,
                stored_name: req.file.filename,
                report_type: reportType,
                analysis,
                file_size: req.file.size,
                mime_type: mimeType
            })
            .select()
            .single();

        if (dbError) throw new Error('Database error: ' + dbError.message);

        console.log('Report analyzed and stored:', report.id);
        res.json({
            report: {
                id: report.id.toString(),
                fileName: report.file_name,
                storedName: report.stored_name,
                reportType: report.report_type,
                analysis: report.analysis,
                uploadedAt: report.created_at,
                fileSize: report.file_size,
                mimeType: report.mime_type
            }
        });
    } catch (error) {
        console.error('Report upload error:', error.message);
        res.status(500).json({ error: 'Failed to analyze report.', details: error.message });
    }
});

// --- List All Reports ---
app.get('/api/reports', requireAuth, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('medical_reports')
            .select('*')
            .eq('user_id', req.userId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);

        const reports = (data || []).map(r => ({
            id: r.id.toString(),
            fileName: r.file_name,
            storedName: r.stored_name,
            reportType: r.report_type,
            analysis: r.analysis,
            uploadedAt: r.created_at,
            fileSize: r.file_size,
            mimeType: r.mime_type
        }));

        res.json({ reports });
    } catch (error) {
        console.error('List reports error:', error.message);
        res.status(500).json({ error: 'Failed to load reports.' });
    }
});

// --- Delete a Report ---
app.delete('/api/reports/:id', requireAuth, async (req, res) => {
    try {
        const id = req.params.id;

        // Get the report first to find the stored file name (only if owned by user)
        const { data: report, error: fetchErr } = await supabase
            .from('medical_reports')
            .select('stored_name')
            .eq('id', id)
            .eq('user_id', req.userId)
            .single();

        if (fetchErr || !report) return res.status(404).json({ error: 'Report not found.' });

        // Delete file from disk
        const filePath = path.join(uploadsDir, report.stored_name);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        // Delete from database
        const { error: delErr } = await supabase
            .from('medical_reports')
            .delete()
            .eq('id', id)
            .eq('user_id', req.userId);

        if (delErr) throw new Error(delErr.message);

        res.json({ success: true });
    } catch (error) {
        console.error('Delete report error:', error.message);
        res.status(500).json({ error: 'Failed to delete report.' });
    }
});

// --- Ask AI about stored reports ---
app.post('/api/reports/ask', requireAuth, async (req, res) => {
    console.log('--- Report Query ---');
    try {
        const { question } = req.body;
        if (!question) return res.status(400).json({ error: 'Please provide a question.' });

        // Fetch user's reports from Supabase
        const { data: reports, error: dbErr } = await supabase
            .from('medical_reports')
            .select('file_name, report_type, analysis, created_at')
            .eq('user_id', req.userId)
            .order('created_at', { ascending: false });

        if (dbErr) throw new Error(dbErr.message);

        if (!reports || reports.length === 0) {
            return res.json({ answer: "You haven't uploaded any reports yet. Upload a medical report first, then I can answer questions about your data." });
        }

        // Build context from all stored report analyses
        const reportsContext = reports.map((r, i) =>
            `--- Report ${i + 1}: "${r.file_name}" (${r.report_type}, uploaded ${new Date(r.created_at).toLocaleDateString()}) ---\n${r.analysis}`
        ).join('\n\n');

        const prompt = `You are MediEase, a healthcare assistant with access to the patient's medical reports.

Here are the patient's stored medical reports:

${reportsContext}

STRICT RULES:
- Answer ONLY based on the data in the reports above.
- If the question cannot be answered from the reports, say so clearly.
- Use simple, easy-to-understand language.
- Maximum 150 words.
- Use markdown (### headers, - bullets) to organize your answer.

Patient's question: "${question}"`;

        const result = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.3,
        });
        const answer = result.choices[0].message.content;

        res.json({ answer });
    } catch (error) {
        console.error('Report query error:', error.message);
        res.status(500).json({ error: 'Failed to answer question.', details: error.message });
    }
});

// --- First Aid Image Analysis ---
app.post('/api/firstaid/analyze', upload.single('injury'), async (req, res) => {
    console.log('--- First Aid Analysis ---');
    try {
        if (!req.file) return res.status(400).json({ error: 'No image uploaded.' });

        const mimeType = req.file.mimetype;
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(mimeType)) {
            return res.status(400).json({ error: 'Only JPG, PNG, or WEBP images are allowed.' });
        }

        const fileBuffer = fs.readFileSync(req.file.path);
        const base64Data = fileBuffer.toString('base64');

        const prompt = `You are MediEase, an AI first aid assistant. Analyze this injury photo carefully.

STRICT RULES:
- Be accurate. If the image is unclear or not an injury, say so.
- Use simple language anyone can understand.
- Do NOT diagnose conditions beyond first aid scope.
- Be concise but thorough.

Respond in this EXACT JSON format (no markdown, no code fences, ONLY raw JSON):
{
  "injury_type": "Short name of the injury (e.g., Minor Cut, Second-Degree Burn, Bruise, Abrasion, Sprain)",
  "description": "1-2 sentence description of what you see in the image",
  "severity": "mild|moderate|severe",
  "severity_score": <number from 1 to 10>,
  "warning_color": "green|yellow|red",
  "first_aid_steps": [
    "Step 1...",
    "Step 2...",
    "Step 3...",
    "Step 4..."
  ],
  "see_doctor_when": [
    "Condition 1 when they should see a doctor...",
    "Condition 2..."
  ],
  "warning_signs": [
    "Warning sign 1...",
    "Warning sign 2..."
  ],
  "do_not": [
    "Thing to avoid 1...",
    "Thing to avoid 2..."
  ]
}

SEVERITY GUIDE:
- "green" (mild): Minor injuries like small cuts, light bruises, mild scrapes. Severity 1-3.
- "yellow" (moderate): Deeper cuts, moderate burns, significant bruising, mild sprains. Severity 4-6.
- "red" (severe): Deep wounds, severe burns, possible fractures, heavy bleeding. Severity 7-10.

If the image does NOT show an injury or is unrelated, respond with:
{"injury_type": "Not an injury", "description": "This image does not appear to show an injury.", "severity": "mild", "severity_score": 0, "warning_color": "green", "first_aid_steps": [], "see_doctor_when": [], "warning_signs": [], "do_not": []}`;

        const result = await groq.chat.completions.create({
            messages: [{
                role: "user",
                content: [
                    { type: "text", text: prompt },
                    { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Data}` } }
                ]
            }],
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            temperature: 0.2,
        });

        let text = result.choices[0].message.content.trim();
        // Strip code fences if model wraps it
        text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');

        const analysis = JSON.parse(text);
        
        // Clean up the uploaded file after analysis
        fs.unlink(req.file.path, () => {});

        console.log('First aid analysis complete:', analysis.injury_type);
        res.json({ analysis });
    } catch (error) {
        console.error('First aid analysis error:', error.message);
        if (req.file?.path) fs.unlink(req.file.path, () => {});
        res.status(500).json({ error: 'Failed to analyze image.', details: error.message });
    }
});

// --- Extract medicines from prescription image ---
app.post('/api/prescriptions/extract', requireAuth, upload.single('prescription'), async (req, res) => {
    console.log('--- Prescription Extract ---');
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

        const mimeType = req.file.mimetype;
        const fileBuffer = fs.readFileSync(req.file.path);
        const base64Data = fileBuffer.toString('base64');

        const prompt = `You are MediEase, a prescription analyzer. Extract all medicines from this prescription image.

STRICT RULES:
- Extract ONLY medicines that are clearly visible in the prescription.
- Do NOT invent or guess medicines.
- If the image is not a prescription or is unreadable, return an empty array.

Respond in this EXACT JSON format (no markdown, no code fences, ONLY raw JSON):
[
  {
    "name": "Medicine Name",
    "dosage": "e.g. 500mg, 1 tablet",
    "frequency": "Once daily|Twice daily|Three times daily|Every 8 hours|As needed",
    "timing": "Before food|After food|With food|Bedtime",
    "duration": "e.g. 5 days, 1 week, 2 weeks"
  }
]

If no medicines found, return: []`;

        const result = await groq.chat.completions.create({
            messages: [{
                role: "user",
                content: [
                    { type: "text", text: prompt },
                    { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Data}` } }
                ]
            }],
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            temperature: 0.2,
        });

        let text = result.choices[0].message.content.trim();
        text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');

        const medicines = JSON.parse(text);

        // Clean up uploaded file
        fs.unlink(req.file.path, () => {});

        console.log('Prescription extracted:', medicines.length, 'medicines');
        res.json({ medicines: Array.isArray(medicines) ? medicines : [] });
    } catch (error) {
        console.error('Prescription extract error:', error.message);
        if (req.file?.path) fs.unlink(req.file.path, () => {});
        res.status(500).json({ error: 'Failed to extract medicines.', details: error.message });
    }
});

app.post('/api/check-symptoms', async (req, res) => {
    console.log('--- Start Health Chat ---');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Payload:', JSON.stringify(req.body, null, 2));

    try {
        const { message, symptoms, duration, severity } = req.body;

        if (!process.env.GROQ_API_KEY) {
            throw new Error('GROQ_API_KEY is missing from environment variables');
        }

        if (!message && (!symptoms || symptoms.length === 0)) {
            return res.status(400).json({ error: 'Please provide a message or select symptoms.' });
        }

        const hasSymptoms = symptoms && symptoms.length > 0;
        const hasMessage = message && message.trim().length > 0;

        let prompt;

        if (hasMessage && !hasSymptoms) {
            // Free-text health question mode
            prompt = `
                You are MediEase, a friendly healthcare assistant chatbot. 
                The user asked a health-related question. Give a clear, helpful, and simple reply.

                STRICT RULES:
                - Maximum 120 words total.
                - Use very simple words. No medical jargon.
                - Use short sentences.
                - Be warm and conversational like a helpful friend.
                - If the question is NOT health-related, politely say you can only help with health topics.
                - No disclaimers inside the response.

                User's question: "${message.trim()}"

                Reply naturally. Use markdown headers (###) and bullet points (-) to organize if needed.
            `;
        } else {
            // Symptom analysis mode (with optional message context)
            prompt = `
                You are MediEase, a friendly healthcare assistant. Explain symptoms in very easy language.
                
                STRICT RULES:
                - Maximum 100 words total.
                - Use very simple words. No medical jargon.
                - Use short sentences.
                - No medical disclaimer.

                ${hasMessage ? `User's description: "${message.trim()}"` : ''}
                ${hasSymptoms ? `Selected symptoms: ${symptoms.join(', ')}` : ''}
                ${duration ? `Duration: ${duration}` : ''}
                ${severity ? `Severity: ${severity}/10` : ''}

                USE THIS EXACT STRUCTURE:

                ### Possible Issue
                One short sentence explaining the likely issue.

                ### What It Means
                One short sentence explaining what might be happening.

                ### What You Can Do
                - 3–4 short bullet points of simple home care.

                ### See a Doctor If
                - 2–3 warning signs.
            `;
        }

        console.log('Calling Groq API...');
        const result = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.3,
        });
        const text = result.choices[0].message.content;
        console.log('AI response generated successfully. Length:', text.length);

        res.json({ analysis: text });
    } catch (error) {
        console.error('--- ERROR IN HEALTH CHAT ---');
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        console.error('Stack Trace:', error.stack);

        res.status(500).json({
            error: 'Failed to get response.',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    } finally {
        console.log('--- End Health Chat ---');
    }
});

// --- Medications CRUD (Supabase) ---
app.get('/api/medications', requireAuth, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('medications')
            .select('*')
            .eq('user_id', req.userId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        res.json({ medications: data || [] });
    } catch (err) {
        console.error('Get medications error:', err.message);
        res.status(500).json({ error: 'Failed to load medications.' });
    }
});

app.post('/api/medications', requireAuth, async (req, res) => {
    try {
        const { name, dosage, frequency, timing, duration } = req.body;
        if (!name) return res.status(400).json({ error: 'Medicine name is required.' });
        const { data, error } = await supabase
            .from('medications')
            .insert({
                user_id: req.userId,
                name,
                dosage: dosage || '1 tablet',
                frequency: frequency || 'Once daily',
                timing: timing || 'After food',
                duration: duration || ''
            })
            .select()
            .single();
        if (error) throw error;
        res.json({ medication: data });
    } catch (err) {
        console.error('Add medication error:', err.message);
        res.status(500).json({ error: 'Failed to add medication.' });
    }
});

app.delete('/api/medications/:id', requireAuth, async (req, res) => {
    try {
        const { error } = await supabase
            .from('medications')
            .delete()
            .eq('id', req.params.id)
            .eq('user_id', req.userId);
        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        console.error('Delete medication error:', err.message);
        res.status(500).json({ error: 'Failed to delete medication.' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
