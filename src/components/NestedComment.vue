<template>
  <div class="nested-comments">
    <el-scrollbar height="auto">
      <div
        v-for="(item, index) in comments"
        :key="index"
        class="scrollbar-demo-item"
      >
        <span class="username__child">{{ item.user_name }}</span>
        <el-dropdown v-if="user_id == item.user_id">
          <font-awesome-icon
            class="icon-three-dot"
            icon="fa-solid fa-ellipsis-vertical"
          />
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="enableInputEdit(item.id, index)"
                >Edit</el-dropdown-item
              >
              <el-dropdown-item @click="deleteChildComments(item.id)"
                >Delete</el-dropdown-item
              >
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <br />
        <textarea
          class="content-input"
          :readonly="item.enableEdit"
          v-model="item.content"
          placeholder="Enter for me ..."
          ref="myinput"
          @input="checkValidateEdit(item.id)"
        >
        </textarea>

        <div class="edit-comment" v-if="item.showEditComment">
          <button
            :disabled="item.checkErrorContent"
            @click="editComment(item.id, item.content)"
          >
            Edit Comment
          </button>
          <button @click="cancelEditComment(item.id)">Cancel</button>
        </div>
        <button
          v-if="token"
          class="reply-button"
          @click="showModalReply(item.id, item.user_name)"
        >
          Reply
        </button>
        <div v-if="item.showFormReply" class="comment-form">
          <textarea
            v-model="newComment"
            placeholder="Add a comment..."
          ></textarea>
          <button @click="addCommentChildren()" :disabled="disableAddComment">
            Add Comment
          </button>
          <button @click="hiddenModalReply(item.id)" style="margin-left: 20px">
            Cancel
          </button>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script>
import axios from "axios";
import { ElNotification } from "element-plus";
export default {
  props: ["childComments", "idBadmintonCourt", "idParentComment"],

  created() {
    this.comments.forEach((item) => ({
      ...item,
      showFormReply: false,
      disableAddCommentChildren: false,
      enableEdit: true,
      showEditComment: false,
      checkErrorContent: false,
    }));

    window.addEventListener("storage", (event) => {
      if (event.key === this.accessToken) {
        this.token = localStorage.getItem(this.accessToken);
      }
    });
  },

  data() {
    return {
      comments: this.childComments,
      newComment: null,
      token: localStorage.getItem("access_token"),
      user_id: localStorage.getItem("userId"),
      contentRegex: /^(?=\S)(?!.*\s$).{1,200}$/,
      accessToken: "access_token",
    };
  },

  methods: {
    enableInputEdit(id, index) {
      const comment = this.comments.find((item) => item.id === id);
      comment.enableEdit = false;
      comment.showEditComment = true;
      setTimeout(() => {
        this.$refs.myinput[index].focus();
      }, 400);
    },

    cancelEditComment(id) {
      const comment = this.comments.find((item) => item.id === id);
      comment.showEditComment = false;
    },

    showModalReply(id, name) {
      this.comments.forEach((item) => {
        item.showFormReply = false;
      });
      const comment = this.comments.find((item) => item.id === id);
      comment.showFormReply = true;
      this.newComment = `@${name} `;
    },

    hiddenModalReply(id) {
      const comment = this.comments.find((item) => item.id === id);
      comment.showFormReply = false;
    },

    deleteChildComments(id) {
      const urlDeleteChildComment =
        process.env.VUE_APP_END_POINT_API + `comments/${id}`;
      axios
        .delete(urlDeleteChildComment, {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        })
        .then(() => {
          ElNotification({
            title: "Successfully Notification",
            message: "Delete comment is successfully",
            position: "bottom-right",
            type: "success",
            duration: "3000",
          });
          this.$emit("reloadComment");
        })
        .catch((error) => {
          ElNotification({
            title: "Error Notification",
            message: "Delete comment is failed",
            position: "bottom-right",
            type: "error",
            duration: "3000",
          });
          console.log(error);
        });
    },

    addCommentChildren() {
      this.disableAddComment = true;
      const urlAddCommentsChildren =
        process.env.VUE_APP_END_POINT_API + `comments/${this.idBadmintonCourt}`;
      const formData = new FormData();
      formData.append("content", this.newComment);
      formData.append("id_parent", this.idParentComment);
      axios
        .post(urlAddCommentsChildren, formData, {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        })
        .then(() => {
          ElNotification({
            title: "Successfully Notification",
            message: "Add comment is successfully",
            position: "bottom-right",
            type: "success",
            duration: "3000",
          });
          this.disableAddComment = false;
          this.newComment = null;
          this.$emit("reloadComment");
        })
        .catch((error) => {
          ElNotification({
            title: "Error Notification",
            message: "Add comment is failed",
            position: "bottom-right",
            type: "error",
            duration: "3000",
          });
          console.log(error);
        });
    },

    editComment(id, content) {
      const comment = this.comments.find((item) => item.id === id);
      comment.checkErrorContent = true;
      const urlEditComment =
        process.env.VUE_APP_END_POINT_API +
        `comments/${id}/${this.idBadmintonCourt}/edit?_method=PATCH`;
      const formData = new FormData();
      formData.append("id_parent", this.idParentComment);
      formData.append("content", content);
      axios
        .post(urlEditComment, formData, {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        })
        .then(() => {
          ElNotification({
            title: "Successfully Notification",
            message: "Edit comment is successfully",
            position: "bottom-right",
            type: "success",
            duration: "3000",
          });
          this.$emit("reloadComment");
        })
        .catch((error) => {
          ElNotification({
            title: "Error Notification",
            message: "Edit comment is failed",
            position: "bottom-right",
            type: "error",
            duration: "3000",
          });
          console.log(error);
        });
    },

    checkValidateEdit(id) {
      const comment = this.comments.find((item) => item.id === id);
      comment.checkErrorContent = true;
      if (this.contentRegex.test(comment.content)) {
        comment.checkErrorContent = false;
      }
    },
  },
};
</script>

<style scoped>
.comment-form {
  margin: 15px 0px 5px 20px;
}

.comment-form textarea {
  width: 95%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  resize: none;
}

.comment-form button {
  padding: 10px;
  background-color: #3498db;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.scrollbar-demo-item {
  margin-top: 10px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1), 0 0 5px rgba(0, 0, 0, 0.1) inset;
  background: rgba(127, 191, 234, 0.2);
  position: relative;
  padding: 10px;
}

.content-input {
  margin-top: 10px;
  margin-bottom: 5px;
  width: 50vw;
  border: none;
  background: none;
  margin-left: 10px;
  padding: 10px;
  overflow: hidden;
  resize: none;
  height: auto;
  white-space: normal;
}

.nested-comments {
  margin-left: 30px;
}

.username__child {
  font-weight: bold;
  color: #000;
}

.content {
  margin-left: 20px;
}

.icon-three-dot {
  position: absolute;
  top: 1vh;
  right: -48vw;
  width: 1vw;
  height: 22px;
  color: #409eff;
}

.icon-three-dot:hover {
  background: rgba(32, 146, 208, 0.25);
  cursor: pointer;
}

.edit-comment button {
  padding: 10px;
  background-color: #3498db;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin: 0px 5px 10px 5px;
}
</style>