document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatMessages = document.getElementById('chat-messages');
    const clearChatBtn = document.getElementById('clear-chat-btn');
    const newChatBtn = document.getElementById('new-chat-btn');
    const exportBtn = document.getElementById('export-btn');
    const personaButtons = document.querySelectorAll('.persona-btn');
    const currentPersonaTitle = document.getElementById('current-persona-title');
    const currentPersonaDesc = document.getElementById('current-persona-desc');

    let currentPersona = 'nexus';
    let chatHistory = [];

    const personaInfo = {
        nexus: {
            title: 'Nexus Core',
            desc: 'General purpose AI assistant ready for any task.'
        },
        coder: {
            title: 'Code Wizard',
            desc: 'Programming expert ready to write and debug code.'
        },
        sage: {
            title: 'Sage',
            desc: 'Philosophical guide offering calm reflection and wisdom.'
        }
    };

    const RESPONSES = {
        nexus: [
            "Hello! I am Nexus, your AI assistant. How can I empower your workflow today?",
            "That is an interesting question! Let me break it down for you logically.",
            "I'm here to help you brainstorm architecture, write clean logic, or research ideas.",
            "Fascinating inquiry. What specific objectives are you aiming to hit next?",
            "I have analyzed your request. Everything looks optimal! How else can I assist?"
        ],
        coder: [
            "Let's write some clean, efficient code! Are we working in Python, TypeScript, Go, or Rust?",
            "Always remember to handle edge cases, boundaries, and errors. Would you like a modular snippet?",
            "Code quality tip: Keep functions small, pure, and single-purpose for maximum testability.",
            "Refactoring tip: Abstract repeated logic into reusable utility modules to adhere to DRY principles."
        ],
        sage: [
            "Patience, traveler. In software as in life, simplicity is the ultimate sophistication.",
            "Water shapes the hardest rock through persistent flow, not sheer force. Approach the problem gently.",
            "The most elegant solution is often the one that removes unnecessary complexity.",
            "Pause and reflect on the fundamentals before seeking premature optimizations."
        ]
    };

    function generateClientResponse(userText, persona) {
        const lower = userText.toLowerCase();
        if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
            return (RESPONSES[persona] && RESPONSES[persona][0]) || 'Hello! How can I assist you today?';
        }
        if (lower.includes('help') || lower.includes('features')) {
            return 'I am Nexus AI! You can ask questions, request coding advice, or switch personas using the top menu to talk with Code Wizard or Sage.';
        }
        if (lower.includes('code') || lower.includes('python') || lower.includes('javascript') || lower.includes('bug')) {
            if (persona === 'coder') {
                return 'Here is a best-practice pattern:\n\n```javascript\nfunction processStream(data) {\n  return data.filter(Boolean).map(item => item.trim());\n}\n```\n\nLet me know what specific function you are engineering!';
            }
        }
        if (lower.includes('joke')) {
            return 'Why do programmers prefer dark mode? Because light attracts bugs!';
        }
        if (lower.includes('time') || lower.includes('date')) {
            return 'Current client time: ' + new Date().toLocaleString();
        }
        const list = RESPONSES[persona] || RESPONSES.nexus;
        return list[Math.floor(Math.random() * list.length)];
    }

    userInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            chatForm.requestSubmit();
        }
    });

    personaButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            personaButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentPersona = btn.getAttribute('data-persona');
            
            if (personaInfo[currentPersona]) {
                currentPersonaTitle.textContent = personaInfo[currentPersona].title;
                currentPersonaDesc.textContent = personaInfo[currentPersona].desc;
            }
        });
    });

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const messageText = userInput.value.trim();
        if (!messageText) return;

        appendMessage(messageText, 'user');
        chatHistory.push({ sender: 'user', text: messageText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
        
        userInput.value = '';
        userInput.style.height = 'auto';

        const typingElement = showTypingIndicator();

        let reply = '';
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: messageText, persona: currentPersona }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                reply = data.reply;
            } else {
                throw new Error('Server non-200');
            }
        } catch (err) {
            await new Promise(r => setTimeout(r, 600));
            reply = generateClientResponse(messageText, currentPersona);
        }

        removeTypingIndicator(typingElement);
        appendMessage(reply, 'ai');
        chatHistory.push({ sender: 'ai', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
    });

    function appendMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender === 'user' ? 'user-message' : 'ai-message');

        const avatarDiv = document.createElement('div');
        avatarDiv.classList.add('avatar');
        avatarDiv.innerHTML = sender === 'user' ? '<i class="fa-solid fa-user"></i>' : '<i class="fa-solid fa-brain"></i>';

        const contentDiv = document.createElement('div');
        contentDiv.classList.add('message-content');

        const bubbleDiv = document.createElement('div');
        bubbleDiv.classList.add('message-bubble');
        bubbleDiv.innerText = text;

        const timeSpan = document.createElement('span');
        timeSpan.classList.add('message-time');
        timeSpan.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        contentDiv.appendChild(bubbleDiv);
        contentDiv.appendChild(timeSpan);
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);

        chatMessages.appendChild(messageDiv);
        scrollToBottom();
    }

    function showTypingIndicator() {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', 'ai-message', 'typing-container');

        const avatarDiv = document.createElement('div');
        avatarDiv.classList.add('avatar');
        avatarDiv.innerHTML = '<i class="fa-solid fa-brain"></i>';

        const contentDiv = document.createElement('div');
        contentDiv.classList.add('message-content');

        const bubbleDiv = document.createElement('div');
        bubbleDiv.classList.add('message-bubble');
        bubbleDiv.innerHTML = '<div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>';

        contentDiv.appendChild(bubbleDiv);
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);

        chatMessages.appendChild(messageDiv);
        scrollToBottom();
        return messageDiv;
    }

    function removeTypingIndicator(element) {
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function resetChat() {
        chatMessages.innerHTML = '';
        chatHistory = [];
        const welcomeText = personaInfo[currentPersona] ? `Hello! I am ${personaInfo[currentPersona].title}. How can I help you today?` : 'Hello! How can I help you today?';
        appendMessage(welcomeText, 'ai');
    }

    clearChatBtn.addEventListener('click', resetChat);
    newChatBtn.addEventListener('click', resetChat);

    exportBtn.addEventListener('click', () => {
        if (chatHistory.length === 0) {
            alert('No chat history to export.');
            return;
        }
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(chatHistory, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute('download', `nexus_chat_${new Date().toISOString().slice(0,10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    });
});
