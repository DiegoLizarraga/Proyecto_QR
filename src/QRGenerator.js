import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

export default function QRGenerator() {
  const [text, setText] = useState('');
  const [size] = useState(256);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [level, setLevel] = useState('H');
  const [includeMargin, setIncludeMargin] = useState(true);

  const downloadQR = () => {
    const canvas = document.getElementById('qr-gen-canvas');
    if (!canvas) return;

    const pngUrl = canvas
      .toDataURL('image/png')
      .replace('image/png', 'image/octet-stream');
    let downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `qr_code.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">✨ Generador QR</h1>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Enlace o Texto
          </label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="https://ejemplo.com o cualquier texto"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color (Frente)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="h-10 w-10 p-1 border border-gray-300 rounded cursor-pointer"
              />
              <span className="text-sm text-gray-600 font-mono">{fgColor}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color (Fondo)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="h-10 w-10 p-1 border border-gray-300 rounded cursor-pointer"
              />
              <span className="text-sm text-gray-600 font-mono">{bgColor}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nivel de Corrección
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none bg-white"
            >
              <option value="L">Bajo (7%)</option>
              <option value="M">Medio (15%)</option>
              <option value="Q">Cuartil (25%)</option>
              <option value="H">Alto (30%)</option>
            </select>
          </div>
          <div className="flex items-center mt-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeMargin}
                onChange={(e) => setIncludeMargin(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-gray-700">Incluir Margen</span>
            </label>
          </div>
        </div>
      </div>

      {text && (
        <div className="mt-8 flex flex-col items-center">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 inline-block">
            <QRCodeCanvas
              id="qr-gen-canvas"
              value={text}
              size={size}
              fgColor={fgColor}
              bgColor={bgColor}
              level={level}
              includeMargin={includeMargin}
            />
          </div>
          <button
            onClick={downloadQR}
            className="mt-6 w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
          >
            ⬇️ Descargar QR
          </button>
        </div>
      )}

      {!text && (
        <div className="mt-8 p-8 border-2 border-dashed border-gray-300 rounded-lg text-center">
          <p className="text-gray-500">
            Ingresa un texto o enlace arriba para generar tu código QR
          </p>
        </div>
      )}
    </div>
  );
}
