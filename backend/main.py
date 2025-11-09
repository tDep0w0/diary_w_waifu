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
import asyncio


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
async def get_db_connection():
    conn = sqlite3.connect("diary.db")
    conn.row_factory = sqlite3.Row
    return conn


@app.post("/add_entry")
async def add_entry(entry_text: str):
    conn = get_db_connection()
    conn.execute(
        "INSERT INTO diary_entries (entry_date, entry_text) VALUES (DATE('now'), ?)",
        (entry_text,),
    )
    conn.commit()
    conn.close()


async def get_latest_entries(n=4):
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
    recent_entries = await get_latest_entries()
    if len(recent_entries) == 0:
        return {"error": "No recent entries found."}

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

        async def token_generator():
            nonlocal final_text
            for event in stream:
                if event.type == "response.output_text.delta":
                    final_text += event.delta
                    yield event.delta
                elif event.type == "response.completed":
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


async def save_message(speaker: str, text: str):
    conn = get_db_connection()
    conn.execute(
        "INSERT INTO chat_messages (speaker, message_text, timestamp) VALUES (?, ?, datetime('now'))",
        (speaker, text),
    )
    conn.commit()
    conn.close()

async def get_today_messages(limit=30):
    conn = get_db_connection()
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
    conn.close()
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

    stream = client.responses.stream(
        model="gpt-5-nano",
        input=[
            {"role": "system", "content": "You are a caring and emotionally intelligent listener."},
            {"role": "user", "content": full_prompt},
        ],
    )

    async def token_generator():
        ai_reply = []
        loop = asyncio.get_event_loop()

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
