import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from './button';
import { Camera, X } from 'lucide-react';
import { toast } from 'sonner';
import { ImageEditor } from './ImageEditor';

interface CameraCaptureProps {
    onCapture: (blob: Blob) => void;
    onClose: () => void;
    title: string;
}

export function CameraCapture({ onCapture, onClose, title }: CameraCaptureProps) {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [showEditor, setShowEditor] = useState(false);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const startCamera = useCallback(async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setIsCameraReady(true);
        } catch (err) {
            console.error("Error accessing camera:", err);
            toast.error("No se pudo acceder a la cámara. Revisa los permisos.");
            onClose();
        }
    }, [onClose]);

    useEffect(() => {
        startCamera();
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;
        
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        if (context) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            setCapturedImage(dataUrl);
            setShowEditor(true);
            
            // Stop camera stream after capture
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                setStream(null);
            }
        }
    };

    const handleSaveCropped = (blob: Blob) => {
        onCapture(blob);
    };

    const handleCancelEditor = () => {
        setShowEditor(false);
        setCapturedImage(null);
        startCamera();
    };

    if (showEditor && capturedImage) {
        return (
            <ImageEditor 
                image={capturedImage} 
                onSave={handleSaveCropped} 
                onCancel={handleCancelEditor}
                aspect={1.6 / 1}
            />
        );
    }

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl relative bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                
                {/* Header */}
                <div className="absolute top-0 inset-x-0 p-4 flex items-center justify-between z-20 bg-gradient-to-b from-black/60 to-transparent">
                    <h3 className="text-white font-bold">{title}</h3>
                    <button onClick={onClose} className="p-2 text-white/80 hover:text-white bg-black/20 rounded-full">
                        <X size={24} />
                    </button>
                </div>

                {/* Viewport */}
                <div className="relative aspect-[4/3] bg-black flex items-center justify-center">
                    <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        className="w-full h-full object-cover"
                    />
                    {/* Framing Guide Overlay */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="w-[85%] aspect-[1.6/1] border-2 border-primary/60 rounded-xl relative">
                            <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                            <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                            <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
                            <div className="absolute inset-0 bg-primary/5 flex items-center justify-center">
                                <p className="text-white/40 text-xs font-bold uppercase tracking-widest text-center px-4">
                                    Alinea tu tarjeta aquí
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="p-6 flex items-center justify-around bg-zinc-900">
                    <button 
                        onClick={capturePhoto} 
                        disabled={!isCameraReady}
                        className="w-16 h-16 bg-white rounded-full border-4 border-white/20 flex items-center justify-center active:scale-90 transition-transform disabled:opacity-50"
                    >
                        <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center">
                            <Camera className="text-white" size={24} />
                        </div>
                    </button>
                </div>

                <canvas ref={canvasRef} className="hidden" />
            </div>
            
            <p className="mt-4 text-white/60 text-sm text-center max-w-xs">
                Ubica la tarjeta de frente a la cámara dentro del recuadro. Luego podrás rotarla y recortarla.
            </p>
        </div>
    );
}

