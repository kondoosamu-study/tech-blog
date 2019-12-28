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
    >
      <template v-slot:cell(name)="row">{{ row.value.first }} {{ row.value.last }}</template>

      <template v-slot:cell(actions)="row">
        <b-button size="sm" @click="view(row.item, row.index, $event.target)" class="m-1">View</b-button>
        <b-button size="sm" @click="goToEdit" class="m-1">Edit</b-button>
        <b-button size="sm" @click="softDelete" class="m-1">Soft Delete</b-button>
        <b-button size="sm" @click="HardDelete" class="m-1">Hard Delete</b-button>
      </template>

      <template v-slot:row-details="row">
        <b-card>
          <ul>
            <li v-for="(value, key) in row.item" :key="key">{{ key }}: {{ value }}</li>
          </ul>
        </b-card>
      </template>
    </b-table>

    <!-- Info modal -->
    <b-modal :id="infoModal.id" :title="infoModal.title" ok-only @hide="resetInfoModal">
      <pre>{{ infoModal.content }}</pre>
    </b-modal>
  </b-container>
</template>

<script>
export default {
  middleware: "auth",
  layout: "mng",
  data() {
    return {
      items: [
        {
          id: 1,
          title: "First",
          category: 1,
          tag: {
            first: "fir",
            second: "se",
            third: "th",
            fourth: "fo",
            fifth: "fif",
            sixth: "six"
          },
          contents: 'test',
          created_at: '2019/10/29 21:17:29',
          updated_at: '2019/10/29 21:17:29',
        },
        {
          id: 2,
          title: "Second",
          category: 2,
          tag: {
            first: "fir",
            second: "se",
            third: "th",
            fourth: "fo",
            fifth: "fif",
            sixth: "six"
          },
          contents: 'testtest',
          created_at: '2019/10/29 21:18:29',
          updated_at: '2019/10/29 21:18:29',
        },
        {
          id: 3,
          title: "Third",
          category: 3,
          tag: {
            first: "fir",
            second: "se",
            third: "th",
            fourth: "fo",
            fifth: "fif",
            sixth: "six"
          },
          contents: 'testtesttest',
          created_at: '2019/10/29 21:18:29',
          updated_at: '2019/10/29 21:18:29',
        },
        {
          id: 4,
          title: "Fourth",
          category: 4,
          tag: {
            first: "fir",
            second: "se",
            third: "th",
            fourth: "fo",
            fifth: "fif",
            sixth: "six"
          },
          contents: 'testtesttesttest',
          created_at: '2019/10/29 21:18:29',
          updated_at: '2019/10/29 21:18:29',
        },

        {
          id: 5,
          title: "Fifth",
          category: 5,
          tag: {
            first: "fir",
            second: "se",
            third: "th",
            fourth: "fo",
            fifth: "fif",
            sixth: "six"
          },
          contents: 'testtesttesttesttest',
          created_at: '2019/10/29 21:18:29',
          updated_at: '2019/10/29 21:18:29',
        },
        {
          id: 6,
          title: "Sixth",
          category: 6,
          tag: {
            first: "fir",
            second: "se",
            third: "th",
            fourth: "fo",
            fifth: "fif",
            sixth: "six"
          },
          contents: 'testtesttesttesttesttesttest',
          created_at: '2019/10/29 21:18:29',
          updated_at: '2019/10/29 21:18:29',
        },
        {
          id: 7,
          title: "Seventh",
          category: 7,
          tag: {
            first: "fir",
            second: "se",
            third: "th",
            fourth: "fo",
            fifth: "fif",
            sixth: "six"
          },
          contents: 'testtesttesttesttesttesttest',
          created_at: '2019/10/29 21:18:29',
          updated_at: '2019/10/29 21:18:29',
        },
        {
          id: 8,
          title: "8",
          category: 8,
          tag: {
            first: "fir",
            second: "se",
            third: "th",
            fourth: "fo",
            fifth: "fif",
            sixth: "six"
          },
          contents: 'testtesttesttesttesttesttest',
          created_at: '2019/10/29 21:18:29',
          updated_at: '2019/10/29 21:18:29',
        },
        {
          id: 9,
          title: "9",
          category: 9,
          tag: {
            first: "fir",
            second: "se",
            third: "th",
            fourth: "fo",
            fifth: "fif",
            sixth: "six"
          },
          contents: 'testtesttesttesttesttesttest',
          created_at: '2019/10/29 21:18:29',
          updated_at: '2019/10/29 21:18:29',
        },
        {
          id: 10,
          title: "Seventh",
          category: 10,
          tag: {
            first: "fir",
            second: "se",
            third: "th",
            fourth: "fo",
            fifth: "fif",
            sixth: "six"
          },
          contents: 'testtesttesttesttesttesttest',
          created_at: '2019/10/29 21:18:29',
          updated_at: '2019/10/29 21:18:29',
        },
        {
          id: 11,
          title: "Seventh",
          category: 11,
          tag: {
            first: "fir",
            second: "se",
            third: "th",
            fourth: "fo",
            fifth: "fif",
            sixth: "six"
          },
          contents: 'testtesttesttesttesttesttest',
          created_at: '2019/10/29 21:18:29',
          updated_at: '2019/10/29 21:18:29',
        },
        {
          id: 12,
          title: "Seventh",
          category: 12,
          tag: {
            first: "fir",
            second: "se",
            third: "th",
            fourth: "fo",
            fifth: "fif",
            sixth: "six"
          },
          contents: 'testtesttesttesttesttesttest',
          created_at: '2019/10/29 21:18:29',
          updated_at: '2019/10/29 21:18:29',
        }
      ],
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
          class: "text-center"
        },
        {
          key: "category",
          label: "Category",
          sortable: true
        },
        {
          key: "tag",
          label: "Tag",
          sortable: true
        },
        {
          key: "contents",
          label: "Contents",
          sortable: true
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
        { key: "actions", label: "Actions" }
      ],
      totalRows: 1,
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
      }
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
</style>
