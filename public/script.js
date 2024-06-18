document.addEventListener('DOMContentLoaded', () => {
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const chatMessages = document.getElementById('chat-messages');
    const clearButton = document.getElementById('clear-button');
    const debugCheckbox = document.getElementById('debug-checkbox');

	function getMessages() {
		return JSON.parse(localStorage.getItem('messages')) || [];
	}

	function setMessages(messages) {
		localStorage.setItem('messages', JSON.stringify(messages));
		return true
	}
	const messages = getMessages();
    // Load messages from LocalStorage
    messages.forEach(appendUiMessage);

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
			const messages = getMessages();
            messages.push(message);
			setMessages(messages);
			appendUiMessage(message);
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
                  // Update local messages array with response from server
				  const messages = data.messages;
				  console.log({messages});
				  setMessages(messages);
                  // Clear current messages
                  chatMessages.innerHTML = '';
                  // Append all messages
                  messages.forEach(msg => {
                      appendUiMessage(msg);
                  });
              })
              .catch(error => {
                  console.error('Error:', error);
              });
        }
    }

    function appendUiMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        if (message.role === 'user') {
            messageElement.classList.add('user');
        } else if (message.role === 'assistant') {
            messageElement.classList.add('assistant');
        } else if (message.role === 'tool') {
            if (!debugCheckbox.checked) return;  // Only show tool messages if debug mode is enabled
            messageElement.classList.add('tool');
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
