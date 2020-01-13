<template>
  <b-container fluid>
    <!-- User Interface controls -->
    <b-row>
      <b-col lg="6" class="my-1">
        <b-form-group
          label="Sort"
          label-cols-sm="3"
          label-align-sm="right"
          label-size="sm"
          label-for="sortBySelect"
          class="mb-0"
        >
          <b-input-group size="sm">
            <b-form-select v-model="sortBy" id="sortBySelect" :options="sortOptions" class="w-75">
              <template v-slot:first>
                <option value>-- none --</option>
              </template>
            </b-form-select>
            <b-form-select v-model="sortDesc" size="sm" :disabled="!sortBy" class="w-25">
              <option :value="false">Asc</option>
              <option :value="true">Desc</option>
            </b-form-select>
          </b-input-group>
        </b-form-group>
      </b-col>

      <b-col lg="6" class="my-1">
        <b-form-group
          label="Filter"
          label-cols-sm="3"
          label-align-sm="right"
          label-size="sm"
          label-for="filterInput"
          class="mb-0"
        >
          <b-input-group size="sm">
            <b-form-input
              v-model="filter"
              type="search"
              id="filterInput"
              placeholder="Type to Search"
            ></b-form-input>
            <b-input-group-append>
              <b-button :disabled="!filter" @click="filter = ''">Clear</b-button>
            </b-input-group-append>
          </b-input-group>
        </b-form-group>
      </b-col>

      <b-col sm="5" md="6" class="my-1">
        <b-form-group
          label="Per page"
          label-cols-sm="6"
          label-cols-md="4"
          label-cols-lg="3"
          label-align-sm="right"
          label-size="sm"
          label-for="perPageSelect"
          class="mb-0"
        >
          <b-form-select v-model="perPage" id="perPageSelect" size="sm" :options="pageOptions"></b-form-select>
        </b-form-group>
      </b-col>

      <b-col sm="7" md="6" class="my-1">
        <b-pagination
          v-model="currentPage"
          :total-rows="totalRows"
          :per-page="perPage"
          align="fill"
          size="sm"
          class="my-0"
        ></b-pagination>
      </b-col>
    </b-row>

    <!-- Main table element -->
    <b-table
      show-empty
      small
      stacked="md"
      :items="items"
      :fields="fields"
      :current-page="currentPage"
      :per-page="perPage"
      :filter="filter"
      :sort-by.sync="sortBy"
      :sort-desc.sync="sortDesc"
      @filtered="onFiltered"
      class="w-100"
    >
      <template class="w-100" v-slot:cell(name)="row">{{ row.value.first }} {{ row.value.last }}</template>

      <template class="w-100" v-slot:cell(actions)="row">
        <b-button size="sm" @click="view(row.item, row.index, $event.target)" class="m-1">View</b-button>
        <!-- <b-button size="sm" @click="goToEdit(row.item)" class="m-1">Edit</b-button> -->
        <b-button size="sm" @click="$router.push(`/edit/${row.item.id}`)" class="m-1">Edit</b-button>
        <b-button size="sm" v-if="row.item.deleted_at" @click="releaseArticle(row.item)" class="m-1">Release</b-button>
        <b-button size="sm" v-else @click="softDelete(row.item)" class="m-1">Soft Delete</b-button>
        <b-button size="sm" @click="warnToHardDelete(row.item)" class="m-1">Hard Delete</b-button>
      </template>

      <template class="w-100" v-slot:row-details="row">
        <b-card>
          <ul>
            <li
              class="textOverflow"
              v-for="(value, key) in row.item"
              :key="key"
            >{{ key }}: {{ value }}</li>
          </ul>
        </b-card>
      </template>
    </b-table>

    <!-- modal -->
    <b-modal :id="infoModal.id" :title="infoModal.title" ok-only @hide="resetInfoModal">
      <pre>{{ infoModal.content }}</pre>
    </b-modal>
    <b-modal ref="warn-modal" hide-footer :title="warnModal.title">
      <div class="d-block text-center">
        <h3>Do you want to Hard Delete?</h3>
        <pre>{{ warnModal.content }}</pre>
      </div>
      <b-button class="mt-3" variant="dark" block @click="hideModal">Close</b-button>
      <b-button class="mt-2" variant="danger" block @click="hardDelete(warnModal.id)">Hard Delete</b-button>
    </b-modal>
  </b-container>
