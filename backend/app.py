# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import requests
from werkzeug.utils import secure_filename
import speech_recognition as sr
import os,tempfile
from pydub import AudioSegment

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

MODEL_DIR = "top_final_roberta_model"  # folder produced by trainer
tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_DIR)
model.eval()
analyzer = SentimentIntensityAnalyzer()

# thresholds (use calibrated values or defaults)
THR_LOW_MOD = 0.33
THR_MOD_HIGH = 0.66

def compute_probs(text):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=256)
    with torch.no_grad():
        out = model(**inputs)
        probs = torch.nn.functional.softmax(out.logits, dim=-1).squeeze().cpu().numpy()
    return probs
@app.route("/speech-to-text", methods=["POST"])
def speech_to_text():
    if "file" not in request.files:
        return jsonify({"error": "no_file"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "empty_filename"}), 400

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_wav:
            tmp_path = tmp_wav.name

        # Convert any audio to WAV using pydub + ffmpeg
        audio = AudioSegment.from_file(file)
        audio.export(tmp_path, format="wav")

        recognizer = sr.Recognizer()
        with sr.AudioFile(tmp_path) as source:
            audio_data = recognizer.record(source)
            text = recognizer.recognize_google(audio_data)

        os.remove(tmp_path)
        return jsonify({"text": text})
    except Exception as e:
        print("Speech-to-text error:", e)
        return jsonify({"error": str(e)}), 500

def ensemble_score(text, probs):
    vader = analyzer.polarity_scores(text)
    neg = max(0, -vader['compound'])

    # Handle 2-class models
    if len(probs) == 2:
        # Assuming index 1 = "stress" or "negative"
        base = probs[1]
    else:
        # For 3-class models
        base = probs[2] + 0.5 * probs[1]

    combined = float(0.8 * base + 0.2 * neg)
    return max(0.0, min(1.0, combined))
def get_dynamic_suggestion(category):
    """Fetch category-based suggestions from public APIs"""
    try:
        if category == "Low":
            # Motivational quote
            res = requests.get("https://zenquotes.io/api/random", timeout=5)
            if res.status_code == 200:
                data = res.json()
                return f"Motivational Quote: {data[0]['q']} — {data[0]['a']}"
        
        elif category == "Moderate":
            # Relaxing activity suggestion
            res = requests.get("https://www.boredapi.com/api/activity", timeout=5)
            if res.status_code == 200:
                data = res.json()
                return f"Try this: {data['activity']} ({data['type']})"
        
        elif category == "High":
            # Comforting advice
            res = requests.get("https://api.adviceslip.com/advice", timeout=5)
            if res.status_code == 200:
                data = res.json()
                return f"Advice: {data['slip']['advice']}"
    except Exception as e:
        print("Suggestion API error:", e)
    
    # fallback
    fallback = {
        "Low": "You're doing great — keep up your positive habits!",
        "Moderate": "Take a 5-minute walk or listen to calming music.",
        "High": "Pause, breathe deeply, and consider talking to a friend."
    }
    return fallback.get(category, "Take care of yourself!")

@app.route("/analyze", methods=["POST"])
def analyze():
    text = request.json.get("text","")
    if not text.strip():
        return jsonify({"error":"empty_text"}), 400
    probs = compute_probs(text)
    score = ensemble_score(text, probs)
    if score < THR_LOW_MOD:
        category = "Low"
    elif score < THR_MOD_HIGH:
        category = "Moderate"
    else:
        category = "High"
    # simple explanation: top words via naive keyword match or LIME
    suggestion = "Try short breathing exercises" if category != "Low" else "Keep doing what you are doing!"
    try:
        suggestion = get_dynamic_suggestion(category)
    except Exception as e:
        print("Error fetching suggestion:", e)
        # keep default
    return jsonify({
        "stress_score": round(score,3),
        "category": category,
        "probs": probs.tolist(),
        "suggestion": suggestion
    })

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)
