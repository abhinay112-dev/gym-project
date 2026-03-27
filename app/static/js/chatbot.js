/* ═══════════════════════════════════════════
   GYMBHAI — chatbot.js
   Chatbot widget: toggle, send, API calls
   ═══════════════════════════════════════════ */

(function () {
    const btn      = document.getElementById('chatbot-btn');
    const panel    = document.getElementById('chatbot-panel');
    const messages = document.getElementById('chat-messages');
    const input    = document.getElementById('chat-input');
    const sendBtn  = document.getElementById('chat-send-btn');

    if (!btn || !panel) return;

    let isOpen    = false;
    let isLoading = false;

    /* ── Message helpers ─────────────────────── */
    function addBotMessage(html) {
        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble bot';
        bubble.innerHTML = `<div class="bubble-label">GymBhai AI</div>${html}`;
        messages.appendChild(bubble);
        messages.scrollTop = messages.scrollHeight;
    }

    function addUserMessage(text) {
        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble user';
        bubble.textContent = text;
        messages.appendChild(bubble);
        messages.scrollTop = messages.scrollHeight;
    }

    function showTyping() {
        const el = document.createElement('div');
        el.className = 'typing-indicator';
        el.id = 'typing-indicator';
        el.innerHTML = '<span></span><span></span><span></span>';
        messages.appendChild(el);
        messages.scrollTop = messages.scrollHeight;
    }

    function removeTyping() {
        const el = document.getElementById('typing-indicator');
        if (el) el.remove();
    }

    function getPageContent() {
        const main = document.querySelector('.main');
        return main ? main.innerText.trim() : document.body.innerText.trim();
    }

    /* ── Toggle panel ────────────────────────── */
    btn.addEventListener('click', () => {
        isOpen = !isOpen;
        btn.classList.toggle('open', isOpen);
        panel.classList.toggle('open', isOpen);

        if (isOpen && messages.children.length === 0) {
            const pageName = document.title.replace('Gym Bhai —', '').trim();
            setTimeout(() => {
                addBotMessage(
                    `Hey! 👋 I'm your <strong>GymBhai AI</strong> assistant.<br>` +
                    `I can answer questions about the <strong>${pageName}</strong> page. What would you like to know?`
                );
            }, 300);
        }
    });

    /* ── Send message ────────────────────────── */
    async function sendMessage() {
        const text = input.value.trim();
        if (!text || isLoading) return;

        addUserMessage(text);
        input.value = '';
        isLoading = true;
        sendBtn.disabled = true;

        showTyping();

        try {
            const res = await fetch('/chatbot-api', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, context: getPageContent() })
            });
            const data = await res.json();
            removeTyping();
            addBotMessage(data.reply);
        } catch (err) {
            removeTyping();
            addBotMessage('Sorry, something went wrong. Please try again.');
        }

        isLoading = false;
        sendBtn.disabled = false;
        input.focus();
    }

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });
})();