</template>

<script>
import firebase from "~/plugins/firebase.js";
export default {
  middleware: "auth",
  layout: "mng",
  data() {
    return {
      items: [],
      fields: [
        {
          key: "id",
          label: "ID",
          sortable: true,
          class: "text-right"
        },
        {
          key: "title",
          label: "Title",
          sortable: true,
          class: "text-left"
        },
        {
          key: "category",
          label: "Category",
          sortable: true,
          class: "text-left"
        },
        {
          key: "tags",
          label: "Tags",
          sortable: true,
          class: "text-left"
        },
        {
          key: "contents",
          label: "Contents",
          sortable: true,
          class: "text-left textOverflow m-2"
        },
        {
          key: "created_at",
          label: "Created at",
          sortable: true
        },
        {
          key: "updated_at",
          label: "Updated at",
          sortable: true
        },
        {
          key: "deleted_at",
          label: "Deleted_at",
          sortable: true
        },
        { key: "actions", label: "Actions" }
      ],
      totalRows: 2,
      currentPage: 1,
      perPage: 5,
      pageOptions: [5, 10, 15],
      sortBy: "",
      sortDesc: false,
      filter: null,
      infoModal: {
        id: "info-modal",
        title: "",
        content: ""
      },
      warnModal: {
        id: "",
        title: "",
        content: ""
      },
    };
  },
  computed: {
    sortOptions() {
      // Create an options list from our fields
      return this.fields
        .filter(f => f.sortable)
        .map(f => {
          return { text: f.label, value: f.key };
        });
    }
  },
  async asyncData() {
     const results = await firebase
        .database()
        .ref("articles")
        .once("value")
        .then(snapshot => {
          let result = [];
          let firebaseRecodes = snapshot.val();
          
          for (let k in firebaseRecodes) {
            // firebaseRecodes[k].contents = firebaseRecodes[k].contents.slice(0,10);
            result.push(firebaseRecodes[k]);
          }
          
          return result;
        })
        .catch(err => {
          console.log("firebase's err =====", err);
          return err;
        });
    return { items: results };
  },
  mounted() {
    // Set the initial number of items
    this.totalRows = this.items.length;
  },
  methods: {
    view(item, index, button) {
      this.infoModal.title = `Row index: ${index}`;
      this.infoModal.content = JSON.stringify(item, null, 2);
      this.$root.$emit("bv::show::modal", this.infoModal.id, button);
    },
    async synchronizeFirebaseRecodes() {
      this.items = [];
      await firebase
        .database()
        .ref("articles")
        .once("value")
        .then(snapshot => {
          let firebaseRecodes = snapshot.val();
          for (let k in firebaseRecodes) {
            // firebaseRecodes[k].contents = firebaseRecodes[k].contents.slice(0,10);
            this.items.push(firebaseRecodes[k]);
          }
          return;
        })
        .catch(err => {
          console.log("firebase's err =====", err);
          return err;
        });
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
    softDelete(item) {
      item.deleted_at = this.createDateTime();
      let updates = {};
      updates["/articles/" + item.id + "/"] = item;
      return firebase.database().ref().update(updates);
    },
    releaseArticle(item) {
      item.deleted_at = "";
      let updates = {};
      updates["/articles/" + item.id + "/"] = item;
      return firebase.database().ref().update(updates);
    },
    warnToHardDelete(item, index) {
      this.warnModal.id = item.id;
      this.warnModal.title = `Delete article about id: ${item.id}`;
      this.warnModal.content = JSON.stringify(item, null, 2);
      this.$refs['warn-modal'].show();
    },
    hideModal() {
      this.$refs['warn-modal'].hide();
    },
    hardDelete(id) {
      firebase.database().ref('articles/' + id).remove();
      this.synchronizeFirebaseRecodes();
      this.$refs['warn-modal'].hide();
    },
    resetInfoModal() {
      this.infoModal.title = "";
      this.infoModal.content = "";
    },
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
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
.textOverflow {
  text-overflow: ellipsis;
  -webkit-text-overflow: ellipsis; /* Safari */
  -o-text-overflow: ellipsis; /* Opera */
}
</style>
