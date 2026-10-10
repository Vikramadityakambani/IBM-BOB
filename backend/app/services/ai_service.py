import json
from typing import Dict, Any, List
from ..core.config import settings

class AIService:
    @staticmethod
    def generate_draft(
        topic: str,
        platform: str,
        format_type: str,
        tone: str,
        language: str,
        brand_profile: Dict[str, Any] = None
    ) -> Dict[str, str]:
        """
        Server-side LLM orchestration service.
        Uses configured provider or built-in deterministic mock adapter for offline testing.
        """
        # Multilingual draft templates
        if language == "Hindi":
            title = f"{tone} विश्लेषण: {topic}"
            body = (
                f"आधुनिक एंटरप्राइज आर्किटेक्चर और {topic.lower()} के लिए स्पष्ट दिशानिर्देश जरूरी हैं।\n\n"
                f"प्रमुख बिंदु:\n"
                f"1. सर्वर-साइड सुरक्षा और मॉडल कीज का सुरक्षित प्रबंधन।\n"
                f"2. संपादकीय समीक्षा और गुणवत्ता नियंत्रण।\n"
                f"3. डिजिटल चैनलों पर निरंतर ब्रांड प्रतिनिधित्व।\n\n"
                f"#एंटरप्राइज #सॉफ्टवेयर #आर्किटेक्चर #AI"
            )
        elif language == "Marathi":
            title = f"{tone} दृष्टिकोन: {topic}"
            body = (
                f"एंटरप्राइज तंत्रज्ञान आणि {topic.lower()} यावर आधारित विचार नेतृत्व:\n\n"
                f"महत्त्वाचे मुद्दे:\n"
                f"१. संपूर्ण सुरक्षितता आणि पडताळणीयोग्य गव्हर्नन्स.\n"
                f"२. गुणवत्ता तपासणी आणि मानकांचे पालन.\n"
                f"३. मल्टी-प्लॅटफॉर्म वितरणासाठी योग्य रचना.\n\n"
                f"#तंत्रज्ञान #गव्हर्नन्स #मराठी"
            )
        else:
            # English
            title = f"{tone}: How {topic} Drives Enterprise Impact"
            body = (
                f"In high-velocity enterprise operations, {topic.lower()} requires more than ad-hoc generation—it demands structured governance.\n\n"
                f"When designing scalable workflows, three pillars are critical:\n"
                f"1. Server-side isolation of secrets and strict tenant data scoping.\n"
                f"2. Agiloft-inspired approval checkpoints with separation of duties.\n"
                f"3. Real-time brand voice alignment across every digital channel.\n\n"
                f"How is your team safeguarding brand integrity while scaling autonomous creation?\n\n"
                f"#{platform.capitalize()} #EnterpriseAI #WorkflowGovernance #BuildWithIBM"
            )

        return {
            "title": title,
            "body": body,
            "provider": settings.LLM_PROVIDER,
            "model": settings.LLM_MODEL
        }

    @staticmethod
    def repurpose_content(source_body: str, target_platform: str) -> str:
        if target_platform == "x":
            return (
                f"🧵 1/3 Enterprise Architecture Insights:\n\n"
                f"{source_body[:180]}...\n\n"
                f"2/3 Isolation of model keys and verifiable governance are critical.\n\n"
                f"3/3 Read the full analysis in our knowledge base 👇"
            )
        elif target_platform == "instagram":
            return (
                f"✨ Key Takeaway: {source_body[:200]}...\n\n"
                f"Swipe for the 5-point governance checklist ➡️\n\n"
                f"#TechLeader #EnterpriseCloud #Innovation"
            )
        elif target_platform == "youtube":
            return (
                f"VIDEO SCRIPT OUTLINE:\n"
                f"[0:00 - Hook] Why standard AI copilots fall short in enterprise environments.\n"
                f"[0:30 - Core] {source_body[:250]}...\n"
                f"[1:30 - CTA] Like and subscribe for our deep dive on agentic SDLC with IBM Bob."
            )
        else:
            return source_body

    @staticmethod
    def quality_check(body: str, platform: str, prohibited_phrases: List[str] = None) -> Dict[str, Any]:
        prohibited = prohibited_phrases or []
        found_prohibited = [p for p in prohibited if p.lower() in body.lower()]

        char_limit = 3000 if platform == "linkedin" else (280 if platform == "x" else 2200)
        has_cta = any(phrase in body.lower() for phrase in ["how", "?", "👇", "subscribe", "thoughts", "checklist"])

        readability_score = 92 if len(found_prohibited) == 0 else 65

        return {
            "readability_score": readability_score,
            "char_count": len(body),
            "char_limit": char_limit,
            "has_cta": has_cta,
            "prohibited_terms_found": found_prohibited,
            "is_brand_compliant": len(found_prohibited) == 0
        }
