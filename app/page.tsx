"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, Download, X } from "lucide-react";

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null);
  const [logoBlue, setLogoBlue] = useState<HTMLImageElement | null>(null);
  const [logoRed, setLogoRed] = useState<HTMLImageElement | null>(null);
  
  // 新しいデザインベースの状態
  const [baseFrameBlue, setBaseFrameBlue] = useState<HTMLImageElement | null>(null);
  const [baseFrameRed, setBaseFrameRed] = useState<HTMLImageElement | null>(null);

  const [borderColor, setBorderColor] = useState("#172F59");
  const borderSize = 20;
  const [text, setText] = useState("ここにショートタイトルを入力");
  const [textSize, setTextSize] = useState(70);
  
  // テキスト位置の初期値（下部帯の中央）
  const [textPositionY, setTextPositionY] = useState(608);

  // 画像の上下位置の初期値（0 = 中央ぴったり）
  const [imagePositionY, setImagePositionY] = useState(0);

  // ★【追加】文字間隔の状態（初期値はこれまでの -2）
  const [letterSpacing, setLetterSpacing] = useState(-2);

  const canvasWidth = 1280;
  const canvasHeight = 720;

  // 画像をすべて読み込み
  useEffect(() => {
    // テレ朝NEWSロゴ
    const blueLogo = new Image();
    blueLogo.src = "/youtube_ann_logo.png";
    const redLogo = new Image();
    redLogo.src = "/youtube_ann_logo_red.png";
    blueLogo.onload = () => setLogoBlue(blueLogo);
    redLogo.onload = () => setLogoRed(redLogo);

    // 新しいデザインベース（★前提：透過PNGであること）
    const blueFrame = new Image();
    blueFrame.src = "/base_frame_blue.png";
    const redFrame = new Image();
    redFrame.src = "/base_frame_red.png";
    blueFrame.onload = () => setBaseFrameBlue(blueFrame);
    redFrame.onload = () => setBaseFrameRed(redFrame);
  }, []);

  // 画像アップロード
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => setUploadedImage(img as HTMLImageElement);
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // ダウンロード
  const handleDownload = () => {
    const canvas = canvasRef.current as HTMLCanvasElement | null;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "thumbnail.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  // フォントをロードする（1回だけ実行）
  useEffect(() => {
    (async () => {
      try {
        await document.fonts.load(`48px "テレ朝UD角ゴ Pr6N DB"`);
        console.log("フォントロード完了：テレ朝UD角ゴ Pr6N DB");
      } catch (e) {
        console.warn("フォントロードに失敗しました", e);
      }
    })();
  }, []);

  // Canvas描画
  useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement | null;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // キャンバスサイズ設定
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // 背景（白）
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // === プレースホルダーの正確な座標とサイズ ===
    const placeholderX = 30;
    const placeholderY = 30;
    const placeholderW = 1220; // 1280 - 30 * 2
    const placeholderH = 560;  // 590 - 30

    // 画像があるとき（キャンバス全体をカバーするように拡大）
    if (uploadedImage) {
      const availW = canvasWidth;
      const availH = canvasHeight;
      const availRatio = availW / availH;

      const imgW = uploadedImage.naturalWidth ?? uploadedImage.width;
      const imgH = uploadedImage.naturalHeight ?? uploadedImage.height;
      const imgRatio = imgW / imgH;

      let sx = 0, sy = 0, sW = imgW, sH = imgH;

      if (imgRatio > availRatio) {
        sH = imgH;
        sW = Math.round(sH * availRatio);
        sx = Math.round((imgW - sW) / 2);
        sy = 0;
      } else {
        sW = imgW;
        sH = Math.round(sW / availRatio);
        sx = 0;
        sy = Math.round((imgH - sH) / 2);
      }

      // 画像はキャンバス全体に描画（透過枠の下に回り込ませる）
      ctx.drawImage(uploadedImage, sx, sy, sW, sH, 0, imagePositionY, canvasWidth, canvasHeight);
    }

    // ===== 新しいベースフレーム画像の描画 =====
    let baseToUse = baseFrameBlue;
    if (borderColor.toLowerCase() === "#c90a0f") {
      baseToUse = baseFrameRed;
    }

    if (baseToUse) {
      ctx.drawImage(baseToUse, 0, 0, canvasWidth, canvasHeight);
    }

    // ==== テレ朝NEWS ロゴ描画 ====
    let logoToUse = logoBlue;
    if (borderColor.toLowerCase() === "#c90a0f") {
      logoToUse = logoRed;
    }

    if (logoToUse) {
      const logoWidth = 180;
      const logoHeight = (logoToUse.height / logoToUse.width) * logoWidth;
      const padding = -11;

      // ロゴはプレースホルダーの上に重ねる（プレースホルダーの基準座標を使用）
      ctx.drawImage(logoToUse, placeholderX + padding, placeholderY + padding, logoWidth, logoHeight);
    }

    // テキストが空なら、文字は描画しない
    if (!text.trim()) {
      return;
    }

    ctx.font = `${textSize}px "テレ朝UD角ゴ Pr6N DB", "Noto Sans JP", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    let textX = canvasWidth / 2;
    let textY = textPositionY;

    // ★ 固定値（const letterSpacing = -2;）だった部分を削除し、Stateの値をそのまま使うようにしました

    // テキスト幅を測定
    let actualTextWidth = 0;
    for (let i = 0; i < text.length; i++) {
      const charWidth = ctx.measureText(text[i]).width;
      actualTextWidth += charWidth;
    }
    actualTextWidth += letterSpacing * (text.length - 1);

    // ===== テキストと画面下端の接触防止 =====
    const minGap = 15;
    const bottomLimit = canvasHeight - minGap; 

    if (textY + textSize / 2 > bottomLimit) {
      textY = bottomLimit - textSize / 2;
    }

    const trimmedText = text.trim();
    if (trimmedText) {
      // ===== テキストの描画（背景座布団なし） =====
      ctx.fillStyle = "#FFFFFF"; 

      let currentX = textX - actualTextWidth / 2;

      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;

        ctx.fillText(char, currentX + charWidth / 2, textY);

        currentX += charWidth + letterSpacing;
      }
    }

  }, [
    uploadedImage,
    borderColor,
    borderSize,
    text,
    textSize,
    textPositionY,
    imagePositionY,
    letterSpacing, // ★【追加】文字間隔の変更をCanvasに伝えるために監視リストに追加
    logoBlue, 
    logoRed,  
    baseFrameBlue, 
    baseFrameRed,  
  ]);

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-2">YouTube サムネイル作成ツール</h1>
      <p className="text-gray-600 mb-8">テレ朝UDが使用可能なPCでは、フォントが適用されます。</p>

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
              onClick={() => fileInputRef.current?.click()}
              className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50"
            >
              <Upload size={18} />
              画像をアップロード
            </button>
          </div>

          {/* 画像位置の調整スライダー */}
          {uploadedImage && (
            <div>
              <label className="font-semibold text-sm">画像上下位置: {imagePositionY}px</label>
              <input
                type="range"
                min="-150"
                max="150"
                value={imagePositionY}
                onChange={(e) => setImagePositionY(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          )}

          {/* 全体のカラー（下部帯とロゴ） */}
          <div>
            <label className="font-semibold text-sm">全体のカラー</label>
            <div className="flex gap-2 mt-2">
              {["#172F59", "#c90a0f"].map((color) => (
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
              min="70"
              max="200"
              value={textSize}
              onChange={(e) => setTextSize(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* テキスト位置 */}
          <div>
            <label className="font-semibold text-sm">テキスト位置: {textPositionY}px</label>
            <input
              type="range"
              min="590"
              max="648"
              value={textPositionY}
              onChange={(e) => setTextPositionY(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* ★【追加】文字間隔スライダー */}
          <div>
            <label className="font-semibold text-sm">文字間隔: {letterSpacing}px</label>
            <input
              type="range"
              min="-20"
              max="30"
              value={letterSpacing}
              onChange={(e) => setLetterSpacing(parseInt(e.target.value))}
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