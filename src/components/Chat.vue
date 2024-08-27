<template>
  <div class="chat-container">
    <!-- Admin Controls -->
    <div v-if="user && user.role === 'admin'" class="admin-controls">
      <h3>Admin Controls</h3>
      <input v-model="newRoom" placeholder="New room name" />
      <button @click="createRoom">Create Room</button>

      <input v-model="roomToDelete" placeholder="Room to delete" />
      <button @click="deleteRoom">Delete Room</button>

      <input v-model="banUserEmail" placeholder="User email to ban" />
      <button @click="banUser">Ban User</button>
    </div>

    <!-- Rooms -->
    <div class="room-list">
      <h2>Available Rooms</h2>
      <ul>
        <li v-for="room in rooms" :key="room" @click="joinRoom(room)">
          {{ room }}
        </li>
      </ul>
    </div>

    <!-- Chat Area -->
    <div class="chat-area">
      <h2>Messages in Room: {{ currentRoom }}</h2>

      <div class="messages-container">
        <ul>
          <li v-for="message in roomMessages" :key="message.timestamp + message.message" 
              :class="{ 'message-sender': message.senderEmail === user.email, 'message-receiver': message.senderEmail !== user.email }">
            <strong>{{ message.senderEmail }}:</strong> 
            <div class="message-content">{{ message.message }}</div>
            <small class="message-time">{{ formatTimestamp(message.timestamp) }}</small>
          </li>
        </ul>
      </div>

      <!-- Typing Indicator -->
      <p v-if="typingUser" class="typing-indicator">{{ typingUser }} is typing...</p>

      <!-- Input for Sending Messages -->
      <input v-if="currentRoom" 
             v-model="message" 
             @keyup.enter="sendRoomMessage" 
             @input="startTyping" 
             placeholder="Type a message..." 
             class="message-input"/>
    </div>

    <!-- Online Users -->
    <div class="online-users" v-if="currentRoom">
      <h2>Online Users in Room {{ currentRoom }}</h2>
      <ul>
        <li v-for="user in onlineUsers" :key="user.id">
          {{ user.email }} ({{ user.role }})
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { io } from 'socket.io-client';

export default {
  name: 'ChatComponent',
  data() {
    return {
      socket: null,
      message: '',
      rooms: [],
      currentRoom: null,
      roomMessages: [],
      onlineUsers: [],
      typingUser: '',
      typingTimeout: null,
      user: null,
      newRoom: '',
      roomToDelete: '',
      banUserEmail: ''
    };
  },
  mounted() {
    const user = JSON.parse(localStorage.getItem('user'));

    if (user) {
      this.user = { ...user, role: user.email === 'admin@admin.com' ? 'admin' : 'member' };
      this.socket = io('http://localhost:3000', {
        query: { userId: user.id, email: user.email }
      });

      this.socket.on('room list', (rooms) => {
        this.rooms = rooms;
      });

      this.socket.on('room history', (history) => {
        this.roomMessages = history;
      });

      this.socket.on('room message', (msg) => {
        if (msg.room === this.currentRoom) {
          this.roomMessages.push(msg);
        }
      });

      this.socket.on('typing', (data) => {
        if (data.room === this.currentRoom && data.userEmail !== this.user.email) {
          this.typingUser = data.userEmail;
        }
      });

      this.socket.on('stopped typing', (data) => {
        if (data.room === this.currentRoom && data.userEmail === this.typingUser) {
          this.typingUser = '';
        }
      });

      this.socket.on('notification', ({ message, room }) => {
        if (room === this.currentRoom) {
          this.roomMessages.push({ senderEmail: 'System', message: message, timestamp: new Date().toISOString() });
        }
      });

      this.socket.on('online users', (users) => {
        this.onlineUsers = users;
      });
    } else {
      this.$router.push('/login');
    }
  },
  methods: {
    joinRoom(room) {
      if (this.currentRoom === room) {
        return;
      }

      if (this.currentRoom) {
        this.socket.emit('leave room', this.currentRoom);
      }

      this.currentRoom = room;
      this.roomMessages = [];
      this.onlineUsers = [];
      this.typingUser = '';

      this.socket.emit('join room', room);
    },
    sendRoomMessage() {
      if (this.message.trim() !== '' && this.currentRoom) {
        this.socket.emit('room message', {
          room: this.currentRoom,
          message: this.message
        });

        this.message = '';
        this.socket.emit('stopped typing', { room: this.currentRoom, userEmail: this.user.email });
      }
    },
    startTyping() {
      if (this.typingTimeout) {
        clearTimeout(this.typingTimeout);
      }

      this.socket.emit('typing', { room: this.currentRoom, userEmail: this.user.email });

      this.typingTimeout = setTimeout(() => {
        this.socket.emit('stopped typing', { room: this.currentRoom, userEmail: this.user.email });
      }, 3000);
    },
    createRoom() {
      if (this.newRoom.trim() !== '') {
        this.socket.emit('create room', this.newRoom);
        this.newRoom = '';
      }
    },
    deleteRoom() {
      if (this.roomToDelete.trim() !== '') {
        this.socket.emit('delete room', this.roomToDelete);
        this.roomToDelete = '';
      }
    },
    banUser() {
      if (this.banUserEmail.trim() !== '') {
        this.socket.emit('ban user', { userEmail: this.banUserEmail, room: this.currentRoom });
        this.banUserEmail = '';
      }
    },
    formatTimestamp(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleTimeString();
    }
  },
  beforeUnmount() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
};
</script>

<style>
.chat-container {
  display: flex;
  justify-content: space-between;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.room-list, .online-users {
  width: 20%;
  background-color: #f7f7f7;
  padding: 20px;
  border-radius: 10px;
}

.room-list ul, .online-users ul {
  padding: 0;
  list-style-type: none;
}

.room-list ul li, .online-users ul li {
  padding: 10px;
  margin: 5px 0;
  background-color: #fff;
  border-radius: 5px;
  cursor: pointer;
}

.room-list ul li:hover, .online-users ul li:hover {
  background-color: #eee;
}

.chat-area {
  width: 55%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.messages-container {
  height: 400px;
  overflow-y: auto;
  margin-bottom: 10px;
}

.messages-container ul {
  padding: 0;
  list-style-type: none;
}

.messages-container li {
  display: flex;
  flex-direction: column;
  margin: 10px 0;
  padding: 10px;
  border-radius: 10px;
  max-width: 60%;
}

.message-sender {
  align-self: flex-end;
  background-color: #daf8cb;
  text-align: right;
}

.message-receiver {
  align-self: flex-start;
  background-color: #f1f0f0;
  text-align: left;
}

.message-content {
  margin-top: 5px;
}

.message-time {
  font-size: 0.8em;
  color: gray;
}

.typing-indicator {
  font-style: italic;
  color: gray;
}

.message-input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  width: 100%;
  margin-top: 10px;
}
</style>
