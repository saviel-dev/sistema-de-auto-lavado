import { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { IoAddOutline, IoTrashOutline, IoPencilOutline, IoCubeOutline, IoReloadOutline } from "react-icons/io5";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Toaster } from "@/components/ui/toaster";
import { Service, useServices } from "@/contexts/ServiceContext";

const Services = () => {
  const { services, loading, addService, updateService, deleteService, refreshServices } = useServices();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [dolarRate, setDolarRate] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchDolarRate = async () => {
      try {
        const response = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
        const data = await response.json();
        setDolarRate(data.promedio || data.venta);
      } catch (error) {
        console.error('Error al obtener la tasa del dólar:', error);
        setDolarRate(36.5);
      }
    };

    fetchDolarRate();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateBsPrice = (usdPrice: string | number) => {
    if (!dolarRate) return 'Cargando...';
    const price = typeof usdPrice === 'string' ? parseFloat(usdPrice) : usdPrice;
    if (isNaN(price)) return '0.00';
    return (price * dolarRate).toFixed(2);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      toast({
        title: "Error",
        description: "Por favor complete los campos obligatorios.",
        variant: "destructive",
      });
      return;
    }

    try {
      const price = parseFloat(formData.price) || 0;
      
      if (editingId) {
        await updateService(editingId, {
          name: formData.name,
          description: formData.description,
          price: price
        });
        toast({
          title: "Servicio actualizado",
          description: "Los cambios se han guardado correctamente.",
        });
      } else {
        await addService({
          name: formData.name,
          description: formData.description,
          price: price,
          popular: false
        });
        toast({
          title: "Servicio creado",
          description: "El nuevo servicio ha sido agregado.",
        });
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      // Error handling is done in context
    }
  };

  const handleDeleteService = async (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este servicio?")) {
      try {
        await deleteService(id);
        toast({
          title: "Servicio eliminado",
          description: "El servicio ha sido eliminado del catálogo.",
          variant: "destructive",
        });
      } catch (error) {
        // Error handling in context
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      description: "",
    });
    setEditingId(null);
  };

  const handleEditClick = (service: Service) => {
    setFormData({
      name: service.name,
      price: service.price.toString(),
      description: service.description,
    });
    setEditingId(service.id);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    resetForm();
    setIsDialogOpen(true);
  };
  
  const togglePopular = async (id: number, currentStatus: boolean) => {
    try {
      await updateService(id, { popular: !currentStatus });
    } catch (error) {
      // Error handling
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <div className="p-4 md:p-6">
      <Toaster />
      <motion.div 
        className="space-y-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold">Servicios</h1>
               <Button variant="ghost" size="icon" onClick={() => refreshServices()} disabled={loading}>
                 <IoReloadOutline className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
               </Button>
            </div>
            <p className="text-sm md:text-base text-muted-foreground">Gestiona los servicios de tu negocio</p>
          </div>
          <motion.div variants={itemVariants}>
            <Button 
              onClick={handleAddNew} 
              className="gap-2 w-full md:w-auto bg-gradient-to-r from-blue-600 to-cyan-500"
            >
              <IoAddOutline className="h-5 w-5" />
              Nuevo Servicio
            </Button>
          </motion.div>
        </div>

      <motion.div 
        className="hidden lg:block rounded-md border overflow-hidden shadow-sm"
        variants={itemVariants}
      >
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <th className="h-12 px-4 text-center align-middle font-medium">Servicio</th>
                <th className="h-12 px-4 text-center align-middle font-medium">Descripción</th>
                <th className="h-12 px-4 text-center align-middle font-medium">Precio (USD)</th>
                <th className="h-12 px-4 text-center align-middle font-medium">Precio (Bs)</th>
                <th className="h-12 px-4 text-center align-middle font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 text-center align-middle font-medium"><div className="h-4 bg-muted/50 rounded animate-pulse w-3/4 mx-auto"></div></td>
                    <td className="p-4 text-center align-middle text-muted-foreground"><div className="h-4 bg-muted/50 rounded animate-pulse w-full"></div></td>
                    <td className="p-4 text-center align-middle font-medium"><div className="h-4 bg-muted/50 rounded animate-pulse w-1/2 mx-auto"></div></td>
                    <td className="p-4 text-center align-middle font-medium"><div className="h-4 bg-muted/50 rounded animate-pulse w-1/2 mx-auto"></div></td>
                    <td className="p-4 text-center align-middle"><div className="flex justify-center gap-2"><div className="h-8 w-8 bg-muted/50 rounded-full animate-pulse"></div><div className="h-8 w-8 bg-muted/50 rounded-full animate-pulse"></div></div></td>
                  </tr>
                ))
              ) : (
                services.map((service, index) => (
                  <motion.tr 
                    key={service.id} 
                    className="border-b transition-colors hover:bg-muted/50"
                    custom={index}
                    variants={itemVariants}
                  >
                    <td className="p-4 text-center align-middle font-medium">
                      <div className="flex items-center justify-center gap-2">
                        <IoCubeOutline className="h-5 w-5 text-primary" />
                        <span>{service.name}</span>
                        {service.popular && (
                          <Badge className="ml-2 bg-gradient-to-r from-primary to-secondary">
                            Popular
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center align-middle text-muted-foreground">
                      {service.description}
                    </td>
                    <td className="p-4 text-center align-middle font-medium">
   ${parseFloat(service.price.toString()).toFixed(2)}
                    </td>
                    <td className="p-4 text-center align-middle font-medium">
                      {`Bs. ${calculateBsPrice(service.price)}`}
                    </td>
                    <td className="p-4 text-center align-middle">
                      <div className="flex justify-center gap-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleEditClick(service)}
                        >
                          <IoPencilOutline className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteService(service.id)}
                        >
                          <IoTrashOutline className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Vista de cards para móvil y tablet */}
      <motion.div className="lg:hidden space-y-4" variants={itemVariants}>
        {loading ? (
             Array.from({ length: 3 }).map((_, i) => (
               <div key={i} className="h-40 rounded-xl bg-muted/50 animate-pulse" />
             ))
        ) : (
          services.map((service, index) => (
          <motion.div
            key={service.id}
            custom={index}
            variants={itemVariants}
            className="bg-card border rounded-xl overflow-hidden shadow-sm"
          >
            {/* ... card content ... */}
            <div className="p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{service.name}</h3>
                  {service.popular && (
                    <Badge variant="secondary" className="mt-1 bg-yellow-500/10 text-yellow-600 border-yellow-200">
                      Popular
                    </Badge>
                  )}
                </div>
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <IoCubeOutline className="h-5 w-5" />
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-2">
                {service.description}
              </p>

              <div className="flex items-end justify-between pt-2 border-t border-dashed">
                <div>
                  <div className="text-xl font-bold">
                    ${parseFloat(service.price.toString()).toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Bs. {calculateBsPrice(service.price)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleEditClick(service)}
                  >
                    <IoPencilOutline className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => handleDeleteService(service.id)}
                  >
                    <IoTrashOutline className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )))}
      </motion.div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && setIsDialogOpen(false)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingId !== null ? 'Editar Servicio' : 'Nuevo Servicio'}
            </DialogTitle>
            <DialogDescription>
              {editingId !== null 
                ? 'Actualiza la información del servicio.'
                : 'Completa la información para agregar un nuevo servicio.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nombre <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="Ej. Lavado Completo"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Precio (USD) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="0.00"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Descripción
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="Descripción del servicio"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" onClick={(e) => handleSaveService(e)}>
              {editingId !== null ? 'Actualizar' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </motion.div>
    </div>
  );
};

export default Services;
