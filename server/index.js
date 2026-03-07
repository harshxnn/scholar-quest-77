const express = require('express');
const cors = require('cors');
const multer = require('multer');
const dotenv = require('dotenv');
const { spawn } = require('child_process');
const path = require('path');
dotenv.config();

function runChatOrchestrator(query, activeSources, activeAddons, advancedOptions, files) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify({
            query,
            activeSources,
            activeAddons,
            advancedOptions,
            files
        });

        // Execute the Python script using uv run
        const pythonProcess = spawn('uv', ['run', 'agent.py'], {
            cwd: __dirname,
            env: process.env // Pass environment variables
        });

        let stdoutData = '';
        let stderrData = '';

        pythonProcess.stdout.on('data', (data) => {
            stdoutData += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            stderrData += data.toString();
            // Output Python stderr logic, useful for verbose langchain logs
            process.stdout.write(`[Python Log]: ${data.toString()}`);
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`Python process exited with code ${code}`);
                // Try to parse an error response anyway
                try {
                    const lastJsonStart = stdoutData.lastIndexOf('{');
                    if (lastJsonStart !== -1) {
                        const parsed = JSON.parse(stdoutData.substring(lastJsonStart));
                        if (parsed.error) return resolve(parsed.error);
                    }
                } catch (e) { }
                return resolve(`Error: Backend processing failed (Code ${code}).`);
            }

            try {
                // Split by newline and get the last non-empty line
                const lines = stdoutData.split('\n').filter(line => line.trim() !== '');
                const lastLine = lines[lines.length - 1];

                if (lastLine) {
                    const parsed = JSON.parse(lastLine.trim());
                    if (parsed.error) {
                        resolve(parsed.error);
                    } else {
                        resolve(parsed.response);
                    }
                } else {
                    resolve("Error: No output generated from Python agent.");
                }
            } catch (err) {
                console.error('Failed to parse Python output. Output:', stdoutData);
                resolve("Error parsing response from backend orchestration.");
            }
        });

        pythonProcess.stdin.write(payload);
        pythonProcess.stdin.end();
    });
}

const app = express();
const port = process.env.PORT || 3001;

// Setup Middleware
app.use(cors());
app.use(express.json());

// Configure Multer for PDF uploads
const upload = multer({ dest: 'uploads/' });

app.post('/api/chat', upload.array('files'), async (req, res) => {
    try {
        console.log('--- Incoming Request ---');
        console.log('Content-Type:', req.headers['content-type']);
        console.log('req.body:', req.body);
        console.log('req.files:', req.files);

        const { query, activeSources, activeAddons, advancedOptions } = req.body || {};
        const files = req.files || [];

        console.log('Received Chat Request Query:', query);

        const parsedSources = activeSources ? JSON.parse(activeSources) : [];
        const parsedAddons = activeAddons ? JSON.parse(activeAddons) : [];
        const parsedAdvanced = advancedOptions ? JSON.parse(advancedOptions) : {};

        const response = await runChatOrchestrator(
            query,
            parsedSources,
            parsedAddons,
            parsedAdvanced,
            files
        );

        res.json({ response });
    } catch (error) {
        console.error('Error in chat endpoint:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.use((err, req, res, next) => {
    console.error('Express Error Handler:', err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
});

if (require.main === module) {
    app.listen(port, () => {
        console.log(`Backend server magically running on port ${port}`);
    });
}

module.exports = app;
