document.addEventListener("DOMContentLoaded", function() {
    const html5QrCode = new Html5Qrcode("reader");
    const barcodeInput = document.getElementById("barcodeInput");
    const startScanButton = document.getElementById("startScan");
    const scanToInputButton = document.getElementById("scanToInput");
    const helpButton = document.getElementById("helpButton");
    const resultDiv = document.getElementById("result");
    const englishButton = document.getElementById("englishButton");
    const spanishButton = document.getElementById("spanishButton");
    const title = document.getElementById("title");

    let targetBarcode = "";
    let scanning = false;
    let scanningToInput = false;

    const messages = {
        en: {
            title: "Locating Barcode Scanner",
            enterBarcode: "Enter barcode to search",
            startScan: "Start Scan",
            stopScan: "Stop Scan",
            scanToInput: "Scan to Input",
            help: "Help",
            helpMessage: "Enter a barcode to search for and click 'Start Scan'. You can also scan a barcode directly into the input field by clicking 'Scan to Input'. Supports both 1D and 2D barcodes."
        },
        es: {
            title: "Localización del escáner de código de barras",
            enterBarcode: "Ingrese el código de barras para buscar",
            startScan: "Iniciar Escaneo",
            stopScan: "Detener Escaneo",
            scanToInput: "Escanear al Campo",
            help: "Ayuda",
            helpMessage: "Ingrese un código de barras para buscar y haga clic en 'Iniciar Escaneo'. También puede escanear un código de barras directamente en el campo de entrada haciendo clic en 'Escanear al Campo'. Compatible con códigos de barras 1D y 2D."
        }
    };

    let currentLanguage = 'en';

    function updateLanguage(language) {
        currentLanguage = language;
        title.textContent = messages[language].title;
        barcodeInput.placeholder = messages[language].enterBarcode;
        startScanButton.textContent = messages[language].startScan;
        scanToInputButton.textContent = messages[language].scanToInput;
        helpButton.textContent = messages[language].help;
    }

    englishButton.addEventListener("click", () => updateLanguage('en'));
    spanishButton.addEventListener("click", () => updateLanguage('es'));

    helpButton.addEventListener("click", () => {
        alert(messages[currentLanguage].helpMessage);
    });

    startScanButton.addEventListener("click", () => {
        targetBarcode = barcodeInput.value.trim();
        if (targetBarcode) {
            if (!scanning) {
                startScanning();
            } else {
                stopScanning();
            }
        } else {
            alert(messages[currentLanguage].enterBarcode);
        }
    });

    scanToInputButton.addEventListener("click", () => {
        if (!scanningToInput) {
            startScanningToInput();
        } else {
            stopScanningToInput();
        }
    });

    function startScanning() {
        scanning = true;
        startScanButton.textContent = messages[currentLanguage].stopScan;

        const config = {
            fps: 10,
            qrbox: { width: 250, height: 100 }, // Adjust height for 1D barcodes
            aspectRatio: 1.0,
            formatsToSupport: [
                Html5QrcodeSupportedFormats.QR_CODE,
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

        html5QrCode.start({ facingMode: "environment" }, config, onScanSuccess, onScanFailure)
            .catch((err) => {
                console.error(`Unable to start scanning: ${err}`);
            });
    }

    function stopScanning() {
        scanning = false;
        startScanButton.textContent = messages[currentLanguage].startScan;
        html5QrCode.stop().catch((err) => {
            console.error(`Unable to stop scanning: ${err}`);
        });
    }

    function startScanningToInput() {
        scanningToInput = true;
        scanToInputButton.textContent = messages[currentLanguage].stopScan;

        const config = {
            fps: 10,
            qrbox: { width: 250, height: 100 }, // Adjust height for 1D barcodes
            aspectRatio: 1.0,
            formatsToSupport: [
                Html5QrcodeSupportedFormats.QR_CODE,
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

        html5QrCode.start({ facingMode: "environment" }, config, onScanToInputSuccess, onScanFailure)
            .catch((err) => {
                console.error(`Unable to start scanning: ${err}`);
            });
    }

    function stopScanningToInput() {
        scanningToInput = false;
        scanToInputButton.textContent = messages[currentLanguage].scanToInput;
        html5QrCode.stop().catch((err) => {
            console.error(`Unable to stop scanning: ${err}`);
        });
    }

    function onScanSuccess(decodedText, decodedResult) {
        console.log(`Scan success: ${decodedText}`, decodedResult);
        console.log(`Barcode format: ${decodedResult.result.format.formatName}`);
        
        if (decodedText === targetBarcode) {
            resultDiv.textContent = `Found barcode: ${decodedText} (${decodedResult.result.format.formatName})`;
            highlightBarcode(decodedResult.result.location);
            vibrateDevice();
        } else {
            console.log(`Scanned barcode: ${decodedText} (${decodedResult.result.format.formatName})`);
        }
    }

    function onScanToInputSuccess(decodedText, decodedResult) {
        console.log(`Scan to input success: ${decodedText}`, decodedResult);
        barcodeInput.value = decodedText;
        stopScanningToInput();
    }

    function onScanFailure(error) {
        console.warn(`Scan failure: ${error}`);
    }

    function highlightBarcode(location) {
        const overlay = document.createElement("div");
        overlay.className = "barcode-overlay";

        const video = document.querySelector("#reader video");
        const videoRect = video.getBoundingClientRect();

        overlay.style.left = `${videoRect.left + location.topLeftCorner.x}px`;
        overlay.style.top = `${videoRect.top + location.topLeftCorner.y}px`;
        overlay.style.width = `${location.bottomRightCorner.x - location.topLeftCorner.x}px`;
        overlay.style.height = `${location.bottomRightCorner.y - location.topLeftCorner.y}px`;

        document.body.appendChild(overlay);
        setTimeout(() => overlay.remove(), 2000);
    }

    function vibrateDevice() {
        if ("vibrate" in navigator) {
            navigator.vibrate(200);
        }
    }

    updateLanguage(currentLanguage); // Initialize with default language
});
