<template>
    <div>
        <q-btn @click=" showFileView = true" flat dense
            :color="`${currentScopeDocuments.length > 0 ? 'primary' : 'black'}`" icon="cloud_upload"
            :label="currentScopeDocuments.length" style="cursor: pointer;" />
    </div>

    <q-dialog v-model="showFileView" persistent maximized>
        <q-card class="file-uploader">
            <!-- Sticky Button-Leiste -->
            <q-card-section style="position: sticky; top: 0; z-index: 2; background: white; padding: 10px;">
                <q-btn dense flat icon="close" v-close-popup
                    style="position: absolute; top: 5px; right: 5px; color: black;" />
                <div class="row">
                    <!-- Verstecktes File Input für Dateien -->
                    <input ref="fileInput" type="file" multiple style="display: none" @change="handleFileUpload"
                        :accept="mapComputedWhitelistForInput(computedWhitelist)" />
                    <!-- Button für Datei-Auswahl -->
                    <q-btn @click="$refs.fileInput.click()" round flat dense icon="folder_open" class="q-mr-md" />
                    <!-- Button für Kamera -->
                    <q-btn @click="handleCameraClick" round flat dense icon="photo_camera" class="q-mr-md" />
                    <!-- Download-Button -->
                    <q-btn icon="download" round flat dense @click="downloadGallery()"></q-btn>
                </div>
            </q-card-section>

            <!-- Scrollbarer Inhalt -->
            <q-card-section
                style="flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch; padding: 10px; padding-bottom: 20px;">
                <div class="drag-drop-container" @dragover.prevent="; isDragging = true; parseDragOver($event)"
                    @dragleave=" dragIsBlocked = false; isDragging = false" style="cursor: pointer;"
                    @click="$refs.fileInput.click()" @drop="handleDrop"
                    :class="{ 'drag-over': isDragging && !dragIsBlocked, 'drag-invalid': isDragging && dragIsBlocked }">
                    <p>Drag & Drop Dateien hierhin oder klicke, um eine Datei auszuwählen.</p>
                    <p>Beachte dass Du die selbe Datei nicht mehrfach hochladen kannst!</p>
                </div>

                <div v-if="uploading" class="q-mt-md">
                    <div>Upload läuft</div>
                    <q-linear-progress indeterminate color="primary" class="q-mt-md" />
                    <div class="q-mt-md">
                        <div v-for="file in uploadOverview" :key="file.name" class="upload-item">
                            {{ file.name }} - {{ file.size }}
                        </div>
                    </div>
                </div>

                <gallery ref="galleryRef" :documentsMetaData="metaData" :currentScopeDocuments="documentStore"
                    :entity="entity" :targetId="targetId">
                </gallery>
            </q-card-section>
        </q-card>
    </q-dialog>

    <!-- Kamera-Dialog für Desktop/Mobile -->
    <q-dialog class="bg-black" v-model="showCamera" @before-hide="stopCamera">
        <!-- Schließen-Button oben rechts -->
        <q-btn @click="stopCamera()" round flat dense icon="close"
            style="position: absolute; top: 10px; right: 10px; color: white; z-index: 10;" />

        <q-card class="bg-black" style="height: 100%; max-height: 100vh; display: flex; flex-direction: column;">
            <!-- Video -->
            <q-card-section class="q-pa-none" style="flex: 1; position: relative; overflow: hidden;">
                <video ref="video" autoplay playsinline style="width: 100%; height: 100%; object-fit: cover;"></video>
                <q-btn @click="toggleCamera" round flat dense icon="sync"
                    style="position: absolute; bottom: 10px; right: 10px; color: black;" />
            </q-card-section>

            <!-- Kamera-Steuerung (Buttons) -->
            <q-card-section class="q-pa-none"
                style="height: 80px; width: 100%; position: sticky; bottom: 0; background: transparent;">
                <!-- Capture-Button (Mittig) -->
                <q-btn @click="capturePhoto" round flat dense
                    style="width: 60px; height: 60px; background: white; border: 3px solid rgba(255,255,255,0.8); position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%);" />
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script>
import { ref, defineComponent, nextTick, inject, watch } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios'
import gallery from 'components/file-uploader/gallery.vue';
import { mapTargetEntitySaveEvent, startDownloadDirect, getFileChunks, mapComputedWhitelistForInput } from 'components/file-uploader/common';

