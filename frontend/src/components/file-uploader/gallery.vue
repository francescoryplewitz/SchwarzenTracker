<template>
    <div v-if="currentScopeDocuments" class="gallery-container">
        <div v-for="(item, index) in galleryPreview" :key="index" class="gallery-item"
            :class="{ 'cursor-pointer': item.content && ['pdf', 'jpg', 'jpeg', 'png'].includes(item.mimeType) }"
            @click="item.content && ['pdf', 'jpg', 'jpeg', 'png'].includes(item.mimeType) ? openDetailView(item) : null">
            <div class="image-wrapper">
                <q-spinner v-if="!item.content" color="grey-5" size="lg" />

                <q-btn v-if="item.content" flat dense round icon="close" class="close-button" @click.stop
                    @click="deleteFile(item.id)" />

                <!-- Bild anzeigen, sobald es geladen wurde -->
                <img v-if="item.content && isImageMimeType(item.mimeType)" :src="item.content" class="gallery-image"
                    alt="Gallery Image" />


                <img v-if="item.content && ['pdf'].includes(item.mimeType)" src="~/assets/pdf-preview.png"
                    class="gallery-doc" alt="File Preview" />

                <img v-if="item.content && ['docx'].includes(item.mimeType)" src="~/assets/word-placeholder.png"
                    class="gallery-doc" alt="File Preview" />

                <img v-if="item.content && ['pptx'].includes(item.mimeType)" src="~/assets/powerpoint-placeholder.png"
                    class="gallery-doc" alt="File Preview" />

                <img v-if="item.content && ['xlsx'].includes(item.mimeType)" src="~/assets/excel-placeholder.png"
                    class="gallery-doc" alt="File Preview" />

                <img @click="console.log(item.mimeType)"
                    v-if="item.content && !['pdf', 'jpg', 'jpeg', 'png', 'docx', 'pptx', 'xlsx'].includes(item.mimeType)"
                    src="~/assets/file-placeholder.png" class="gallery-doc" alt="File Preview" />
            </div>

            <!-- Datei-Name unterhalb des Bildes -->
            <p class="file-name">{{ item.fileName }}</p>
        </div>
        <div v-if="galleryPreview.length < currentScopeDocuments.length" class="gallery-item load-more"
            @click=" loadNextGalleryFiles()">
            <div class="image-wrapper">
                <div class="load-more-content">
                    <q-icon class="q-mb-md" name="add" size="lg" />
                    <div>Weitere Dateien laden</div>
                    <div>{{ galleryPreview.length }} / {{ currentScopeDocuments.length }}</div>
                </div>
            </div>
        </div>
    </div>
    <q-dialog v-model="showImageViewer" full-width full-height persistent>
        <imageDetailView v-if="['jpg', 'jpeg', 'png'].includes(selectedImage.mimeType)" :image="selectedImage">
        </imageDetailView>
        <pdfViewer v-if="['pdf'].includes(selectedImage.mimeType)" :image="selectedImage">
        </pdfViewer>

    </q-dialog>
</template>

<script>
import { ref, defineComponent, inject } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios'
import { mapTargetEntitySaveEvent } from 'components/file-uploader/common';
import imageDetailView from 'components/file-uploader/image-detail.vue'
import pdfViewer from 'components/file-uploader/pdf-viewer.vue';

