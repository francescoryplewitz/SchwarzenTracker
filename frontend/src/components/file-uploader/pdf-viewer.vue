<template>
    <q-card>
        <q-card-section class="q-pa-none">
            <div class="row justify-end">
                <q-btn dense flat icon="close" v-close-popup />
            </div>
        </q-card-section>
        <q-card-section>
            <div class="pdf-detail-view">
                <div v-if="selectedImage.content" style="min-height: 100vh;">
                    <pdf :src="selectedImage.content" style="min-height: 90vh;" class="pdf-page"></pdf>
                </div>
            </div>
        </q-card-section>
    </q-card>

</template>

<script>
import { ref, defineComponent } from 'vue';
import pdf from 'pdf-vue3'

export default defineComponent({
    name: 'pdfDetailView',
    components: {
        pdf
    },
    props: ['image'],

    setup(props) {
        const selectedImage = ref(props.image);
       
        return {
            selectedImage
        };
    }
});
</script>

<style scoped>
.pdf-detail-view {
    width: 100%;
    height: 100%;
}

.pdf-container {
    width: 100%;
    overflow-y: auto;
}

.pdf-page {
    margin: 10px auto;
    display: block;
    max-width: 100%;
}

.loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
}

@media (max-width: 1025px) {
    .pdf-container {
        max-height: 60vh;
    }

    .pdf-page {
        width: 100%;
    }
}
</style>