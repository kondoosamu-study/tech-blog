<template>
  <div class="mt-4 mx-4">
    <h1>Create new article</h1>
    <b-form @submit="onSubmit" @reset="onReset" v-if="show">
      <b-form-group id="input-group-1" label="タイトル：" label-for="title" description="記事とタブのタイトル">
        <b-form-input id="title" v-model="form.title" required placeholder="記事のタイトルを記入して下さい。"></b-form-input>
      </b-form-group>

      <b-form-group id="input-group-2" label="サムネイル：" label-for="thumbnail">
        <b-form-select id="thumbnail" v-model="form.thumbnailName" :options="options" v-on:change="setSelectedThumbnailAsFormData" required></b-form-select>
        <div class="mt-3">Selected: <strong>{{ form.thumbnailName }}</strong></div>
      </b-form-group>
      <b-img v-if="form.thumbnailName" :src="form.thumbnailUrl" thumbnail fluid alt="selected thumbnail" class="p-4 bg-white"></b-img>

      <b-form-group id="input-group-3" label="カテゴリ：" label-for="category">
        <vue-suggest-input id="category" v-model="form.category" :items="categoriesNameList" placeholder="記事のカテゴリを記入して下さい。" class="my-2" required />
      </b-form-group>

      <b-form-group id="input-group-4" label="タグ：" label-for="tags" description>
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

      <b-form-group id="input-group-5" label="シリーズ名：" label-for="series-name">
        <vue-suggest-input id="series-name" v-model="form.seriesName" :items="seriesNameList" placeholder="記事のシリーズ設定をする場合は入力して下さい。" class="my-2" />
      </b-form-group>

      <b-form-group v-if="form.seriesName.length" id="input-group-6" label="シリーズ番号：" label-for="series-order">
        <b-form-input id="series-order" v-model="form.seriesOrder" type="number" min="1" step="1" required></b-form-input>
        <b-button v-if="form.seriesName.length" @click="deleteSeries()" variant="info" class="mt-2">クリア</b-button>
      </b-form-group>

      <no-ssr placeholder="Loading Your Editor...">
        <vue-editor id="editor" v-model="form.contents" useCustomImageHandler @image-added="handleImageAdded"/>
      </no-ssr>

      <b-button type="submit" variant="primary" class="mt-2">Submit</b-button>
      <b-button type="reset" variant="danger" class="mt-2">Reset</b-button>
    </b-form>
    <b-card class="mt-3" header="Form Data Result">
      <pre class="m-0">{{ form }}</pre>
    </b-card>
  </div>
</template>

<script>
// カテゴリのサジェストが出るようにしないと同一カテゴリだが、文字の違い（ひらがな、カタカナ、英数字、大文字、小文字）で重複したカテゴリ群が作成される。
import VueSuggestInput from 'vue-suggest-input'
import 'vue-suggest-input/dist/vue-suggest-input.css'
import firebase from "~/plugins/firebase.js";
import SimpleCrypto from "simple-crypto-js";
import { mapGetters, mapActions } from "vuex";
export default {
  // 一時コメントアウト
  // middleware: "auth",
  layout: "mng",
  components: {
    VueSuggestInput
  },
  data() {
    return {
      form: {
        id: "",// 左記を追加する
        title: "",
        thumbnailName: null,
        thumbnailFullPath: null,
        thumbnailUrl: null,
        category: "",
        tags: [],
        seriesName: "",
        seriesOrder: null,
        contents: "",
        createdAt: "",
        updatedAt: "",
        deletedAt: ""
      },
      tag: "",
      show: true,
      publicDirectoryPath: "public/",
      fireStoragesDirectoryName: "",
      options: [{value: null, text: 'Please select an option', selected: true}],
      selected: null,
    };
  },
  computed: {
    ...mapGetters({ thumbnails: "getThumbnails" }),
    ...mapGetters({ categoriesList: "getCategories" }),
    ...mapGetters({ categoriesNameList: "getCategoriesName" }),
    // ...mapGetters({ tags: "getTags" }),
    ...mapGetters({ tagsName: "getTagsName" }),
    ...mapGetters({ seriesNameList: "getSeriesName" }),
  },
  async fetch({ store, $axios }) {
    await store.dispatch("fetchAllCategories");
    await store.dispatch("fetchAllTags");
    await store.dispatch("fetchAllSeries");
    
    // const { data } = await $axios.get('/api/category');
    // console.log(" Response from API ===========", data);
  },
  async mounted() {
    await this.fetchThumbnails();
    for (let thumbnail of this.thumbnails) {
        this.options.push({value: thumbnail.name, text: thumbnail.name.split('_logo')[0]})
    }
  },
  methods: {
    setSelectedThumbnailAsFormData() {
      let selectedThumbnail = this.thumbnails.find(element => element.name === this.form.thumbnailName);
      this.form.thumbnailFullPath = selectedThumbnail.path;
      this.form.thumbnailUrl = selectedThumbnail.url;
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
    deleteSeries() {
      this.form.seriesName = '';
      this.form.seriesOrder = '';
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
      form.seriesName = form.seriesName.trim();
    },
    createDateTime() {
      const date = new Date();
      let year = date.getFullYear();
      let month = ("0" + (date.getMonth() + 1)).slice(-2);
      let day = ("0" + date.getDate()).slice(-2);
      let hours = ("0" + date.getHours()).slice(-2);
      let minutes = ("0" + date.getMinutes()).slice(-2);
      let seconds = ("0" + date.getSeconds()).slice(-2);
      let createdAt = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":"  + seconds;
      return createdAt;
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

      this.form.createdAt = this.createDateTime();
      this.form.updatedAt = this.form.createdAt;

      // 登録作業を行う
      // this.$store.commit('todos/add', e.target.value)
      // 入力文字列のSQLインジェクション対策
      // カテゴリ名、タグ名、シリーズ名は小文字、大文字比較はせずに同一文字列が存在すれば既存のレコードを使用する
      // シリーズ名が空白のみとシリーズ番号が0の場合は登録処理行わない
      this.$store.dispatch('insertNewArticle', { form: this.form });

      // const uuid = new Date().getTime();
      // this.form.id = uuid;
      // const dbRef = firebase.database().ref(`articles/${uuid}`);
      // try {
      //   await dbRef.set(this.form);
      //   this.$router.push("/articles");
      // } catch (err) {
      //   console.log("----------------", err);
      //   this.makeToast(err.message);
      // }
    },
    onReset(evt) {
      evt.preventDefault();
      // Reset our form values
      this.form.title = "";
      this.form.category = "";
      this.form.tags = [];
      this.seriesName = "";
      this.seriesOrder = null;
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
    },
    ...mapActions(['fetchThumbnails'])
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
</style>
