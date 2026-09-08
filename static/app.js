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

    // Auto-resize textarea
    userInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    // Handle Enter key for submission (Shift+Enter for newline)
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            chatForm.requestSubmit();
        }
    });

    // Persona switching
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

    // Form submission
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const messageText = userInput.value.trim();
        if (!messageText) return;

        // Append user message
        appendMessage(messageText, 'user');
        chatHistory.push({ sender: 'user', text: messageText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
        
        userInput.value = '';
        userInput.style.height = 'auto';

        // Show typing indicator
        const typingElement = showTypingIndicator();

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: messageText,
                    persona: currentPersona
                })
            });

            const data = await response.json();
            removeTypingIndicator(typingElement);

            if (response.ok && data.reply) {
                appendMessage(data.reply, 'ai');
                chatHistory.push({ sender: 'ai', text: data.reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
            } else {
                appendMessage('Sorry, I encountered an error processing your request.', 'ai');
            }
        } catch (error) {
            console.error('Network error:', error);
            removeTypingIndicator(typingElement);
            appendMessage('Network error: Unable to connect to the server.', 'ai');
        }
    });

    // Append message to chat DOM
    function appendMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(sender === 'user' ? 'user-message' : 'ai-message');

        const avatarDiv = document.createElement('div');
        avatarDiv.classList.add('avatar');
        if (sender === 'user') {
            avatarDiv.innerHTML = '<i class="fa-solid fa-user"></i>';
        } else {
            avatarDiv.innerHTML = '<i class="fa-solid fa-brain"></i>';
        }

        const contentDiv = document.createElement('div');
        contentDiv.classList.add('message-content');

        const bubbleDiv = document.createElement('div');
        bubbleDiv.classList.add('message-bubble');
        bubbleDiv.textContent = text;

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

    // Typing indicator helpers
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
        
        const typingIndicator = document.createElement('div');
        typingIndicator.classList.add('typing-indicator');
        typingIndicator.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';

        bubbleDiv.appendChild(typingIndicator);
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

    // Clear and New Chat actions
    function resetChat() {
        chatMessages.innerHTML = '';
        chatHistory = [];
        const welcomeText = personaInfo[currentPersona] ? `Hello! I am ${personaInfo[currentPersona].title}. How can I help you today?` : 'Hello! How can I help you today?';
        appendMessage(welcomeText, 'ai');
    }

    clearChatBtn.addEventListener('click', resetChat);
    newChatBtn.addEventListener('click', resetChat);

    // Export Chat History
    exportBtn.addEventListener('click', () => {
        if (chatHistory.length === 0) {
            alert('No chat history to export.');
            return;
        }
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(chatHistory, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute('download', `nexus_chat_${new Date().toISOString().slice(0,10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    });
});
