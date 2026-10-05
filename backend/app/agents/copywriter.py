import time
from typing import Dict, Any
from app.agents.base import BaseAgent, AgentOutput

class CopywriterAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="The Copywriter",
            agent_type="copywriter",
            icon="✍️",
            color="#10B981",
        )

    async def execute(self, state: Dict[str, Any]) -> AgentOutput:
        start_time = time.time()
        project_name = state.get("project_name", "Campaign")
        self.log("Writing copy based on Strategist's plan...")

        strategy_plan = state.get("artifacts", {}).get("strategist", {}).get("strategy_plan", {})
        
        from app.core.llm import generate_agent_response
        import json

        system_prompt = (
            "You are an expert Marketing Copywriter AI. Your job is to take the campaign description and strategy plan "
            "and generate the actual marketing copy. Output ONLY a valid JSON array where each object has "
            "'path' (e.g., 'emails/launch_email.txt', 'social/tweet_1.txt'), 'language' (use 'markdown'), and "
            "'content' (the actual copy string). No markdown formatting blocks outside the JSON."
        )

        config = state.get("config", {})
        user_prompt = (
            f"Campaign Name: {project_name}\n"
            f"Campaign Description: {state.get('description', '')}\n"
            f"Strategy Plan: {json.dumps(strategy_plan)}\n\n"
            f"Configuration Constraints:\n"
            f"- Target Audience: {config.get('targetUsers', 'General Public')}\n"
            f"- Tone/Voice: {config.get('techStack', 'Professional & Engaging')}\n\n"
            "Generate at least 5-6 distinct pieces of copy (e.g., blog posts, tweets, ad copy) adhering to the Strategy Plan."
        )

        try:
            self.log("Calling LLM for copy generation...")
            llm_res = await generate_agent_response(self.agent_type, user_prompt, system_prompt)
            if llm_res.startswith("```json"):
                llm_res = llm_res[7:]
            if llm_res.startswith("```"):
                llm_res = llm_res[3:]
            if llm_res.endswith("```"):
                llm_res = llm_res[:-3]
                
            code_snippets = json.loads(llm_res.strip())
            if not isinstance(code_snippets, list):
                raise ValueError("Expected a JSON array.")
        except Exception as e:
            self.log(f"LLM generation failed ({str(e)}), falling back to dynamic scaffold...")
            code_snippets = [
                {
                    "path": "social/teaser_tweet.md",
                    "language": "markdown",
                    "content": f"Tired of the same old problems? 👀 We've been working on something huge in stealth. Meet {project_name}. Coming soon... 🚀 #Innovation"
                },
                {
                    "path": "emails/launch_newsletter.md",
                    "language": "markdown",
                    "content": f"# The Wait is Over: {project_name} is Live!\n\nHi there,\n\nWe are thrilled to announce that {project_name} is finally available to the public. \n\nClick below to get started and change the way you work forever.\n\n[Get Started Now]"
                },
                {
                    "path": "ads/facebook_ad_1.md",
                    "language": "markdown",
                    "content": f"**Headline:** Stop Wasting Time.\n**Body:** {project_name} is the only tool you need to streamline your workflow. Join 10,000+ early adopters today.\n**CTA:** Sign Up Free"
                },
                {
                    "path": "blog/introducing_product.md",
                    "language": "markdown",
                    "content": f"# Introducing {project_name}: A New Era\n\nFor years, industry professionals have struggled with outdated tools. Today, we change that with {project_name}. Here is why we built it..."
                }
            ]

        artifacts = {"code_snippets": code_snippets}
        logs = [self.log(f"Generated {len(code_snippets)} marketing assets.")]
        
        return AgentOutput(
            agent_type=self.agent_type,
            agent_name=self.name,
            status="completed",
            summary="Marketing copy generated successfully.",
            artifacts=artifacts,
            logs=logs,
            execution_time_seconds=time.time() - start_time,
        )