export default defineComponent({
    name: 'galleryView',
    props: [
        'documentsMetaData',
        'currentScopeDocuments',
        'entity',
        'targetId'
    ],
    components: {
        imageDetailView,
        pdfViewer
    },

    setup(props) {
        const $q = useQuasar();
        const bus = inject('bus')

        const documentStore = ref(props.currentScopeDocuments)
        const metaData = ref(props.documentsMetaData)

        const selectedImage = ref(null)
        const showImageViewer = ref(false)

        const galleryPagination = ref({
            currentIndex: 0,
        })
        const gallery = ref({})
        const galleryPreview = ref([])

        async function getGalleryPreview(id, index) {
            const result = await api.get(`/media/document/${id}/content?isPreview=true`, {
                withCredentials: true,
            })
            gallery.value[id].content = `data:${getMimeType(gallery.value[id].mimeType)};base64,${result.data}`
            galleryPreview.value[index].content = `data:${getMimeType(gallery.value[id].mimeType)};base64,${result.data}`
        }

        function loadNextGalleryFiles() {
            const currentScope = documentStore.value.slice(galleryPagination.value.currentIndex, galleryPagination.value.currentIndex + 5)
            currentScope.forEach((id) => {
                galleryPreview.value.push(gallery.value[id])
                getGalleryPreview(id, galleryPreview.value.length - 1)
            })
            galleryPagination.value.currentIndex += 5
        }

        function addDocumentsAfterUpload(documents) {
            galleryPagination.value.currentIndex += documents.length
            documents.forEach((doc) => {
                gallery.value[doc.id] = {
                    id: doc.id,
                    fileName: doc.fileName,
                    mimeType: doc.fileName.split('.').pop(),
                    content: doc.content,
                    isPreview: true
                }
                galleryPreview.value.unshift(gallery.value[doc.id])
            })
        }

        function getMimeType(ext) {
            switch (ext) {
                case '.png': return 'image/png';
                case '.jpg': case '.jpeg': return 'image/jpeg';
                case '.gif': return 'image/gif';
                default: return 'application/octet-stream';
            }
        }

        async function deleteFile(id) {
            const params = {
                method: 'DELETE',
                url: `/media/document/${id}`,
                withCredentials: true
            }
            const result = await api(params).catch(() => { })
            if (!result) {
                $q.notify({
                    type: 'negative',
                    message: 'Datei konnte nicht gelöscht werden!',
                });
                return
            }
            const documentStoreIndex = documentStore.value.findIndex(doc => doc === id);
            documentStore.value.splice(documentStoreIndex, 1)
            delete gallery.value[id]
            galleryPreview.value = galleryPreview.value.filter(item => item.id !== id)
            galleryPagination.value.currentIndex -= 1
            bus.emit(mapTargetEntitySaveEvent(props.entity))
            $q.notify({
                type: 'positive',
                message: 'Datei wurde gelöscht!',
            });
        }


        function init() {
            gallery.value = documentStore.value.reduce((acc, document) => {
                acc[document] = {
                    id: document,
                    fileName: metaData.value[document].fileName,
                    mimeType: metaData.value[document].fileName.split('.').pop(),
                    content: undefined,
                    description: metaData.value[document].description,
                    isPreview: true
                }
                return acc;
            }, {})

            loadNextGalleryFiles()
        }

        function openDetailView(item) {
            selectedImage.value = item
            showImageViewer.value = true
        }

        function isImageMimeType(mimeType) {
            return mimeType === 'png' || mimeType === 'jpeg' || mimeType === 'jpg'
        }

        return {
            gallery,
            galleryPreview,
            galleryPagination,
            selectedImage,
            showImageViewer,
            loadNextGalleryFiles,
            deleteFile,
            init,
            addDocumentsAfterUpload,
            openDetailView,
            isImageMimeType
        }
    }
})
</script>

<style scoped>
.gallery-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: flex-start;
    padding: 10px;
}

.gallery-item {
    width: calc(33.333% - 10px);
    /* 3 Bilder pro Zeile */
    display: flex;
    flex-direction: column;
    align-items: center;
}

.image-wrapper {
    width: 100%;
    aspect-ratio: 1 / 1;
    position: relative;
    /* Neu hinzugefügt */
    background: #e0e0e0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    overflow: hidden;
}

.gallery-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.gallery-doc {
    width: 128px;
    height: 128px;
}

.file-name {
    font-size: 12px;
    color: #666;
    margin-top: 5px;
    text-align: center;
    word-wrap: break-word;
}

.load-more {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.1);
    cursor: pointer;
    border-radius: 8px;
    transition: background 0.3s;
}

.load-more:hover {
    background: rgba(0, 0, 0, 0.2);
}

.load-more-content {
    text-align: center;
    color: #666;
}

.load-more-content p {
    margin-top: 8px;
    font-size: 14px;
}

.close-button {
    position: absolute;
    top: 8px;
    /* Leicht angepasst */
    right: 8px;
    /* Leicht angepasst */
    background: rgba(0, 0, 0, 0.6);
    /* Leicht dunkler für bessere Sichtbarkeit */
    color: white;
    z-index: 10;
}
@media screen and (max-width: 768px) {
    .gallery-item {
        width: calc(50% - 10px);
        /* 2 Bilder pro Zeile */
    }
}

/* Media Query für Handys (1 Bild pro Zeile) */
@media screen and (max-width: 480px) {
    .gallery-item {
        width: 100%;
        /* 1 Bild pro Zeile */
    }
.gallery-container {
    padding-bottom: 150px;
}
}
</style>
