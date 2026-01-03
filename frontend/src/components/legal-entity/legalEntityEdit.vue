<template>
  <div v-if="(mode === 'edit' && selectedLegalEntity.id) || (mode === 'create')" class="q-ma-md">
    <q-form ref="legalEntityForm">
      <div class=" row q-col-gutter-md items-stretch">
        <div class="col-lg-3 col-12">
          <q-card class="q-pa-md full-height">
            <q-card-section class="q-pb-none">
              <div class="row items-center justify-between">
                <div class="text-h6">Allgemeines</div>
              </div>
            </q-card-section>
            <q-card-section class="row q-col-gutter-md">
              <q-input class="col-12" dense v-model="selectedLegalEntity.name" label="Firmenname" />
              <q-select class="col-12" dense emit-value map-options v-model="selectedLegalEntity.type"
                :options="legalOptions" label="Art" />
              <q-select class="col-12" dense emit-value map-options v-model="selectedLegalEntity.businessRelation"
                :options="businessRelationOptions" label="Geschäftsbeziehung" />
              <q-select class="col-12" dense multiple emit-value map-options v-model="selectedLegalEntity.trades"
                :options="tradeOptions" label="Gewerke" />


              <!-- Rechte Spalte mit Synchronisationsstatus -->
              <div v-if="mode === 'edit'" class="col-12 col-md-8">
                <div class="text-caption q-mb-xs text-grey-8">Synchronisationsstatus</div>

                <div class="row q-col-gutter-md q-mt-xs">
                  <div class="col-3">
                    SAGE:
                  </div>
                  <div class="col-9">
                    <q-badge :color="selectedLegalEntity.isSageInSync ? 'positive' : 'warning'"
                      :text-color="selectedLegalEntity.isSageInSync ? 'white' : 'black'" outline>
                      <q-icon :name="selectedLegalEntity.isSageInSync ? 'check_circle' : 'error_outline'" size="xs"
                        class="q-mr-xs" />
                      {{ selectedLegalEntity.isSageInSync ? 'Synchronisiert' : 'Nicht synchronisiert' }}
                    </q-badge>
                  </div>
                  <div class="col-3">
                    SVENJA:
                  </div>
                  <div class="col-9">
                    <q-badge :color="selectedLegalEntity.isSvenjaInSync ? 'positive' : 'warning'"
                      :text-color="selectedLegalEntity.isSvenjaInSync ? 'white' : 'black'" outline>
                      <q-icon :name="selectedLegalEntity.isSvenjaInSync ? 'check_circle' : 'error_outline'" size="xs"
                        class="q-mr-xs" />
                      {{ selectedLegalEntity.isSvenjaInSync ? 'Synchronisiert' : 'Nicht synchronisiert' }}
                    </q-badge>
                  </div>
                  <div class="col-3">
                    BRALE3.0:
                  </div>
                  <div class="col-9">
                    <q-badge :color="selectedLegalEntity.isBraleInSync ? 'positive' : 'warning'"
                      :text-color="selectedLegalEntity.isBraleInSync ? 'white' : 'black'" outline>
                      <q-icon :name="selectedLegalEntity.isBraleInSync ? 'check_circle' : 'error_outline'" size="xs"
                        class="q-mr-xs" />
                      {{ selectedLegalEntity.isBraleInSync ? 'Synchronisiert' : 'Nicht synchronisiert' }}
                    </q-badge>
                  </div>
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="text-caption q-mb-xs text-grey-8">Einstellungen</div>
                <div class="row q-col-gutter-md q-mt-xs">
                  <div class="col-12" style="cursor: pointer;">
                    <q-badge @click="selectedLegalEntity.isActive = !selectedLegalEntity.isActive"
                      :color="selectedLegalEntity.isActive ? 'positive' : 'warning'"
                      :text-color="selectedLegalEntity.isActive ? 'white' : 'black'" outline>
                      <q-icon :name="selectedLegalEntity.isActive ? 'check_circle' : 'error_outline'" size="xs"
                        class="q-mr-xs" />
                      {{ selectedLegalEntity.isActive ? 'Aktiv' : 'Deaktiviert' }}
                    </q-badge>
                  </div>
                  <div style="cursor: pointer;">
                    <q-badge @click="selectedLegalEntity.allowsNewsletter = !selectedLegalEntity.allowsNewsletter"
                      :color="selectedLegalEntity.allowsNewsletter ? 'positive' : 'warning'"
                      :text-color="selectedLegalEntity.allowsNewsletter ? 'white' : 'black'" outline>
                      <q-icon :name="selectedLegalEntity.allowsNewsletter ? 'check_circle' : 'error_outline'"
                        class="q-mr-xs" size="xs" />
                      {{ selectedLegalEntity.allowsNewsletter ? 'Newsletter erlaubt' : 'Keine Newsletter' }}
                    </q-badge>
                  </div>
                  <div style="cursor: pointer;">
                    <q-badge @click="selectedLegalEntity.hasCustomerAccount = !selectedLegalEntity.hasCustomerAccount"
                      :color="selectedLegalEntity.hasCustomerAccount ? 'positive' : 'warning'"
                      :text-color="selectedLegalEntity.hasCustomerAccount ? 'white' : 'black'" outline>
                      <q-icon :name="selectedLegalEntity.hasCustomerAccount ? 'check_circle' : 'error_outline'"
                        class="q-mr-xs" size="xs" />
                      {{ selectedLegalEntity.hasCustomerAccount ? 'Kundenkonto' : 'Kein Kundenkonto' }}
                      <q-tooltip v-if="selectedLegalEntity.hasCustomerAccount">BRALE hat ein Kundenkonto bei {{
                        selectedLegalEntity.name }}</q-tooltip>
                      <q-tooltip v-if="!selectedLegalEntity.hasCustomerAccount">BRALE hat kein Kundenkonto bei {{
                        selectedLegalEntity.name }}</q-tooltip>
                    </q-badge>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-lg-3 col-12">
          <q-card class="q-pa-md full-height">
            <q-card-section class="q-pb-none">
              <div class="row items-center justify-between">
                <div class="text-h6">Firmensitz</div>
                <div>
                  <q-btn dense flat icon="content_copy" class="bg-white  q-mt-xs" size="sm"
                    @click="copyToClipboard(`${selectedLegalEntity.street} ${selectedLegalEntity.zip} ${selectedLegalEntity.city} ${mapFederalStateLabel(selectedLegalEntity.federalState)}`)"
                    :disable="!selectedLegalEntity.street || !selectedLegalEntity.zip || !selectedLegalEntity.city || !selectedLegalEntity.federalState">
                    <q-tooltip>
                      Adresse kopieren
                    </q-tooltip>
                  </q-btn>
                  <q-btn dense flat icon="place" class="bg-white q-mt-xs" size="sm"
                    @click="openInMaps(`${selectedLegalEntity.street} ${selectedLegalEntity.zip} ${selectedLegalEntity.city}`)"
                    :disable="!selectedLegalEntity.street || !selectedLegalEntity.zip || !selectedLegalEntity.city">
                    <q-tooltip>
                      Adresse in Maps öffnen
                    </q-tooltip>
                  </q-btn>
                </div>
              </div>
            </q-card-section>

            <q-card-section class="q-gutter-md">
              <q-input class="col-12" dense v-model="selectedLegalEntity.street" label="Straße & Hausnummer" />
              <q-input class="col-12" dense v-model="selectedLegalEntity.zip" label="Postleitzahl"
                :rules="[val => checkRuleZipCode(val)]" maxlength="5" hide-bottom-space />
              <q-input class="col-12" dense v-model="selectedLegalEntity.city" label="Ort" />
              <div class="col-12">
                <q-select dense emit-value map-options v-model="selectedLegalEntity.federalState"
                  :options="federalStateOptions" label="Bundesland" />
              </div>
              <q-input class="col-12" dense v-model="selectedLegalEntity.catchmentAreaRadius" label="Einzugsradius"
                suffix="KM" :rules="[val => checkRuleInteger(val)]" />
            </q-card-section>
          </q-card>
        </div>
        <div class="col-lg-6 col-12">
          <q-card class="q-pa-md full-height">
            <q-card-section class="q-pb-none">
              <div class="row items-center justify-between">
                <div class="text-h6">Kontaktdaten</div>
              </div>
            </q-card-section>

            <q-card-section class="row q-col-gutter-md">

              <!-- Primäre Email -->
              <div class="col-6">
                <q-input dense v-model="selectedLegalEntity.email" label="Email" class="full-width">
                  <template v-slot:append>
                    <q-btn flat dense icon="email" color="black" @click="mailTo(selectedLegalEntity.email)"
                      :disable="!selectedLegalEntity.email">
                      <q-tooltip>Email schreiben</q-tooltip>
                    </q-btn>
                  </template>
                </q-input>
              </div>

              <!-- Sekundäre Email -->
              <div class="col-6">
                <q-input dense v-model="selectedLegalEntity.emailSecondary" label="Email" class="full-width">
                  <template v-slot:append>
                    <q-btn flat dense icon="email" color="black" @click="mailTo(selectedLegalEntity.emailSecondary)"
                      :disable="!selectedLegalEntity.emailSecondary">
                      <q-tooltip>Email schreiben</q-tooltip>
                    </q-btn>
                  </template>
                </q-input>
              </div>

              <!-- Primäres Telefon -->
              <div class="col-6">
                <q-input dense v-model="selectedLegalEntity.mobile" label="Telefon"
                  :rules="[val => checkPhonenumber(val)]" class="full-width">
                  <template v-slot:append>
                    <q-btn flat dense icon="phone" color="black" @click="phoneTo(selectedLegalEntity.mobile)"
                      :disable="!selectedLegalEntity.mobile">
                      <q-tooltip>Anrufen</q-tooltip>
                    </q-btn>
                  </template>
                </q-input>
              </div>

              <!-- Sekundäres Telefon -->
              <div class="col-6">
                <q-input dense v-model="selectedLegalEntity.mobileSecondary" label="Telefon"
                  :rules="[val => checkPhonenumber(val)]" class="full-width">
                  <template v-slot:append>
                    <q-btn flat dense icon="phone" color="black" @click="phoneTo(selectedLegalEntity.mobileSecondary)"
                      :disable="!selectedLegalEntity.mobileSecondary">
                      <q-tooltip>Anrufen</q-tooltip>
                    </q-btn>
                  </template>
                </q-input>
              </div>

              <!-- Fax und Web -->
              <div class="col-6">
                <q-input dense v-model="selectedLegalEntity.fax" label="Fax" class="full-width" />
              </div>
              <div class="col-6">
                <q-input dense v-model="selectedLegalEntity.web" label="Web" class="full-width" />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <div class="row q-col-gutter-md items-stretch q-mt-xs">
        <div v-if="mode === 'edit'" class="col-lg-3 col-12">
          <q-card class="q-pa-md full-height">
            <q-card-section class="q-pb-none">
              <div class="row items-center justify-between">
                <div class="text-h6">Notizen</div>
              </div>
            </q-card-section>

            <q-card-section class="row q-col-gutter-md">
              <q-input flat dense type="textarea" v-model="selectedLegalEntity.notes" rows="7" class="col-12" />
            </q-card-section>
          </q-card>
        </div>

        <div v-if="mode === 'edit'" class="col-lg-4 col-12 ">
          <q-card class="q-pa-md full-height">
            <q-card-section class="q-pb-none">
              <div class="row items-center justify-between">
                <div class="text-h6">Dokumente</div>
              </div>
            </q-card-section>

            <q-card-section class="q-gutter-md">
              <div class="horizontal-scroll">
                <div v-if="selectedLegalEntity?.id">
                  <div v-for="(documentType, index) in legalEntityDocuments" :key="index"
                    class="row q-col-gutter-md items-center no-wrap" style="min-width: 600px;">
                    <div class="col-6">
                      <q-icon name="fas fa-circle" class="q-mr-sm"
                        :color="getDocumentStatusColor(selectedLegalEntity[`${documentType.type}ValidTo`])" />
                      <span>
                        {{ documentType.label }}
                      </span>
                    </div>
                    <q-input readonly v-model="selectedLegalEntity[`${documentType.type}ValidTo`]" label="Gültig bis"
                      dense mask="##.##.####" placeholder="DD.MM.YYYY" class="col-3">
                      <template v-slot:append>
                        <q-icon name="event" class="cursor-pointer" @click="$refs.startDatePicker.show()" />
                      </template>
                      <q-popup-proxy ref="startDatePicker" transition-show="scale" transition-hide="scale">
                        <q-date v-model="selectedLegalEntity[`${documentType.type}ValidTo`]" mask="DD.MM.YYYY" />
                      </q-popup-proxy>
                    </q-input>
                    <div class="col-3">
                      <fileUploader :type="documentType.type" :targetId="selectedLegalEntity.id" entity="LegalEntity"
                        :currentScopeDocuments="selectedLegalEntity.sortedDocuments[documentType.type]"
                        :documentsMetaData="selectedLegalEntity.documentMapping" :preName="documentType.fileName">
                      </fileUploader>
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div v-if="mode === 'edit'" class="col-lg-5 col-12 ">
          <q-card class="q-pa-md full-height">
            <q-card-section class="q-pb-none">
              <div class="row items-center justify-between">
                <div class="text-h6">Ansprechpartner</div>
                <div>
                  <q-btn flat dense icon="add" color="primary" @click="showCreateContactPerson = true">
                    <q-tooltip>Ansprechpartner erstellen</q-tooltip>
                  </q-btn>
                </div>
              </div>
            </q-card-section>
            <q-card-section class="q-gutter-sm">
              <div class="horizontal-scroll">
                <q-card v-for="(contactPerson, index) in selectedLegalEntity.contactPersons" :key="index"
                  class="q-pa-md q-mb-sm contact-card no-wrap" style="min-width: 600px;">
                  <div class="row items-center justify-between">

                    <div class="row items-center col">
                      <q-btn flat round dense icon="account_circle"
                        :color="contactPerson.isMainContact ? 'primary' : 'black'"
                        @click.stop="selectedContactPerson = contactPerson.person; setMainContact()">
                        <q-tooltip v-if="contactPerson.isMainContact">Hauptansprechpartner</q-tooltip>
                        <q-tooltip v-else>
                          {{ contactPerson.person.firstName }} {{ contactPerson.person.lastName }} als
                          Hauptansprechpartner setzen!
                        </q-tooltip>
                      </q-btn>

                      <div class="q-ml-md">
                        <div class="text-subtitle2 q-mb-xs"
                          @click="selectedContactPerson = contactPerson.person; showUpdateContactPerson = true"
                          style="cursor: pointer;">
                          {{ contactPerson.person.title }} {{ contactPerson.person.firstName }}
                          {{ contactPerson.person.lastName }}
                        </div>

                        <div class="row items-center q-gutter-md contact-group">
                          <div v-if="contactPerson.person.mobile" class="row items-center no-wrap">
                            <q-icon name="phone" size="18px" class="q-mr-sm" />
                            <a :href="`tel:${contactPerson.person.mobile}`">
                              {{ contactPerson.person.mobile }}
                            </a>
                          </div>

                          <div v-if="contactPerson.person.email" class="row items-center">
                            <q-icon name="email" size="18px" class="q-mr-sm" />
                            <a :href="`mailto:${contactPerson.person.email}`">
                              {{ contactPerson.person.email }}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Rechter Block: Löschen -->
                    <div class="col-auto">
                      <q-btn flat dense icon="delete_outline"
                        @click.stop="selectedContactPerson = contactPerson.person; showDeleteConfirmation = true">
                        <q-tooltip>Löschen</q-tooltip>
                      </q-btn>
                    </div>
                  </div>
                </q-card>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
      <div class="row q-col-gutter-md items-stretch q-mt-xs">
        <div v-if="mode === 'edit'" class="col-lg-4 col-12">
          <q-card class="q-pa-md full-height">
            <q-card-section class="q-pb-none">
              <div class="row items-center justify-between">
                <div class="text-h6">Verfügbarkeit</div>
              </div>
            </q-card-section>

            <q-card-section class="row q-col-gutter-md">
              <q-input class="col-6" dense v-model="selectedLegalEntity.maxOrdersPerYear" label="Maximale Aufträge/Jahr"
                :rules="[val => checkRuleInteger(val)]" />
              <q-input class="col-6" dense v-model="selectedLegalEntity.housesInReserve" label="Häuser Reserve"
                :rules="[val => checkRuleInteger(val)]" />
              <q-input class="col-6" dense v-model="selectedLegalEntity.teamsCount" label="Anzahl Teams"
                :rules="[val => checkRuleInteger(val)]" />
              <q-input class="col-6" dense v-model="selectedLegalEntity.virtualTeamsCount"
                label="Anzahl virtuelle Teams" :rules="[val => checkRuleInteger(val)]" />
            </q-card-section>
          </q-card>
        </div>
        <div v-if="mode === 'edit'" class="col-lg-4 col-12">
          <q-card class="q-pa-md full-height">
            <q-card-section class="q-pb-none">
              <div class="row items-center justify-between">
                <div class="text-h6">Zahlungsdaten</div>
              </div>
            </q-card-section>
            <q-card-section class="row q-col-gutter-md">
              <q-input class="col-6" dense v-model="selectedLegalEntity.nameOfBank" label="Name der Bank" />
              <q-input class="col-6" dense v-model="selectedLegalEntity.iban" label="IBAN" />
              <q-input class="col-6" dense v-model="selectedLegalEntity.bic" label="BIC" />
              <q-input class="col-6" dense v-model="selectedLegalEntity.cashDiscount" label="Skonto"
                :rules="[val => checkRuleInteger(val, 0, 100)]" suffix="%" />
              <q-input class="col-6" dense v-model="selectedLegalEntity.paymentPeriod" label="Zahlungsfrist"
                suffix="Tage" :rules="[val => checkRuleInteger(val)]" />
              <q-input class="col-6" dense v-model="selectedLegalEntity.paymentPersiodDiscount"
                :rules="[val => checkRuleInteger(val)]" suffix="Tage" label="Zahlungsfrist bei Skonto" />
            </q-card-section>
          </q-card>
        </div>
      </div>
    </q-form>
  </div>
  <div v-if="mode === 'edit' && !selectedLegalEntity.id" class="flex flex-center q-pa-md" style="min-height: 200px;">
    <span class="text-h6 text-center">
      Juristische Person konnte nicht geladen werden
    </span>
  </div>
  <!-- Direkt unter deinem <q-form> einfügen -->
  <div v-if="mode === 'create' && dublicatedLegalEntities && dublicatedLegalEntities.length" class="q-pa-md">
    <q-card>
      <q-card-section class="row items-center">
        <div class="text-h6">Dubletten</div>
      </q-card-section>
      <q-card-section class="items-center">
        <div class="row text-subtitle2">
          <div class="col-4">Name</div>
          <div class="col-4">Adresse</div>
          <div class="col-4">Kontaktdaten</div>
        </div>
        <q-separator />
        <div class="overflow-y-auto" style="max-height: 300px;">
          <div class="row items-center q-py-sm" v-for="entity in dublicatedLegalEntities" :key="entity.id">
            <!-- Spalte 1: Name + Link-Button -->
            <div class="col-4 row items-center no-wrap">
              <q-btn flat dense round icon="open_in_new" class="q-mr-sm"
                @click="$router.push(`/subcontractor/${entity.id}`)" />
              <span>{{ entity.name }}</span>
            </div>

            <!-- Spalte 2: Adresse -->
            <div class="col-4">
              {{ entity.street }} {{ entity.zip }} {{ entity.city }}
            </div>

            <!-- Spalte 3: Kontaktdaten -->
            <div class="col-4">
              <div v-if="entity.mobile" class="row items-center no-wrap">
                <q-icon name="phone" class="q-mr-xs" />
                <span>{{ entity.mobile }}</span>
              </div>
              <div v-if="entity.email" class="row items-center no-wrap q-mt-xs">
                <q-icon name="email" class="q-mr-xs" />
                <span>{{ entity.email }}</span>
              </div>
            </div>

            <q-separator />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
  <div v-if="mode === 'create'">
    <q-btn class="q-ma-md" flat dense color="primary"
      :disable="!selectedLegalEntity.name || !selectedLegalEntity.type || !selectedLegalEntity.businessRelation"
      icon="add" label="Erstellen" @click="checkCreateNewLegalEntity()">
      <q-tooltip
        v-if="!selectedLegalEntity.name || !selectedLegalEntity.type || !selectedLegalEntity.businessRelation">Bitte
        trage einen Namen sowie die Art und die Geschäftsbeziehung der Juristischen Person ein, um diese zu
        erstellen!</q-tooltip>
    </q-btn>
  </div>

  <q-dialog v-model="showCreateContactPerson">
    <q-card style="min-width: 90vw; min-height: 90vh;">
      <q-card-section class="row items-center">
        <div class="text-h6">Ansprechpartner hinzufügen</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section>
        <contactPerson mode="create" :legalEntityId="selectedLegalEntity.id"></contactPerson>
      </q-card-section>
    </q-card>
  </q-dialog>
  <q-dialog v-model="showDublicateWarning">
    <q-card class="q-pa-md">
      <!-- Header -->
      <q-card-section class="row items-center">
        <q-icon name="warning" color="orange" class="q-mr-sm" size="sm" />
        <div class="text-h6">Warnung</div>
      </q-card-section>

      <!-- Warntext -->
      <q-card-section class="q-pt-none">
        <div class="text-body1">
          Zu Deinen Eingaben wurden
          <strong>{{ dublicatedLegalEntities.length }}</strong>
          passende Ergebnisse gefunden.
          Bist du dir sicher, dass du diese juristische Person dennoch neu erstellen möchtest?
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat dense label="Abbrechen" color="negative" @click="showDublicateWarning = false" />
        <q-btn flat dense label="Erstellen" color="primary" @click="createLegalEntity()" />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-dialog v-model="showUpdateContactPerson">
    <q-card>
      <q-card-section class="row items-center">
        <div class="text-h6">{{ selectedContactPerson.firstName }} {{ selectedContactPerson.lastName }} bearbeiten</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section>
        <contactPerson mode="edit" :contactPerson="selectedContactPerson" :legalEntityId="selectedLegalEntity.id">
        </contactPerson>
      </q-card-section>
    </q-card>
  </q-dialog>
  <q-dialog v-model="showDeleteConfirmation">
    <q-card>
      <q-card-section class="row items-center">
        <div class="text-h6">{{ selectedContactPerson.firstName }} {{ selectedContactPerson.lastName }} entfernen?</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat dense label="Abbrechen" color="primary" @click="showDeleteConfirmation = false" />
        <q-btn flat dense label="Entfernen" color="red" @click="removeContactPerson()" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, ref, onMounted, watch, inject } from 'vue'
