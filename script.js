document.addEventListener("DOMContentLoaded", function() {
    const html5QrCode = new Html5Qrcode("reader");
    const barcodeInput = document.getElementById("barcodeInput");
    const setBarcodeButton = document.getElementById("setBarcode");
    const startScanButton = document.getElementById("startScan");
    const helpButton = document.getElementById("helpButton");
    const resultDiv = document.getElementById("result");
    const englishButton = document.getElementById("englishButton");
    const espanolButton = document.getElementById("espanolButton");
    const targetBarcodeDisplay = document.getElementById("targetBarcode");
    const enableSoundCheckbox = document.getElementById("enableSound");
    const enableVibrationCheckbox = document.getElementById("enableVibration");
    const cameraScanButton = document.getElementById("cameraScan");
    const readerDiv = document.getElementById("reader");

    let targetBarcode = "";
    let scanning = false;
    let overlays = [];

    const messages = {
        en: {
            title: "Advanced Barcode Locator",
            enterBarcode: "Enter barcode to find",
            setBarcode: "Set Barcode",
            startScan: "Start Scanning",
            stopScan: "Stop Scanning",
            help: "Help",
            scanning: "Scanning...",
            targetBarcode: "Target Barcode: ",
            enableSound: "Enable Sound",
            enableVibration: "Enable Vibration",
            helpMessage: "Enter the barcode you want to find, then click 'Set Barcode'. Point your camera at the shelf of shoe boxes and click 'Start Scanning'. The app will highlight found barcodes with a shoe emoji overlay.",
            barcodeFound: "Found target barcode: ",
            scannedBarcode: "Scanned barcode: "
        },
        es: {
            title: "Localizador Avanzado de Códigos de Barras",
            enterBarcode: "Ingrese el código de barras a buscar",
            setBarcode: "Establecer Código",
            startScan: "Iniciar Escaneo",
            stopScan: "Detener Escaneo",
            help: "Ayuda",
            scanning: "Escaneando...",
            targetBarcode: "Código Objetivo: ",
            enableSound: "Activar Sonido",
            enableVibration: "Activar Vibración",
            helpMessage: "Ingrese el código de barras que desea encontrar, luego haga clic en 'Establecer Código'. Apunte su cámara hacia el estante de cajas de zapatos y haga clic en 'Iniciar Escaneo'. La aplicación resaltará los códigos de barras encontrados con un emoji de zapato.",
            barcodeFound: "Código objetivo encontrado: ",
            scannedBarcode: "Código escaneado: "
        }
    };

    let currentLanguage = 'en';

    function updateLanguage(language) {
        currentLanguage = language;
        document.getElementById("title").textContent = messages[language].title;
        barcodeInput.placeholder = messages[language].enterBarcode;
        setBarcodeButton.textContent = messages[language].setBarcode;
        startScanButton.textContent = scanning ? messages[language].stopScan : messages[language].startScan;
        helpButton.textContent = messages[language].help;
        document.getElementById("enableSoundLabel").textContent = messages[language].enableSound;
        document.getElementById("enableVibrationLabel").textContent = messages[language].enableVibration;
        updateTargetBarcodeDisplay();
        updateResultDiv();
    }

    function updateTargetBarcodeDisplay() {
        targetBarcodeDisplay.textContent = messages[currentLanguage].targetBarcode + (targetBarcode || "");
    }

    function updateResultDiv() {
        if (scanning) {
            resultDiv.textContent = messages[currentLanguage].scanning;
        } else if (resultDiv.textContent.includes("Found target barcode:") || resultDiv.textContent.includes("Código objetivo encontrado:")) {
            resultDiv.textContent = messages[currentLanguage].barcodeFound + targetBarcode;
        } else if (resultDiv.textContent.includes("Scanned barcode:") || resultDiv.textContent.includes("Código escaneado:")) {
            const scannedCode = resultDiv.textContent.split(":")[1].trim();
            resultDiv.textContent = messages[currentLanguage].scannedBarcode + scannedCode;
        }
    }

    englishButton.addEventListener("click", () => updateLanguage('en'));
    espanolButton.addEventListener("click", () => updateLanguage('es'));

    helpButton.addEventListener("click", () => {
        alert(messages[currentLanguage].helpMessage);
    });

    setBarcodeButton.addEventListener("click", () => {
        targetBarcode = barcodeInput.value.trim();
        if (targetBarcode) {
            updateTargetBarcodeDisplay();
            if (scanning) {
                stopScanning();
                startScanning();
            }
        } else {
            alert(messages[currentLanguage].enterBarcode);
        }
    });

    startScanButton.addEventListener("click", () => {
        if (!scanning) {
            startScanning();
        } else {
            stopScanning();
        }
    });

    cameraScanButton.addEventListener("click", () => {
        if (!scanning) {
            startScanning(true);
        } else {
            stopScanning();
        }
    });

    function startScanning(forInput = false) {
        scanning = true;
        startScanButton.textContent = messages[currentLanguage].stopScan;
        resultDiv.textContent = messages[currentLanguage].scanning;
        readerDiv.style.display = "block";

        const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.33333,
            formatsToSupport: [
                Html5QrcodeSupportedFormats.EAN_13,
                Html5QrcodeSupportedFormats.CODE_39,
                Html5QrcodeSupportedFormats.CODE_128,
                Html5QrcodeSupportedFormats.UPC_A,
                Html5QrcodeSupportedFormats.UPC_E,
                Html5QrcodeSupportedFormats.EAN_8,
                Html5QrcodeSupportedFormats.ITF,
                Html5QrcodeSupportedFormats.CODABAR
            ],
            experimentalFeatures: {
                useBarCodeDetectorIfSupported: true
            }
        };

        html5QrCode.start({ facingMode: "environment" }, config, 
            (decodedText, decodedResult) => onScanSuccess(decodedText, decodedResult, forInput),
            onScanFailure)
            .catch((err) => {
                console.error(`Unable to start scanning: ${err}`);
            });
    }

    function stopScanning() {
        scanning = false;
        startScanButton.textContent = messages[currentLanguage].startScan;
        readerDiv.style.display = "none";
        removeAllOverlays();
        html5QrCode.stop().catch((err) => {
            console.error(`Unable to stop scanning: ${err}`);
        });
    }

    function onScanSuccess(decodedText, decodedResult, forInput) {
        console.log(`Scan success: ${decodedText}`, decodedResult);
        if (forInput) {
            barcodeInput.value = decodedText;
            stopScanning();
            return;
        }
        if (decodedText === targetBarcode) {
            resultDiv.textContent = messages[currentLanguage].barcodeFound + decodedText;
            if (enableSoundCheckbox.checked) {
                playSound();
            }
            if (enableVibrationCheckbox.checked) {
                vibrateDevice();
            }
        } else {
            resultDiv.textContent = messages[currentLanguage].scannedBarcode + decodedText;
        }
        highlightBarcode(decodedResult.location, decodedText === targetBarcode);
    }

    function onScanFailure(error) {
        console.warn(`Scan failure: ${error}`);
    }

    function highlightBarcode(location, isTarget) {
        const overlay = document.createElement("div");
        overlay.className = "barcode-overlay";
        overlay.style.position = "absolute";
        overlay.style.border = isTarget ? "3px solid #FF0000" : "3px solid #00FF00";

        const video = document.querySelector("#reader video");
        const videoRect = video.getBoundingClientRect();

        overlay.style.left = `${videoRect.left + location.topLeftCorner.x}px`;
        overlay.style.top = `${videoRect.top + location.topLeftCorner.y}px`;
        overlay.style.width = `${location.bottomRightCorner.x - location.topLeftCorner.x}px`;
        overlay.style.height = `${location.bottomRightCorner.y - location.topLeftCorner.y}px`;

        const emoji = document.createElement("span");
        emoji.textContent = "👟";
        emoji.style.position = "absolute";
        emoji.style.top = "-25px";
        emoji.style.left = "50%";
        emoji.style.transform = "translateX(-50%)";
        emoji.style.fontSize = "20px";

        overlay.appendChild(emoji);
        document.body.appendChild(overlay);
        overlays.push(overlay);

        setTimeout(() => {
            overlay.remove();
            overlays = overlays.filter(o => o !== overlay);
        }, 2000);
    }

    function removeAllOverlays() {
        overlays.forEach(overlay => overlay.remove());
        overlays = [];
    }

    function playSound() {
        // Implementation for playing a sound
        // ...
    }

    function vibrateDevice() {
        if ("vibrate" in navigator) {
            navigator.vibrate(200);
        }
    }

    updateLanguage(currentLanguage); // Initialize with default language
});
