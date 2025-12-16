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
  IoEyeOutline,
  IoReloadOutline,
  IoImagesOutline,
  IoCloseCircle,
  IoClose
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
import { useCustomers, Customer, Vehicle } from "@/contexts/CustomerContext";
import VehicleModal from "@/components/VehicleModal";

const Customers = () => {
  const { 
    customers, 
    loading, 
    addCustomer, 
    updateCustomer, 
    deleteCustomer, 
    refreshCustomers, 
    uploadImage,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    uploadVehicleImage
  } = useCustomers();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCriterion, setSearchCriterion] = useState<'name' | 'plate'>('name');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const { toast } = useToast();
  const [uploadingImages, setUploadingImages] = useState(false);

  const [formData, setFormData] = useState<Omit<Customer, 'id' | 'vehicles' | 'image'>>({ 
    name: "",
    email: "",
    phones: [],
    status: "Normal",
    visits: 0
  });
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const addPhone = () => {
    if (formData.phones.length < 3) {
      setFormData(prev => ({ ...prev, phones: [...prev.phones, ""] }));
    }
  };

  const removePhone = (index: number) => {
    setFormData(prev => ({
      ...prev,
      phones: prev.phones.filter((_, i) => i !== index)
    }));
  };

  const updatePhone = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      phones: prev.phones.map((p, i) => i === index ? value : p)
    }));
  };

  const handleAddNewClick = () => {
    setFormData({
      name: "",
      email: "",
      phones: [],
      status: "Normal",
      visits: 0
    });
    setEditingId(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (customer: Customer) => {
    setFormData({
      name: customer.name,
      email: customer.email,
      phones: customer.phones || [],
      status: customer.status,
      visits: customer.visits
    });
    setEditingId(customer.id);
    setIsDialogOpen(true);
  };

  const handleViewProfile = (customer: Customer) => {
    setViewingCustomer(customer);
    setIsProfileOpen(true);
  };

  const handleDeleteClick = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar este cliente?')) {
      await deleteCustomer(id);
    }
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || formData.phones.length === 0) {
      toast({
        title: "Error",
        description: "Por favor complete nombre, email y al menos un teléfono.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingId) {
        await updateCustomer(editingId, formData);
      } else {
        await addCustomer(formData);
      }
      setIsDialogOpen(false);
    } catch (error) {
      // Toast ya manejado en context
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const searchLower = searchTerm.toLowerCase();
    
    if (searchCriterion === 'name') {
      return customer.name.toLowerCase().includes(searchLower);
    } else {
      // Search by vehicle plate
      return customer.vehicles?.some(vehicle =>
        vehicle.placa.toLowerCase().includes(searchLower)
      );
    }
  });

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Clientes</h1>
            <Button variant="ghost" size="icon" onClick={() => refreshCustomers()} disabled={loading}>
              <IoReloadOutline className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <p className="text-sm md:text-base text-muted-foreground">Gestiona tu base de clientes</p>
        </div>
        
        {/* Add/Edit Customer Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="gap-2 w-full md:w-auto bg-gradient-to-r from-primary to-secondary hover:opacity-90"
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

              {/* Campos del formulario */}
              <div className="space-y-3">
                {/* Nombre */}
                <div className="space-y-1">
                  <Label htmlFor="name" className="text-sm">Nombre completo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ej: Julián Herrera"
                    className="h-9 text-sm"
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-sm">Correo electrónico *</Label>
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

                {/* Teléfonos */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Teléfono(s) *</Label>
                    {formData.phones.length < 3 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addPhone}
                        className="h-7 text-xs"
                      >
                        <IoAddOutline className="h-3 w-3 mr-1" />
                        Agregar teléfono
                      </Button>
                    )}
                  </div>
                  {formData.phones.length === 0 ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addPhone}
                      className="w-full h-9 text-sm"
                    >
                      <IoAddOutline className="h-4 w-4 mr-2" />
                      Agregar primer teléfono
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      {formData.phones.map((phone, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            value={phone}
                            onChange={(e) => updatePhone(index, e.target.value)}
                            placeholder="Ej: 0414 1234567"
                            className="h-9 text-sm flex-1"
                            required
                          />
                          {formData.phones.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removePhone(index)}
                              className="h-9 w-9"
                            >
                              <IoClose className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
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

                {/* Vehículos Section */}
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Vehículos</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (!editingId) {
                          toast({
                            title: "Información",
                            description: "Primero guarde el cliente para poder agregar vehículos.",
                            variant: "default",
                          });
                          return;
                        }
                        setEditingVehicle(null);
                        setIsVehicleModalOpen(true);
                      }}
                      className="h-8 gap-2"
                    >
                      <IoCarSportOutline className="h-4 w-4" />
                      Agregar vehículo
                    </Button>
                  </div>
                  
                  {/* Vehicle List */}
                  {editingId ? (
                    customers.find(c => c.id === editingId)?.vehicles && customers.find(c => c.id === editingId)!.vehicles!.length > 0 ? (
                      <div className="space-y-2">
                        {customers.find(c => c.id === editingId)?.vehicles?.map((vehicle) => (
                          <div key={vehicle.id} className="flex items-center justify-between p-2 border rounded-md hover:bg-muted/50">
                            <span className="text-sm">
                              <strong>{vehicle.tipo}</strong> / {vehicle.placa}
                            </span>
                            <div className="flex gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingVehicle(vehicle);
                                  setIsVehicleModalOpen(true);
                                }}
                                className="h-8 w-8"
                              >
                                <IoPencilOutline className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteVehicle(vehicle.id)}
                                className="h-8 w-8 text-destructive"
                              >
                                <IoTrashOutline className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 border-2 border-dashed rounded-md text-center text-muted-foreground text-sm">
                        No hay vehículos registrados. Agregue uno presionando el botón de arriba.
                      </div>
                    )
                  ) : (
                    <div className="p-4 border-2 border-dashed rounded-md text-center text-muted-foreground text-sm">
                      Primero guarde el cliente para poder agregar vehículos.
                    </div>
                  )}
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
          <DialogContent className="max-w-lg">
            <DialogHeader className="bg-gradient-to-r from-blue-600 to-purple-600 -mx-6 -mt-6 px-6 py-4 rounded-t-lg">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-white shadow-lg flex-shrink-0 bg-gradient-to-br from-purple-500 to-blue-500 text-white text-2xl font-bold flex items-center justify-center">
                  {viewingCustomer?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <DialogTitle className="text-white text-lg">{viewingCustomer?.name}</DialogTitle>
                  <p className="text-sm text-white/90">{viewingCustomer?.email}</p>
                </div>
              </div>
            </DialogHeader>
            
            <div className="p-4">
              {/* Vehicles Section in Profile */}
              {viewingCustomer?.vehicles && viewingCustomer.vehicles.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Vehículos</p>
                  <div className="space-y-2">
                    {viewingCustomer.vehicles.map((vehicle, idx) => (
                      <div key={idx} className="p-2 border rounded-md">
                        <p className="text-sm font-medium">{vehicle.tipo} - {vehicle.placa}</p>
                        {vehicle.imagenes && vehicle.imagenes.length > 0 && (
                          <div className="grid grid-cols-4 gap-1 mt-2">
                            {vehicle.imagenes.slice(0, 4).map((img, imgIdx) => (
                              <div key={imgIdx} className="aspect-square rounded overflow-hidden bg-muted border cursor-pointer" onClick={() => window.open(img, '_blank')}>
                                <img src={img} alt={`Vehículo ${idx + 1}`} className="w-full h-full object-cover" />
                              </div>
                            ))}
                            {vehicle.imagenes.length > 4 && (
                              <div className="aspect-square rounded bg-muted border flex items-center justify-center text-xs text-muted-foreground">
                                +{vehicle.imagenes.length - 4}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Teléfono(s)</p>
                  {viewingCustomer?.phones && viewingCustomer.phones.length > 0 ? (
                    <div className="space-y-1">
                      {viewingCustomer.phones.map((phone, idx) => (
                        <p key={idx} className="text-sm text-muted-foreground">{phone}</p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No especificado</p>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{viewingCustomer?.email || 'No especificado'}</p>
                </div>
                <div className="space-y-1 col-span-2">
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
              {viewingCustomer?.phones && viewingCustomer.phones.length > 0 && (
                <Button 
                  variant="outline" 
                  className="w-full gap-2 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                  onClick={() => window.open(`https://wa.me/${viewingCustomer.phones[0].replace(/[^0-9]/g, '')}`, '_blank')}
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

      {/* Search Selection */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <IoSearchOutline className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={searchCriterion === 'name' ? "Buscar por nombre..." : "Buscar por placa..."}
            className="pl-8"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
          {showSuggestions && searchTerm && filteredCustomers.length > 0 && (
            <ul className="absolute z-10 w-full bg-popover text-popover-foreground border rounded-md shadow-lg mt-1 max-h-60 overflow-auto">
              {filteredCustomers.slice(0, 5).map((customer) => (
                <li
                  key={customer.id}
                  className="px-4 py-2 hover:bg-muted cursor-pointer text-sm"
                  onClick={() => {
                    if (searchCriterion === 'name') {
                      setSearchTerm(customer.name);
                    } else {
                      // Find the matching vehicle or default to first
                      const matchingVehicle = customer.vehicles?.find(v => 
                        v.placa.toLowerCase().includes(searchTerm.toLowerCase())
                      );
                      setSearchTerm(matchingVehicle?.placa || customer.vehicles?.[0]?.placa || customer.name);
                    }
                    setShowSuggestions(false);
                  }}
                >
                  {searchCriterion === 'name' ? (
                    <div className="font-medium">{customer.name}</div>
                  ) : (
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {customer.vehicles?.find(v => v.placa.toLowerCase().includes(searchTerm.toLowerCase()))?.placa || customer.vehicles?.[0]?.placa}
                      </span>
                      <span className="text-xs text-muted-foreground">Cliente: {customer.name}</span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          value={searchCriterion}
          onChange={(e) => {
            setSearchCriterion(e.target.value as 'name' | 'plate');
            setSearchTerm("");
          }}
        >
          <option value="name">Por Nombre</option>
          <option value="plate">Por Placa</option>
        </select>
      </div>

      <Card className="hidden lg:block shadow-lg hover:shadow-xl transition-shadow">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
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
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                            {customer.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="font-medium">{customer.name}</div>
                            <div className="text-sm text-muted-foreground">{customer.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">
                          {customer.vehicles && customer.vehicles.length > 0 
                            ? `${customer.vehicles[0].tipo}` 
                            : 'Sin vehículo'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {customer.phones && customer.phones.length > 0 
                            ? customer.phones[0] 
                            : 'Sin teléfono'}
                        </div>
                      </td>
                      <td className="p-4 font-mono">
                        {customer.vehicles && customer.vehicles.length > 0 
                          ? customer.vehicles[0].placa 
                          : '-'}
                      </td>
                      <td className="p-4">
                        {customer.vehicles && customer.vehicles.length > 1
                          ? `${customer.vehicles.length} vehículos`
                          : customer.vehicles && customer.vehicles.length === 1
                          ? customer.vehicles[0].tipo
                          : '-'}
                      </td>
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

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id} className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {customer.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-base truncate pr-2">{customer.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">{customer.email}</p>
                    </div>
                    <Badge 
                      variant={
                        customer.status === "VIP" ? "default" : 
                        customer.status === "Regular" ? "secondary" : "outline"
                      }
                      className="flex-shrink-0"
                    >
                      {customer.status}
                    </Badge>
                  </div>
                  
                  <div className="mt-3 space-y-2">
                    {customer.vehicles && customer.vehicles.length > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <IoCarSportOutline className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{customer.vehicles[0].tipo}</span>
                        <span className="text-muted-foreground text-xs font-mono">({customer.vehicles[0].placa})</span>
                        {customer.vehicles.length > 1 && (
                          <span className="text-xs text-muted-foreground">+{customer.vehicles.length - 1} más</span>
                        )}
                      </div>
                    )}
                    {customer.phones && customer.phones.length > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <IoCallOutline className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{customer.phones[0]}</span>
                        {customer.phones.length > 1 && (
                          <span className="text-xs text-muted-foreground">+{customer.phones.length - 1}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t flex items-center justify-between gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 h-9"
                  onClick={() => handleViewProfile(customer)}
                >
                  <IoEyeOutline className="mr-2 h-4 w-4" />
                  Ver
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <IoEllipsisVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
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
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Vehicle Modal */}
      <VehicleModal
        open={isVehicleModalOpen}
        onOpenChange={setIsVehicleModalOpen}
        customerId={editingId || 0}
        vehicle={editingVehicle || undefined}
        onSave={async (vehicleData) => {
          if (editingId) {
            if (editingVehicle) {
              await updateVehicle(editingVehicle.id, vehicleData);
            } else {
              await addVehicle(editingId, vehicleData);
            }
          }
        }}
        uploadImage={uploadVehicleImage}
      />
    </div>
  );
};

export default Customers;