export default defineComponent({
    name: 'sharepointUploader',
    props: [
        'currentScopeDocuments',
        'type',
        'entity',
        'targetId',
        'documentsMetaData',
        'preName',
        'whitelist'
    ],
    components: {
        gallery
    },

    setup(props) {
        const $q = useQuasar();
        const bus = inject('bus')
        const showFileView = ref(false);
        const isDragging = ref(false);
        const imagePreview = ref(null);
        const showCamera = ref(false);
        const video = ref(null);
        let stream = null;
        const useFrontCamera = ref(false)
        const uploadOverview = ref([])
        const uploading = ref(false)
        const documentStore = ref(props.currentScopeDocuments)
        const metaData = ref(props.documentsMetaData)
        const galleryRef = ref(null)
        const computedWhitelist = ref(props.whitelist ? props.whitelist : [
            'png',
            'jpeg',
            'jpg',
            'rfc822',
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
        ]);
        const dragIsBlocked = ref(false)

        watch(() => galleryRef.value, () => {
            if (galleryRef.value) {
                return initGallery()
            }
        })

        // Kamera-Bild-Upload-Handler (Nur für Mobile)
        const handleCameraCapture = (event) => {
            return handleFileUpload(event)
        };

        function handleCameraClick() {
            showCamera.value = true;
            startCamera();
        }


        // Startet die Kamera mit der aktuellen Kamera-Einstellung
        async function startCamera() {
            await nextTick(); // Warten, bis das Video-Element existiert

            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: useFrontCamera.value ? "user" : "environment",
                        width: { ideal: 1920 },
                        height: { ideal: 1080 }
                    }
                });

                if (video.value) {
                    video.value.srcObject = stream;
                } else {
                    console.error("Fehler: Video-Element nicht gefunden!");
                }
            } catch (error) {
                console.error("Kamera-Zugriff fehlgeschlagen:", {
                    name: error.name,
                    message: error.message,
                    constraint: error.constraint // Falls OverconstrainedError
                });

                // Fallback: Versuche es ohne spezifische facingMode oder Auflösung
                console.log("Versuche Fallback ohne facingMode...");
                try {
                    stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    if (video.value) {
                        video.value.srcObject = stream;
                        console.log("Fallback erfolgreich!");
                    }
                } catch (fallbackError) {
                    console.error("Fallback fehlgeschlagen:", fallbackError);
                }
            }
        }

        // Umschalten zwischen Front- & Rückkamera
        async function toggleCamera() {
            useFrontCamera.value = !useFrontCamera.value; // Kamera wechseln
            console.log(`🔄 Kamera gewechselt zu: ${useFrontCamera.value ? "Front" : "Back"}`);

            // Kamera-Stream aktualisieren
            if (stream) {
                stream.getTracks().forEach(track => track.stop()); // Beende den aktuellen Stream
            }
            await startCamera(); // Starte die Kamera erneut mit der neuen Einstellung
        }

        // Foto aufnehmen (Desktop-Webcam)
        async function capturePhoto() {
            if (!video.value) {
                console.error("Kein Videostream gefunden!");
                return;
            }

            // Bild aus dem Videostream aufnehmen
            const canvas = document.createElement("canvas");
            canvas.width = video.value.videoWidth;
            canvas.height = video.value.videoHeight;
            canvas.getContext("2d").drawImage(video.value, 0, 0, canvas.width, canvas.height);

            // Bild als Blob erstellen
            canvas.toBlob(async (blob) => {
                if (!blob) {
                    console.error("Fehler beim Erstellen des Bild-Blobs!");
                    return;
                }
                // Dateiobjekt mit dem aufgenommenen Bild erstellen
                const file = new File([blob], `Kamera-Aufnahme.png`, { type: "image/png" });
                // Simuliere ein Event-Objekt für handleFileUpload
                const event = { target: { files: [file] } };
                // Datei hochladen
                await handleFileUpload(event);
            }, "image/png",
                1.0 // Qualität auf Maximum setzen (1.0 = 100%)
            );
            stopCamera();
        }


        // Kamera stoppen (Desktop)
        function stopCamera() {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            showCamera.value = false;
        }
        async function handleDrop(event) {
            if (dragIsBlocked.value) {
                isDragging.value = false
                dragIsBlocked.value = false
                return
            }
            event.preventDefault();
            isDragging.value = false
            await handleFileUpload({ target: { files: event.dataTransfer.files } });
        }

        function parseDragOver(event) {
            if (dragIsBlocked.value === true) return
            event.preventDefault();

            const files = event.dataTransfer.items;

            if (files && files.length === 0) return

            for (let i = 0; i < files.length; i++) {
                if (!computedWhitelist.value.includes(files[i].type.split('/')[1])) {
                    $q.notify({
                        type: 'negative',
                        message: `Der Dateityp ${files[i].type.split('/')[1]} ist hier nicht zulässig!`,
                    });
                    dragIsBlocked.value = true
                    return;
                }
            }
        }

        async function getFileData(files) {
            let fileDataArray = [];
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const base64File = await toBase64(file);
                fileDataArray.push({
                    fileName: `${props.preName}_${documentStore.value.length + i + 1}.${file.name.split('.').pop()}`,
                    content: base64File
                });
            }
            return fileDataArray;
        }

        function mapTargetEntity() {
            if (!props.entity) return 'Opportunity'
            if (props.entity === 'LegalEntity') return 'LegalEntity'
            if (props.entity === 'DeficiencyReport') return 'DeficiencyReport'
            if (props.entity === 'Communication') return 'Communication'
            if (props.entity === 'BuildingStatus') return 'BuildingStatus'
            if (props.entity === 'PartnerDocument') return 'Opportunity'
        }


        async function handleFileUpload(event) {
            const files = event.target.files;
            // Filter unzulässige Dateie
            const invalidFiles = Array.from(files).filter(file => !computedWhitelist.value.includes(file.type.split('/')[1]));
            if (invalidFiles.length > 0) {
                $q.notify({
                    type: 'negative',
                    message: `Der Dateityp ${invalidFiles.map(f => f.type.split('/')[1]).join(', ')} ist hier nicht zulässig!`,
                });
                return;
            }

            setUploadOverviewData(files)
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
                        url: `/media/document`,
                        method: 'POST',
                        data: {
                            type: props.type,
                            files: chunk,
                            target: {
                                entity: mapTargetEntity(),
                                id: props.targetId
                            }
                        },
                        withCredentials: true
                    }).catch(() => { })
                })
            )
            if (responses.find(response => response.status !== 201)) {
                $q.notify({
                    type: 'negative',
                    message: 'Fehler beim Hochladen!',
                });
                return
            }

            const createdDocuments = responses.map((response, index) => {
                response.data.forEach((file, fileIndex) => {
                    file.content = chunks[index][fileIndex].content
                })
                return response.data
            }).flat()

            uploading.value = false;
            uploadOverview.value.splice(0, uploadOverview.value.length)

            documentStore.value.unshift(...createdDocuments.map(doc => doc.id))
            bus.emit(mapTargetEntitySaveEvent(props.entity));

            updateMetaDataAfterUpload(createdDocuments)
            galleryRef.value.addDocumentsAfterUpload(createdDocuments)

            $q.notify({
                type: 'positive',
                message: 'Datei erfolgreich hochgeladen!',
            });
        }

        function updateMetaDataAfterUpload(documents) {
            documents.forEach(document => {
                metaData.value[document.id] = Object.assign({}, document, { mimeType: document.fileName.split('.').pop() })
            })
        }

        function formatFileSize(size) {
            if (size < 1024) {
                return `${size} Bytes`;
            } else if (size < 1024 * 1024) {
                return `${(size / 1024).toFixed(2)} KB`;
            } else {
                return `${(size / (1024 * 1024)).toFixed(2)} MB`;
            }
        }
        function setUploadOverviewData(files) {
            const filesArray = Array.from(files);
            uploadOverview.value.push(...filesArray.map(file => ({ name: file.name, size: formatFileSize(file.size) })))
        }


        function toBase64(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result);
                reader.onerror = error => reject(error);
            });
        };

        function initGallery() {
            galleryRef.value.init();
        }


        function downloadGallery() {
            return startDownloadDirect(`media/documents/download?ids=${documentStore.value.map(doc => { return doc }).join(',')}`)
        }

        return {
            showFileView,
            isDragging,
            imagePreview,
            showCamera,
            video,
            useFrontCamera,
            uploadOverview,
            uploading,
            metaData,
            documentStore,
            galleryRef,
            computedWhitelist,
            dragIsBlocked,
            handleFileUpload,
            handleCameraCapture,
            handleCameraClick,
            toggleCamera,
            startCamera,
            capturePhoto,
            stopCamera,
            handleDrop,
            initGallery,
            downloadGallery,
            mapComputedWhitelistForInput,
            parseDragOver
        };
    },
});
</script>

<style scoped>
.file-uploader {
    width: calc(100vw - 20px);
    height: 100vh;
    max-width: 100vw;
    max-height: 95vh;
    display: flex;
    flex-direction: column;
    margin: 0;
    overflow: hidden;
}

.drag-drop-container {
    width: 80%;
    height: 150px;
    border: 2px dashed #aaa;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    text-align: center;
    position: relative;
    transition: background-color 0.3s, border-color 0.3s;
    margin: 0 auto;
}

.drag-over {
    background-color: #96c23233;
    border-color: #96c232;
}

.drag-invalid {
    background-color: #ff333333;
    /* Rot mit Transparenz */
    border-color: #ff3333;
}


@media (max-width: 768px) {
    .file-uploader {
        width: 100vh;
            height: 100vh;
            max-width: 100vw;
            max-height: 100vh;
        }

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