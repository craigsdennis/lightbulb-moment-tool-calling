document.addEventListener('DOMContentLoaded', () => {
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const chatMessages = document.getElementById('chat-messages');
    const clearButton = document.getElementById('clear-button');
    const messages = JSON.parse(localStorage.getItem('messages')) || [];

    // Load messages from LocalStorage
    messages.forEach(appendMessage);

    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    clearButton.addEventListener('click', clearMessages);

    function sendMessage() {
        const messageText = messageInput.value.trim();
        if (messageText) {
            const message = {
                role: 'user',
                content: messageText
            };
            messages.push(message);
            localStorage.setItem('messages', JSON.stringify(messages));
            appendMessage(message);
            messageInput.value = '';

            // Send message to server
            fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ messages })
            }).then(response => response.json())
              .then(data => {
                  const assistantMessage = {
                      role: 'assistant',
                      content: data.response
                  };
                  messages.push(assistantMessage);
                  localStorage.setItem('messages', JSON.stringify(messages));
                  appendMessage(assistantMessage);
              })
              .catch(error => {
                  console.error('Error:', error);
              });
        }
    }

    function appendMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        if (message.role === 'user') {
            messageElement.classList.add('user');
        } else if (message.role === 'assistant') {
            messageElement.classList.add('assistant');
        }
        messageElement.textContent = message.content;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function clearMessages() {
        localStorage.removeItem('messages');
        chatMessages.innerHTML = '';
        messages.length = 0;  // Clear the messages array
    }
});
