import { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ArrowLeft, Save, Shield, Activity, Heart, Trophy, FileDown } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../utils/supabase/client';
import { ImageEditor } from '../ui/ImageEditor';
import { PersonalInfoTab } from './tabs/PersonalInfoTab';
import { PerformanceTab } from './tabs/PerformanceTab';
import { HealthTab } from './tabs/HealthTab';
import { TestsTab } from './tabs/TestsTab';
import { DocumentsTab } from './tabs/DocumentsTab';
import { TournamentsTab } from './tabs/TournamentsTab';
import { generatePlayerSheet } from '../../utils/generatePlayerSheet';

interface PlayerDetailsProps {
  player: any;
  onBack: () => void;
  user: any;
}

export function PlayerDetails({ player, onBack, user }: PlayerDetailsProps) {
  const [editedPlayer, setEditedPlayer] = useState({
    ...player,
    description: player.description || '',
    position: player.position || '',
    performance: player.performance || {
      training: 0,
      matchGoals: 0,
      matchAssists: 0,
    },
    injuries: player.injuries || [],
    tests: player.tests || [],
    photo_url: player.photo_url || '',
    tournaments: player.tournaments || [],
  });
  const [isSaving, setIsSaving] = useState(false);
  
  // Image editing state
  const [editingImage, setEditingImage] = useState<{ url: string, field: string } | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updateData: any = {
        name: editedPlayer.name,
        email: editedPlayer.email,
        phone: editedPlayer.phone,
        identification: editedPlayer.identification,
        category: editedPlayer.category,
        position: editedPlayer.position,
        status: editedPlayer.status,
        description: editedPlayer.description,
        performance: editedPlayer.performance,
        injuries: editedPlayer.injuries || [],
        tests: editedPlayer.tests || [],
        tournaments: editedPlayer.tournaments || [],
        photo_url: editedPlayer.photo_url || null,
        id_card_front_url: editedPlayer.id_card_front_url || null,
        id_card_back_url: editedPlayer.id_card_back_url || null,
        weight: editedPlayer.weight || null,
        height: editedPlayer.height || null,
        previous_team: editedPlayer.previous_team || null,
        updated_at: new Date().toISOString()
      };

      if (editedPlayer.birth_date || editedPlayer.birthDate) {
        updateData.birth_date = editedPlayer.birth_date || editedPlayer.birthDate;
      }

      const { data, error } = await supabase
        .from('players')
        .update(updateData)
        .eq('id', player.id)
        .select()
        .single();

      if (error) throw error;

      toast.success('Información actualizada correctamente');
      onBack();
    } catch (error) {
      console.error('Error updating player:', error);
      toast.error('Error al actualizar la información');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateImage = async (blob: Blob) => {
    if (!editingImage) return;

    const toastId = toast.loading('Subiendo imagen editada...');
    try {
      const bucketName = editingImage.field === 'photo_url' ? 'player-photos' : 'player-documents';
      
      // 1. Delete old image if it exists
      const oldUrl = editedPlayer[editingImage.field];
      if (oldUrl && oldUrl.includes(bucketName)) {
        try {
          // Extract path from public URL
          const pathParts = oldUrl.split(`${bucketName}/`)[1];
          if (pathParts) {
            const filePath = pathParts.split('?')[0]; // Remove any query params
            await supabase.storage
              .from(bucketName)
              .remove([filePath]);
          }
        } catch (delError) {
          console.error('Error deleting old image:', delError);
        }
      }

      // 2. Upload new image
      const fileName = `${player.id}/${editingImage.field}_${Date.now()}.jpg`;
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      setEditedPlayer({
        ...editedPlayer,
        [editingImage.field]: publicUrl
      });
      
      setEditingImage(null);
      toast.success('Imagen actualizada localmente. No olvides guardar los cambios del perfil.', { id: toastId });
    } catch (error) {
      console.error('Error uploading edited image:', error);
      toast.error('Error al subir la imagen editada', { id: toastId });
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (editingImage) {
    return (
      <ImageEditor 
        image={editingImage.url}
        onSave={handleUpdateImage}
        onCancel={() => setEditingImage(null)}
        aspect={editingImage.field === 'photo_url' ? 1 / 1 : 1.6 / 1}
      />
    );
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4 text-foreground hover:bg-muted"
        >
          <ArrowLeft size={20} className="mr-2" />
          Volver a la lista
        </Button>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-primary/20 border-2 border-primary/30 rounded-full flex items-center justify-center">
              <span className="text-primary font-bold text-2xl">
                {player.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">{player.name}</h1>
              <p className="text-muted-foreground">ID: {player.identification}</p>
              <p className="text-muted-foreground text-sm">
                Registrado el {formatDate(player.registered_at)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => generatePlayerSheet(editedPlayer)}
              className="border-primary/30 text-primary hover:bg-primary/10"
            >
              <FileDown size={20} className="mr-2" />
              Descargar Ficha
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Save size={20} className="mr-2" />
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="bg-muted/30 mb-6">
          <TabsTrigger value="info" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Información General
          </TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Activity size={16} className="mr-2" />
            Rendimiento
          </TabsTrigger>
          <TabsTrigger value="health" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Heart size={16} className="mr-2" />
            Fisioterapia
          </TabsTrigger>
          <TabsTrigger value="tests" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Trophy size={16} className="mr-2" />
            Tests
          </TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Shield size={16} className="mr-2" />
            Documentos
          </TabsTrigger>
          <TabsTrigger value="tournaments" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Trophy size={16} className="mr-2" />
            Torneos
          </TabsTrigger>
        </TabsList>

        {/* Información General */}
        <TabsContent value="info">
          <PersonalInfoTab editedPlayer={editedPlayer} setEditedPlayer={setEditedPlayer} setEditingImage={setEditingImage} />
        </TabsContent>

        {/* Rendimiento */}
        <TabsContent value="performance">
          <PerformanceTab editedPlayer={editedPlayer} setEditedPlayer={setEditedPlayer} />
        </TabsContent>

        {/* Fisioterapia */}
        <TabsContent value="health">
          <HealthTab editedPlayer={editedPlayer} setEditedPlayer={setEditedPlayer} playerId={player.id} />
        </TabsContent>

        {/* Tests */}
        <TabsContent value="tests">
          <TestsTab editedPlayer={editedPlayer} />
        </TabsContent>

        {/* Documentos */}
        <TabsContent value="documents" className="mt-6">
          <DocumentsTab editedPlayer={editedPlayer} player={player} setEditingImage={setEditingImage} />
        </TabsContent>

        {/* Torneos */}
        <TabsContent value="tournaments">
          <TournamentsTab editedPlayer={editedPlayer} setEditedPlayer={setEditedPlayer} playerId={player.id} />
        </TabsContent>
      </Tabs>

      {/* Bottom Actions */}
      <div className="flex justify-start mt-8">
        <Button
          variant="outline"
          onClick={onBack}
          className="border-border text-foreground hover:bg-muted"
        >
          <ArrowLeft size={20} className="mr-2" />
          Volver a la lista
        </Button>
      </div>
    </div>
  );
}
