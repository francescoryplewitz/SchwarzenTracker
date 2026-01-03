<template>
    <q-card flat bordered class="q-mx-auto q-my-xl" style="max-width: 600px;">
        <q-card-section class="text-center bg-white q-pa-lg">
            <div class="text-h5 text-primary q-mb-sm">
                Willkommen {{ user.firstName }} {{ user.lastName }}
            </div>
            <div class="text-subtitle1 q-mb-md">
                Hier entsteht das neue <strong class="text-primary">BRALE HUB "JÖRG"</strong>
            </div>
            <div>
                Zukünftig bekommst du hier die Möglichkeit zur <span class="text-primary">Verwaltung von
                    Subunternehmern</span>
                sowie des <span class="text-primary">Bauablaufsplans</span> aller BRALE Unternehmungen.
            </div>
        </q-card-section>
    </q-card>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import { LocalStorage } from 'quasar'

export default defineComponent({
    name: 'IntroComponent',
    setup() {
        const user = ref({ firstName: '', lastName: '' })

        onMounted(() => {
                const stored = LocalStorage.getItem('user')
                if (stored) {
                    user.value = typeof stored === 'string'
                        ? JSON.parse(stored)
                        : stored
                }
        })

        return { user }
    }
})
</script>

<style scoped>
/* Karte weißer Hintergrund und dezenter Schatten */
q-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
</style>