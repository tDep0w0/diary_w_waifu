from fastapi import FastAPI
from fastapi.responses import JSONResponse
from openai import OpenAI
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import List

load_dotenv()
app = FastAPI()

client = OpenAI(
    base_url="https://openrouter.ai/api/v1"
)

class EntitiesModel(BaseModel):
    attributes: List[str]
    colors: List[str]
    animals: List[str]

@app.post("/extract_entities")
def extract_entities(text: str):
    try:
        with client.responses.stream(
            model="openai/gpt-5-nano",
            input=[
                {"role": "system", "content": "Extract entities from the input text"},
                {"role": "user", "content": text},
            ],
            text_format=EntitiesModel,
        ) as stream:
            final_response = stream.get_final_response()

        # Safely extract parsed content
        parsed = None
        if final_response.output and final_response.output[0].content:
            parsed = final_response.output[0].content[0].parsed

        if not parsed:
            return JSONResponse(
                status_code=500,
                content={"error": "Failed to parse model response"}
            )

        return JSONResponse(content=parsed.model_dump())

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )
    
print()