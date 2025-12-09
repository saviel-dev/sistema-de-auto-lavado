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
  IoCloseCircle
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
import { useCustomers, Customer } from "@/contexts/CustomerContext";

const Customers = () => {
  const { customers, loading, addCustomer, updateCustomer, deleteCustomer, refreshCustomers, uploadImage } = useCustomers();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const { toast } = useToast();
  const [uploadingImages, setUploadingImages] = useState(false);

  const [formData, setFormData] = useState<Omit<Customer, 'id'>>({
    name: "",
    email: "",
    phone: "",
    vehicle: "",
    vehicleType: "",
    licensePlate: "",
    status: "Normal",
    image: "",
    images: [],
    visits: 0
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  /* Perfil */
  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setUploadingImages(true);
        const url = await uploadImage(file);
        setFormData(prev => ({ ...prev, image: url }));
        toast({ title: "Foto subida correctamente" });
      } catch (error) {
        // Error handling in context
      } finally {
        setUploadingImages(false);
      }
    }
  };

  /* Galería */
  const handleGalleryUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      try {
        setUploadingImages(true);
        const uploadPromises = Array.from(files).map(file => uploadImage(file));
        const urls = await Promise.all(uploadPromises);
        
        setFormData(prev => ({
          ...prev,
          images: [...(prev.images || []), ...urls]
        }));
        
        toast({ title: "Galería actualizada", description: `${urls.length} fotos subidas.` });
      } catch (error) {
        // Error handled in context
      } finally {
        setUploadingImages(false);
      }
    }
  };

  const removeGalleryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index) || []
    }));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const triggerGalleryInput = () => {
    galleryInputRef.current?.click();
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
      images: [],
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
      images: customer.images || [],
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
    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: "Error",
        description: "Por favor complete los campos obligatorios.",
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

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.licensePlate.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

              {/* Sección Galería */}
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Galería de Fotos del Vehículo (6-10)</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={triggerGalleryInput}
                    disabled={uploadingImages}
                    className="h-8 gap-2"
                  >
                    <IoImagesOutline className="h-4 w-4" />
                    {uploadingImages ? 'Subiendo...' : 'Agregar Fotos'}
                  </Button>
                  <input
                    type="file"
                    ref={galleryInputRef}
                    onChange={handleGalleryUpload}
                    multiple
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                
                {formData.images && formData.images.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2 mt-2">
                     {formData.images.map((img, index) => (
                       <div key={index} className="relative group aspect-square rounded-md overflow-hidden bg-muted border">
                         <img src={img} alt={`Foto ${index}`} className="w-full h-full object-cover" />
                         <button
                           type="button"
                           onClick={() => removeGalleryImage(index)}
                           className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                         >
                           <IoCloseCircle className="h-4 w-4" />
                         </button>
                       </div>
                     ))}
                  </div>
                ) : (
                  <div className="p-4 border-2 border-dashed rounded-md text-center text-muted-foreground text-sm">
                    No hay fotos en la galería
                  </div>
                )}
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
              {/* Galería en Perfil */}
              {viewingCustomer?.images && viewingCustomer.images.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Galería de Fotos</p>
                  <div className="grid grid-cols-3 gap-2">
                    {viewingCustomer.images.map((img, idx) => (
                      <div key={idx} className="aspect-square rounded-md overflow-hidden bg-muted border cursor-pointer hover:opacity-90" onClick={() => window.open(img, '_blank')}>
                        <img src={img} alt="Vehículo" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

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

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id} className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-muted overflow-hidden flex-shrink-0 border">
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
                      <IoPeopleOutline className="h-6 w-6 text-primary" />
                    </div>
                  )}
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
                    <div className="flex items-center gap-2 text-sm">
                      <IoCarSportOutline className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{customer.vehicle}</span>
                      <span className="text-muted-foreground text-xs">({customer.vehicleType})</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="bg-muted px-2 py-0.5 rounded text-xs font-mono">
                        {customer.licensePlate}
                      </div>
                    </div>
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
    </div>
  );
};

export default Customers;
