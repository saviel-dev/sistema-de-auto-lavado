import { useState, useRef, ChangeEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  IoAddOutline, 
  IoSearchOutline, 
  IoPeopleOutline,
  IoEllipsisVertical,
  IoPencilOutline,
  IoTrashOutline,
  IoCarSportOutline,
  IoMailOutline,
  IoCallOutline,
  IoCalendarOutline,
  IoEyeOutline
} from "react-icons/io5";
import { FaWhatsapp } from 'react-icons/fa';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  vehicle: string;
  vehicleType: string;
  licensePlate: string;
  status: "VIP" | "Regular" | "Normal";
  visits: number;
  image?: string;
}

const initialCustomers: Customer[] = [
  {
    id: 1,
    name: "Juan Pérez",
    email: "juan@example.com",
    phone: "584123456789",
    vehicle: "Toyota Corolla",
    vehicleType: "Sedán",
    licensePlate: "ABC123",
    status: "VIP",
    visits: 0
  },
  {
    id: 2,
    name: "María González",
    email: "maria@example.com",
    phone: "584123456788",
    vehicle: "Honda Civic",
    vehicleType: "Sedán",
    licensePlate: "DEF456",
    status: "Regular",
    visits: 0
  },
  {
    id: 3,
    name: "Carlos Rodríguez",
    email: "carlos@example.com",
    phone: "584123456787",
    vehicle: "Ford F-150",
    vehicleType: "Camioneta",
    licensePlate: "GHI789",
    status: "Normal",
    visits: 0
  }
];

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState<Omit<Customer, 'id'>>({
    name: "",
    email: "",
    phone: "",
    vehicle: "",
    vehicleType: "",
    licensePlate: "",
    status: "Normal",
    image: "",
    visits: 0
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          image: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleAddNewClick = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      vehicle: "",
      vehicleType: "",
      licensePlate: "",
      status: "Normal",
      image: "",
      visits: 0
    });
    setEditingId(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (customer: Customer) => {
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      vehicle: customer.vehicle,
      vehicleType: customer.vehicleType,
      licensePlate: customer.licensePlate,
      status: customer.status,
      image: customer.image || "",
      visits: customer.visits
    });
    setEditingId(customer.id);
    setIsDialogOpen(true);
  };

  const handleViewProfile = (customer: Customer) => {
    setViewingCustomer(customer);
    setIsProfileOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setCustomers(customers.filter((c) => c.id !== id));
    toast({
      title: "Eliminado",
      description: "El cliente ha sido eliminado.",
      variant: "destructive",
    });
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: "Error",
        description: "Por favor complete los campos obligatorios.",
        variant: "destructive",
      });
      return;
    }

    if (editingId) {
      setCustomers(customers.map(c => 
        c.id === editingId 
          ? { ...c, ...formData, id: editingId }
          : c
      ));
      toast({
        title: "Actualizado",
        description: "Cliente actualizado correctamente.",
      });
    } else {
      const newCustomer: Customer = {
        id: Date.now(),
        visits: 0,
        ...formData,
      };
      setCustomers([...customers, newCustomer]);
      toast({
        title: "Éxito",
        description: "Cliente agregado correctamente.",
      });
    }

    setIsDialogOpen(false);
  };

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.licensePlate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Clientes</h1>
          <p className="text-muted-foreground">Gestiona tu base de clientes</p>
        </div>
        
        {/* Add/Edit Customer Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              onClick={handleAddNewClick}
            >
              <IoAddOutline className="h-5 w-5" />
              Nuevo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-lg">{editingId ? 'Editar Cliente' : 'Nuevo Cliente'}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-2">
              {/* Sección de imagen */}
              <div className="space-y-1">
                <Label className="text-sm">Foto del perfil</Label>
                <div className="flex items-center gap-3">
                  <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-dashed border-muted-foreground/20 flex-shrink-0">
                    {formData.image ? (
                      <img 
                        src={formData.image} 
                        alt="Preview" 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-muted/50 flex items-center justify-center">
                        <IoPeopleOutline className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={triggerFileInput}
                      className="text-xs h-8"
                    >
                      {formData.image ? 'Cambiar foto' : 'Subir foto'}
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                      aria-label="Seleccionar imagen de perfil"
                    />
                  </div>
                </div>
              </div>

              {/* Campos del formulario en pares */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Nombre */}
                <div className="space-y-1">
                  <Label htmlFor="name" className="text-sm">Nombre</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ej: Juan Pérez"
                    className="h-9 text-sm"
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-sm">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="ejemplo@email.com"
                    className="h-9 text-sm"
                    required
                  />
                </div>

                {/* Teléfono */}
                <div className="space-y-1">
                  <Label htmlFor="phone" className="text-sm">Teléfono</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Ej: 584123456789"
                    className="h-9 text-sm"
                    required
                  />
                </div>

                {/* Vehículo */}
                <div className="space-y-1">
                  <Label htmlFor="vehicle" className="text-sm">Vehículo</Label>
                  <Input
                    id="vehicle"
                    value={formData.vehicle}
                    onChange={handleInputChange}
                    placeholder="Ej: Toyota Corolla"
                    className="h-9 text-sm"
                    required
                  />
                </div>

                {/* Tipo de vehículo */}
                <div className="space-y-1">
                  <Label htmlFor="vehicleType" className="text-sm">Tipo</Label>
                  <Input
                    id="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleInputChange}
                    placeholder="Ej: Sedán, SUV, Camioneta"
                    className="h-9 text-sm"
                    required
                  />
                </div>

                {/* Placa */}
                <div className="space-y-1">
                  <Label htmlFor="licensePlate" className="text-sm">Placa</Label>
                  <Input
                    id="licensePlate"
                    value={formData.licensePlate}
                    onChange={handleInputChange}
                    placeholder="Ej: ABC123"
                    className="h-9 text-sm"
                    required
                  />
                </div>

                {/* Estado */}
                <div className="space-y-1">
                  <Label htmlFor="status" className="text-sm">Estado</Label>
                  <select
                    id="status"
                    aria-label="Seleccionar estado del cliente"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Regular">Regular</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>
              </div>
            </div>
            
            <DialogFooter className="pt-2">
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                size="sm"
                className="h-9"
              >
                Cancelar
              </Button>
              <Button 
                type="button" 
                onClick={handleSaveCustomer}
                size="sm"
                className="h-9"
              >
                {editingId ? 'Actualizar' : 'Guardar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Profile Dialog */}
        <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
          <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden [&>button]:text-muted-foreground [&>button]:hover:text-foreground">
            <DialogHeader className="bg-gradient-to-r from-purple-600 to-blue-600 p-4">
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {viewingCustomer?.image ? (
                    <img 
                      src={viewingCustomer.image} 
                      alt={viewingCustomer.name} 
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '';
                        target.outerHTML = `
                          <div class="h-full w-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-500 text-white text-2xl font-bold">
                            ${viewingCustomer.name?.charAt(0) || 'U'}
                          </div>
                        `;
                      }}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-500 text-white text-2xl font-bold">
                      {viewingCustomer?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
                <div>
                  <DialogTitle className="text-white text-lg">{viewingCustomer?.name}</DialogTitle>
                  <p className="text-sm text-white/90">{viewingCustomer?.email}</p>
                </div>
              </div>
            </DialogHeader>
            
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Teléfono</p>
                  <p className="text-sm text-muted-foreground">{viewingCustomer?.phone || 'No especificado'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{viewingCustomer?.email || 'No especificado'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Vehículo</p>
                  <p className="text-sm text-muted-foreground">{viewingCustomer?.vehicle || 'No especificado'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Tipo de vehículo</p>
                  <p className="text-sm text-muted-foreground">{viewingCustomer?.vehicleType || 'No especificado'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Placa</p>
                  <p className="text-sm text-muted-foreground font-mono">{viewingCustomer?.licensePlate || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Estado</p>
                  <Badge 
                    variant={
                      viewingCustomer?.status === "VIP" ? "default" : 
                      viewingCustomer?.status === "Regular" ? "secondary" : "outline"
                    }
                    className="text-xs mt-1"
                  >
                    {viewingCustomer?.status}
                  </Badge>
                </div>
              </div>
            </div>
            
            <DialogFooter className="px-4 pb-4 gap-2">
              {viewingCustomer?.phone && (
                <Button 
                  variant="outline" 
                  className="w-full gap-2 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                  onClick={() => window.open(`https://wa.me/${viewingCustomer.phone.replace(/[^0-9]/g, '')}`, '_blank')}
                >
                  <FaWhatsapp className="h-4 w-4" />
                  WhatsApp
                </Button>
              )}
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setIsProfileOpen(false)}
              >
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-lg hover:shadow-xl transition-shadow">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Cliente</th>
                    <th className="text-left p-4">Vehículo</th>
                    <th className="text-left p-4">Placa</th>
                    <th className="text-left p-4">Tipo</th>
                    <th className="text-left p-4">Estado</th>
                    <th className="p-4 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-muted overflow-hidden flex-shrink-0">
                            {customer.image ? (
                              <img 
                                src={customer.image} 
                                alt={customer.name}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.onerror = null;
                                  target.src = '';
                                }}
                              />
                            ) : (
                              <div className="h-full w-full bg-primary/10 flex items-center justify-center">
                                <IoPeopleOutline className="h-5 w-5 text-primary" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{customer.name}</div>
                            <div className="text-sm text-muted-foreground">{customer.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{customer.vehicle}</div>
                        <div className="text-sm text-muted-foreground">{customer.phone}</div>
                      </td>
                      <td className="p-4 font-mono">{customer.licensePlate}</td>
                      <td className="p-4">{customer.vehicleType}</td>
                      <td className="p-4">
                        <Badge 
                          variant={
                            customer.status === "VIP" ? "default" : 
                            customer.status === "Regular" ? "secondary" : "outline"
                          }
                        >
                          {customer.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <IoEllipsisVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewProfile(customer)}>
                              <IoEyeOutline className="mr-2 h-4 w-4" />
                              Ver perfil
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditClick(customer)}>
                              <IoPencilOutline className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDeleteClick(customer.id)}
                            >
                              <IoTrashOutline className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Customers;
