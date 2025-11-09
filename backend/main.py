from fastapi import FastAPI
from fastapi.responses import JSONResponse, StreamingResponse
from openai import OpenAI
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import List
import sqlite3
from datetime import datetime
import json
from fastapi.middleware.cors import CORSMiddleware



load_dotenv()
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Type"],
)


client = OpenAI(base_url="https://openrouter.ai/api/v1")


# ---------------------------FOR DIARY----------------------------
def get_db_connection():
    conn = sqlite3.connect("diary.db")
    conn.row_factory = sqlite3.Row
    return conn


@app.post("/add_entry")
def add_entry(entry_text: str):
    conn = get_db_connection()
    conn.execute(
        "INSERT INTO diary_entries (entry_date, entry_text) VALUES (DATE('now'), ?)",
        (entry_text,),
    )
    conn.commit()
    conn.close()


def get_latest_entries(n=4):
    conn = get_db_connection()
    rows = conn.execute(
        """
        SELECT entry_date, entry_text, ai_response_text
        FROM diary_entries
        WHERE entry_date >= date('now', '-4 days')
        ORDER BY entry_date ASC;
    """
    ).fetchall()
    conn.close()
    return rows


@app.post("/comment_journal")
async def comment_journal():
    recent_entries = get_latest_entries()
    if len(recent_entries) == 0:
        return {"error": "No recent entries found."}

    # Combine texts for model input
    journal_texts = "\n\n".join([row["entry_text"] for row in recent_entries])

    with client.responses.stream(
        model="openai/gpt-5-nano",
        input=[
            {
                "role": "system",
                "content": (
                    "You are a supportive, attentive, and empathetic commenter "
                    "on the user's latest day journal while given knowledge about their previous 3 days."
                ),
            },
            {"role": "user", "content": journal_texts},
        ],
    ) as stream:

        final_text = ""

        def token_generator():
            nonlocal final_text
            for event in stream:
                if event.type == "response.output_text.delta":
                    final_text += event.delta
                    yield event.delta
                elif event.type == "response.completed":
                    # Save the AI’s full comment to DB
                    conn = get_db_connection()
                    conn.execute(
                        "UPDATE diary_entries SET ai_response_text = ? WHERE entry_date = DATE('now')",
                        (final_text,),
                    )
                    conn.commit()
                    conn.close()
                    break
                elif event.type == "response.error":
                    yield f"\n[ERROR]: {event.error}\n"
                    break

        return StreamingResponse(token_generator(), media_type="text/plain")

# ---------------------Chat---------------------


def save_message(speaker: str, text: str):
    conn = get_db_connection()
    conn.execute(
        "INSERT INTO chat_messages (speaker, message_text) VALUES (?, ?)",
        (speaker, text),
    )
    conn.commit()
    conn.close()


def get_message(n=20):
    conn = get_db_connection()
    rows = conn.execute(
        "SELECT * FROM chat_messages ORDER BY timestamp DESC LIMIT ?", (n,)
    ).fetchall()
    return [dict(row) for row in reversed(rows)]


@app.post("/comment_message")
async def comment_message(message: str):
    try:
        recent_entries = get_latest_entries()
        journal_texts = "\n\n".join([row["entry_text"] for row in recent_entries])
    except Exception:
        journal_texts = ""

    full_text = journal_texts + "\n\n" + message if journal_texts else message

    stream = client.responses.stream(
        model="openai/gpt-5-nano",
        input=[
            {
                "role": "system",
                "content": "You are a supportive, attentive, and empathetic commentator on the user's message.",
            },
            {"role": "user", "content": full_text},
        ],
        stream=True,
    )

    async def token_generator():
        for event in stream:
            if event.type == "response.output_text.delta":
                yield event.delta  # event.delta contains the incremental token text

        yield "[DONE]"

    return StreamingResponse(token_generator(), media_type="text/plain")


@app.get("/api/chat/{message}")
async def test_comment(message: str):
    stream = client.responses.create(
        model="gpt-5-nano",
        input=[
            {
                "role": "system",
                "content": "You are a supportive, attentive and empathetic commentor on the user's message knowing ",
            },
            {"role": "user", "content": message},
        ],
        stream=True,
    )

    async def token_generator():
        for event in stream:
            if event.type == "response.output_text.delta":
                yield event.delta  # event.delta contains the incremental token text

        yield "[DONE]"

    return StreamingResponse(token_generator(), media_type="text/plain")
