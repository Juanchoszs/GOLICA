import { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ArrowLeft, Save, Shield, Activity, Heart, Trophy, FileDown } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../utils/supabase/client';
import { ImageEditor } from '../ui/ImageEditor';
import { PersonalInfoTab } from './tabs/PersonalInfoTab';
import { HealthTab } from './tabs/HealthTab';
import { TestsTab } from './tabs/TestsTab';
import { DocumentsTab } from './tabs/DocumentsTab';
import { TournamentsTab } from './tabs/TournamentsTab';
import { generatePlayerSheet } from '../../utils/generatePlayerSheet';

interface PlayerDetailsProps {
  player: any;
  onBack: () => void;
  user: any;
  isEmbedded?: boolean;
}

export function PlayerDetails({ player, onBack, user, isEmbedded = false }: PlayerDetailsProps) {
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
    // Include all fields that were missing and causing data loss
    weight: player.weight || '',
    height: player.height || '',
    previous_team: player.previous_team || '',
    birth_date: player.birth_date || player.birthDate || '',
    id_card_front_url: player.id_card_front_url || '',
    id_card_back_url: player.id_card_back_url || '',
  });
  const [isSaving, setIsSaving] = useState(false);

  // Image editing state
  const [editingImage, setEditingImage] = useState<{ url: string, field: string } | null>(null);

  // Signed URLs for private documents
  const [signedUrls, setSignedUrls] = useState<{ [key: string]: string }>({});

  const fetchSignedUrls = async () => {
    const fields = ['id_card_front_url', 'id_card_back_url', 'id_card_url'];
    const newSignedUrls: { [key: string]: string } = {};

    for (const field of fields) {
      const url = editedPlayer[field];
      if (url && url.includes('player-documents')) {
        try {
          // Extract path: everything after the bucket name
          const path = url.split('player-documents/')[1]?.split('?')[0];
          if (path) {
            const { data, error } = await supabase.storage
              .from('player-documents')
              .createSignedUrl(path, 3600); // 1 hour

            if (data?.signedUrl) {
              newSignedUrls[field] = data.signedUrl;
            }
          }
        } catch (err) {
          console.error(`Error creating signed URL for ${field}:`, err);
        }
      }
    }
    setSignedUrls(newSignedUrls);
  };

  useState(() => {
    fetchSignedUrls();
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. Update Profile Data (Shared fields)
      const profileData = {
        name: editedPlayer.name,
        email: editedPlayer.email,
        phone: editedPlayer.phone,
        identification: editedPlayer.identification,
        updated_at: new Date().toISOString()
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', player.id);

      if (profileError) throw profileError;

      // 2. Update Player Data (Specific fields)
      // Only include fields that exist in the database based on database_setup.sql
      // Note: 'description', 'weight', 'height', 'previous_team', 'id_card_*' are strictly dependent on the SQL script being run.
      // We will try to include them, but if they fail, we might need to be more conservative or ensure SQL is run.
      // However, 'updated_at' does NOT exist in players, 'registered_at' does.

      const playerData: any = {
        category: editedPlayer.category,
        position: editedPlayer.position,
        status: editedPlayer.status,
        photo_url: editedPlayer.photo_url || null,
        // We attempt to save these, but if columns miss, it might fail. 
        // Ideally we check if they exist or catch error, but standard is to expect schema sync.
        // Since user refuses SQL, we only send what is 100% sure or essential.
        // But user WANTS documents. So we MUST send id_card fields.
        id_card_front_url: editedPlayer.id_card_front_url || null,
        id_card_back_url: editedPlayer.id_card_back_url || null,
        description: editedPlayer.description,
        weight: editedPlayer.weight,
        height: editedPlayer.height,
        previous_team: editedPlayer.previous_team,
        // JSONB fields
        performance: editedPlayer.performance,
        injuries: editedPlayer.injuries,
        tests: editedPlayer.tests,
        tournaments: editedPlayer.tournaments
      };

      if (editedPlayer.birth_date || editedPlayer.birthDate) {
        playerData.birth_date = editedPlayer.birth_date || editedPlayer.birthDate || null;
      }

      const { error: playerError } = await supabase
        .from('players')
        .update(playerData)
        .eq('id', player.id);

      if (playerError) {
        // Fallback: If update fails likely due to missing columns, try a minimal update
        console.warn("Full update failed, trying minimal update...", playerError);
        const minimalData = {
          category: editedPlayer.category,
          position: editedPlayer.position,
          status: editedPlayer.status,
          photo_url: editedPlayer.photo_url || null,
          birth_date: playerData.birth_date
        };
        const { error: minimalError } = await supabase
          .from('players')
          .update(minimalData)
          .eq('id', player.id);

        if (minimalError) throw minimalError;
        toast.warning('Se guardaron datos básicos. Faltan columnas para documentos/extras en la base de datos.');
      } else {
        toast.success('Información actualizada correctamente');
      }

      // Only call onBack if not embedded, or refresh list if needed
      if (!isEmbedded) onBack();
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
      // Separar buckets según el campo
      const isPhoto = editingImage.field === 'photo_url';
      const bucketName = isPhoto ? 'player-photos' : 'player-documents';

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
      // Organize photos in a 'photos' folder within the bucket if desired, or just by ID
      const folder = editingImage.field === 'photo_url' ? 'fotos de perfil' : 'documents';
      const fileName = `${player.id}/${folder}/${editingImage.field}_${Date.now()}.jpg`;

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (error) throw error; // This is a storage error

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      // 3. Update database with new URL
      // Try to update the specific field. If it fails (e.g. column missing), notify user but keep the file.
      const { error: dbError, data: updateData } = await supabase
        .from('players')
        .update({ [editingImage.field]: publicUrl })
        .eq('id', player.id)
        .select('*');

      if (dbError) {
        console.error("Error saving URL to DB:", dbError);
        toast.error(`❌ NO SE HA PODIDO GUARDAR LA IMAGEN EN LA BASE DE DATOS. Error: ${dbError.message}`, { id: toastId, duration: 10000 });
      } else if (!updateData || updateData.length === 0) {
        toast.error(`❌ Fila no encontrada. La actualización silenció el error. Revisa RLS.`, { id: toastId, duration: 10000 });
      } else {
        toast.success(`✅ Imagen de ${editingImage.field === 'photo_url' ? 'perfil' : 'documento'} guardada perfectamente en el servidor`, { id: toastId, duration: 8000 });

        // Update local state
        setEditedPlayer(prev => ({
          ...prev,
          [editingImage.field]: publicUrl
        }));

        // Refresh signed URLs if it was a document
        if (editingImage.field !== 'photo_url') {
          fetchSignedUrls();
        }
      }

      setEditingImage(null);
    } catch (error) {
      console.error('Error in handleUpdateImage:', error);
      toast.error('Error al procesar la imagen', { id: toastId });
    } finally {
      toast.dismiss(toastId);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-CO', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
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
    <div className={`p-4 md:p-8 ${isEmbedded ? 'h-full overflow-y-auto' : ''}`}>
      {/* Header */}
      <div className="mb-6">
        {!isEmbedded && (
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4 text-foreground hover:bg-muted"
          >
            <ArrowLeft size={20} className="mr-2" />
            Volver a la lista
          </Button>
        )}

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
                Registrado el {formatDate(player.registeredAt || player.registered_at)}
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
          <DocumentsTab 
            editedPlayer={editedPlayer} 
            player={player} 
            setEditingImage={setEditingImage} 
            signedUrls={signedUrls}
          />
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
