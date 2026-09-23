import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage

def get_ai_response(user_message: str) -> str:
    llm = ChatGoogleGenerativeAI(
        model="gemini-3.6-flash",
        google_api_key=os.getenv("GOOGLE_API_KEY"),
    )
    response = llm.invoke([HumanMessage(content=user_message)])

    content = response.content
    if isinstance(content, list):
        text_parts = [
            block["text"] for block in content
            if isinstance(block, dict) and block.get("type") == "text"
        ]
        return "".join(text_parts)
    return content