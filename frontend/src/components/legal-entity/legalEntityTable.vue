<template>
  <div>
    <q-table flat :grid="$q.platform.is.mobile" wrap-cells ref="tableRef" row-key="id" class="q-mb-md border-bottom"
      :rows="legalEntities" :columns="tableColumns" v-model:pagination="pagination" :rows-per-page-options="[30]"
      :loading="loading" binary-state-sort @request="searchLegalEntities">

      <!-- table -->
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="action" :props="props">
            <q-btn flat icon="edit_note" @click="$router.push(`/subcontractor/${props.row.id}`)" />
          </q-td>
          <q-td key="name" :props="props">
            {{ props.row.name }}
          </q-td>
          <q-td key="trades" :props="props">
            <div class="row q-col-gutter">
              <div v-for="(trade, index) in mapTradeLabelLegalEntity(props.row.trades)" :key="index">
                <q-chip class="col-6 chip-minimal-rounded" :label="trade"></q-chip>
              </div>
            </div>
          </q-td>
          <q-td key="address" :props="props">
            <div v-if="props.row.street" class="row">
              <!-- Ohne height:100% – stattdessen flex stretch -->
              <q-img src="~assets/icons/home.png" class="q-mr-sm q-mt-sm" style="max-width:20px; max-height: 20px;" />

              <div class="column justify-center">
                <div>{{ props.row.street }}</div>
                <div>{{ props.row.zip }} {{ props.row.city }}</div>
              </div>
            </div>
          </q-td>
          <q-td key="contact" :props="props">
            <div v-if="props.row.mobile" class="row items-center no-wrap">
              <q-icon name="phone" class="q-mr-xs" />
              <a style="text-decoration: none; color:black" :href="`tel:${props.row.mobile}`">{{ props.row.mobile }}
                <q-tooltip>
                  Anrufen
                </q-tooltip>
              </a>
            </div>
            <div v-if="props.row.email" class="row items-center no-wrap q-mt-xs">
              <q-icon name="email" class="q-mr-xs" />
              <a style="text-decoration: none; color:black" :href="`mailto:${props.row.email}`">{{ props.row.email }}
                <q-tooltip>
                  Email schreiben
                </q-tooltip>
              </a>
            </div>
          </q-td>
          <q-td key="mainContact" :props="props">
            <div v-if="props.row.contactPersons[0]" class="row text-bold">
              {{ props.row.contactPersons[0].person.title }}
              {{ props.row.contactPersons[0].person.firstName }} {{ props.row.contactPersons[0].person.lastName }}
            </div>
            <div class="row" style="cursor: pointer" @click="phoneTo(props.row.mainContact?.mobile)">
              <div v-if="props.row.contactPersons[0]?.person.mobile">
                <q-icon name=" phone" class="q-mr-sm" />
                <q-tooltip>Anrufen</q-tooltip>
                {{ props.row.contactPersons[0].person.mobile }}
              </div>
            </div>
            <div class="row" style="cursor: pointer" @click="mailTo(props.row.mainContact?.email)">
              <div v-if="props.row.contactPersons[0]?.person.email">
                <q-icon name="mail" class="q-mr-sm" />
                <q-tooltip>Email senden</q-tooltip>
                {{ props.row.contactPersons[0].person.email }}
              </div>
            </div>
          </q-td>

          <q-td key="documents" :props="props">
            <div class="row no-wrap">
              <div v-for="(documentType, index) in legalEntityDocuments" :key="index">
                <q-icon class="q-mr-xs" name="fas fa-circle"
                  :color="getDocumentStatusColor(props.row[`${documentType.type}ValidTo`])">
                  <q-tooltip>{{ documentType.label }}</q-tooltip>
                </q-icon>
              </div>
            </div>
          </q-td>
        </q-tr>
      </template>

      <template v-slot:item="props">
        <q-card style="min-width:85vw !important; margin-left: -2px;" flat bordered class="q-mb-sm"
          @click="$router.push(`/subcontractor/${props.row.id}`)">
          <q-card-section class="q-pa-sm">
            <!-- Name und Edit-Button -->
            <div class="row items-center justify-between q-mb-sm">
              <div class="text-h6 q-ellipsis" style="max-width: 80%">{{ props.row.name || 'Kein Name' }}</div>
            </div>

            <!-- Trades -->
            <div class="q-mb-sm" style="flex-grow: 1">
              <div class="row q-col-gutter-sm">
                <div v-for="(trade, index) in mapTradeLabelLegalEntity(props.row.trades || [])" :key="index">
                  <q-chip class="col-6 chip-minimal-rounded" :label="trade" />
                </div>
                <div v-if="!props.row.trades || props.row.trades.length === 0" class="col-12">
                  <span class="text-caption text-grey">Keine Gewerke</span>
                </div>
              </div>
            </div>

            <!-- Address -->
            <div class="q-mb-sm" style="flex-grow: 1">
              <div v-if="props.row.street" class="row items-start">
                <q-img src="~assets/icons/home.png" class="q-mr-sm q-mt-xs" style="max-width: 20px; max-height: 20px" />
                <div class="column">
                  <div>{{ props.row.street }}</div>
                  <div>{{ props.row.zip }} {{ props.row.city }}</div>
                </div>
              </div>
              <div v-else class="text-caption text-grey">Keine Adresse</div>
            </div>

            <!-- Contact -->
            <div class="q-mb-sm" style="flex-grow: 1">
              <div v-if="props.row.mobile" class="row items-center no-wrap q-mb-xs">
                <q-icon name="phone" class="q-mr-xs" />
                <a style="text-decoration: none; color: black" :href="`tel:${props.row.mobile}`">
                  {{ props.row.mobile }}
                  <q-tooltip>Anrufen</q-tooltip>
                </a>
              </div>
              <div v-if="props.row.email" class="row items-center no-wrap">
                <q-icon name="email" class="q-mr-xs" />
                <a style="text-decoration: none; color: black" :href="`mailto:${props.row.email}`">
                  {{ props.row.email }}
                  <q-tooltip>Email schreiben</q-tooltip>
                </a>
              </div>
              <div v-if="!props.row.mobile && !props.row.email" class="text-caption text-grey">
                Keine Kontaktinformationen
              </div>
            </div>

            <!-- Documents -->
            <div class="row no-wrap" style="flex-grow: 1">
              <div v-for="(documentType, index) in legalEntityDocuments" :key="index" class="q-mr-sm">
                <q-icon name="fas fa-circle"
                  :color="getDocumentStatusColor(props.row[`${documentType.type}ValidTo`] || null)">
                  <q-tooltip>{{ documentType.label }}</q-tooltip>
                </q-icon>
              </div>
              <div v-if="!legalEntityDocuments || legalEntityDocuments.length === 0" class="text-caption text-grey">
                Keine Dokumente
              </div>
            </div>
          </q-card-section>
        </q-card>
      </template>
    </q-table>
    <div class="q-pa-md">
      <div class="row q-col-gutter-xl">
        <div class="col-auto">
          <strong>Dokumente von links nach rechts:</strong><br />
          1. Nachweis zur Steuerschuldnerschaft §13b<br />
          2. Freistellungsbescheinigung §48b<br />
          3. Unbedenklichkeitsbescheinigung<br />
          4. Gewerbeanmeldung<br />
          5. Bürgschaft<br />
          6. Preisvereinbarung
        </div>
        <div class="col-auto">
          <strong>Statusampel</strong><br />
          <q-icon name="fas fa-circle" color="green" /> Datum angegeben und Dokument hochgeladen<br />
          <q-icon name="fas fa-circle" color="yellow" /> Dokument weniger als 28 Tage gültig<br />
          <q-icon name="fas fa-circle" color="red" /> Dokument ist abgelaufen<br />
          <q-icon name="fas fa-circle" color="grey" /> Kein Gültigkeitsdatum angegeben
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted, watch } from 'vue'
import { date } from 'quasar'
import {
  mapOptionLabelLegalEntity,
  mapTradeLabelLegalEntity,
  getLegalEntityDocuments,
  getDocumentStatusColor
} from './helper.js'
import { isOdd } from 'components/common/helper'
import { api } from 'boot/axios'

