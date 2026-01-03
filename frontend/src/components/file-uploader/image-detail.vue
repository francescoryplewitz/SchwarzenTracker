<template>
    <div v-if="selectedImage?.content">
        <q-btn v-if="!showPenToolBar" dense flat icon="close" v-close-popup class="image-detail-close-button" />
        <q-btn v-if="showPenToolBar" dense flat icon="close" @click="clearCanvas()" class="image-detail-close-button" />
        <q-card v-if="!showPenToolBar" class="image-viewer-card bg-white">
            <q-card-section class="row image-section">
                <img :src="selectedImage?.content" class="full-image" alt="Selected Image" />
                <div class="image-details">
                    <div>
                        <q-spinner v-if="selectedImage.isPreview" color="primary" class="q-mt-md q-mr-md"
                            size="22px"></q-spinner>
                        <q-btn :disable="selectedImage.isPreview" @click="showPenToolBar = true; activatePenTool()" flat
                            dense color="black" icon="edit" class="q-mt-md" />
                        <q-btn :disable="selectedImage.isPreview" @click="downloadSelectedImage()" flat dense
                            color="black" icon="download" class="q-ml-md q-mt-md" />
                    </div>
                    <q-input v-model="selectedImage.fileName" label="Dateiname" class="image-description"
                        @blur="updateSelectedImageMetaData()" />
                    <q-input v-model="selectedImage.description" label="Beschreibung"
                        @blur="updateSelectedImageMetaData()" type="textarea" class="image-description" />
                </div>
            </q-card-section>
        </q-card>
        <q-card v-if="showPenToolBar" class="drawing-card">
            <div class="drawing-card-toolbar">
                <div class="pen-tool">
                    <input type="color" v-model="penColor" class="color-picker" />
                    <q-input v-model="penSize" class="pen-size-input" flat dense type="number" min="1" max="25"
                        label="Stiftgröße" />
                    <q-btn @click="toggleEraser" flat dense :color="erasing ? 'red' : 'black'" icon="mdi-eraser"
                        class="q-ml-md">
                        <q-tooltip>Radiergummi</q-tooltip>
                    </q-btn>
                </div>
                <div>
                    <q-btn @click="saveCanvas()" flat dense color="primary" size="lg" icon="save" class="save-btn"
                        style="cursor: pointer;" />
                </div>
            </div>
            <div class="drawing-card-container">
                <canvas ref="backgroundCanvas" class="drawing-card-canvas"></canvas>
                <canvas ref="drawingCanvas" class="drawing-card-canvas"></canvas>
            </div>
        </q-card>
        <q-dialog v-model="showSpinner" persistent>
            <q-card class="q-pa-lg flex flex-center">
                <q-spinner color="primary" size="lg" />
                <div class="q-ml-md">Deine Änderungen werden gespeichert. Bitte habe einen Moment Geduld!</div>
            </q-card>
        </q-dialog>
    </div>
</template>

