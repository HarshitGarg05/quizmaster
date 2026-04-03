import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { motion, AnimatePresence } from 'framer-motion';

const createImage = (url) =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = url;
    });

async function getCroppedImg(imageSrc, pixelCrop) {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    return canvas.toDataURL('image/jpeg');
}

const ImageCropper = ({ image, onCropComplete, onCancel }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const onCropChange = (crop) => {
        setCrop(crop);
    };

    const onZoomChange = (zoom) => {
        setZoom(zoom);
    };

    const onCropAreaComplete = useCallback((_croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleDone = async () => {
        try {
            const croppedImage = await getCroppedImg(image, croppedAreaPixels);
            onCropComplete(croppedImage);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-2 sm:p-8 bg-black/95 backdrop-blur-3xl">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-surface-container w-full max-w-2xl rounded-[2rem] sm:rounded-[3rem] border border-white/10 overflow-hidden flex flex-col max-h-[95vh]"
            >
                <div className="p-5 sm:p-8 border-b border-white/5 flex justify-between items-center bg-surface-container-high/50">
                    <h3 className="text-lg sm:text-2xl font-black font-headline text-on-surface uppercase tracking-tight leading-tight max-w-[80%]">Crop Identity Avatar</h3>
                    <button onClick={onCancel} className="material-symbols-outlined text-on-surface-variant hover:text-white transition-colors">close</button>
                </div>

                <div className="relative flex-grow min-h-[300px] sm:min-h-[400px] bg-[#050505]">
                    <Cropper
                        image={image}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={onCropChange}
                        onCropComplete={onCropAreaComplete}
                        onZoomChange={onZoomChange}
                        cropShape="round"
                        showGrid={false}
                    />
                </div>

                <div className="p-6 sm:p-10 space-y-6 sm:space-y-8 bg-surface-container-high/50">
                    <div className="space-y-4">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                            <span>Zoom Level</span>
                            <span>{Math.round(zoom * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(e.target.value)}
                            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={onCancel}
                            className="flex-1 py-3 sm:py-4 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface hover:bg-white/5 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDone}
                            className="flex-1 py-4 bg-primary rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl hover:opacity-90 active:scale-95 transition-all"
                        >
                            Set Avatar
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ImageCropper;
