// WebSocket Client
const ws = new WebSocket(`ws://localhost:8081`); // Connect to the WebSocket server

// Handle form submission
const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');
const messages = document.getElementById('messages');

// const username = "<%= username %>";

chatForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent form from refreshing the page
    const message = messageInput.value;
    const username = document.getElementById('user').textContent.slice(8, -1);
    // Add the username and timestamp on the client side
    const time = new Date().toLocaleTimeString(); // Get the current time
    const messageData = {
        username: username,
        message: message,
        time: time
    };

    // Send the message data to the server
    ws.send(JSON.stringify(messageData));

    messageInput.value = ''; // Clear the input field
});

// Listen for incoming messages
ws.onmessage = async (event) => {
    const data = JSON.parse(await event.data.text()); // Parse the incoming message
    const messageElement = document.createElement('div');
    messageElement.classList.add('message-bubble');

    // Add the username, message content, and time
    messageElement.innerHTML = `
        <strong>${data.username}</strong> <span class="time">[${data.time}]</span>
        <p>${data.message}</p>
    `;
    messages.appendChild(messageElement); // Add the message to the chat
    messages.scrollTop = messages.scrollHeight; // Scroll to the bottom
};