import { useRoute, useRouter } from "vue-router"
import { useQuasar, date } from 'quasar'
import fileUploader from '../file-uploader/file-uploader.vue'

import {
  getBusinessRelationOptions,
  getLegalTypeOptions,
  getLegalEntityPayload,
  getLegalEntityDocuments,
  getDocumentStatusColor
} from './helper.js'

import {
  copyToClipboard,
  openInMaps,
  phoneTo,
  mailTo,
  getChecksumOfObject
} from 'components/common/helper.js'

import {
  getFederalStateOptions,
  mapFederalStateLabel,
  getTradeOptions
} from 'components/common/options.js'

import {
  checkRuleZipCode,
  checkPhonenumber,
  checkRuleInteger
} from 'components/common/input.js'

import { api } from 'boot/axios'

import contactPerson from './contactPerson.vue'

export default defineComponent({
  name: 'tableLegalEntities',

  props: [
    'mode',
    'relation'
  ],
  components: {
    contactPerson,
    fileUploader
  },

  setup(props) {
    const bus = inject('bus')
    const q = useQuasar()
    const route = useRoute()
    const router = useRouter()

    const legalEntityForm = ref(null)
    const selectedLegalEntity = ref({
      businessRelation: props.relation,
      isActive: true
    })
    const businessRelationOptions = getBusinessRelationOptions()
    const legalOptions = getLegalTypeOptions()
    const federalStateOptions = getFederalStateOptions()
    const tradeOptions = getTradeOptions()
    const currentHash = ref()
    const showDublicateWarning = ref(false)
    let timer = null
    const dublicatedLegalEntities = ref([])
    const showCreateContactPerson = ref(false)

    const showUpdateContactPerson = ref(false)
    const selectedContactPerson = ref()

    const showDeleteConfirmation = ref(false)
    const legalEntityDocuments = getLegalEntityDocuments()


    async function getLegalEntityById() {
      if (props.mode !== 'edit') return

      const params = {
        method: 'GET',
        url: `/joerg/legal-entity/${route.params.id}`,
        withCredentials: true
      }
      const result = await api(params).catch(e => { console.log(e) })
      if (!result) {
        q.notify({
          color: 'negative',
          message: 'Juritstische Person konnte nicht geladen werden. Probiere es bitte später erneut!',
        })
        return
      }
      selectedLegalEntity.value = Object.assign(result.data,
        result.data.documents.reduce((acc, document) => {
          acc.sortedDocuments[document.documentTypeId].push(document.id)
          acc.documentMapping[document.id] = document
          return acc
        }, {
          sortedDocuments: {
            ...legalEntityDocuments.reduce((acc, doc) => {
              acc[doc.type] = []
              return acc
            }, {})
          },
          documentMapping: {}
        }),
        legalEntityDocuments.reduce((acc, doc) => {
          const dateValue = result.data[`${doc.type}ValidTo`]
          if (!dateValue) return acc
          acc[`${doc.type}ValidTo`] = date.formatDate(dateValue, 'DD.MM.YYYY')
          return acc
        }, {})
      )
      currentHash.value = getChecksumOfObject(result.data, ['documents', 'sortedDocuments', 'contactPersons'])
    }

    async function updateLegalEntity() {
      const isValid = await legalEntityForm.value.validate()
      if (!isValid) {
        q.notify({
          color: 'negative',
          message: 'Bitte überprüfe alle markierten Felder.'
        })
        return
      }
      const newHashValue = getChecksumOfObject(selectedLegalEntity.value, ['documents', 'sortedDocuments', 'contactPersons'])
      if (newHashValue === currentHash.value) return

      const params = {
        url: `/joerg/legal-entity/${selectedLegalEntity.value.id}`,
        method: 'PATCH',
        withCredentials: true,
        data: getLegalEntityPayload(selectedLegalEntity.value)

      }
      const result = await api(params).catch(() => { })
      if (!result) {
        q.notify({
          color: 'negative',
          message: 'Juritstische Person konnte nicht aktualisiert werden. Probiere es bitte später erneut!',
        })
        return
      }
    }

    async function searchDublicatedLegalEntities() {
      const params = {
        url: `/joerg/legal-entity?search=${selectedLegalEntity.value.name}`,
        method: 'GET',
        withCredentials: true
      }
      const result = await api(params).catch(() => { })
      if (!result) {
        q.notify({
          color: 'negative',
          message: 'Es konnte nicht nach Dubletten gesucht werden. Probiere es bitte später erneut!'
        })
        return
      }
      dublicatedLegalEntities.value = result.data
    }

    function checkCreateNewLegalEntity() {
      if (dublicatedLegalEntities.value.length > 0) {
        showDublicateWarning.value = true
        return
      }
      return createLegalEntity()
    }

    async function createLegalEntity() {
      const params = {
        method: 'POST',
        url: '/joerg/legal-entity',
        data: getLegalEntityPayload(selectedLegalEntity.value),
        withCredentials: true
      }
      const result = await api(params).catch(() => { })
      if (!result) {
        q.notify({
          color: 'negative',
          message: 'Juristische Person konnte nicht erstellt werden. Probiere es bitte später erneut!'
        })
        return
      }
      q.notify({
        color: 'positive',
        message: 'Juristische Person wurde erstellt!'
      })
      router.push(`/subcontractor/${result.data.id}`)
    }

    async function removeContactPerson() {
      const params = {
        method: 'DELETE',
        url: `/joerg/legal-entity/${selectedLegalEntity.value.id}/contact-person/${selectedContactPerson.value.id}`,
        withCredentials: true
      }
      const result = await api(params).catch(() => { })
      showDeleteConfirmation.value = false
      if (!result) {
        q.notify({
          color: 'negative',
          message: 'Ansprechpartner konnte nicht entfernt werden. Probiere es bitte später erneut!'
        })
        return
      }
      q.notify({
        color: 'positive',
        message: 'Ansprechpartner wurde entfernt!'
      })
      selectedLegalEntity.value.contactPersons = selectedLegalEntity.value.contactPersons.filter(assignment => assignment.person.id !== selectedContactPerson.value.id)
    }

    async function setMainContact() {
      const params = {
        method: 'PATCH',
        url: `/joerg/legal-entity/${selectedLegalEntity.value.id}/contact-person/${selectedContactPerson.value.id}`,
        withCredentials: true
      }
      const result = await api(params).catch(() => { })
      showDeleteConfirmation.value = false
      if (!result) {
        q.notify({
          color: 'negative',
          message: 'Ansprechpartner konnte nicht als Hauptansprechpartner gesetzt werden. Probiere es bitte später erneut!'
        })
        return
      }
      q.notify({
        color: 'positive',
        message: 'Ansprechpartner wurde als Hauptansprechpartner gesetzt!'
      })
      selectedLegalEntity.value.contactPersons = selectedLegalEntity.value.contactPersons.map(assignment => {
        if (assignment.person.id === selectedContactPerson.value.id) {
          assignment.isMainContact = true
          return assignment
        }
        assignment.isMainContact = false
        return assignment
      })
    }

    onMounted(async () => {
      await getLegalEntityById()
    })

    bus.on(`add-new-contact-person-${route.params.id}`, (contactPerson) => {
      selectedLegalEntity.value.contactPersons.push({ person: contactPerson })
      showCreateContactPerson.value = false
    })

    watch(
      () => selectedLegalEntity.value,
      () => {
        if (props.mode !== 'edit') return
        clearTimeout(timer)
        timer = setTimeout(() => {
          updateLegalEntity()
        }, 500)
      },
      { deep: true }
    )

    watch(
      () => selectedLegalEntity.value.name,
      () => {
        if (props.mode !== 'create') return
        clearTimeout(timer)
        timer = setTimeout(() => {
          searchDublicatedLegalEntities()
        }, 500)
      },
      { deep: true }
    )
    return {
      selectedLegalEntity,
      businessRelationOptions,
      legalOptions,
      federalStateOptions,
      legalEntityForm,
      tradeOptions,
      dublicatedLegalEntities,
      showDublicateWarning,
      showCreateContactPerson,
      showUpdateContactPerson,
      selectedContactPerson,
      showDeleteConfirmation,
      date,
      legalEntityDocuments,
      phoneTo,
      mailTo,
      mapFederalStateLabel,
      copyToClipboard,
      openInMaps,
      checkRuleZipCode,
      checkPhonenumber,
      checkRuleInteger,
      checkCreateNewLegalEntity,
      createLegalEntity,
      removeContactPerson,
      setMainContact,
      getDocumentStatusColor
    }
  }
})
</script>
<style scoped>
.contact-scroll-wrapper {
  overflow-x: auto;
}

.name-group span {
  margin-right: 0.75rem;
}

.contact-group a {
  text-decoration: none;
  color: inherit;
}

.contact-group a:hover {
  text-decoration: underline;
}

.q-mt-none {
  margin-top: 0 !important;
}

.contact-card {
  border-bottom: 1px solid lightgray;
  box-shadow: none;
}

.contact-card:hover {
  background-color: rgba(35, 160, 223, 0.1);
}

</style>