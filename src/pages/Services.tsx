import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IoAddOutline, IoCarSportOutline, IoTrashOutline, IoPencilOutline } from "react-icons/io5";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

interface Service {
  id: number;
  name: string;
  description: string;
  duration: string;
  price: string;
  popular: boolean;
}

const initialServices: Service[] = [
  {
    id: 1,
    name: "Lavado Express",
    description: "Lavado exterior rápido y eficiente",
    duration: "15 min",
    price: "5",
    popular: false,
  },
  {
    id: 2,
    name: "Lavado Completo",
    description: "Lavado exterior e interior profundo",
    duration: "45 min",
    price: "10",
    popular: true,
  },
  {
    id: 3,
    name: "Encerado Premium",
    description: "Encerado profesional con cera de alta calidad",
    duration: "60 min",
    price: "20",
    popular: true,
  },
  {
    id: 4,
    name: "Pulido de Faros",
    description: "Restauración y pulido de faros delanteros",
    duration: "30 min",
    price: "8",
    popular: false,
  },
  {
    id: 5,
    name: "Limpieza de Motor",
    description: "Limpieza profunda del compartimento del motor",
    duration: "40 min",
    price: "12",
    popular: false,
  },
  {
    id: 6,
    name: "Detallado Completo",
    description: "Servicio premium con todo incluido",
    duration: "3 hrs",
    price: "35",
    popular: true,
  },
];

const Services = () => {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [dolarRate, setDolarRate] = useState<number | null>(null);
  const { toast } = useToast();
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    duration: "",
    description: "",
  });

  useEffect(() => {
    const fetchDolarRate = async () => {
      try {
        const response = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
        if (!response.ok) throw new Error('Error al obtener la tasa');
        const data = await response.json();
        setDolarRate(data.promedio);
      } catch (err) {
        console.error('Error fetching dolar rate:', err);
      }
    };
    fetchDolarRate();
  }, []);

  const calculateBsEquivalent = (usdPrice: string): string => {
    if (!dolarRate || !usdPrice) return "Calculando...";
    const price = parseFloat(usdPrice);
    if (isNaN(price)) return "---";
    return (price * dolarRate).toFixed(2);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSaveService = () => {
    if (!formData.name || !formData.price || !formData.duration) {
      toast({
        title: "Error",
        description: "Por favor complete los campos obligatorios.",
        variant: "destructive",
      });
      return;
    }

    if (editingId) {
      // Update existing service
      setServices(services.map(service => 
        service.id === editingId 
          ? {
              ...service,
              name: formData.name,
              description: formData.description,
              duration: formData.duration,
              price: formData.price,
            }
          : service
      ));
      toast({
        title: "Actualizado",
        description: "Servicio actualizado correctamente.",
      });
    } else {
      // Add new service
      const newService: Service = {
        id: Date.now(),
        name: formData.name,
        description: formData.description,
        duration: formData.duration,
        price: formData.price,
        popular: false,
      };
      setServices([...services, newService]);
      toast({
        title: "Éxito",
        description: "Servicio agregado correctamente.",
      });
    }

    setFormData({ name: "", price: "", duration: "", description: "" });
    setEditingId(null);
    setIsDialogOpen(false);
  };

  const handleEditClick = (service: Service) => {
    setFormData({
      name: service.name,
      price: service.price,
      duration: service.duration,
      description: service.description,
    });
    setEditingId(service.id);
    setIsDialogOpen(true);
  };

  const handleAddNewClick = () => {
    setFormData({ name: "", price: "", duration: "", description: "" });
    setEditingId(null);
    setIsDialogOpen(true);
  };

  const handleDeleteService = (id: number) => {
    setServices(services.filter((service) => service.id !== id));
    toast({
      title: "Eliminado",
      description: "El servicio ha sido eliminado.",
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Servicios</h1>
          <p className="text-muted-foreground">Gestiona los servicios ofrecidos</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90 w-full md:w-auto"
              onClick={handleAddNewClick}
            >
              <IoAddOutline className="h-5 w-5" />
              Nuevo Servicio
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden [&>button]:text-white [&>button]:hover:text-white/80">
            <DialogHeader className="bg-purple-600 p-6 text-center sm:text-center">
              <DialogTitle className="text-white text-2xl">
                {editingId ? "Editar Servicio" : "Agregar Nuevo Servicio"}
              </DialogTitle>
              <DialogDescription className="text-purple-100">
                {editingId ? "Modifique los detalles del servicio." : "Complete los detalles del nuevo servicio aquí."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
                <Label htmlFor="name" className="md:text-right">
                  Nombre
                </Label>
                <Input 
                  id="name" 
                  placeholder="Ej. Lavado Express" 
                  className="md:col-span-3" 
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
                <Label htmlFor="price" className="md:text-right">
                  Precio (USD)
                </Label>
                <div className="md:col-span-3 space-y-1">
                  <Input 
                    id="price" 
                    placeholder="$0.00" 
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                  />
                  {formData.price && (
                    <p className="text-xs text-muted-foreground">
                      Equivalente: Bs. {calculateBsEquivalent(formData.price)}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
                <Label htmlFor="duration" className="md:text-right">
                  Duración
                </Label>
                <Input 
                  id="duration" 
                  placeholder="Ej. 30 min" 
                  className="md:col-span-3" 
                  value={formData.duration}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
                <Label htmlFor="description" className="md:text-right">
                  Descripción
                </Label>
                <Textarea 
                  id="description" 
                  placeholder="Descripción del servicio..." 
                  className="md:col-span-3" 
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <DialogFooter className="p-6 pt-0 sm:justify-center">
              <Button 
                type="submit" 
                className="bg-purple-600 hover:bg-purple-700 text-white min-w-[150px]"
                onClick={handleSaveService}
              >
                {editingId ? "Actualizar Servicio" : "Guardar Servicio"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Card key={service.id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden border-t-4 border-t-primary group">
            {service.popular && (
              <Badge className="absolute top-4 right-4 bg-gradient-to-r from-primary to-secondary shadow-md">
                Popular
              </Badge>
            )}
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="p-4 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10">
                  <IoCarSportOutline className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="mt-4">{service.name}</CardTitle>
              <CardDescription className="leading-relaxed">{service.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground">Duración</span>
                <span className="font-semibold">{service.duration}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <div>
                  <span className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    ${service.price}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    ≈ Bs. {calculateBsEquivalent(service.price)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="icon" 
                    className="bg-green-500 hover:bg-green-600 text-white border-none shadow-sm transition-all"
                    onClick={() => handleEditClick(service)}
                  >
                    <IoPencilOutline className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    className="bg-red-500 hover:bg-red-600 text-white border-none shadow-sm transition-all"
                    onClick={() => handleDeleteService(service.id)}
                  >
                    <IoTrashOutline className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Services;