export default defineComponent({
  name: 'tableLegalEntities',

  props: ['filterValue'],

  setup(props) {
    //const bus = inject('bus')
    //const q = useQuasar()
    const legalEntities = ref([])
    const loading = ref(false)

    const tableRef = ref()
    const filter = ref(props.filterValue)

    const legalEntityDocuments = getLegalEntityDocuments()

    const pagination = ref({
      sortBy: 'createdAt',
      descending: true,
      page: 1,
      rowsPerPage: 30,
      rowsNumber: 30
    })

    const tableColumns = ref(
      [
        { name: 'action', label: 'Bearbeiten', align: 'left' },
        { name: 'name', label: 'Name', align: 'left', sortable: true },
        { name: 'trades', label: 'Gewerke', align: 'left', sortable: true, style: 'max-width:150px' },
        { name: 'address', label: 'Adresse', align: 'left', sortable: true },
        { name: 'contact', label: 'Kontaktdaten', align: 'left' },
        { name: 'mainContact', label: 'Hauptansprechpartner', align: 'left' },
        { name: 'documents', label: 'Dokumente', align: 'left' }
      ]
    )

    async function searchLegalEntities(params) {
      loading.value = true
      pagination.value = params.pagination

      const getResult = await getLegalEntities()
      legalEntities.value = getResult.data
      pagination.value.rowsNumber = getResult.count
      loading.value = false
    }
    const getLegalEntities = async function () {
      const url = setSearchUrlLegalEntitiesList()
      const [dataResult, countResult] = await Promise.all([
        api.get(url, { withCredentials: true }),
        api.get(`${url}&count=true`, { withCredentials: true })
      ])
      return {
        data: dataResult.data.map(entry => {
          Object.assign(entry, legalEntityDocuments.reduce((acc, doc) => {
            const dateValue = entry[`${doc.type}ValidTo`]
            if (!dateValue) return acc
            acc[`${doc.type}ValidTo`] = date.formatDate(dateValue, 'DD.MM.YYYY')
            return acc
          }, {}))
          return entry
        }),
        count: countResult.data.count
      }
    }

    function setSearchUrlLegalEntitiesList() {
      const { page, rowsPerPage, sortBy, descending } = pagination.value
      const skip = (page - 1) * rowsPerPage
      let url = `/joerg/legal-entity?skip=${skip}&sortBy=${mapLegalEntitySortBy(sortBy)}&desc=${descending}`
      if (filter.value.legalEntity?.search) {
        url = `${url}&search=${filter.value.legalEntity.search}`
      }
      if (filter.value.legalEntity?.isActive !== undefined) {
        url = `${url}&isActive=${filter.value.legalEntity.isActive}`
      }
      if (filter.value.legalEntity?.trades.length > 0) {
        url = `${url}&trades=${filter.value.legalEntity.trades.join(',')}`
      }
      if (filter.value.legalEntity.documents !== null) {
        url = `${url}&documents=${filter.value.legalEntity.documents}`
      }
      return url
    }

    function mapLegalEntitySortBy(sortBy) {
      if (sortBy === 'address') return 'zip'
      if (sortBy === 'type') return 'businessRelation'
      return sortBy
    }

    watch(
      () => filter.value,
      () => {
        searchLegalEntities({ pagination: pagination.value})
      },
      { deep: true }
    )

    onMounted(() => {
      tableRef.value.requestServerInteraction()
    })

    return {
      tableRef,
      legalEntities,
      loading,
      pagination,
      tableColumns,
      filter,
      legalEntityDocuments,
      searchLegalEntities,
      mapOptionLabelLegalEntity,
      mapTradeLabelLegalEntity,
      isOdd,
      getDocumentStatusColor
    }
  }
})
</script>
<style scoped>
.card-fixed-size {
  width: 100%;
  max-width: 400px;
  /* Begrenzt die Breite für bessere Lesbarkeit */
  min-height: 300px;
  /* Feste Mindesthöhe für alle Karten */
  display: flex;
  flex-direction: column;
  margin: 0 !important;
  /* Entfernt jeglichen Margin der Karte */
}

.card-content {
  flex: 1;
  /* Nimmt den verfügbaren Platz ein */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  /* Verteilt Inhalt gleichmäßig */
  padding: 8px !important;
  /* Konsistentes Padding, kein zusätzlicher Platz */
}

.flex-grow {
  flex-grow: 1;
  /* Lässt Abschnitte wachsen, um Platz auszufüllen */
}

.text-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80%;
  /* Verhindert, dass der Name zu viel Platz einnimmt */
}

.text-caption {
  font-size: 0.75rem;
}

/* Entfernt Padding von q-item, falls vorhanden */
:deep(.q-item) {
  padding: 0 !important;
}

/* Entfernt Padding und Margin von q-list, falls vorhanden */
:deep(.q-list) {
  padding: 0 !important;
  margin: 0 !important;
}
.chip-minimal-rounded {
  display: inline-flex;
  align-items: center;
  background-color: white;
  color: #23a0df;
  font-weight: 500;
  border-radius: 0.5rem;
  border: 1px solid rgba(35, 160, 223, 0.3);
  white-space: nowrap;
}
</style>