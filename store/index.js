import firebase from "~/plugins/firebase.js";
import axios from 'axios';

export const state = () => ({
  thumbnails: [],
  articles: [],
  categories: [],
  categoriesName: [],
  tags: [],
  tagsName: [],
  series: [],
  seriesName: [],
})

export const getters = {
  getThumbnails(state) {
    return state.thumbnails;
  },
  getArticles(state) {
    return state.articles;
  },
  getCategories(state) {
    return state.categories;
  },
  getCategoriesName(state) {
    return state.categoriesName;
  },
  getTags(state) {
    return state.tags;
  },
  getTagsName(state) {
    return state.tagsName;
  },
  getSeries(state) {
    return state.series;
  },
  getSeriesName(state) {
    return state.seriesName;
  },
}

export const mutations = {
  setThumbnailsInfo(state, payload) {
    state.thumbnails = payload;
  },
  setAllArticles(state, payload) {
    state.articles = payload;
  },
  setAllCategories(state, payload) {
    state.categories = payload;
  },
  setAllCategoriesName(state, payload) {
    state.categoriesName = payload;
  },
  setAllTags(state, payload) {
    state.tags = payload;
  },
  setAllTagsName(state, payload) {
    state.tagsName = payload;
  },
  setAllSeries(state, payload) {
    state.series = payload;
  },
  setAllSeriesName(state, payload) {
    state.seriesName = payload;
  },
}

// clientサイドではfetchで呼び出す
export const actions = {
  async fetchAllArticles({ commit }) {
    // const { data } = await axios.get('/api/articles');
    // const { data } = await axios.get('http://0.0.0.0:3000/api/articles');
    const { data } = await axios.get('http://adm.ok-engineering.net/api/articles');
    // const { data } = await axios.get('http://localhost:3000/api/articles');
    console.log('all articles ===== ', data);
    
    commit('setAllArticles', data);
  },
  async fetchThumbnails({ commit }) {
    let storage = firebase.storage();
    let storageReference = await storage.ref('logo').listAll();
    let storageFullPath = [];
    let storageUrl = [];
    let logoName = [];
    let thumbnails = [];
    for (let k of storageReference.items) {
      let storageUrlResult = await storage.ref(k.fullPath).getDownloadURL().then((res) => {
        return res;
      }).catch((err) => {
        console.log(err);
        k.fullPath = "";
        k.name = "";
        return "";
      });
      storageFullPath.push(k.fullPath);
      logoName.push(k.name);
      storageUrl.push(storageUrlResult);
      // URLを取得する
      // ループの非同期（async awaitに注意）
      // storage.ref(fireStoragePath)
    }
    for (let i = 0; storageFullPath.length > i; i++) {
      thumbnails.push({name: logoName[i], path: storageFullPath[i], url: storageUrl[i]});
    }
    commit('setThumbnailsInfo', thumbnails);
    // commit('setThumbnailsInfo', storageReference.items);
  },

  async fetchAllCategories({ commit }) {
    // const { data } = await axios.get('/api/category');
    // const { data } = await axios.get('http://0.0.0.0:3000/api/category');
    const { data } = await axios.get('http://adm.ok-engineering.net/api/category');
    // const { data } = await axios.get('http://localhost:3000/api/category');
    commit('setAllCategories', data);
    
    let categoriesName = [];
    for (let row of data) {
      categoriesName.push(row.name);
    }
    commit('setAllCategoriesName', categoriesName);
  },
  async fetchAllTags({ commit }) {
    // const { data } = await axios.get('/api/tag');
    // const { data } = await axios.get('http://0.0.0.0:3000/api/tag');
    const { data } = await axios.get('http://adm.ok-engineering.net/api/tag');
    // const { data } = await axios.get('http://localhost:3000/api/tag');
    console.log(data);
    
    commit('setAllTags', data);
    
    let tagsName = [];
    for (let row of data) {
      tagsName.push(row.name);
    }
    commit('setAllTagsName', tagsName);
  },
  async fetchAllSeries({ commit }) {
    // const { data } = await axios.get('/api/series');
    // const { data } = await axios.get('http://0.0.0.0:3000/api/series');
    const { data } = await axios.get('http://adm.ok-engineering.net/api/series');
    // const { data } = await axios.get('http://localhost:3000/api/series');
    commit('setAllSeries', data);
    
    let seriesName = [];
    for (let row of data) {
      seriesName.push(row.name);
    }
    commit('setAllSeriesName', seriesName);
  },
  async insertNewArticle({},{ form }) {
    // let { data } = await axios.post('http://0.0.0.0:3000/api/new-article', {params: form});
    let { data } = await axios.post('http://adm.ok-engineering.net/api/new-article', {params: form});
    // let { data } = await axios.post('http://localhost:3000/api/new-article', {params: form});
    
    if (data === true) {
      this.$router.push("/articles");
    }
  },
  async updateArticle({},{ form }) {
    // let { data } = await axios.post('http://0.0.0.0:3000/api/edit', {params: form});
    let { data } = await axios.post('http://adm.ok-engineering.net/api/edit', {params: form});
    // let { data } = await axios.post('http://localhost:3000/api/edit', {params: form});
    console.log(data);
    
    
    if (data === true) {
      this.$router.push("/articles");
    }
  },
}
