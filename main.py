"""
Nexus AI Chat Companion - Flask Backend
Provides REST API endpoints for conversational AI interactions with persona support.
"""

import random
from flask import Flask, jsonify, request, send_from_directory

app = Flask(__name__, static_folder="static")

# Knowledge base for different personas
RESPONSES = {
    "nexus": [
        "Hello! I am Nexus, your AI assistant. How can I empower your workflow today?",
        "That is an interesting question! Let me break it down for you.",
        "I'm here to help you brainstorm, code, or answer any questions you might have.",
        "Fascinating! Could you tell me a bit more about what you are trying to achieve?",
        "I've processed your request. Everything looks optimal! What's next on your list?",
    ],
    "coder": [
        "Let's write some clean, efficient code! Are we working in Python, JavaScript, or something else?",
        "Make sure to handle your edge cases and exceptions properly. Would you like a code snippet?",
        "Debugging is like being the detective in a crime movie where you are also the murderer. Need help finding the bug?",
        "Consider using modular functions and descriptive variable names for maintainability.",
    ],
    "sage": [
        "Patience, young traveler. Every challenge carries the seed of wisdom.
        "Water shapes the rock not through force, but through persistence. How can we approach this calmly?",
        "The journey of a thousand miles begins with a single step. What is your first step today?",
        "Reflect upon what truly matters. Simplicity is the ultimate sophistication.",
    ],
}

FALLBACK_RESPONSES = [
    "That's truly fascinating! Tell me more about your perspective on this.",
    "I am learning new things every day. How does that make you feel?",
    "That makes complete sense. Let's explore that idea further.",
    "I've noted that down! What would you like to discuss next?",
]


def generate_ai_response(message: str, persona: str) -> str:
    msg = message.lower()

    # Basic keyword triggers
    if "hello" in msg or "hi" in msg:
        if persona in RESPONSES:
            return RESPONSES[persona][0]
        return "Hello there! How can I assist you today?"

    if "help" in msg:
        return (
            "I am Nexus AI! You can ask me questions, request coding assistance, "
            "or switch personas at the top right to talk with our Code Wizard or Sage."
        )

    if "time" in msg or "date" in msg:
        import datetime

        now = datetime.datetime.now()
        return f"Current server timestamp: {now.strftime('%Y-%m-%d %H:%M:%S')}"

    if "joke" in msg:
        jokes = [
            "Why do programmers prefer dark mode? Because light attracts bugs!",
            "Why do Java developers wear glasses? Because they don't C#!",
            "There are 10 types of people in the world: those who understand binary, and those who don't.",
        ]
        return random.choice(jokes)

    # Persona-specific random response or fallback
    if persona in RESPONSES and RESPONSES[persona]:
        return random.choice(RESPONSES[persona])

    return random.choice(FALLBACK_RESPONSES)


@app.route("/")
def serve_index():
    return send_from_directory(app.static_folder, "index.html")


@app.route("/api/chat", methods=["POST"])
def chat_api():
    data = request.get_json()
    if not data or "message" not in data:
        return jsonify({"error": "Invalid request payload, 'message' is required."}), 400

    user_message = data.get("message", "").strip()
    persona = data.get("persona", "nexus").lower()

    if not user_message:
        return jsonify({"error": "Message cannot be empty."}), 400

    # Simulate intelligent processing delay
    ai_reply = generate_ai_response(user_message, persona)

    return jsonify({"reply": ai_reply, "persona": persona, "status": "success"})


if __name__ == "__main__":
    print("Starting Nexus AI Chat Companion server on http://127.0.0.1:5000")
    app.run(host="0.0.0.0", port=5000, debug=True)
