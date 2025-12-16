import { useState, useRef, ChangeEvent } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IoImagesOutline, IoCloseCircle } from "react-icons/io5";
import { Vehicle } from "@/contexts/CustomerContext";
import { useToast } from "@/components/ui/use-toast";

interface VehicleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: number;
  vehicle?: Vehicle;
  onSave: (vehicleData: { tipo: string; placa: string; imagenes: string[] }) => Promise<void>;
  uploadImage: (file: File) => Promise<string>;
}

const VehicleModal: React.FC<VehicleModalProps> = ({
  open,
  onOpenChange,
  vehicle,
  onSave,
  uploadImage
}) => {
  const { toast } = useToast();
  const [tipo, setTipo] = useState(vehicle?.tipo || "");
  const [placa, setPlaca] = useState(vehicle?.placa || "");
  const [imagenes, setImagenes] = useState<string[]>(vehicle?.imagenes || []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleGalleryUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      try {
        setUploading(true);
        const uploadPromises = Array.from(files).map(file => uploadImage(file));
        const urls = await Promise.all(uploadPromises);
        
        setImagenes(prev => [...prev, ...urls]);
        toast({ title: "Fotos subidas", description: `${urls.length} fotos agregadas.` });
      } catch (error) {
        // Error handled in context
      } finally {
        setUploading(false);
      }
    }
  };

  const removeImage = (index: number) => {
    setImagenes(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tipo || !placa) {
      toast({
        title: "Error",
        description: "Tipo y placa son obligatorios",
        variant: "destructive",
      });
      return;
    }

    if (imagenes.length > 10) {
      toast({
        title: "Error",
        description: "Máximo 10 fotos permitidas",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      await onSave({ tipo, placa, imagenes });
      onOpenChange(false);
      // Reset form
      setTipo("");
      setPlaca("");
      setImagenes([]);
    } catch (error) {
      // Error handled in context
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{vehicle ? "Editar Vehículo" : "Agregar Vehículo"}</DialogTitle>
          <DialogDescription>
            Complete los datos del vehículo y agregue fotos (opcional, máx 10).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de vehículo *</Label>
              <Input
                id="tipo"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                placeholder="Ej: Sedán, SUV, Camioneta"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="placa">Placa *</Label>
              <Input
                id="placa"
                value={placa}
                onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                placeholder="Ej: ABC123"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Galería de Fotos (Máx 10)</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {imagenes.length}/10 fotos
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={uploading || imagenes.length >= 10}
                  className="h-8 gap-2"
                >
                  <IoImagesOutline className="h-4 w-4" />
                  {uploading ? 'Subiendo...' : 'Agregar Fotos'}
                </Button>
              </div>
              <input
                type="file"
                ref={galleryInputRef}
                onChange={handleGalleryUpload}
                multiple
                accept="image/*"
                className="hidden"
              />
            </div>

            {imagenes.length > 0 ? (
              <div className="grid grid-cols-4 gap-2 mt-2">
                {imagenes.map((img, index) => (
                  <div key={index} className="relative group aspect-square rounded-md overflow-hidden bg-muted border">
                    <img src={img} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <IoCloseCircle className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 border-2 border-dashed rounded-md text-center text-muted-foreground text-sm">
                No hay fotos. Puede agregar hasta 10 fotos del vehículo.
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving || imagenes.length > 10}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VehicleModal;
