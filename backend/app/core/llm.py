import os
import httpx
import structlog
from typing import Optional, Dict, Any
from app.core.config import settings

logger = structlog.get_logger(__name__)


async def generate_agent_response(
    agent_type: str,
    prompt: str,
    system_instruction: Optional[str] = None,
    preferred_provider: str = "auto",
) -> str:
    """
    Unified LLM Router.
    Routes agent tasks to a local Ollama model or cloud providers (Gemini / Claude / OpenAI).
    Falls back seamlessly if a local model or provider is unavailable.
    """
    configured_provider = settings.LLM_PROVIDER.lower() if settings.LLM_PROVIDER else "auto"
    
    ollama_url = settings.OLLAMA_BASE_URL or os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
    ollama_model = settings.OLLAMA_MODEL or os.environ.get("OLLAMA_MODEL", "llama3")
    
    gemini_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY", "")
    anthropic_key = settings.ANTHROPIC_API_KEY or os.environ.get("ANTHROPIC_API_KEY", "")
    openai_key = settings.OPENAI_API_KEY or os.environ.get("OPENAI_API_KEY", "")

    # 1. Try Local Ollama Provider first if configured or auto
    if configured_provider in ["ollama", "local", "auto"]:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                full_prompt = f"{system_instruction}\n\n{prompt}" if system_instruction else prompt
                response = await client.post(
                    f"{ollama_url.rstrip('/')}/api/generate",
                    json={
                        "model": ollama_model,
                        "prompt": full_prompt,
                        "stream": False,
                    },
                )
                if response.status_code == 200:
                    data = response.json()
                    res_text = data.get("response", "")
                    if res_text:
                        logger.info("llm_response_success", provider="ollama", model=ollama_model, agent_type=agent_type)
                        return res_text
        except Exception as e:
            logger.info("ollama_local_not_running_fallback_to_cloud", error=str(e))

    # 2. Google Gemini Provider
    if gemini_key:
        try:
            import google.generativeai as genai
            genai.configure(api_key=gemini_key)
            model = genai.GenerativeModel("gemini-1.5-pro")
            full_prompt = f"{system_instruction}\n\n{prompt}" if system_instruction else prompt
            response = await model.generate_content_async(full_prompt)
            if response and response.text:
                logger.info("llm_response_success", provider="gemini", agent_type=agent_type)
                return response.text
        except Exception as e:
            logger.warning("gemini_llm_error", error=str(e))

    # 3. Anthropic Claude Provider
    if anthropic_key:
        try:
            import anthropic
            client = anthropic.AsyncAnthropic(api_key=anthropic_key)
            msg = await client.messages.create(
                model="claude-3-5-sonnet-20240620",
                max_tokens=4000,
                system=system_instruction or "You are an expert AI software engineer.",
                messages=[{"role": "user", "content": prompt}],
            )
            if msg and msg.content and len(msg.content) > 0:
                logger.info("llm_response_success", provider="anthropic", agent_type=agent_type)
                return msg.content[0].text
        except Exception as e:
            logger.warning("anthropic_llm_error", error=str(e))

    # 4. OpenAI Provider
    if openai_key:
        try:
            import openai
            client = openai.AsyncOpenAI(api_key=openai_key)
            messages = []
            if system_instruction:
                messages.append({"role": "system", "content": system_instruction})
            messages.append({"role": "user", "content": prompt})

            completion = await client.chat.completions.create(
                model="gpt-4o",
                messages=messages,
            )
            if completion and completion.choices and len(completion.choices) > 0:
                logger.info("llm_response_success", provider="openai", agent_type=agent_type)
                return completion.choices[0].message.content or ""
        except Exception as e:
            logger.warning("openai_llm_error", error=str(e))

    logger.info("llm_providers_unavailable_using_intelligent_synthesis", agent_type=agent_type)
    return ""


