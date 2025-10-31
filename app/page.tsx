"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, Download, X } from "lucide-react";

export default function Page() {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const [uploadedImage, setUploadedImage] = useState(null);
  const [borderColor, setBorderColor] = useState("#172F59");
  const [borderSize, setBorderSize] = useState(20);
  const [text, setText] = useState("ここにテキストを入力");
  const [textBackgroundColor, setTextBackgroundColor] = useState("#172F59");
  const [textSize, setTextSize] = useState(48);
  const [textPositionY, setTextPositionY] = useState(80);

  const canvasWidth = 1280;
  const canvasHeight = 720;

  // 画像アップロード
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => setUploadedImage(img);
      img.src = event.target?.result;
    };
    reader.readAsDataURL(file);
  };

  // ダウンロード
  const handleDownload = () => {
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = "thumbnail.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  // Canvas描画
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 枠
    ctx.fillStyle = borderColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

   // 画像があるとき（corner maskを先に作る）
if (uploadedImage) {
    // === 角丸マスクを適用（画像領域）=== 
    const radius = 30; // 好みで変更可能！

    ctx.beginPath();
    ctx.moveTo(borderSize + radius, borderSize);
    ctx.lineTo(canvasWidth - borderSize - radius, borderSize);
    ctx.quadraticCurveTo(canvasWidth - borderSize, borderSize, canvasWidth - borderSize, borderSize + radius);
    ctx.lineTo(canvasWidth - borderSize, canvasHeight - borderSize - radius);
    ctx.quadraticCurveTo(canvasWidth - borderSize, canvasHeight - borderSize, canvasWidth - borderSize - radius, canvasHeight - borderSize);
    ctx.lineTo(borderSize + radius, canvasHeight - borderSize);
    ctx.quadraticCurveTo(borderSize, canvasHeight - borderSize, borderSize, canvasHeight - borderSize - radius);
    ctx.lineTo(borderSize, borderSize + radius);
    ctx.quadraticCurveTo(borderSize, borderSize, borderSize + radius, borderSize);
    ctx.closePath();
    ctx.clip();

  const availW = canvasWidth - borderSize * 2;   // 枠の内側の幅
  const availH = canvasHeight - borderSize * 2;  // 枠の内側の高さ
  const availRatio = availW / availH;

  // 画像の実サイズ（naturalWidth/Height を使うのが確実）
  const imgW = uploadedImage.naturalWidth ?? uploadedImage.width;
  const imgH = uploadedImage.naturalHeight ?? uploadedImage.height;
  const imgRatio = imgW / imgH;

  // ソース側を中央トリミングして「cover」
  let sx = 0, sy = 0, sW = imgW, sH = imgH;

  if (imgRatio > availRatio) {
    // 画像が横に広い → 横をカット
    sH = imgH;
    sW = Math.round(sH * availRatio);
    sx = Math.round((imgW - sW) / 2);
    sy = 0;
  } else {
    // 画像が縦に長い → 上下をカット
    sW = imgW;
    sH = Math.round(sW / availRatio);
    sx = 0;
    sy = Math.round((imgH - sH) / 2);
  }

  // デスティネーションは内側をピッタリ埋める
  const dx = borderSize;
  const dy = borderSize;
  const dW = availW;
  const dH = availH;

  ctx.drawImage(uploadedImage, sx, sy, sW, sH, dx, dy, dW, dH);
}

    // テキスト背景
    // ===== テキスト描画 =====
ctx.font = `bold ${textSize}px "fot-udkakugo-large-pr6n", "Noto Sans JP", sans-serif`;
ctx.textAlign = "center";
ctx.textBaseline = "middle";

let textX = canvasWidth / 2;
let textY = canvasHeight - textPositionY; // ★ let に変更（上書きするため）

const textWidth = ctx.measureText(text).width;
const paddingX = 20;
const paddingY = 10;

const bgWidth = textWidth + paddingX * 2;
const bgHeight = textSize + paddingY * 2;

// ===== テキスト帯と枠の下端接触防止 =====
const minGap = 10;
const textBottom = textY + bgHeight / 2;
const bottomLimit = canvasHeight - borderSize - minGap;

if (textBottom > bottomLimit) {
  textY = bottomLimit - bgHeight / 2;
}

// 背景位置（中央揃え）
const bgX = textX - bgWidth / 2;
const bgY = textY - bgHeight / 2;

// 背景描画
ctx.fillStyle = textBackgroundColor;
// === テキスト帯角丸 ===
const bgRadius = 25;

ctx.beginPath();
ctx.moveTo(bgX + bgRadius, bgY);
ctx.lineTo(bgX + bgWidth - bgRadius, bgY);
ctx.quadraticCurveTo(bgX + bgWidth, bgY, bgX + bgWidth, bgY + bgRadius);
ctx.lineTo(bgX + bgWidth, bgY + bgHeight - bgRadius);
ctx.quadraticCurveTo(bgX + bgWidth, bgY + bgHeight, bgX + bgWidth - bgRadius, bgY + bgHeight);
ctx.lineTo(bgX + bgRadius, bgY + bgHeight);
ctx.quadraticCurveTo(bgX, bgY + bgHeight, bgX, bgY + bgHeight - bgRadius);
ctx.lineTo(bgX, bgY + bgRadius);
ctx.quadraticCurveTo(bgX, bgY, bgX + bgRadius, bgY);
ctx.closePath();

ctx.fillStyle = textBackgroundColor;
ctx.fill();


// テキスト描画（中央配置）
ctx.fillStyle = "#fff";
ctx.fillText(text, textX, textY);

  });

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-2">YouTube サムネイル作成ツール</h1>
      <p className="text-gray-600 mb-8">16:9の画像をアップロードしてください</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-7xl">
        
        {/* プレビュー */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-lg p-4">
          <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          style={{ width: "100%", height: "auto", aspectRatio: "16 / 9", display: "block" }}
          className="border rounded"
          />

        </div>

        {/* コントロール */}
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          
          {/* 画像アップロード */}
          <div>
            <label className="font-semibold text-sm">画像をアップロード</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <button
              onClick={() => fileInputRef.current.click()}
              className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50"
            >
              <Upload size={18} />
              画像をアップロード
            </button>
          </div>

          {/* 枠サイズ */}
          <div>
            <label className="font-semibold text-sm">枠のサイズ: {borderSize}px</label>
            <input
              type="range"
              min="0"
              max="100"
              value={borderSize}
              onChange={(e) => setBorderSize(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* 枠の色 */}
          <div>
            <label className="font-semibold text-sm">枠の色</label>
            <div className="flex gap-2 mt-2">
              {["#172F59", "#FF0000"].map((color) => (
                <button
                  key={color}
                  onClick={() => setBorderColor(color)}
                  className={`h-8 w-8 rounded-full border ${
                    borderColor === color ? "border-black" : ""
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* テキスト */}
          <div>
            <label className="font-semibold text-sm">テキスト</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full border p-2 rounded mt-1"
            />
          </div>

          {/* テキストサイズ */}
          <div>
            <label className="font-semibold text-sm">テキストサイズ: {textSize}px</label>
            <input
              type="range"
              min="20"
              max="120"
              value={textSize}
              onChange={(e) => setTextSize(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* テキスト背景色 */}
          <div>
            <label className="font-semibold text-sm">テキスト背景色</label>
            <div className="flex gap-2 mt-2">
              {["#172F59", "#FF0000"].map((color) => (
                <button
                  key={color}
                  onClick={() => setTextBackgroundColor(color)}
                  className="h-8 w-8 rounded-full border"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* テキスト位置 */}
          <div>
            <label className="font-semibold text-sm">テキスト位置: {textPositionY}px</label>
            <input
              type="range"
              min="20"
              max="600"
              value={textPositionY}
              onChange={(e) => setTextPositionY(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* ダウンロード */}
          <button
            onClick={handleDownload}
            className="w-full bg-blue-600 text-white py-3 rounded-lg flex items-center gap-2 justify-center hover:bg-blue-700"
          >
            <Download size={18} /> ダウンロード
          </button>

        </div>
      </div>
    </div>
  );
}
