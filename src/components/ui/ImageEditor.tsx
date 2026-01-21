import { useState, useCallback } from 'react';
import Cropper, { Area, Point } from 'react-easy-crop';
import { Button } from './button';
import { Slider } from './slider';
import { RotateCcw, Check, X, Scissors } from 'lucide-react';
import { useTheme } from '../ThemeContext';

interface ImageEditorProps {
    image: string;
    onSave: (blob: Blob) => void;
    onCancel: () => void;
    aspect?: number;
}

export function ImageEditor({ image, onSave, onCancel, aspect = 1.6 / 1 }: ImageEditorProps) {
    const { theme } = useTheme();
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', (error) => reject(error));
            image.setAttribute('crossOrigin', 'anonymous');
            image.src = url;
        });

    const getCroppedImg = async (
        imageSrc: string,
        pixelCrop: Area,
        rotation = 0
    ): Promise<Blob | null> => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) return null;

        const rotRad = (rotation * Math.PI) / 180;
        
        // Calculate bounding box after rotation
        const { width: bWidth, height: bHeight } = {
            width: Math.abs(Math.cos(rotRad) * image.width) + Math.abs(Math.sin(rotRad) * image.height),
            height: Math.abs(Math.sin(rotRad) * image.width) + Math.abs(Math.cos(rotRad) * image.height),
        };

        canvas.width = bWidth;
        canvas.height = bHeight;

        ctx.translate(bWidth / 2, bHeight / 2);
        ctx.rotate(rotRad);
        ctx.translate(-image.width / 2, -image.height / 2);
        ctx.drawImage(image, 0, 0);

        const data = ctx.getImageData(
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height
        );

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        ctx.putImageData(data, 0, 0);

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/jpeg', 0.9);
        });
    };

    const handleSave = async () => {
        try {
            if (croppedAreaPixels) {
                const croppedImage = await getCroppedImg(
                    image,
                    croppedAreaPixels,
                    rotation
                );
                if (croppedImage) {
                    onSave(croppedImage);
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className={`fixed inset-0 z-[110] flex flex-col p-4 sm:p-6 animate-in fade-in duration-300 ${
            theme === 'dark' 
                ? 'bg-black' 
                : 'bg-white'
        }`} style={theme === 'light' ? { backgroundColor: '#FFFFFF' } : {}}>
            {theme === 'light' && (
                <style>{`
                    .react-easy-crop_image {
                        background-color: white !important;
                    }
                    .react-easy-crop_container {
                        background-color: white !important;
                    }
                    /* Asegurar que todo sea opaco en tema claro */
                    div[class*="fixed"] {
                        background-color: white !important;
                    }
                `}</style>
            )}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        theme === 'dark'
                            ? 'bg-primary/20'
                            : 'bg-primary/10'
                    }`}>
                        <Scissors className="text-primary w-5 h-5" />
                    </div>
                    <div>
                        <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-foreground'}`}>
                            Editar Imagen
                        </h3>
                        <p className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-muted-foreground'}`}>
                            Rota y recorta para ajustar
                        </p>
                    </div>
                </div>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={onCancel}
                    className={`rounded-full ${
                        theme === 'dark'
                            ? 'text-white/60 hover:text-white hover:bg-white/10'
                            : 'text-foreground/60 hover:text-foreground hover:bg-foreground/5'
                    }`}
                >
                    <X size={24} />
                </Button>
            </div>

            <div className={`relative flex-1 rounded-2xl overflow-hidden shadow-2xl border ${
                theme === 'dark'
                    ? 'bg-zinc-950 border-white/5'
                    : 'bg-white border-border'
            }`}>
                <Cropper
                    image={image}
                    crop={crop}
                    zoom={zoom}
                    rotation={rotation}
                    aspect={aspect}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                    onRotationChange={setRotation}
                />
            </div>

            <div className={`mt-6 p-6 rounded-3xl border shadow-xl ${
                theme === 'dark'
                    ? 'bg-zinc-900/50 border-white/5 backdrop-blur-xl'
                    : 'bg-white border-border'
            }`} style={theme === 'light' ? { backgroundColor: '#FFFFFF' } : {}}>
                <div className="space-y-6">
                    {/* Zoom Control */}
                    <div className="space-y-3">
                        <div className={`flex justify-between text-xs font-medium uppercase tracking-wider ${
                            theme === 'dark' ? 'text-zinc-400' : 'text-muted-foreground'
                        }`}>
                            <span>Zoom</span>
                            <span className="text-primary">{Math.round(zoom * 100)}%</span>
                        </div>
                        <Slider
                            value={[zoom]}
                            min={1}
                            max={3}
                            step={0.1}
                            onValueChange={([val]) => setZoom(val)}
                            className="py-2"
                        />
                    </div>

                    {/* Rotation Control */}
                    <div className="space-y-3">
                        <div className={`flex justify-between text-xs font-medium uppercase tracking-wider ${
                            theme === 'dark' ? 'text-zinc-400' : 'text-muted-foreground'
                        }`}>
                            <span>Rotación</span>
                            <span className="text-primary">{rotation}°</span>
                        </div>
                        <Slider
                            value={[rotation]}
                            min={0}
                            max={360}
                            step={90}
                            onValueChange={([val]) => setRotation(val)}
                            className="py-2"
                        />
                    </div>

                    <div className="flex gap-4 pt-2">
                        <Button 
                            variant="outline" 
                            className={`flex-1 h-14 rounded-2xl font-semibold ${
                                theme === 'dark'
                                    ? 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                                    : 'bg-foreground/5 border-border text-foreground hover:bg-foreground/10'
                            }`}
                            onClick={() => setRotation((prev) => (prev + 90) % 360)}
                        >
                            <RotateCcw className="mr-2 w-5 h-5" /> Rotar 90°
                        </Button>
                        <Button 
                            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground h-14 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20"
                            onClick={handleSave}
                        >
                            <Check className="mr-2 w-6 h-6" /> Guardar
                        </Button>
                    </div>
                </div>
            </div>
            
            <p className={`mt-4 text-center text-[10px] uppercase tracking-[0.2em] font-medium ${
                theme === 'dark'
                    ? 'text-zinc-500'
                    : 'text-muted-foreground'
            }`}>
                GOLICA Pro Image Editor
            </p>
        </div>
    );
}
