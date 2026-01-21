import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Shield, Download, Scissors } from 'lucide-react';
import { toast } from 'sonner';
import { downloadPlayerDocuments } from '../../../utils/downloadDocuments';

interface DocumentsTabProps {
  editedPlayer: any;
  player: any;
  setEditingImage: (state: { url: string; field: string } | null) => void;
}

export function DocumentsTab({ editedPlayer, player, setEditingImage }: DocumentsTabProps) {
  const handleDownloadDocuments = async () => {
    const toastId = toast.loading('Generando PDF...');
    try {
      if (!editedPlayer.id_card_front_url || !editedPlayer.id_card_back_url) {
        toast.error('Faltan documentos para descargar', { id: toastId });
        return;
      }
      
      await downloadPlayerDocuments(
        player.name,
        editedPlayer.id_card_front_url,
        editedPlayer.id_card_back_url
      );
      
      toast.success('Documentos descargados exitosamente', { id: toastId });
    } catch (error) {
      console.error('Error downloading documents:', error);
      toast.error('Error al descargar los documentos', { id: toastId });
    }
  };

  return (
    <Card className="bg-card border-border p-8 min-h-[400px]">
      {editedPlayer.id_card_front_url || editedPlayer.id_card_back_url ? (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Shield size={20} className="text-primary" />
              Documentación de Identidad
            </h3>
            <Button
              onClick={handleDownloadDocuments}
              disabled={!editedPlayer.id_card_front_url || !editedPlayer.id_card_back_url}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            >
              <Download size={16} />
              Descargar Documentos
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Front Side */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Lado Frontal</p>
                <div className="flex gap-2">
                  {editedPlayer.id_card_front_url && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs px-2 border-primary/30 text-primary hover:bg-primary/10"
                        onClick={() => setEditingImage({ url: editedPlayer.id_card_front_url, field: 'id_card_front_url' })}
                      >
                        <Scissors size={12} className="mr-1" /> Editar/Rotar
                      </Button>
                      <a href={editedPlayer.id_card_front_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs flex items-center">Ver original</a>
                    </>
                  )}
                </div>
              </div>
              <div className="aspect-[1.6/1] relative group overflow-hidden rounded-xl border border-border bg-muted/30 flex items-center justify-center shadow-inner">
                {editedPlayer.id_card_front_url ? (
                  <img
                    src={editedPlayer.id_card_front_url}
                    alt="ID Front"
                    className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <p className="text-muted-foreground text-xs italic">No cargado</p>
                )}
              </div>
            </div>

            {/* Back Side */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Lado Posterior (Dorso)</p>
                <div className="flex gap-2">
                  {editedPlayer.id_card_back_url && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs px-2 border-primary/30 text-primary hover:bg-primary/10"
                        onClick={() => setEditingImage({ url: editedPlayer.id_card_back_url, field: 'id_card_back_url' })}
                      >
                        <Scissors size={12} className="mr-1" /> Editar/Rotar
                      </Button>
                      <a href={editedPlayer.id_card_back_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs flex items-center">Ver original</a>
                    </>
                  )}
                </div>
              </div>
              <div className="aspect-[1.6/1] relative group overflow-hidden rounded-xl border border-border bg-muted/30 flex items-center justify-center shadow-inner">
                {editedPlayer.id_card_back_url ? (
                  <img
                    src={editedPlayer.id_card_back_url}
                    alt="ID Back"
                    className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <p className="text-muted-foreground text-xs italic">No cargado</p>
                )}
              </div>
            </div>
          </div>

          {/* Legacy View */}
          {editedPlayer.id_card_url && !editedPlayer.id_card_front_url && (
            <div className="pt-8 border-t border-border space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Archivo Antiguo (Legacy)</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs px-2 border-primary/30 text-primary hover:bg-primary/10"
                  onClick={() => setEditingImage({ url: editedPlayer.id_card_url, field: 'id_card_url' })}
                >
                  <Scissors size={12} className="mr-1" /> Editar/Rotar
                </Button>
              </div>
              <div className="relative group overflow-hidden rounded-xl border border-border bg-muted/30 flex items-center justify-center shadow-inner">
                <img
                  src={editedPlayer.id_card_url}
                  alt="ID Legacy"
                  className="max-h-[300px] mx-auto object-contain transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full py-12 text-center">
          <Shield size={48} className="text-primary mx-auto mb-4 opacity-30" />
          <h3 className="text-lg font-bold mb-2 text-foreground">Gestión de Documentos</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            El jugador aún no ha cargado los archivos de su tarjeta de identidad.
          </p>
        </div>
      )}
    </Card>
  );
}
