<template>
  <q-form ref="contactPersonForm" class="row q-col-gutter-md q-mx-md">
    <div class="row q-col-gutter-md">
      <div class="col-6">
        <q-card class="q-pa-md">
          <div class="text-h6 ">Allgemeines</div>
          <q-card-section>
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <q-select dense emit-value map-options v-model="person.title" :options="titleOptions" label="Anrede" />
              </div>
              <div class="col-12">
                <q-input dense v-model="person.namePrefix" label="Namenszusatz" />
              </div>
              <div class="col-12">
                <q-input dense v-model="person.firstName" label="Vorname" />
              </div>
              <div class="col-12">
                <q-input dense v-model="person.lastName" label="Nachname" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6">
        <q-card class="q-pa-md full-height">
          <div class="text-h6">Kontaktdaten</div>
          <q-card-section>
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <q-input dense v-model="person.mobile" label="Telefon"
                  :rules="[val => checkPhonenumber(val)]"></q-input>
              </div>
              <div class="col-12">
                <q-input dense v-model="person.email" label="Email" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div v-if="mode==='create'" class="col-12 row justify-end">
        <q-btn :disable="!isInputComplete()" flat dense color="primary" label="Erstellen" @click="createContactPerson()"></q-btn>
      </div>
    </div>
  </q-form>

</template>

<script>
import { defineComponent, ref, inject, watch } from 'vue'
//import { useRoute, useRouter } from "vue-router"
import { useQuasar } from 'quasar'

import {
  getContactPersonPayload
} from './helper.js'

import {
} from 'components/common/helper.js'

import {
  getTitleOptions
} from 'components/common/options.js'

import {
  checkPhonenumber
} from 'components/common/input.js'

import { api } from 'boot/axios'

export default defineComponent({
  name: 'tableLegalEntities',

  props: [
    'mode',
    'legalEntityId',
    'contactPerson'
  ],

  setup(props) {
    const bus = inject('bus')
     const q = useQuasar()
    // const route = useRoute()
    // const router = useRouter()
    const titleOptions = getTitleOptions()
    const person = ref(props.contactPerson || {})
    const contactPersonForm = ref(null)
    const currentHash = props.person ? ref(JSON.stringify(props.person)): ref()
    let timer = null

    async function createContactPerson(){
      const isValid = await contactPersonForm.value.validate()
      if (!isValid) {
        q.notify({
          color: 'negative',
          message: 'Bitte überprüfe alle markierten Felder.'
        })
        return
      }

      const params = {
        method: 'POST',
        url: `/joerg/legal-entity/${props.legalEntityId}/contact-person`,
        withCredentials: true,
        data: getContactPersonPayload(person.value)
      }

      const result = await api(params).catch(()=>{})
      if(!result){
         q.notify({
          color: 'negative',
          message: 'Ansprechpartner konnte nicht erstellt werden. Bitte probiere es später erneut!'
        })
        return
      }
      bus.emit(`add-new-contact-person-${props.legalEntityId}`, result.data)
      q.notify({
        color: 'positive',
        message: 'Ansprechpartner wurde erstellt!'
      })
    }

    function isInputComplete  (){
      return person.value.title && person.value.firstName && person.value.lastName
    }

    async function updatePerson(){
      const isValid = await contactPersonForm.value.validate()
      if (!isValid || !isInputComplete()) {
        q.notify({
          color: 'negative',
          message: 'Bitte überprüfe alle markierten Felder.'
        })
        return
      }
      const newHashValue = JSON.stringify(person.value)
      if (newHashValue === currentHash.value) return

      const params = {
        method: 'patch',
        url: `/joerg/person/${person.value.id}`,
        withCredentials: true,
        data: getContactPersonPayload(person.value)
      }

      const result = await api(params).catch(() => { })
      if (!result) {
        q.notify({
          color: 'negative',
          message: 'Ansprechpartner konnte nicht aktualisiert werden. Bitte probiere es später erneut!'
        })
        return
      }
    }
 
    watch(
      () => person.value,
      () => {
        if (props.mode !== 'edit') return
        clearTimeout(timer)
        timer = setTimeout(() => {
          updatePerson()
        }, 500)
      },
      { deep: true }
    )

    return {
      person,
      titleOptions,
      contactPersonForm,
      checkPhonenumber,
      createContactPerson,
      isInputComplete
    }
  }
})
</script>