<script>
import { ref, defineComponent, nextTick, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
import { downloadFileFromBase64 } from 'components/common/helper';

export default defineComponent({
    name: 'imageDetailView',
    props: ['image'],

    setup(props) {
        const $q = useQuasar();

        const showSpinner = ref(false);
        const selectedImage = ref(props.image);

        let drawing = false;
        let erasing = ref(false);

        const showPenToolBar = ref(false);
        const penColor = ref('#000000');
        const penSize = ref(10);
        const drawingCanvas = ref(null);
        const backgroundCanvas = ref(null);

        const scaleX = ref();
        const scaleY = ref();

        let bgCtx = null; // Kontext für das Hintergrund-Canvas
        let ctx = null;   // Kontext für das Zeichen-Canvas

        onMounted(() => {
            loadFullImage();
        });

        async function loadFullImage() {
            if (!selectedImage.value.isPreview) return;
            const result = await api.get(`/media/document/${selectedImage.value.id}/content`, {
                withCredentials: true,
            });
            selectedImage.value.content = `data:${selectedImage.value.mimeType};base64,${result.data}`;
            selectedImage.value.isPreview = false;
        }

        async function updateSelectedImageMetaData() {
            selectedImage.value.fileName = `${selectedImage.value.fileName.split('.')[0]}.${selectedImage.value.mimeType}`;
            const params = {
                method: 'POST',
                url: `/media/document/${selectedImage.value.id}`,
                withCredentials: true,
                data: {
                    fileName: selectedImage.value.fileName,
                    description: selectedImage.value.description,
                },
            };
            const result = await api(params).catch(() => { });
            if (!result) {
                $q.notify({
                    color: 'negative',
                    timeout: 3000,
                    message: 'Die Metadaten konnten nicht gespeichert werden. Bitte lade die Seite neu!',
                    position: 'top',
                });
            }
        }

        function getCanvasCoordinates(event) {
            const rect = drawingCanvas.value.getBoundingClientRect();
            return {
                x: (event.clientX - rect.left) * scaleX.value,
                y: (event.clientY - rect.top) * scaleY.value,
            };
        }

        function startDrawing(event) {
            drawing = true;
            event.preventDefault();
            const touch = event.touches ? event.touches[0] : event;
            const { x, y } = getCanvasCoordinates(touch);
            ctx.beginPath();
            ctx.moveTo(x, y);
        }

        function draw(event) {
            if (!drawing) return;
            event.preventDefault();

            const touch = event.touches ? event.touches[0] : event;
            const { x, y } = getCanvasCoordinates(touch);

            if (erasing.value) {
                ctx.globalCompositeOperation = 'destination-out'; // Radier-Modus
                ctx.lineWidth = penSize.value * 2; // Größerer Radierer
            } else {
                ctx.globalCompositeOperation = 'source-over'; // Zeichen-Modus
                ctx.strokeStyle = penColor.value;
                ctx.lineWidth = penSize.value;
            }

            ctx.lineTo(x, y);
            ctx.lineCap = 'round';
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y);
        }

        function stopDrawing() {
            drawing = false;
            ctx.closePath();
        }

        function clearCanvas() {
            ctx.clearRect(0, 0, drawingCanvas.value.width, drawingCanvas.value.height);
            showPenToolBar.value = false;
        }

        function toggleEraser() {
            erasing.value = !erasing.value;
        }

        function addCanvasEventListeners() {
            drawingCanvas.value.addEventListener('mousedown', startDrawing);
            drawingCanvas.value.addEventListener('mousemove', draw);
            drawingCanvas.value.addEventListener('mouseup', stopDrawing);
            drawingCanvas.value.addEventListener('mouseleave', stopDrawing);

            drawingCanvas.value.addEventListener('touchstart', startDrawing);
            drawingCanvas.value.addEventListener('touchmove', draw);
            drawingCanvas.value.addEventListener('touchend', stopDrawing);
            drawingCanvas.value.addEventListener('touchcancel', stopDrawing);
        }

        function activatePenTool() {
            showPenToolBar.value = true;
            const img = new Image();
            img.src = selectedImage.value.content;
            img.onload = () => {
                const container = drawingCanvas.value.parentElement;
                const containerWidth = container.clientWidth;
                const containerHeight = container.clientHeight;

                let scale = Math.min(containerWidth / img.width, containerHeight / img.height);
                const newWidth = img.width * scale;
                const newHeight = img.height * scale;

                // Setze die Canvas-Zeichenfläche auf die Originalgröße des Bildes
                drawingCanvas.value.width = img.width;
                drawingCanvas.value.height = img.height;
                backgroundCanvas.value.width = img.width;
                backgroundCanvas.value.height = img.height;

                // Setze die CSS-Größe für beide Canvas-Elemente
                drawingCanvas.value.style.width = `${newWidth}px`;
                drawingCanvas.value.style.height = `${newHeight}px`;
                backgroundCanvas.value.style.width = `${newWidth}px`;
                backgroundCanvas.value.style.height = `${newHeight}px`;

                // Initialisiere die Kontexte
                bgCtx = backgroundCanvas.value.getContext('2d');
                ctx = drawingCanvas.value.getContext('2d');

                // Zeichne das Bild auf das Hintergrund-Canvas
                bgCtx.drawImage(img, 0, 0);

                // Event-Listener hinzufügen
                addCanvasEventListeners();

                // Speichere die Skalierung für die Mauskoordinaten
                scaleX.value = img.width / newWidth;
                scaleY.value = img.height / newHeight;
            };
        }

        async function saveCanvas() {
            // Erstelle ein temporäres Canvas, um Hintergrund und Zeichnungen zu kombinieren
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = drawingCanvas.value.width;
            tempCanvas.height = drawingCanvas.value.height;
            const tempCtx = tempCanvas.getContext('2d');

            // Zeichne das Hintergrundbild und die Zeichnungen auf das temporäre Canvas
            tempCtx.drawImage(backgroundCanvas.value, 0, 0);
            tempCtx.drawImage(drawingCanvas.value, 0, 0);

            // Konvertiere das kombinierte Bild in eine Daten-URL
            const dataUrl = tempCanvas.toDataURL('image/jpeg', 0.95);
            selectedImage.value.content = dataUrl;

            showSpinner.value = true;
            await nextTick();
            const result = await api({
                method: 'PATCH',
                url: `/media/document/${selectedImage.value.id}`,
                data: {
                    content: dataUrl.split(',')[1],
                },
                withCredentials: true,
            }).catch(() => { });
            showSpinner.value = false;

            if (!result) {
                $q.notify({
                    type: 'negative',
                    message: 'Fehler beim Speichern des Bildes!',
                });
                return;
            }
            $q.notify({
                type: 'positive',
                message: 'Deine Malerkünste wurden gespeichert!',
            });

            showPenToolBar.value = false;
        }

        function downloadSelectedImage() {
            return downloadFileFromBase64(selectedImage.value.content.split(',')[1], selectedImage.value.fileName);
        }

        return {
            penColor,
            penSize,
            drawingCanvas,
            backgroundCanvas,
            showPenToolBar,
            selectedImage,
            showSpinner,
            erasing,
            updateSelectedImageMetaData,
            clearCanvas,
            activatePenTool,
            saveCanvas,
            downloadSelectedImage,
            toggleEraser,
        };
    },
});
</script>

