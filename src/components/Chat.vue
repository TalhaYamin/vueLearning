<template>
  <div>
    <!-- Admin Controls -->
    <div v-if="user && user.role === 'admin'">
      <h3>Admin Controls</h3>
      <input v-model="newRoom" placeholder="New room name" />
      <button @click="createRoom">Create Room</button>

      <input v-model="roomToDelete" placeholder="Room to delete" />
      <button @click="deleteRoom">Delete Room</button>

      <input v-model="banUserEmail" placeholder="User email to ban" />
      <button @click="banUser">Ban User</button>
    </div>

    <!-- Rooms -->
    <h2>Available Rooms</h2>
    <ul>
      <li v-for="room in rooms" :key="room" @click="joinRoom(room)">
        {{ room }}
      </li>
    </ul>

    <!-- Messages -->
    <h2>Messages in Room: {{ currentRoom }}</h2>
    <ul>
      <li v-for="message in roomMessages" :key="message.timestamp + message.message">
        <strong>{{ message.senderEmail }}:</strong> {{ message.message }} 
        <small>{{ formatTimestamp(message.timestamp) }}</small>
      </li>
    </ul>

    <!-- Typing Indicator -->
    <p v-if="typingUser">{{ typingUser }} is typing...</p>

    <!-- Online Users -->
    <h2 v-if="currentRoom">Online Users in Room {{ currentRoom }}</h2>
    <ul>
      <li v-for="user in onlineUsers" :key="user.id">
        {{ user.email }} ({{ user.role }})
      </li>
    </ul>

    <!-- Input for Sending Messages -->
    <input v-if="currentRoom" 
           v-model="message" 
           @keyup.enter="sendRoomMessage" 
           @input="startTyping" 
           placeholder="Type a message in the room" />
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
      rooms: [], // List of rooms fetched from the server
      currentRoom: null,
      roomMessages: [], // Messages in the current room
      onlineUsers: [], // List of online users in the current room
      typingUser: '',  // Track who is typing
      typingTimeout: null,  // Timeout for stopping typing
      user: null, // Store user information
      newRoom: '', // Admin control: new room name
      roomToDelete: '', // Admin control: room to delete
      banUserEmail: '' // Admin control: user email to ban
    };
  },
  mounted() {
    const user = JSON.parse(localStorage.getItem('user'));

    if (user) {
      this.user = { ...user, role: user.email === 'admin@admin.com' ? 'admin' : 'member' };
      this.socket = io('http://localhost:3000', {
        query: { userId: user.id, email: user.email }
      });

      // Get the list of rooms
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
        return; // Prevent joining the same room multiple times
      }

      if (this.currentRoom) {
        this.socket.emit('leave room', this.currentRoom); // Leave the current room
      }

      this.currentRoom = room;
      this.roomMessages = [];
      this.onlineUsers = [];
      this.typingUser = '';

      console.log(`Joining room: ${room}`);
      this.socket.emit('join room', room);
    },
    sendRoomMessage() {
      if (this.message.trim() !== '' && this.currentRoom) {
        this.socket.emit('room message', {
          room: this.currentRoom,
          message: this.message
        });

        this.message = ''; // Clear input field
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
        this.newRoom = ''; // Clear input field
      }
    },
    deleteRoom() {
      if (this.roomToDelete.trim() !== '') {
        this.socket.emit('delete room', this.roomToDelete);
        this.roomToDelete = ''; // Clear input field
      }
    },
    banUser() {
      if (this.banUserEmail.trim() !== '') {
        this.socket.emit('ban user', { userEmail: this.banUserEmail, room: this.currentRoom });
        this.banUserEmail = ''; // Clear input field
      }
    },
    formatTimestamp(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleTimeString(); // Format the timestamp into a human-readable time
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
/* Add your styles */
input {
  padding: 10px;
  width: 80%;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  margin: 5px 0;
}

h2 {
  margin-top: 20px;
}

p {
  font-style: italic;
  color: gray;
}

small {
  color: gray;
  font-size: 0.8em;
}
</style>
