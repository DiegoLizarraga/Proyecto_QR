import React, { useEffect, useRef, useState } from 'react';

export default function QRScanner() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [scannedData, setScannedData] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [jsQRLoaded, setJsQRLoaded] = useState(false);
  const [lastDetected, setLastDetected] = useState('');
  const lastScannedRef = useRef('');

  // Cargar la librería jsQR
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jsqr/1.4.0/jsQR.min.js';
    script.onload = () => setJsQRLoaded(true);
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!isScanning) return;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setError('');
      } catch (err) {
        setError('No se pudo acceder a la cámara. Verifica los permisos.');
      }
    };

    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [isScanning]);

  useEffect(() => {
    if (!isScanning || !videoRef.current || !jsQRLoaded) return;

    const scanInterval = setInterval(() => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video || video.readyState !== video.HAVE_ENOUGH_DATA) return;

      const ctx = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      if (window.jsQR) {
        // Intentar escanear múltiples veces con diferentes procesientos
        let code = window.jsQR(imageData.data, imageData.width, imageData.height);
        
        // Si no lo detecta, intentar con imagen invertida
        if (!code) {
          const data = imageData.data;
          for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i];
            data[i + 1] = 255 - data[i + 1];
            data[i + 2] = 255 - data[i + 2];
          }
          code = window.jsQR(data, imageData.width, imageData.height);
        }

        if (code && code.data !== lastScannedRef.current) {
          lastScannedRef.current = code.data;
          setLastDetected(code.data);
          const newEntry = {
            id: Date.now(),
            data: code.data,
            timestamp: new Date().toLocaleTimeString('es-MX')
          };
          setScannedData(prev => [newEntry, ...prev]);
        } else if (code) {
          setLastDetected(code.data);
        }
      }
    }, 200);

    return () => clearInterval(scanInterval);
  }, [isScanning, jsQRLoaded]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const removeEntry = (id) => {
    setScannedData(prev => prev.filter(item => item.id !== id));
  };

  const clearAll = () => {
    setScannedData([]);
    lastScannedRef.current = '';
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <h1 className="text-3xl font-bold text-gray-800">📱 Lector QR</h1>
          </div>

          <div className="mb-6">
            <button
              onClick={() => setIsScanning(!isScanning)}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition ${
                isScanning
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {isScanning ? 'Detener lectura' : 'Iniciar lectura'}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3 items-start mb-4">
              <span className="text-red-600 text-xl">⚠️</span>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {isScanning && (
            <div className="bg-gray-100 rounded-lg overflow-hidden mb-6">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full aspect-video object-cover"
              />
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />

          {isScanning && lastDetected && (
            <div className="bg-indigo-600 text-white p-4 rounded-lg mt-4">
              <p className="text-xs text-indigo-200 mb-1">🔍 QR Detectado:</p>
              <p className="text-sm font-mono break-all mb-3">{lastDetected}</p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => copyToClipboard(lastDetected)}
                  className="px-3 py-1.5 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded text-sm font-medium transition"
                >
                  📋 Copiar
                </button>
                {isValidUrl(lastDetected) && (
                  <a
                    href={lastDetected}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded text-sm font-medium transition"
                  >
                    🔗 Ir al enlace
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {scannedData.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Códigos escaneados ({scannedData.length})
              </h2>
              <button
                onClick={clearAll}
                className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition text-sm font-medium"
              >
                🗑️ Limpiar
              </button>
            </div>

            <div className="space-y-3">
              {scannedData.map(item => (
                <div key={item.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start gap-3 mb-2">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">{item.timestamp}</p>
                      <p className="text-sm font-mono text-gray-800 break-all bg-white p-2 rounded border border-gray-200">
                        {item.data}
                      </p>
                    </div>
                    <button
                      onClick={() => removeEntry(item.id)}
                      className="text-gray-400 hover:text-red-600 transition text-lg"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => copyToClipboard(item.data)}
                      className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-sm font-medium transition"
                    >
                      📋 Copiar
                    </button>
                    {isValidUrl(item.data) && (
                      <a
                        href={item.data}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded text-sm font-medium transition"
                      >
                        🔗 Abrir enlace
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}