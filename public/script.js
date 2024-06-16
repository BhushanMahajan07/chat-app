// Client-side script

const socket = io();
let username = localStorage.getItem('username');
let room = localStorage.getItem('room');

if (!username || !room) {
  window.location.href = '/';
}

document.getElementById('send-button').addEventListener('click', () => {
  const messageInput = document.getElementById('message-input');
  const message = messageInput.value.trim();
  const timestamp = new Date().toLocaleTimeString();

  if (message) {
    socket.emit('chatMessage', { room, username, message, timestamp });
    messageInput.value = '';
  }
});

document.getElementById('leave-button').addEventListener('click', () => {
  localStorage.removeItem('username');
  localStorage.removeItem('room');
  window.location.href = '/';
});

socket.emit('joinRoom', { room, username });

const appendMessage = (messageData) => {
  const chatBox = document.getElementById('chat-box');
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');
  messageElement.classList.add(messageData.username === username ? 'right' : 'left');
  messageElement.innerHTML = `${messageData.message}<span class="timestamp">${messageData.timestamp}</span>`;
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight;
};

const appendNotification = (message) => {
  const chatBox = document.getElementById('chat-box');
  const notificationElement = document.createElement('div');
  notificationElement.textContent = message;
  notificationElement.className = 'notification';
  chatBox.appendChild(notificationElement);
  chatBox.scrollTop = chatBox.scrollHeight;
};

socket.on('message', (data) => {
  appendMessage(data);
});

socket.on('notification', (data) => {
  appendNotification(`${data.timestamp} ${data.message}`);
});

socket.on('updateUserList', (users) => {
  const userList = document.getElementById('user-list');
  userList.innerHTML = '';
  users.forEach(user => {
    const userElement = document.createElement('li');
    userElement.innerHTML = ` ${user.username} <span class="online-dot"></span>`;
    userList.appendChild(userElement);
  });
});
