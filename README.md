🧠 MindWatch AI — Mental Wellness & Stress Detection System

⚡ A multi-platform AI tool that detects stress and emotional wellness levels from WhatsApp chats, Tweets, or voice recordings — providing real-time insights and personalized recommendations.

🚀 Overview

MindWatch AI combines Natural Language Processing (NLP) and Speech Emotion Recognition to analyze user interactions across different platforms and estimate their mental wellness level.

It uses a fine-tuned RoBERTa emotion model with VADER sentiment analysis for textual data and SpeechRecognition + pydub + ffmpeg for voice input.

The web dashboard provides an intuitive UI to visualize stress levels with progress indicators and actionable mental health suggestions.

🌟 Key Features
Feature	Description
💬 WhatsApp Chat Analysis	Upload exported chat text files to analyze stress patterns.
🐦 Twitter Post Evaluation	Analyze tweets or social media text for emotional wellness.
🎤 Speech Analysis	Upload .wav, .mp3, or .m4a audio to detect stress from voice tone.
📊 AI Dashboard	Real-time circular stress index and risk bar visualization.
🧩 Multi-Model Ensemble	Combines transformer probabilities with sentiment scores.
🧘 Smart Suggestions	Personalized motivational quotes or activities fetched from public APIs.
🔒 Privacy-First	All processing done locally — no data storage or sharing.
🏗️ Tech Stack
🧩 Frontend

⚛️ React.js

🎨 Tailwind CSS

📦 Axios for API requests

🔧 Backend

🐍 Flask (Python)

🤗 Transformers (Hugging Face)

🔊 SpeechRecognition + pydub + ffmpeg

🧠 VADER Sentiment Analyzer

🌐 REST APIs for suggestions (ZenQuotes, BoredAPI, AdviceSlip)
