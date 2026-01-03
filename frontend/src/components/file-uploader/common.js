import { api } from 'boot/axios'

function mapTargetEntitySaveEvent(entity) {
    if (!entity) {
        return 'save-opportunity'
    }
    if (entity === 'LegalEntity') {
        return 'save-legalEntity'
    }
    if (entity === 'DeficiencyReport') {
        return 'update-deficiency-report'
    }
    if (entity === 'Communication') {
        return 'update-last-communication'
    }
    if (entity === 'BuildingStatus') {
        return 'update-buildingStatus'
    }
    if (entity === 'PartnerDocument') {
        return 'save-partnerDocuments'
    }


}

async function startDownload(params, fileName) {
    try {
        // Füge responseType für den Dateidownload hinzu
        params.responseType = 'blob';

        // API-Call mit Axios, basierend auf dem params-Objekt
        const response = await api({
            ...params, // Übernimmt alle Parameter (Methode, URL etc.)
            onDownloadProgress: (progressEvent) => {
                if (progressEvent.lengthComputable) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    console.log(`Download-Fortschritt: ${percentCompleted}%`);
                    // Falls du eine UI hast, kannst du hier eine Fortschrittsanzeige aktualisieren
                } else {
                    console.log(`Heruntergeladen: ${progressEvent.loaded} Bytes`);
                }
            }
        });

        // Erstelle eine URL für den Blob
        const blobUrl = window.URL.createObjectURL(new Blob([response.data]));

        // Erstelle den Download-Link
        const link = document.createElement("a");
        link.href = blobUrl;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();

        // Aufräumen
        link.remove();
        window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
        console.error("Fehler beim Download:", error);
    }
}

function startDownloadDirect(url) {
    const domain = window.location.origin
    console.log(domain)
    console.log(`${domain.includes('localhost') ? 'http://localhost:4004' : domain}/${url}`)
    window.open(`${domain.includes('localhost') ? 'http://localhost:4004' : domain}/${url}`, '_blank'); // Download sofort sichtbar im Browser
}

function getBase64Size(base64String) {
    let padding = 0;
    if (base64String.endsWith("==")) padding = 2;
    else if (base64String.endsWith("=")) padding = 1;
    return (base64String.length * 3) / 4 - padding;
}
function getFileChunks(fileData) {
    const chunkData = fileData.reduce((acc, file) => {
        const fileSize = getBase64Size(file.content);
        if (fileSize > 20 * 1024 * 1024) acc.singleFileExceededSize = true

        if (acc.currentSize + fileSize > 20 * 1024 * 1024) {
            acc.chunks.push(acc.currentChunk);
            acc.currentChunk = [file];
            acc.currentSize = fileSize;
        } else {
            acc.currentChunk.push(file);
            acc.currentSize += fileSize;
        }
        return acc
    }, { chunks: [], currentChunk: [], currentSize: 0, singleFileExceededSize: false })

    if (chunkData.singleFileExceededSize) return false

    if (chunkData.currentChunk.length > 0) {
        chunkData.chunks.push(chunkData.currentChunk)
    }
    return chunkData.chunks
}


function mapComputedWhitelistForInput(computedWhitelist) {
    return computedWhitelist.map(type => {
        switch (type) {
            // Bestehende Typen
            case 'png':
                return 'image/png';
            case 'jpeg':
                return 'image/jpeg';
            case 'jpg':
                return 'image/jpg';
            case 'rfc822':
                return 'message/rfc822';
            case 'pdf':
                return 'application/pdf';
            case 'xlsx':
                return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            case 'pptx':
                return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
            case 'docx':
                return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            case 'xls':
                return 'application/vnd.ms-excel';
            case 'ppt':
                return 'application/vnd.ms-powerpoint';
            case 'doc':
                return 'application/msword';
            default:
                return type;
        }
    });
}

export {
    mapTargetEntitySaveEvent,
    startDownload,
    startDownloadDirect,
    getFileChunks,
    mapComputedWhitelistForInput
}