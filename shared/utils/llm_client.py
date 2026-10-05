import httpx
import json
from typing import Optional, Dict, Any
from shared.config.settings import settings


async def query_ollama_llm(
    prompt: str,
    system_prompt: Optional[str] = None,
    model: Optional[str] = None,
) -> str:
    """
    Query local Ollama server running llama3.1:8b (http://localhost:11434).
    Falls back gracefully if Ollama is starting or offline.
    """
    target_model = model or settings.OLLAMA_MODEL
    url = f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/generate"

    payload: Dict[str, Any] = {
        "model": target_model,
        "prompt": prompt,
        "stream": False,
    }
    if system_prompt:
        payload["system"] = system_prompt

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, json=payload)
            if response.status_code == 200:
                data = response.json()
                return data.get("response", "")
    except Exception as exc:
        pass

    # Cloud Fallback (OpenAI / Anthropic / Gemini) if configured
    if settings.OPENAI_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                res = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {settings.OPENAI_API_KEY}"},
                    json={
                        "model": "gpt-4o-mini",
                        "messages": [
                            {"role": "system", "content": system_prompt or "You are a helpful AI engineer."},
                            {"role": "user", "content": prompt},
                        ],
                    },
                )
                if res.status_code == 200:
                    return res.json()["choices"][0]["message"]["content"]
        except Exception:
            pass

    return ""
