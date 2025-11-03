# backend/utils.py
import re
from datetime import datetime

def split_by_day(messages):
    # messages: list of {datetime: "12/31/20, 9:50 PM", sender, text}
    days = {}
    for m in messages:
        dt = parse_whatsapp_datetime(m["datetime"])  # implement parse
        day = dt.date().isoformat()
        days.setdefault(day, []).append(m["text"])
    return {day: " ".join(txts) for day, txts in days.items()}

# on analyze endpoint: if payload includes parsed messages (with datetime), compute per-day scores
