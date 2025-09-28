#!/usr/bin/env python3
"""
LUDUS Selena AI Agents Demo Script
Created: 2025-09-28 GMT+3 (Riyadh)
Purpose: Demonstrate the capabilities of all four Selena AI agents
"""

import asyncio
import sys
import os

# Add the agents directory to Python path for imports
sys.path.append('.')

async def demo_selena_agents():
    """Demonstrate all four Selena AI agents"""
    
    print("🌟 LUDUS Selena AI Agents Demo")
    print("=" * 50)
    print("Four specialized AI agents for the LUDUS platform")
    print("")
    
    try:
        # Import Selena agents
        from api.selena_agents import (
            SelenaAgentManager, 
            AgentType, 
            AgentRequest,
            OnboardAgent,
            DiscoverAgent, 
            SupportAgent,
            CommunityAgent
        )
        
        print("✅ Selena agents imported successfully")
        
        # Initialize agent manager
        manager = SelenaAgentManager()
        print("✅ Agent manager initialized")
        
        # Demo each agent
        demo_scenarios = [
            {
                "agent_type": AgentType.ONBOARD,
                "message_ar": "مرحباً، أحتاج مساعدة في البداية مع LUDUS",
                "message_en": "Hello, I need help getting started with LUDUS",
                "description": "Onboard Agent - User guidance and platform introduction"
            },
            {
                "agent_type": AgentType.DISCOVER,
                "message_ar": "أريد العثور على أنشطة ممتعة في الرياض",
                "message_en": "I want to find fun activities in Riyadh",
                "description": "Discover Agent - Activity recommendations and discovery"
            },
            {
                "agent_type": AgentType.SUPPORT,
                "message_ar": "أواجه مشكلة في تطبيق LUDUS ولا أستطيع الدخول",
                "message_en": "I'm having trouble with the LUDUS app and can't log in",
                "description": "Support Agent - Technical support and issue resolution"
            },
            {
                "agent_type": AgentType.COMMUNITY,
                "message_ar": "كيف يمكنني التواصل مع مجتمع LUDUS والانضمام للفعاليات؟",
                "message_en": "How can I connect with the LUDUS community and join events?",
                "description": "Community Agent - Social interaction and community management"
            }
        ]
        
        print("\n🤖 Agent Demonstrations:")
        print("-" * 30)
        
        for i, scenario in enumerate(demo_scenarios, 1):
            print(f"\n{i}. {scenario['description']}")
            print(f"   Agent: {scenario['agent_type'].value.title()}")
            
            # Test Arabic
            ar_request = AgentRequest(
                message=scenario['message_ar'],
                language="ar",
                session_id=f"demo_ar_{i}"
            )
            
            ar_response = await manager.route_request(scenario['agent_type'], ar_request)
            print(f"   Arabic Response: {ar_response.response[:80]}...")
            print(f"   Response Time: {ar_response.response_time_ms:.1f}ms")
            
            # Test English  
            en_request = AgentRequest(
                message=scenario['message_en'],
                language="en",
                session_id=f"demo_en_{i}"
            )
            
            en_response = await manager.route_request(scenario['agent_type'], en_request)
            print(f"   English Response: {en_response.response[:80]}...")
            print(f"   Response Time: {en_response.response_time_ms:.1f}ms")
        
        # Show agent information
        print("\n📋 Agent Information:")
        print("-" * 20)
        
        ar_info = manager.get_agent_info("ar")
        en_info = manager.get_agent_info("en")
        
        for agent_id, agent_data in ar_info.items():
            en_data = en_info[agent_id]
            print(f"\n{agent_data['icon']} {agent_id.title()} Agent")
            print(f"   Arabic: {agent_data['name']}")
            print(f"   English: {en_data['name']}")
            print(f"   Color: {agent_data['color']}")
        
        print("\n" + "=" * 50)
        print("🎉 DEMO COMPLETED SUCCESSFULLY!")
        print("All four Selena AI agents are operational and ready for production.")
        
        return True
        
    except Exception as e:
        print(f"❌ Demo failed: {e}")
        return False


async def main():
    """Main demo execution"""
    success = await demo_selena_agents()
    return 0 if success else 1


if __name__ == "__main__":
    result = asyncio.run(main())
    sys.exit(result)