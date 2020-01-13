<template>
  <div class="mt-4 mx-4">
    <h1>Edit article about {{ form.id }}</h1>
    <b-form @submit="onSubmit" @reset="onReset" v-if="show">
      <b-form-group id="input-group-1" label="タイトル：" label-for="title" description="記事とタブのタイトル">
        <b-form-input id="title" v-model="form.title" required placeholder="記事のタイトルを記入して下さい。"></b-form-input>
      </b-form-group>
      <b-form-group id="input-group-2" label="カテゴリ：" label-for="category">
        <b-form-input id="category" v-model="form.category" required placeholder="記事のカテゴリを記入して下さい。"></b-form-input>
      </b-form-group>

      <b-form-group id="input-group-3" label="タグ：" label-for="tags" description>
        <b-card v-if="form.tags.length" no-body class="mb-2">
          <b-card-body class="p-1">
            <div v-for="(tag, index) in form.tags" :key="index" class="col-sm-2">
              <b-badge variant="secondary">{{ tag }}</b-badge>
              <i @click="deleteTag(tag)" class="fas fa-times-circle"></i>
            </div>
          </b-card-body>
        </b-card>
        <b-form-input id="tags" v-model="tag" class="mb-2" placeholder="記事のタグを記入して下さい。"></b-form-input>
        <b-button @click="pushTag(tag)" variant="info">タグ追加</b-button>
      </b-form-group>

      <b-card title="Create, Update and Soft Delete Time"  class="mb-2">
        <b-card-text>Created_at: {{form.created_at}}</b-card-text>
        <b-card-text>Updated_at: {{form.updated_at}}</b-card-text>
        <b-card-text v-if="form.deleted_at">Deleted_at: {{form.deleted_at}}</b-card-text>
        <b-card-text v-else>Deleted_at: Not Deleted</b-card-text>
      </b-card>

      <no-ssr placeholder="Loading Your Editor...">
        <vue-editor
          id="editor"
          v-model="form.contents"
          useCustomImageHandler
          @image-added="handleImageAdded"
        />
      </no-ssr>

      <b-button v-if="form.deleted_at" @click="releaseArticle" variant="success" class="mt-2">Release</b-button>
      <b-button v-else @click="softDelete" variant="warning" class="mt-2">Soft Delete</b-button>
      <b-button　@click="warnToHardDelete" variant="danger" class="mt-2">Hard Delete</b-button>
      <b-button variant="secondary" class="mt-2">
        <nuxt-link class="light" to="/">Cansel</nuxt-link>
      </b-button>
      <b-button type="submit" variant="primary" class="mt-2">Submit</b-button>
    </b-form>
    <b-card class="mt-3" header="Form Data Result">
      <pre class="m-0">{{ form }}</pre>
    </b-card>

    <!-- modal -->
    <b-modal ref="warn-modal" hide-footer :title="form.title">
      <div class="d-block text-center">
        <h3>Do you want to Hard Delete?</h3>
        <pre>{{ warnModal.content }}</pre>
      </div>
      <b-button class="mt-3" variant="dark" block @click="hideModal">Close</b-button>
      <b-button class="mt-2" variant="danger" block @click="hardDelete">Hard Delete</b-button>
    </b-modal>
  </div>
</template>

