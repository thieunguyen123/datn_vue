<template>
  <div class="chat-container">
    <div class="messages">
      <div v-for="message in messages" :key="message.id" class="message">
        <div :class="['message-text', message.sender]">{{ message.text }}</div>
      </div>
    </div>
    <div class="form-chat">
      <el-input v-model="userMessage" class="question" @keyup.enter="sendMessage" placeholder="Type a message..." />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      userMessage: '',
      messages: [],
      messageId: 1
    };
  },
  methods: {
    sendMessage() {
      if (this.userMessage.trim() !== '') {
        const message = {
          id: this.messageId++,
          text: this.userMessage,
          sender: 'user'
        };
        this.messages.push(message);
        this.userMessage = '';
        this.getBotResponse(message.text);
      }
    },
    async getBotResponse(userMessage) {
      try {
        const response = await fetch('http://localhost:5500/webhooks/rest/webhook', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ message: userMessage })
        });
        const data = await response.json();
        data.forEach((res) => {
          this.messages.push({
            id: this.messageId++,
            text: res.text,
            sender: 'bot'
          });
        });
      } catch (error) {
        console.error('Error:', error);
      }
    }
  }
};
</script>

<style scoped>
.chat-container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  background: rgb(65, 162, 223);
}

.messages {
  height: 400px;
  overflow-y: scroll;
  display: flex;
  flex-direction: column;
  margin-bottom: 2%;
}

.message {
  margin-bottom: 10px;
}

.message-text {
  padding: 10px;
  border-radius: 5px;
  width: fit-content;
  max-width: 60%;
}

.user {
  align-self: flex-end;
  background-color: #dcf8c6;
  width: fit-content;
  word-wrap: break-word;
  word-break: break-all;
  overflow-wrap: break-word;
}

.bot {
  align-self: flex-start;
  background-color: #f1f0f0;
  float: right;
  margin-right: 3%;
}

.form-chat {
  border-radius: 0.25rem;
  border: 1px ;
  padding: 3%;
  background: rgba(255, 255, 255, 0.53);
}

.question {
  width: 100%;
}
</style>