<style scoped>
.image-viewer-card {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    background-color: rgb(255, 255, 255);
    padding: 20px;
}

.full-image {
    max-width: 60%;
    max-height: 90vh;
    object-fit: contain;
    border-radius: 10px;
}

.image-details {
    flex-grow: 1;
    padding-left: 30px;
    display: flex;
    flex-direction: column;
    justify-content: left;
    color: white;
}

.q-input {
    width: 100%;
    max-width: 400px;
}

.image-container {
    position: relative;
    display: inline-block;
}

.drawing-card {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 16px;
    box-sizing: border-box;
}

.drawing-card-toolbar {
    display: flex;
    align-items: center;
}

.pen-tool {
    display: flex;
    align-items: center;
    gap: 10px;
    background: white;
    padding: 6px 12px;
    }
    
    .color-picker {
        width: 40px;
        height: 40px;
        border: none;
        background: transparent;
        cursor: pointer;
    }
    
    .pen-size-input {
        width: 50px;
    }
    
    .drawing-card-container {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 10px;
        background: #f5f5f5;
        border-radius: 8px;
        overflow: hidden;
        width: 100%;
        height: 100%;
    }
    
    .drawing-card-canvas {
        position: absolute;
        top: 0;
        left: 0;
        pointer-events: none;
        /* Hintergrund-Canvas ignoriert Events */
    }
    
    .drawing-card-canvas:last-child {
        pointer-events: auto;
        /* Zeichen-Canvas empfängt Events */
    }
    
    .image-description {
        max-width: 500px;
        width: 100%;
    }
    
    .image-detail-close-button {
        position: absolute;
        top: 25px;
        right: 25px;
        color: black;
        z-index: 1000;
    }
    
    @media (max-width: 1025px) {
        .image-detail-close-button {
            color: black;
            background-color: white;
            border-radius: 50%;
        }
    
        .image-viewer-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            width: 100vw;
            min-height: 100vh;
            height: auto;
            padding: 0;
            margin: 0;
        }
    
        .image-details {
            width: 100%;
            padding: 10px 20px;
            text-align: left;
        }
    
        .full-image {
            width: 100vw;
            max-width: 100vw;
            height: auto;
            max-height: calc(100vh - 120px);
            object-fit: contain;
            display: block;
            margin: 0;
            border-radius: 0;
        }
    
        .q-card {
            width: 100vw !important;
            max-width: 100vw !important;
            margin: 0;
        }
    
        .q-card-section {
            width: 100vw;
            padding: 0 !important;
            margin: 0 !important;
            display: flex;
            justify-content: center;
        }
    
        .image-description {
            max-width: 80vw;
        }
    
        .image-section {
            padding: 0px;
        }
    }
</style>