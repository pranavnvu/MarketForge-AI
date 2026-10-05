import time
from typing import Dict, Any
from app.agents.base import BaseAgent, AgentOutput

class StrategistAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="The Strategist",
            agent_type="strategist",
            icon="🧠",
            color="#3B82F6",
        )

    async def execute(self, state: Dict[str, Any]) -> AgentOutput:
        start_time = time.time()
        project_name = state.get("project_name", "Campaign")
        description = state.get("description", "")
        config = state.get("config", {})
        self.log(f"Developing marketing strategy for {project_name}")

        from app.core.llm import generate_agent_response
        import json

        system_prompt = (
            "You are an elite Digital Marketing Strategist AI. Given a product/brand description, output a comprehensive marketing strategy. "
            "Output ONLY a valid JSON object containing two arrays: 'target_demographics' (objects with 'segment', 'pain_points' list, and 'channels' list) "
            "and 'content_calendar' (objects with 'day' (1-30), 'platform', 'content_type', and 'topic'). Do not include markdown code blocks outside the JSON."
        )

        user_prompt = (
            f"Campaign Name: {project_name}\n"
            f"Campaign / Product Description: {description}\n\n"
            f"Campaign Constraints / Initial Ideas:\n"
            f"- Target Audience: {config.get('targetUsers', 'General Public')}\n"
            f"- Tone/Voice: {config.get('techStack', 'Professional')}\n"
            f"Ensure the strategy explicitly accommodates these constraints."
        )

        try:
            self.log("Calling LLM for strategy generation...")
            llm_res = await generate_agent_response(self.agent_type, user_prompt, system_prompt)
            if llm_res.startswith("```json"):
                llm_res = llm_res[7:]
            if llm_res.startswith("```"):
                llm_res = llm_res[3:]
            if llm_res.endswith("```"):
                llm_res = llm_res[:-3]
                
            plan = json.loads(llm_res.strip())
        except Exception as e:
            self.log(f"LLM generation failed ({str(e)}), falling back to dynamic scaffold...")
            plan = {
                "target_demographics": [
                    {
                        "segment": f"Early Adopters of {project_name}",
                        "pain_points": ["Lack of time", "Seeking innovation"],
                        "channels": ["Twitter/X", "LinkedIn"]
                    },
                    {
                        "segment": "Industry Professionals",
                        "pain_points": ["Need scalable solutions", "Budget constraints"],
                        "channels": ["LinkedIn", "Industry Newsletters"]
                    }
                ],
                "content_calendar": [
                    {"day": 1, "platform": "Twitter/X", "content_type": "Teaser Thread", "topic": f"Introducing the problem {project_name} solves"},
                    {"day": 3, "platform": "LinkedIn", "content_type": "Thought Leadership Article", "topic": f"Why the industry needs a solution like {project_name}"},
                    {"day": 7, "platform": "Email Newsletter", "content_type": "Launch Announcement", "topic": f"Official Launch of {project_name} and Early Bird Access"}
                ]
            }

        artifacts = {"strategy_plan": plan}
        logs = [self.log("Generated Target Demographics and Content Calendar.")]
        
        return AgentOutput(
            agent_type=self.agent_type,
            agent_name=self.name,
            status="completed",
            summary="Marketing strategy generated successfully.",
            artifacts=artifacts,
            logs=logs,
            execution_time_seconds=time.time() - start_time,
        )

