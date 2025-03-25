// WebSocket Client
// const ws = new WebSocket(`ws://localhost:8081`); // Connect to the WebSocket server

// // Handle form submission
// const chatForm = document.getElementById('chatForm');
// const messageInput = document.getElementById('messageInput');
// const messages = document.getElementById('messages');

// chatForm.addEventListener('submit', (e) => {
//     e.preventDefault(); // Prevent form from refreshing the page
//     const message = messageInput.value;
//     ws.send(message); // Send the message to the server
//     messageInput.value = ''; // Clear the input field
// });

// // Listen for incoming messages
// ws.onmessage = (event) => {
//     const messageElement = document.createElement('div');
//     messageElement.textContent = event.data;
//     messages.appendChild(messageElement); // Add the message to the chat
//     messages.scrollTop = messages.scrollHeight; // Scroll to the bottom
// };
///////////////////////////////////////////
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.sections').forEach(section => {
        section.classList.add('hidden');
        section.classList.remove('show');
    });

    // Remove active class from all menu links
    document.querySelectorAll('.menu a').forEach(link => {
        link.classList.remove('active');
    });

    // Show the selected section
    document.getElementById(sectionId).classList.remove('hidden');
    document.getElementById(sectionId).classList.add('show');
    document.querySelector('#postForm').classList.add('show');
    document.querySelector('#postForm').classList.remove('hidden');

    // Highlight the active menu link
    if (sectionId === 'myPosts') {
        document.querySelectorAll('.menu a')[0].classList.add('active');
    } else if (sectionId === 'allPosts') {
        document.querySelectorAll('.menu a')[1].classList.add('active');
    } else if (sectionId === 'chatRoom') {
        document.querySelectorAll('.menu a')[2].classList.add('active');
        document.querySelector('#postForm').classList.add('hidden');
        document.querySelector('#postForm').classList.remove('show');
    } 
}