<template>
    <div>
        <q-btn @click="showDragDrop = true" flat dense :icon="getUploadIcon()" :color="getUploadIconColor()"
            :label="currentDocuments.length" :size="`${iconSize ? iconSize : '14px'}`" />

        <q-dialog v-model="showDragDrop">
            <q-card style="min-width:80vw" class="q-pa-md">
                <div class="row q-mb-md">
                    <div class="text-h6">Sharepoint Uploader</div>
                    <q-space />
                    <q-btn icon="close" flat round dense v-close-popup />

                </div>
                <q-banner class="bg-grey-3 q-mb-md">
                    <template v-slot:avatar>
                        <q-icon name="info" color="primary" size="md" class="q-mt-xs" />
                    </template>
                    <div>
                        Lade hier Dokumente direkt in den Sharepoint Projektordner hoch. Nach dem Upload findest du
                        links
                        unter "Dokumente" einen Link zur Datei!
                    </div>
                </q-banner>
                <div class="row q-col-gutter-md">
                    <!-- Linker Bereich: Hochgeladene Dateien -->
                    <div class="col-12 col-lg-4 self-stretch">
                        <q-card class="fit">
                            <q-card-section>
                                <div class="row justify between">
                                    <div class="text-h6 q-mb-md">Dokumente ({{ currentDocuments.length }})</div>
                                    <div>
                                        <q-icon style="cursor: pointer;" name="event_available"
                                            @click="showOutdatedDocuments = !showOutdatedDocuments" size="sm"
                                            class="q-ml-sm q-mt-xs">
                                            <q-tooltip v-if="!showOutdatedDocuments">Veraltete Dokumente
                                                anzeigen!</q-tooltip>
                                            <q-tooltip v-if="showOutdatedDocuments">Veraltete Dokumente
                                                ausblenden!</q-tooltip>
                                        </q-icon>
                                    </div>
                                </div>
                            </q-card-section>
                            <q-card-section>
                                <div v-for="(document, index) in currentDocuments" :key="index"
                                    class="file-item q-mb-xs">
                                    <div v-if="showOutdatedDocuments || document.isRecent"
                                        class="row items-center justify-between q-pa-sm ">
                                        <!-- Icon für den SharePoint-Link -->
                                        <q-btn style="cursor: pointer;" @click="goTo(document.sharepointLink)" flat
                                            dense size="sm" class="q-mr-md">
                                            <q-avatar style="cursor: pointer;" size="25px">
                                                <img style="cursor: pointer;" src="~assets/icons/sharepoint.png" />
                                            </q-avatar>
                                            <q-tooltip anchor="top middle" :offset="[10, 10]">
                                                Zum Dokument in SharePoint öffnen
                                            </q-tooltip>
                                        </q-btn>

                                        <!-- Dokumentenname mit Tooltip -->
                                        <span v-if="selectedDocument?.id !== document.id"
                                            @contextmenu="(event) => { event.preventDefault(); selectedDocument = document; }"
                                            class="file-name text-body1 text-weight-medium q-mr-auto">
                                            {{ document.fileName }}
                                        </span>
                                        <span v-if="selectedDocument?.id === document.id"
                                            class="file-name text-body1 text-weight-medium q-mr-auto">
                                            <q-input v-model="selectedDocument.fileName"
                                                :rules="[(val) => checkRuleSharepointFileName(val)]"
                                                @blur="renameSharepointDocument()"></q-input>
                                        </span>


                                        <!-- Status-Icon mit Tooltip -->
                                        <q-icon @click="setIsRecent(document)"
                                            :name="document.isRecent ? 'check' : 'warning'"
                                            :color="document.isRecent ? 'positive' : 'warning'" size="sm"
                                            class="q-mr-sm" style="cursor: pointer;">
                                            <q-tooltip anchor="top middle" :offset="[10, 10]">
                                                <div class="row">
                                                    {{
                                                    document.isRecent ? 'Dokument ist aktuell' : 'Dokument ist veraltet'
                                                    }}
                                                </div>
                                                <div class="row">
                                                    {{
    document.isRecent ?
        'Klicke um das Dokument als veraltet zu markieren!'
        :
        'Klicke um das Dokument als aktuell zu markieren!'
}}
                                                </div>
                                            </q-tooltip>
                                        </q-icon>
                                    </div>
                                </div>
                            </q-card-section>
                        </q-card>
                    </div>

                    <!-- Rechter Bereich: Upload -->
                    <div class="col-12 col-lg-8 self-stretch">
                        <q-card class="fit">
                            <q-card-section>
                                <div class="row items-center justify-between">
                                    <div class="row">
                                        <div class="text-h6">Upload</div>
                                        <q-input :rules="[(val) => checkRuleSharepointFileName(val)]"
                                            v-model="altFileName"
                                            style="margin-top: -3px;padding: 0px !important; min-width: 250px;"
                                            class="q-ml-md" flat dense :placeholder="fileName">
                                            <q-tooltip>Eingabe eines alternativen Dateinamen!</q-tooltip>
                                        </q-input>
                                    </div>

                                    <q-icon style="cursor: pointer;" :color="`${isSignedUpload ? 'primary' : 'black'}`"
                                        @click="isSignedUpload = !isSignedUpload" name="draw" size="sm">
                                        <q-tooltip v-if="!isSignedUpload">Dokument ist nicht unterschrieben. Klicke
                                            um
                                            das Dokument als
                                            unterschrieben zu markieren!</q-tooltip>
                                        <q-tooltip v-if="isSignedUpload">Dokument ist unterschrieben. Klicke um das
                                            Dokument als
                                            nicht unterschrieben zu markieren!</q-tooltip>
                                    </q-icon>
                                    <q-banner v-if="showFileNameWarning" class="bg-red-5 text-white" dense>
                                        <template v-slot:avatar>
                                            <q-icon name="warning" />
                                        </template>
                                        Möglicherweise enthält der Dateiname ungültige Zeichen wie z.B. `$`, `&`, `()`,
                                        o.ä. Probiere bitte einen alternativen Dateinamen ohne Sonderzeichen zu setzen
                                        und versuche das Dokument erneut hochzuladen! <br>
                                        Einen alternativen Dateinamen kannst du direkt über dieser Warnmeldung rechts
                                        neben der Uploadüberschrift eingeben!
                                    </q-banner>
                                </div>
                            </q-card-section>
                            <q-card-section>
                                <input ref="fileInput" type="file"
                                    :accept="mapComputedWhitelistForInput(computedWhitelist)" multiple
                                    style="display: none" @change="handleFileUpload" />
                                <div class="drag-drop-container" :class="{ 'drag-over': isDragging }"
                                    @click="$refs.fileInput.click()" @dragover.prevent="isDragging = true"
                                    @dragleave="isDragging = false" @drop="handleDrop">
                                    <q-btn round flat dense icon="folder_open" class="top-left-icon" />
                                    <p>Drag & Drop Dateien hierhin oder klicke, um eine Datei auszuwählen</p>
                                </div>
                                <div v-if="uploading" class="upload-progress">
                                    <div class="text-subtitle1 q-mt-md">Upload läuft...</div>
                                    <q-linear-progress indeterminate color="primary" class="q-mt-sm" />
                                    <div class="q-mt-md">
                                        <div v-for="file in uploadOverview" :key="file.name" class="upload-item">
                                            {{ file.name }} - {{ file.size }}
                                        </div>
                                    </div>
                                </div>
                            </q-card-section>
                        </q-card>
                    </div>
                </div>
            </q-card>
        </q-dialog>
    </div>