<script>
import firebase from "~/plugins/firebase.js";
import SimpleCrypto from "simple-crypto-js";
export default {
  layout: "mng",
  data() {
    return {
      form: {
        id: "",// 左記を追加する
        title: "",
        category: "",
        tags: [],
        contents: "",
        created_at: "",
        updated_at: "",
        deleted_at: ""
      },
      tag: "",
      show: true,
      publicDirectoryPath: "public/",
      fireStoragesDirectoryName: "",
      warnModal: {
        content: ""
      },
    };
  },
  async asyncData({ route }) {
     const result = await firebase
        .database()
        .ref("articles/"+ route.params.id)
        .once("value")
        .then(snapshot => {
          return snapshot.val();
          // return result;
        })
        .catch(err => {
          console.log("firebase's err =====", err);
          return err;
        });
    return { form: result };
  },
  methods: {
    releaseArticle() {
      this.form.deleted_at = "";
      let updates = {};
      updates["/articles/" + this.form.id + "/"] = this.form;
      return firebase.database().ref().update(updates);
    },
    softDelete() {
      this.form.deleted_at = this.createDateTime();
      let updates = {};
      updates["/articles/" + this.form.id + "/"] = this.form;
      return firebase.database().ref().update(updates);
    },
    warnToHardDelete(){
      this.warnModal.content = JSON.stringify(this.form, null, 2);
      this.$refs['warn-modal'].show();
    },
    hideModal() {
      this.$refs['warn-modal'].hide();
    },
    hardDelete() {
      firebase.database().ref('articles/' + this.form.id).remove();
      this.$router.push("/articles");
    },
    pushTag(tag) {
      if (tag !== null && tag !== "") {
        tag = tag.trim();
        this.form.tags.push(tag);
        this.tag = null;
      } else {
        tag = null;
        this.tag = null;
      }
    },
    deleteTag(tag) {
      let idx = this.form.tags.indexOf(tag);
      if (idx >= 0) {
        this.form.tags.splice(idx, 1);
      }
    },
    createDirectoryName() {
      const date = new Date();
      let year = date.getFullYear();
      let month = ("0" + (date.getMonth() + 1)).slice(-2);
      let day = ("0" + date.getDate()).slice(-2);
      let hours = ("0" + date.getHours()).slice(-2);
      this.fireStoragesDirectoryName = String(year) + String(month) + String(day) + String(hours) + "/";
    },
    async handleImageAdded(file, Editor, cursorLocation, resetUploader) {
      if (!this.fireStoragesDirectoryName) {
        this.createDirectoryName();
      }
      const formData = new FormData();
      formData.append("image", file);

      try {
        const storage = firebase.storage();
        let simpleCrypto = new SimpleCrypto("nuxtProject");
        let imageName = SimpleCrypto.generateRandom(100);
        let fireStoragePath =
          this.publicDirectoryPath + this.fireStoragesDirectoryName + imageName;
        let getMessage = await storage.ref(fireStoragePath).put(file);
        storage
          .ref(fireStoragePath)
          .getDownloadURL()
          .then(function(url) {
            Editor.insertEmbed(cursorLocation, "image", url);
            resetUploader();
          });
      } catch (err) {
        console.log(err);
      }
    },
    deleteBlank(form) {
      form.title = form.title.trim();
      form.category = form.category.trim();
    },
    createDateTime() {
      const date = new Date();
      let year = date.getFullYear();
      let month = ("0" + (date.getMonth() + 1)).slice(-2);
      let day = ("0" + date.getDate()).slice(-2);
      let hours = ("0" + date.getHours()).slice(-2);
      let minutes = ("0" + date.getMinutes()).slice(-2);
      let seconds = ("0" + date.getSeconds()).slice(-2);
      let created_at = year + "/" + month + "/" + day + " " + hours + ":" + minutes + ":"  + seconds;
      return created_at;
    },
    async onSubmit(evt) {
      evt.preventDefault();
      this.deleteBlank(this.form);
      if (!this.form.title.length) {
        alert("タイトルが入力されていません");
        return;
      } else if (!this.form.category.length) {
        alert("カテゴリが入力されていません");
        return;
      } else if (!this.form.tags.length) {
        alert("タグが入力されていません");
        return;
      }

      this.form.updated_at = this.createDateTime();

      const dbRef = firebase.database().ref(`articles/${this.form.id}`);
      try {
        await dbRef.set(this.form);
        this.$router.push("/articles");
      } catch (err) {
        console.log("----------------", err);
        this.makeToast(err.message);
      }
    },
    onReset(evt) {
      evt.preventDefault();
      // Reset our form values
      this.form.title = "";
      this.form.category = "";
      this.form.tags = [];
      this.form.contents = "";
      // Trick to reset/clear native browser form validation state
      this.show = false;
      this.$nextTick(() => {
        this.show = true;
      });
    },
    makeToast(err) {
      this.$bvToast.toast(err, {
        title: "投稿に失敗しました",
        variant: "danger",
        solid: true
      });
    }
  }
};
</script>

<style>
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title {
  font-family: "Quicksand", "Source Sans Pro", -apple-system, BlinkMacSystemFont,
    "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}

a {
  color: white;
}
</style>
