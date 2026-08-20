import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    print("ERROR: API key not found in .env file")
    exit()

print("API key loaded successfully")
client = Groq(api_key=api_key)

def chat(message):
    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
                {
                    "role": "system",
                    "content": "You are Delaw, a friendly AI assistant produced by Desadu Chirandith. Be helpful and clear."
                },
                {
                    "role": "user",
                    "content": message
                }
            ],
            temperature=0.7,
            max_tokens=1024
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error occurred: {str(e)}"

print("Delaw is ready! Type your message (type quit to stop)\n")

while True:
    user = input("You: ").strip()
    if user.lower() in ["quit", "exit", "q"]:
        break
    if not user:
        continue
    reply = chat(user)
    print("\nDelaw:", reply, "\n")