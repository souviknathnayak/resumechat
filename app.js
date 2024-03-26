const express = require('express');
const { spawn } = require('child_process');
const bodyParser = require('body-parser');
const SpeechSDK = require('microsoft-cognitiveservices-speech-sdk');
const path = require('path');
const fs = require('fs');
const multer = require('multer'); // For handling file uploads

const app = express();
const port = 8888;

// Setup for file uploads
const upload = multer({ dest: 'uploads/' });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Configure your Azure subscription key and region
const speechConfig = SpeechSDK.SpeechConfig.fromSubscription("6bf5f76b71644223a48cc33a28631030", "centralindia");
// Optionally, configure the speech recognition language
speechConfig.speechRecognitionLanguage = "en-IN"; // For Indian English, adjust as needed

function textToSpeech(text, res) {
    const audioFileName = `audio-${Date.now()}.wav`;
    const audioFilePath = path.join(__dirname, 'public', audioFileName);
    const audioConfig = SpeechSDK.AudioConfig.fromAudioFileOutput(audioFilePath);

    const synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, audioConfig);

    synthesizer.speakTextAsync(
        text,
        result => {
            if (result) {
                synthesizer.close();
                res.json({ botReply: text, audioPath: audioFileName });
            }
        },
        error => {
            console.error(error);
            synthesizer.close();
            res.status(500).json({ botReply: 'Failed to synthesize speech', error: error.toString() });
        }
    );
}

app.post('/chat', (req, res) => {
    const userMessage = req.body.message;
    console.log('User Message:', userMessage);

    const pythonProcess = spawn('python', ['python_bot_interaction.py', userMessage]);

    let botReply = '';
    pythonProcess.stdout.on('data', (data) => botReply += data.toString());
    pythonProcess.stderr.on('data', (data) => console.error(data.toString()));

    pythonProcess.on('close', (code) => {
        if (code === 0) {
            textToSpeech(botReply, res);
        } else {
            res.status(500).json({ botReply: 'Bot encountered an error' });
        }
    });
});

// Endpoint for speech recognition
app.post('/speech-to-text', upload.single('audio'), (req, res) => {
    // Assumes a single audio file named 'audio' is uploaded
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const audioFileName = path.join(__dirname, req.file.path);
    const audioConfig = SpeechSDK.AudioConfig.fromWavFileInput(audioFileName);
    const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

    recognizer.recognizeOnceAsync(
        result => {
            fs.unlinkSync(audioFileName); // Delete the audio file after processing
            recognizer.close();
            if (result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
                res.json({ text: result.text });
            } else {
                res.status(500).json({ error: 'Failed to recognize speech', details: result });
            }
        },
        err => {
            recognizer.close();
            console.error('Error during speech recognition:', err);
            res.status(500).json({ error: 'Speech recognition failed', details: err.toString() });
        }
    );
});

app.delete('/delete-audio', (req, res) => {
    const audioFile = req.query.file;
    if (audioFile) {
        const filePath = path.join(__dirname, 'public', audioFile);
        fs.unlink(filePath, err => {
            if (err) {
                console.error(`Failed to delete audio file: ${filePath}`, err);
                res.status(500).send('Failed to delete audio file');
            } else {
                res.send('Audio file deleted');
            }
        });
    } else {
        res.status(400).send('No file specified');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});