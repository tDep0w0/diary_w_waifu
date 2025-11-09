from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.responses import JSONResponse, StreamingResponse
from openai import OpenAI
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import List, Optional
import sqlite3
from datetime import datetime
import json
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from contextlib import contextmanager


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


@contextmanager
def get_db_connection():
    conn = None
    try:
        conn = sqlite3.connect(
            DATABASE_FILE,
            isolation_level=None,
            timeout=10,
            check_same_thread=False,
        )
        conn.row_factory = sqlite3.Row
        yield conn
    finally:
        if conn:
            conn.close()


def init_db():
    with get_db_connection() as conn:
        # Diary table
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS diary_entries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                entry_date DATE NOT NULL,
                entry_text TEXT NOT NULL,
                ai_response_text TEXT,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """
        )
        # Chat table
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS chat_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                speaker VARCHAR(4) NOT NULL,
                message_text TEXT NOT NULL
            )
        """
        )
        conn.commit()


@app.on_event("startup")
def on_startup():
    init_db()


# ---------------------------FOR DIARY----------------------------


async def get_latest_entries(n=4):
    with get_db_connection() as conn:
        rows = conn.execute(
            """
            SELECT entry_date, entry_text, ai_response_text
            FROM diary_entries
            WHERE entry_date >= date('now', '-4 days')
            ORDER BY entry_date ASC;
        """
        ).fetchall()

    return rows


class EntryPayLoad(BaseModel):
    entry_date: Optional[str]
    entry_text: str


# db.py
import sqlite3
from contextlib import contextmanager

DATABASE_FILE = "your_diary.db"


@app.post("/api/add_or_modify_entry/")
async def add_or_modify_entry(payload: EntryPayLoad):
    entry_text = payload.entry_text
    entry_date = payload.entry_date

    with get_db_connection() as conn:
        if not entry_date:
            conn.execute(
                "INSERT INTO diary_entries (entry_date, entry_text) VALUES (DATE('now'), ?)",
                (entry_text,),
            )
            # You might need to retrieve the actual date for the AI update later
            entry_date = datetime.now().strftime("%Y-%m-%d")  # This is an approximation
        else:
            # The logic remains the same for update/insert
            cursor = conn.execute(
                "SELECT * FROM diary_entries WHERE entry_date = ?", (entry_date,)
            )
            existing = cursor.fetchone()
            if existing:
                conn.execute(
                    "UPDATE diary_entries SET entry_text = ?, ai_response_text = NULL WHERE entry_date = ?",
                    (entry_text, entry_date),
                )
            else:
                conn.execute(
                    "INSERT INTO diary_entries (entry_date, entry_text) VALUES (?, ?)",
                    (entry_date, entry_text),
                )
        conn.commit()

    recent_entries = await get_latest_entries()
    if len(recent_entries) == 0:
        return {"error": "No recent entries found."}

    journal_texts = "\n\n".join([row["entry_text"] for row in recent_entries])

    stream = client.responses.create(
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
        stream=True,
    )

    print("Text:")
    print(entry_text)
    print("Date")
    print(entry_date)

    final_text = ""

    async def token_generator():
        nonlocal final_text
        for event in stream:
            if event.type == "response.output_text.delta":
                final_text += event.delta
                yield event.delta
            elif event.type == "response.completed":
                with get_db_connection() as conn:  # <-- Use context manager here too
                    conn.execute(
                        "UPDATE diary_entries SET ai_response_text = ? WHERE entry_date = ?",
                        (final_text, entry_date),
                    )
                    conn.commit()
                break
            elif event.type == "response.error":
                yield f"\n[ERROR]: {event.error}\n"
                break

    return StreamingResponse(token_generator(), media_type="text/plain")


@app.get("/api/diary/{entry_date}")
async def get_journal(entry_date: str):
    with get_db_connection() as conn:
        row = conn.execute(
            "SELECT entry_date, entry_text, ai_response_text FROM diary_entries WHERE entry_date = ?",
            (entry_date,),
        ).fetchone()

    if row:
        return {
            "entry_date": row["entry_date"],
            "entry_text": row["entry_text"],
            "ai_response_text": row["ai_response_text"],
        }
    else:
        return {"error": f"No journal entry found for {entry_date}"}


# ---------------------Chat---------------------


async def save_message(speaker: str, text: str):
    with get_db_connection() as conn:
        conn.execute(
            "INSERT INTO chat_messages (speaker, message_text, timestamp) VALUES (?, ?, datetime('now'))",
            (speaker, text),
        )
        conn.commit()


async def get_today_messages(limit=30):
    with get_db_connection() as conn:
        today = datetime.now().strftime("%Y-%m-%d")
        rows = conn.execute(
            """
            SELECT speaker, message_text
            FROM chat_messages
            WHERE DATE(timestamp) = ?
            ORDER BY timestamp ASC
            LIMIT ?
            """,
            (today, limit),
        ).fetchall()

    return [dict(row) for row in rows]


@app.get("/api/chat/{message}")
async def comment_message(message: str):
    await save_message("user", message)

    previous_msgs = await get_today_messages()

    conversation_context = "\n".join(
        [f"{row['speaker']}: {row['message_text']}" for row in previous_msgs]
    )

    full_prompt = (
        "You are a supportive, attentive, and empathetic companion in a daily journal chat. "
        "Respond naturally and thoughtfully.\n\n"
        + conversation_context
        + f"\nuser: {message}"
    )

    async def token_generator():
        ai_reply = []
        loop = asyncio.get_event_loop()

        stream = client.responses.create(
            model="gpt-5-nano",
            input=[
                {
                    "role": "system",
                    "content": "You are a caring and emotionally intelligent listener. Depending on the length and the nature of the message, give a corresponding answer. Please, unless required, just keep a casual conversation",
                },
                {"role": "user", "content": full_prompt},
            ],
            stream=True,
        )

        def sync_iter():
            for event in stream:
                if event.type == "response.output_text.delta":
                    yield event.delta
            yield "[DONE]"

        for chunk in await loop.run_in_executor(None, lambda: list(sync_iter())):
            if chunk != "[DONE]":
                ai_reply.append(chunk)
                yield chunk
            await asyncio.sleep(0)

        await save_message("assistant", "".join(ai_reply))

    return StreamingResponse(token_generator(), media_type="text/plain")
