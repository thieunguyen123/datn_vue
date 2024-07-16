<template>
  <div class="comment-container">
    <div class="comment-form" v-if="token">
      <textarea
        v-model="newComment"
        @input="checkValidate"
        placeholder="Add a comment..."
      ></textarea>
      <button @click="addComment" :disabled="contentError">Add Comment</button>
    </div>
    <el-scrollbar height="550px">
      <div
        v-for="(item, index) in comments"
        :key="index"
        class="scrollbar-demo-item"
      >
        <span class="user-name">{{ item.user_name }}</span>
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
              <el-dropdown-item @click="deleteComment(item.id)"
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
          class="reply-button"
          v-if="token"
          @click="showModalReply(item.id)"
        >
          Reply
        </button>
        <div v-if="item.showFormReply" class="comment-form">
          <textarea
            v-model="newCommentChild"
            placeholder="Add a comment..."
          ></textarea>
          <button
            :disabled="disableAddComment"
            @click="addCommentChildren(item.id)"
          >
            Add Comment
          </button>
          <button @click="hiddenModalReply(item.id)" style="margin-left: 20px">
            Cancel
          </button>
        </div>
        <div
          v-if="item.viewReply"
          @click="openModalChildComments(item.id)"
          class="view-reply"
        >
          <font-awesome-icon
            class="icon-down"
            icon="fa-solid fa-chevron-down"
          />
          <span style="margin-left: 10px">View replies</span>
        </div>
        <nested-comment
          v-if="item.openChildComments"
          :childComments="item.childComments"
          :idBadmintonCourt="idBadmintonCourt"
          :idParentComment="item.id"
          @reload-comment="getComments"
        />
      </div>
    </el-scrollbar>
  </div>
</template>

<script>
import axios from "axios";
import NestedComment from "./NestedComment.vue";
import { ElNotification } from "element-plus";
export default {
  components: { NestedComment },
  created() {
    this.getComments();

    window.addEventListener("storage", (event) => {
      if (event.key === this.accessToken) {
        this.token = localStorage.getItem(this.accessToken);
      }
    });
  },

  props: ["idBadmintonCourt"],

  data() {
    return {
      toggleCommentNested: false,
      newComment: null,
      newCommentChild: null,
      comments: {},
      urlGetComments:
        process.env.VUE_APP_END_POINT_API + `comments/${this.idBadmintonCourt}`,
      token: localStorage.getItem("access_token"),
      viewReply: false,
      childComments: {},
      disableAddComment: false,
      user_id: localStorage.getItem("userId"),
      contentRegex: /^(?=\S)(?!.*\s$).{1,200}$/,
      contentError: true,
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

    reply() {
      this.toggleCommentNested = !this.toggleCommentNested;
    },

    showModalReply(id) {
      this.comments.forEach((item) => {
        item.showFormReply = false;
      });
      const comment = this.comments.find((item) => item.id === id);
      comment.showFormReply = true;
    },

    hiddenModalReply(id) {
      const comment = this.comments.find((item) => item.id === id);
      comment.showFormReply = false;
    },

    openModalChildComments(id) {
      const comment = this.comments.find((item) => item.id === id);
      comment.openChildComments = !comment.openChildComments;
    },

    addCommentChildren(id) {
      this.disableAddComment = true;
      const urlAddComment =
        process.env.VUE_APP_END_POINT_API + `comments/${this.idBadmintonCourt}`;
      const formData = new FormData();
      formData.append("content", this.newCommentChild);
      formData.append("id_parent", id);
      axios
        .post(urlAddComment, formData, {
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
          this.newCommentChild = null;
          this.getComments();
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

    addComment() {
      console.log(1)
      this.contentError = true;
      const urlAddComment =
        process.env.VUE_APP_END_POINT_API + `comments/${this.idBadmintonCourt}`;
      const formData = new FormData();
      formData.append("content", this.newComment);
      axios
        .post(urlAddComment, formData, {
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
          this.newComment = null;
          this.getComments();
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
          this.getComments();
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

    deleteComment(id) {
      const urlDeleteComment =
        process.env.VUE_APP_END_POINT_API + `comments/${id}`;
      axios
        .delete(urlDeleteComment, {
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
          this.getComments();
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

    getComments() {
      axios
        .get(this.urlGetComments)
        .then((response) => {
          this.comments = response.data.comments.map((comment) => ({
            ...comment,
            showFormReply: false,
            openChildComments: false,
            enableEdit: true,
            showEditComment: false,
            checkErrorContent: false,
            viewReply:
              comment.childComments && comment.childComments.length > 0,
          }));
        })
        .catch((error) => {
          console.log(error);
        });
    },

    checkValidate() {
      this.contentError = true;
      if (this.contentRegex.test(this.newComment)) {
        this.contentError = false;
      }
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
.comment-container {
  width: 70vw;
  margin: 20px auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

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

.reply {
  margin-top: 10px;
}

.view-replies {
  margin-top: 10px;
  margin-left: 20px;
}

.scrollbar-demo-item {
  width: 60vw;
  padding: 20px;
  margin: 30px 0px 0px 25px;
  border-radius: 7px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  overflow: hidden;
  position: relative;
}

.user-name {
  margin-top: -10px;
  color: black;
  font-weight: bold;
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

.reply-button {
  margin: 10px;
}

.view-reply {
  position: absolute;
  top: 20px;
  right: 6vw;
  cursor: pointer;
  width: 8vw;
  height: 22px;
}

.view-reply:hover {
  background: rgba(32, 146, 208, 0.25);
}

.icon-three-dot {
  position: absolute;
  right: -52vw;
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
  margin: 0px 5px 0px 5px;
}
</style>
