# calibrate_thresholds.py (run after training)
import numpy as np
import pandas as pd
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
from sklearn.metrics import f1_score

MODEL_DIR = "saved_model"
tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_DIR)
model.eval()

def get_score(text):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=256)
    with torch.no_grad():
        out = model(**inputs)
        probs = torch.nn.functional.softmax(out.logits, dim=-1).squeeze().cpu().numpy()
    stress_score = probs[2] + 0.5*probs[1]  # simple mapping
    return stress_score, probs

val = pd.read_csv("val.csv")
y_true = val["label"].values
scores = val["text"].map(lambda t: get_score(t)[0]).values

# find thresholds that maximize f1 for mapping to 0,1,2
best = {"thr1":None,"thr2":None,"f1":-1}
for t1 in np.linspace(0.2,0.5,16):    # Low->Moderate
    for t2 in np.linspace(0.5,0.85,18): # Moderate->High
        preds = np.digitize(scores, bins=[t1,t2])  # 0,1,2
        f1 = f1_score(y_true, preds, average="weighted")
        if f1 > best["f1"]:
            best = {"thr1":t1,"thr2":t2,"f1":f1}
print("Best thresholds:", best)