</template>


<script>
import { ref, defineComponent, inject, nextTick } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios'
import { goTo ,checkRuleSharepointFileName} from 'components/helper/helper'
import { mapComputedWhitelistForInput, getFileChunks } from 'components/file-uploader/common';


export default defineComponent({
    name: 'sharepointUploader',
    props: [
        'type',
        'fileName',
        'targetEntityId',
        'targetEntity',
        'eventName',
        'currentDocuments',
        'iconSize',
        'whitelist'
    ],

    setup(props) {
        const $q = useQuasar();
        const isMobile = ref($q.platform.is.mobile)
        const fileInput = ref(null);
        const bus = inject('bus')
        const showDragDrop = ref(false)
        const uploading = ref(false);
        const uploadOverview = ref([])
        const isDragging = ref(false);
        const isSignedUpload = ref(false);
        const selectedDocument = ref()
        const showFileNameWarning = ref(false)

        const showOutdatedDocuments = ref(false)

        const altFileName = ref()

        const computedWhitelist = ref(props.whitelist ? props.whitelist : [
            'pdf',
            'xlsx',
            'pptx',
            'docx',
            'xls',
            'ppt',
            'doc',
            'vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'vnd.openxmlformats-officedocument.presentationml.presentation',
            'vnd.openxmlformats-officedocument.wordprocessingml.document',
            'png',
            'jpeg',
            'jpg'
        ]);

        const toBase64 = (file) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result);
                reader.onerror = error => reject(error);
            });
        };

        const handleDrop = async (event) => {
            event.preventDefault();
            await handleFileUpload({ target: { files: event.dataTransfer.files } });
        }
        const formatFileSize = (size) => {
            if (size < 1024) {
                return `${size} Bytes`;
            } else if (size < 1024 * 1024) {
                return `${(size / 1024).toFixed(2)} KB`;
            } else {
                return `${(size / (1024 * 1024)).toFixed(2)} MB`;
            }
        }
        const setUploadOverviewData = (files) => {
            const filesArray = Array.from(files);
            uploadOverview.value.push(...filesArray.map(file => ({ name: file.name, size: formatFileSize(file.size) })))
        }

        const mapTargetEntity = () => {
            if (props.targetEntity === 'scs') return 'subcontractorService'
            return props.targetEntity
        }

        async function getFileData(files) {
            let fileDataArray = [];
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const base64File = await toBase64(file);

                const fileNameForUpload = altFileName.value || props.fileName

                fileDataArray.push({
                    fileName: isSignedUpload.value ? `${fileNameForUpload}_signed` : fileNameForUpload,
                    content: base64File
                });
            }
            return fileDataArray
        }


        const handleFileUpload = async (event) => {
            const files = event.target.files;
            setUploadOverviewData(files)
            if (!files || files.length === 0) return;
            
            const invalidFiles = Array.from(files).filter(file => !computedWhitelist.value.includes(file.type.split('/')[1]));
            
            if (invalidFiles.length > 0) {
                $q.notify({
                    type: 'negative',
                    message: `Der Dateityp ${invalidFiles.map(f => f.type.split('/')[1]).join(', ')} ist hier nicht zulässig!`,
                });
                return;
            }

            uploading.value = true;

            const fileData = await getFileData(files)
            const chunks = getFileChunks(fileData)

            if (!chunks) {
                uploading.value = false;
                uploadOverview.value.splice(0, uploadOverview.value.length)
                $q.notify({
                    type: 'negative',
                    message: 'Eine der hochgeladenen Dateien ist zu groß! Stelle sicher, dass keine Datei größer als 20MB ist.',
                });
                return
            }

            let responses = await Promise.all(
                chunks.map(chunk => {
                    return api({
                        url: `/media/${props.targetEntity}/${props.targetEntityId}/sharepoint`,
                        method: 'POST',
                        data: {
                            type: props.type,
                            files: chunk,
                            targetEntity: mapTargetEntity()
                        },
                        withCredentials: true
                    }).catch(() => { })
                }))
            uploading.value = false;
            uploadOverview.value.splice(0, uploadOverview.value.length)
            if (!responses.every(response => response && response.status === 200)) {
                $q.notify({
                    type: 'negative',
                    timeout: 5000,
                    message: 'Fehler beim Hochladen!',
                });
                showFileNameWarning.value = true
                event.target.value = null
                return
            }
            $q.notify({
                type: 'positive',
                message: 'Datei erfolgreich hochgeladen!',
            });
            if (props.eventName) {
                bus.emit(props.eventName);
            }
            showDragDrop.value = false
        };

        async function setIsRecent(document) {
            document.isRecent = !document.isRecent
            const result = await api({
                method: 'POST',
                url: `/media/document/${document.id}`,
                withCredentials: true,
                data: {
                    isRecent: document.isRecent
                }
            }).catch(() => { })

            if (!result) {
                $q.notify({
                    type: 'negative',
                    message: 'Datei konnte nicht geändert werden. Probiere es bitte später erneut!',
                })
                return
            }

            if (document.isRecent) {
                $q.notify({
                    type: 'positive',
                    message: 'Dokument wurde als aktuell markiert!',
                })
            } else {
                $q.notify({
                    type: 'positive',
                    message: 'Dokument wurde als nicht aktuell markiert!',
                })
            }
        }

        async function renameSharepointDocument() {
            await nextTick()

            const result = await api({
                method: 'POST',
                url: `/media/document/${selectedDocument.value.id}`,
                withCredentials: true,
                data: {
                    fileName: selectedDocument.value.fileName
                }
            }).catch(() => { })

            if (!result) {
                $q.notify({
                    type: 'negative',
                    message: 'Dateiname konnte nicht geändert werden. Probiere es bitte später erneut!',
                })
                return
            }
            selectedDocument.value.sharepointLink = result.data.sharepointLink
        }
        function getUploadIcon() {
            const signed = props.currentDocuments.find(doc => doc.fileName.includes('signed'))
            const recent = props.currentDocuments.find(doc => doc.isRecent)
            if (signed && recent) return 'draw'
            return 'cloud_upload'
        }
        function getUploadIconColor() {
            const recent = props.currentDocuments.find(doc => doc.isRecent)
            if (recent) return 'primary'
            return 'black'
        }

        return {
            fileInput,
            showDragDrop,
            uploading,
            uploadOverview,
            isDragging,
            isMobile,
            isSignedUpload,
            showOutdatedDocuments,
            altFileName,
            computedWhitelist,
            selectedDocument,
            showFileNameWarning,
            goTo,
            formatFileSize,
            handleFileUpload,
            handleDrop,
            setIsRecent,
            mapComputedWhitelistForInput,
            renameSharepointDocument,
            getUploadIcon,
            getUploadIconColor,
            checkRuleSharepointFileName
        }

    }
})
</script>

<style scoped>
.dialog-card {
    min-width: 800px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}


.file-item {
    transition: background-color 0.3s ease;
}

.file-item:hover {
    background-color: #f5f5f5;
}

.rounded-borders {
    border-radius: 8px;
}

.file-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.drag-drop-container {
    width: 80%;
    max-width: 50vw;
    height: 250px;
    border: 2px dashed #aaa;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    text-align: center;
    position: relative;
    transition: background-color 0.3s, border-color 0.3s;
    margin: 0 auto;
    border-radius: 6px;
    cursor: pointer;
}

.drag-drop-container:hover {
    border-color: #888;
}

.drag-over {
    background-color: #96c23233;
    border-color: #96c232;
}

.top-left-icon {
    position: absolute;
    top: 10px;
    left: 10px;
}

.upload-progress {
    margin-top: 16px;
}

.upload-item {
    padding: 8px 0;
    border-bottom: 1px solid #eee;
}

/* Responsivität aus deinem CSS */
@media (max-width: 768px) {
    .drag-drop-container {
        width: 90%;
        height: 220px;
    }
}

@media (max-width: 480px) {
    .drag-drop-container {
        width: 95%;
        height: 200px;
    }
}
</style>