# train_classifier.py
import numpy as np
from datasets import load_dataset
from evaluate import load as load_metric
from transformers import (
    AutoTokenizer, Trainer, TrainingArguments, RobertaForSequenceClassification
)
import torch
import os

os.environ["SAFETENSORS_FAST_SAVE"] = "0"

MODEL_BASE = "SamLowe/roberta-base-go_emotions"
OUTPUT_DIR = "saved_model_fast"
MAX_LEN = 128

# 1️⃣ Load dataset
dataset = load_dataset("go_emotions")
train_data = dataset["train"].shuffle(seed=42).select(range(3500))
val_data = dataset["validation"].shuffle(seed=1).select(range(700))

label_names = dataset["train"].features["labels"].feature.names
print("Available emotion labels:", label_names)

# 2️⃣ Map emotion labels → stress levels
stress_map = {
    "joy": 0, "neutral": 0, "love": 0,
    "surprise": 1,
    "anger": 2, "fear": 2, "sadness": 2, "disgust": 2, "anxiety": 2
}

def map_stress(example):
    emotions = [label_names[i] for i in example["labels"]]
    primary = emotions[0] if len(emotions) > 0 else "neutral"
    example["labels"] = stress_map.get(primary, 1)
    return example

train_data = train_data.map(map_stress)
val_data = val_data.map(map_stress)

# 3️⃣ Tokenize
tokenizer = AutoTokenizer.from_pretrained(MODEL_BASE)

def preprocess(batch):
    return tokenizer(
        batch["text"],
        truncation=True,
        padding="max_length",
        max_length=MAX_LEN
    )

train_enc = train_data.map(preprocess, batched=True)
val_enc = val_data.map(preprocess, batched=True)

train_enc.set_format(type="torch", columns=["input_ids", "attention_mask", "labels"])
val_enc.set_format(type="torch", columns=["input_ids", "attention_mask", "labels"])

# 4️⃣ Load model (3 stress levels)
print("🔧 Loading pretrained model...")

model = RobertaForSequenceClassification.from_pretrained(
    MODEL_BASE,
    num_labels=3,
    problem_type="single_label_classification",
    ignore_mismatched_sizes=True  # ✅ Add this line
)

# 5️⃣ Metrics
metric_acc = load_metric("accuracy")
metric_f1 = load_metric("f1")

def compute_metrics(p):
    preds = np.argmax(p.predictions, axis=1)
    acc = metric_acc.compute(predictions=preds, references=p.label_ids)["accuracy"]
    f1 = metric_f1.compute(predictions=preds, references=p.label_ids, average="weighted")["f1"]
    return {"accuracy": acc, "f1": f1}

# 6️⃣ Training setup
training_args = TrainingArguments(
    output_dir=OUTPUT_DIR,
    per_device_train_batch_size=16,
    per_device_eval_batch_size=16,
    num_train_epochs=5,
    learning_rate=2e-5,
    weight_decay=0.01,
    warmup_ratio=0.1,
    eval_strategy="epoch",  # ✅ Correct param name
    save_strategy="epoch",
    load_best_model_at_end=True,
    metric_for_best_model="f1",
    logging_steps=50,
    gradient_accumulation_steps=1,
    fp16=torch.cuda.is_available(),
    report_to="none"
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_enc,
    eval_dataset=val_enc,
    compute_metrics=compute_metrics,
    tokenizer=tokenizer
)

print("🚀 Training started...")
trainer.train()
trainer.save_model(OUTPUT_DIR)
tokenizer.save_pretrained(OUTPUT_DIR)
print("✅ Model saved to", OUTPUT_DIR)
