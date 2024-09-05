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
          <li
            v-for="message in roomMessages"
            :key="message.timestamp + message.message"
            :class="{
              'message-sender': message.senderEmail === user.email,
              'message-receiver': message.senderEmail !== user.email,
            }"
          >
            <strong>{{ message.senderEmail }}:</strong>
            <div class="message-content">{{ message.message }}</div>
            <small class="message-time">{{ formatTimestamp(message.timestamp) }}</small>
          </li>
        </ul>
      </div>

      <!-- Typing Indicator -->
      <p v-if="typingUser" class="typing-indicator">{{ typingUser }} is typing...</p>

      <!-- Input for Sending Messages -->
      <input
        v-if="currentRoom"
        v-model="message"
        @keyup.enter="sendRoomMessage"
        @input="startTyping"
        placeholder="Type a message..."
        class="message-input"
      />
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

    <!-- Audio for Notification Sound -->
    <audio ref="notificationSound" :src="require('@/assets/jump.mp3')" preload="auto"></audio>

    <button @click="playTestSound">Test Sound</button>
  </div>
</template>

<script>
import { io } from 'socket.io-client';
import { useToast } from 'vue-toastification';

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
      banUserEmail: '',
    };
  },


  setup() {
    const toast = useToast(); // Initialize toast

    return {
      toast,
    };
  },

  mounted() {
    const user = JSON.parse(localStorage.getItem('user'));

    if (user) {
      this.user = {
        ...user,
        role: user.email === 'admin@admin.com' ? 'admin' : 'member',
      };
      this.socket = io('http://localhost:3000', {
        query: { userId: user.id, email: user.email },
      });

      this.setupSocketListeners();
    } else {
      this.$router.push('/login');
    }

    // Request notification permission on load
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  },
  methods: {
    playTestSound() {
      const sound = this.$refs.notificationSound;
      if (sound) {
        sound.currentTime = 0; // Reset to start
        sound.play().catch((error) => {
          console.error('Error playing test sound:', error);
        });
      } else {
        console.error('Audio element not found or failed to load.');
      }
    },

    setupSocketListeners() {
  this.socket.on('room list', (rooms) => {
    this.rooms = rooms;
  });

  this.socket.on('room history', (history) => {
    this.roomMessages = history;
  });

  this.socket.on('room message', (msg) => {
    if (msg.room === this.currentRoom) {
      this.roomMessages.push(msg);
      this.notifyUser(msg); // Trigger sound and notification
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
      this.roomMessages.push({
        senderEmail: 'System',
        message: message,
        timestamp: new Date().toISOString(),
      });
      this.notifyUser({ message: message, senderEmail: 'System' });
    }
  });

  this.socket.on('online users', (users) => {
    this.onlineUsers = users;
  });
},


    notifyUser(message) {
      // Play notification sound
      const sound = this.$refs.notificationSound;
      if (sound) {
        sound.play().catch((error) => {
          console.error('Error playing notification sound:', error);
        });
      }

      // Show browser notification if permissions are granted
      if (Notification.permission === 'granted') {
        new Notification(`New message from ${message.senderEmail}`, {
          body: message.message,
        });
      }

      // Display a toast notification using the toast instance
      this.toast.info(`New message from ${message.senderEmail}: ${message.message}`);
    },

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
          message: this.message,
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
    },
  },

  beforeUnmount() {
    if (this.socket) {
      this.socket.disconnect();
    }
  },
};
</script>

<style>
/* Your existing styles */
</style>
