import json
from typing import List, Dict, Any, Optional
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage

from app.config import settings
from app.schemas import SpreadRecommendResponse


async def get_interpretation(
    question: Optional[str],
    spread_name: str,
    cards: List[Dict[str, Any]]
) -> str:
    if not settings.DEEPSEEK_API_KEY:
        return "AI解读服务未配置，请联系管理员设置DeepSeek API密钥。"
    
    llm = ChatOpenAI(
        model="deepseek-chat",
        openai_api_key=settings.DEEPSEEK_API_KEY,
        openai_api_base=settings.DEEPSEEK_BASE_URL,
        temperature=0.7
    )
    
    cards_info = []
    for card_data in cards:
        card = card_data.get("card", {})
        is_reversed = card_data.get("is_reversed", False)
        position = card_data.get("position", {})
        
        card_info = f"""
位置: {position.get('name_cn', position.get('name', '未知'))}
牌名: {card.get('name_cn', card.get('name', '未知'))}
正逆位: {"逆位" if is_reversed else "正位"}
关键词: {card.get('keywords', '无')}
{"逆位含义: " + card.get('reversed_meaning', '无') if is_reversed else "正位含义: " + card.get('upright_meaning', '无')}
"""
        cards_info.append(card_info)
    
    system_prompt = """你是一位专业的塔罗牌占卜师，拥有丰富的塔罗牌解读经验。你的任务是根据用户的问题和抽到的牌，给出专业、温暖、有启发性的解读。

解读要求：
1. 首先简要说明牌阵的整体含义
2. 逐一解读每张牌在各自位置的意义，结合正逆位
3. 综合分析各张牌之间的关联和整体趋势
4. 给出具体的建议和指引
5. 语言要温暖、有同理心，避免过于武断
6. 解读要有深度，但也要通俗易懂
7. 最后给出一个简短的总结

请用中文进行解读，保持专业且友好的语气。"""

    user_prompt = f"""
用户问题: {question if question else "综合运势占卜"}
牌阵类型: {spread_name}

抽到的牌:
{''.join(cards_info)}

请给出详细的塔罗牌解读。"""

    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_prompt)
    ]
    
    try:
        response = await llm.ainvoke(messages)
        return response.content
    except Exception as e:
        return f"AI解读服务暂时不可用，请稍后再试。错误: {str(e)}"


async def recommend_spread(
    question: str,
    spreads: List[Any]
) -> SpreadRecommendResponse:
    if not settings.DEEPSEEK_API_KEY:
        default_spread = next((s for s in spreads if s.name == "three_cards"), spreads[0])
        return SpreadRecommendResponse(
            spread_id=default_spread.id,
            spread_name=default_spread.name,
            spread_name_cn=default_spread.name_cn,
            reason="默认推荐三张牌占卜法，适用于大多数情况。"
        )
    
    llm = ChatOpenAI(
        model="deepseek-chat",
        openai_api_key=settings.DEEPSEEK_API_KEY,
        openai_api_base=settings.DEEPSEEK_BASE_URL,
        temperature=0.3
    )
    
    spreads_info = []
    for spread in spreads:
        spread_info = f"""
ID: {spread.id}
名称: {spread.name_cn} ({spread.name})
牌数: {spread.card_count}张
类别: {spread.category}
描述: {spread.description}
"""
        spreads_info.append(spread_info)
    
    system_prompt = """你是一位塔罗牌专家，需要根据用户的问题推荐最合适的牌阵。

请分析用户的问题类型和需求，从提供的牌阵列表中选择最合适的一个。

返回格式必须是JSON：
{
    "spread_id": 数字ID,
    "reason": "推荐理由"
}

只返回JSON，不要有其他内容。"""

    user_prompt = f"""
用户问题: {question}

可选牌阵:
{''.join(spreads_info)}

请推荐最合适的牌阵。"""

    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_prompt)
    ]
    
    try:
        response = await llm.ainvoke(messages)
        content = response.content.strip()
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
        
        result = json.loads(content)
        spread_id = result.get("spread_id")
        reason = result.get("reason", "根据您的问题类型推荐。")
        
        selected_spread = next((s for s in spreads if s.id == spread_id), None)
        if not selected_spread:
            selected_spread = next((s for s in spreads if s.name == "three_cards"), spreads[0])
        
        return SpreadRecommendResponse(
            spread_id=selected_spread.id,
            spread_name=selected_spread.name,
            spread_name_cn=selected_spread.name_cn,
            reason=reason
        )
    except Exception as e:
        default_spread = next((s for s in spreads if s.name == "three_cards"), spreads[0])
        return SpreadRecommendResponse(
            spread_id=default_spread.id,
            spread_name=default_spread.name,
            spread_name_cn=default_spread.name_cn,
            reason="根据您的问题，推荐使用三张牌占卜法进行分析。"
        )
