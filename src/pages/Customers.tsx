import { useState } from "react";
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
  IoCalendarOutline
} from "react-icons/io5";
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
  visits: number;
  status: "VIP" | "Regular" | "Nuevo";
}

const initialCustomers: Customer[] = [
  {
    id: 1,
    name: "Juan Pérez",
    email: "juan.perez@email.com",
    phone: "(555) 123-4567",
    vehicle: "Toyota Corolla 2020",
    visits: 12,
    status: "VIP",
  },
  {
    id: 2,
    name: "María García",
    email: "maria.garcia@email.com",
    phone: "(555) 234-5678",
    vehicle: "Honda Civic 2021",
    visits: 8,
    status: "Regular",
  },
  {
    id: 3,
    name: "Carlos López",
    email: "carlos.lopez@email.com",
    phone: "(555) 345-6789",
    vehicle: "Ford F-150 2019",
    visits: 15,
    status: "VIP",
  },
  {
    id: 4,
    name: "Ana Martínez",
    email: "ana.martinez@email.com",
    phone: "(555) 456-7890",
    vehicle: "Mazda CX-5 2022",
    visits: 5,
    status: "Regular",
  },
  {
    id: 5,
    name: "Luis Rodríguez",
    email: "luis.rodriguez@email.com",
    phone: "(555) 567-8901",
    vehicle: "Chevrolet Silverado 2020",
    visits: 3,
    status: "Nuevo",
  },
];

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    vehicle: "",
    status: "Nuevo" as Customer["status"],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleAddNewClick = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      vehicle: "",
      status: "Nuevo",
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
      status: customer.status,
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

  const handleSaveCustomer = () => {
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
    customer.vehicle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
          <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden [&>button]:text-white [&>button]:hover:text-white/80">
            <DialogHeader className="bg-purple-600 p-6 text-center sm:text-center">
              <DialogTitle className="text-white text-2xl">
                {editingId ? "Editar Cliente" : "Agregar Nuevo Cliente"}
              </DialogTitle>
              <DialogDescription className="text-purple-100">
                {editingId ? "Modifique los datos del cliente." : "Complete los datos del nuevo cliente aquí."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 p-6">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nombre
                </Label>
                <Input 
                  id="name" 
                  placeholder="Nombre completo" 
                  className="col-span-3" 
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input 
                  id="email" 
                  type="email"
                  placeholder="correo@ejemplo.com" 
                  className="col-span-3" 
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Teléfono
                </Label>
                <Input 
                  id="phone" 
                  placeholder="(555) 000-0000" 
                  className="col-span-3" 
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="vehicle" className="text-right">
                  Vehículo
                </Label>
                <Input 
                  id="vehicle" 
                  placeholder="Ej. Toyota Corolla 2020" 
                  className="col-span-3" 
                  value={formData.vehicle}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Estado
                </Label>
                <select
                  id="status"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 col-span-3"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="Nuevo">Nuevo</option>
                  <option value="Regular">Regular</option>
                  <option value="VIP">VIP</option>
                </select>
              </div>
            </div>
            <DialogFooter className="p-6 pt-0 sm:justify-center">
              <Button 
                type="submit" 
                className="bg-purple-600 hover:bg-purple-700 text-white min-w-[150px]"
                onClick={handleSaveCustomer}
              >
                {editingId ? "Actualizar Cliente" : "Guardar Cliente"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Profile Dialog */}
        <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
          <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden [&>button]:text-white [&>button]:hover:text-white/80">
            <DialogHeader className="bg-purple-600 p-6 text-center sm:text-center">
              <div className="mx-auto h-20 w-20 rounded-full bg-white/20 flex items-center justify-center text-white text-3xl font-bold mb-2">
                {viewingCustomer?.name.charAt(0)}
              </div>
              <DialogTitle className="text-white text-2xl">
                {viewingCustomer?.name}
              </DialogTitle>
              <DialogDescription className="text-purple-100 flex items-center justify-center gap-2">
                <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-none">
                  {viewingCustomer?.status}
                </Badge>
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 p-6">
              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <div className="p-2 rounded-full bg-primary/10 text-primary">
                  <IoMailOutline className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{viewingCustomer?.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <div className="p-2 rounded-full bg-primary/10 text-primary">
                  <IoCallOutline className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p className="font-medium">{viewingCustomer?.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <div className="p-2 rounded-full bg-primary/10 text-primary">
                  <IoCarSportOutline className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vehículo</p>
                  <p className="font-medium">{viewingCustomer?.vehicle}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <div className="p-2 rounded-full bg-primary/10 text-primary">
                  <IoCalendarOutline className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Visitas</p>
                  <p className="font-medium">{viewingCustomer?.visits} visitas</p>
                </div>
              </div>
            </div>
            <DialogFooter className="p-6 pt-0 sm:justify-center">
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
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-lg">
                <IoPeopleOutline className="h-6 w-6 text-primary" />
              </div>
              Lista de Clientes
            </CardTitle>
            <div className="relative w-full md:w-64">
              <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cliente..."
                className="pl-10 focus:ring-2 focus:ring-primary/20 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg bg-gradient-to-r from-muted/30 to-muted/10 hover:shadow-md transition-all duration-300 border border-border/50 gap-4 group"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-foreground">{customer.name}</p>
                    <Badge
                      variant={customer.status === "VIP" ? "default" : "secondary"}
                      className={`shadow-sm ${customer.status === "VIP" ? "bg-primary" : ""}`}
                    >
                      {customer.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{customer.email}</p>
                  <p className="text-sm text-muted-foreground">{customer.phone}</p>
                  <p className="text-sm font-semibold text-foreground">{customer.vehicle}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center px-5 py-3 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 shadow-sm">
                    <p className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{customer.visits}</p>
                    <p className="text-xs text-muted-foreground font-medium mt-1">Visitas</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="hover:bg-primary hover:text-primary-foreground transition-all"
                      onClick={() => handleViewProfile(customer)}
                    >
                      Ver Perfil
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-black">
                          <IoEllipsisVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="cursor-pointer" onClick={() => handleEditClick(customer)}>
                          <IoPencilOutline className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600" onClick={() => handleDeleteClick(customer.id)}>
                          <IoTrashOutline className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Customers;
