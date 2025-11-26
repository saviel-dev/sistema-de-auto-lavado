import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  IoAddOutline, 
  IoCalendarOutline, 
  IoTimeOutline, 
  IoPersonOutline, 
  IoSearchOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoEllipsisVertical,
  IoPencilOutline,
  IoTrashOutline
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

interface Appointment {
  id: number;
  client: string;
  service: string;
  date: string;
  time: string;
  status: "Pendiente" | "Confirmada" | "Completada" | "Cancelada";
  phone: string;
}

const initialAppointments: Appointment[] = [
  {
    id: 1,
    client: "José Rodríguez",
    service: "Lavado Completo",
    date: "2024-01-15",
    time: "10:00 AM",
    status: "Confirmada",
    phone: "0414-123-4567",
  },
  {
    id: 2,
    client: "María González",
    service: "Encerado Premium",
    date: "2024-01-15",
    time: "11:30 AM",
    status: "Pendiente",
    phone: "0424-234-5678",
  },
  {
    id: 3,
    client: "Carlos Pérez",
    service: "Detallado Completo",
    date: "2024-01-15",
    time: "02:00 PM",
    status: "Confirmada",
    phone: "0412-345-6789",
  },
  {
    id: 4,
    client: "Ana Martínez",
    service: "Lavado Express",
    date: "2024-01-15",
    time: "03:30 PM",
    status: "Pendiente",
    phone: "0416-456-7890",
  },
  {
    id: 5,
    client: "Luis Hernández",
    service: "Pulido de Faros",
    date: "2024-01-16",
    time: "09:00 AM",
    status: "Completada",
    phone: "0426-567-8901",
  },
];

const Appointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    client: "",
    service: "",
    date: "",
    time: "",
    phone: "",
    status: "Pendiente" as Appointment["status"],
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
      client: "",
      service: "",
      date: "",
      time: "",
      phone: "",
      status: "Pendiente",
    });
    setEditingId(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (appointment: Appointment) => {
    setFormData({
      client: appointment.client,
      service: appointment.service,
      date: appointment.date,
      time: appointment.time,
      phone: appointment.phone,
      status: appointment.status,
    });
    setEditingId(appointment.id);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setAppointments(appointments.filter((app) => app.id !== id));
    toast({
      title: "Eliminado",
      description: "La cita ha sido eliminada.",
      variant: "destructive",
    });
  };

  const handleSaveAppointment = () => {
    if (!formData.client || !formData.service || !formData.date || !formData.time) {
      toast({
        title: "Error",
        description: "Por favor complete los campos obligatorios.",
        variant: "destructive",
      });
      return;
    }

    if (editingId) {
      setAppointments(appointments.map(app => 
        app.id === editingId 
          ? { ...app, ...formData, id: editingId }
          : app
      ));
      toast({
        title: "Actualizado",
        description: "Cita actualizada correctamente.",
      });
    } else {
      const newAppointment: Appointment = {
        id: Date.now(),
        ...formData,
      };
      setAppointments([...appointments, newAppointment]);
      toast({
        title: "Éxito",
        description: "Cita agendada correctamente.",
      });
    }

    setIsDialogOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmada":
        return "bg-green-500 hover:bg-green-600";
      case "Pendiente":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "Completada":
        return "bg-blue-500 hover:bg-blue-600";
      case "Cancelada":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-gray-500";
    }
  };

  const filteredAppointments = appointments.filter(app => 
    app.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.service.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
    <div className="flex flex-col md:flex-row md:items-center justify-between p-3 md:p-4 rounded-xl bg-card hover:shadow-lg transition-all duration-300 border border-border/50 gap-3 md:gap-4 group">
      <div className="flex items-center gap-3 md:gap-4">
        <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary font-bold text-base md:text-lg">
          {appointment.client.charAt(0)}
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-foreground text-base md:text-lg">{appointment.client}</h3>
            <Badge className={`${getStatusColor(appointment.status)} text-white border-none text-xs`}>
              {appointment.status}
            </Badge>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground flex items-center gap-1 flex-wrap">
            <span className="font-medium text-primary">{appointment.service}</span>
            <span className="text-xs hidden sm:inline">•</span>
            <span className="hidden sm:inline">{appointment.phone}</span>
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-4 md:gap-6 justify-between md:justify-end flex-1">
        <div className="flex flex-col items-start md:items-end min-w-[100px]">
          <div className="flex items-center gap-2 text-xs md:text-sm font-medium">
            <IoCalendarOutline className="text-primary h-3 w-3 md:h-4 md:w-4" />
            {appointment.date}
          </div>
          <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
            <IoTimeOutline className="h-3 w-3 md:h-4 md:w-4" />
            {appointment.time}
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-black">
              <IoEllipsisVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="cursor-pointer" onClick={() => handleEditClick(appointment)}>
              <IoPencilOutline className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600" onClick={() => handleDeleteClick(appointment.id)}>
              <IoTrashOutline className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Citas</h1>
          <p className="text-muted-foreground">Gestiona y organiza tu agenda</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-lg shadow-primary/20 w-full md:w-auto"
              onClick={handleAddNewClick}
            >
              <IoAddOutline className="h-5 w-5" />
              Nueva Cita
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden [&>button]:text-white [&>button]:hover:text-white/80">
            <DialogHeader className="bg-purple-600 p-6 text-center sm:text-center">
              <DialogTitle className="text-white text-2xl">
                {editingId ? "Editar Cita" : "Agendar Nueva Cita"}
              </DialogTitle>
              <DialogDescription className="text-purple-100">
                {editingId ? "Modifique los detalles de la cita." : "Complete los detalles de la nueva cita aquí."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
                <Label htmlFor="client" className="md:text-right">
                  Cliente
                </Label>
                <Input 
                  id="client" 
                  placeholder="Nombre del cliente" 
                  className="md:col-span-3" 
                  value={formData.client}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
                <Label htmlFor="service" className="md:text-right">
                  Servicio
                </Label>
                <Input 
                  id="service" 
                  placeholder="Ej. Lavado Completo" 
                  className="md:col-span-3" 
                  value={formData.service}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
                <Label htmlFor="date" className="md:text-right">
                  Fecha
                </Label>
                <Input 
                  id="date" 
                  type="date"
                  className="md:col-span-3" 
                  value={formData.date}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
                <Label htmlFor="time" className="md:text-right">
                  Hora
                </Label>
                <Input 
                  id="time" 
                  type="time"
                  className="md:col-span-3" 
                  value={formData.time}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
                <Label htmlFor="phone" className="md:text-right">
                  Teléfono
                </Label>
                <Input 
                  id="phone" 
                  placeholder="0414-000-0000" 
                  className="md:col-span-3" 
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
                <Label htmlFor="status" className="md:text-right">
                  Estado
                </Label>
                <select
                  id="status"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:col-span-3"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="Confirmada">Confirmada</option>
                  <option value="Completada">Completada</option>
                  <option value="Cancelada">Cancelada</option>
                </select>
              </div>
            </div>
            <DialogFooter className="p-6 pt-0 sm:justify-center">
              <Button 
                type="submit" 
                className="bg-purple-600 hover:bg-purple-700 text-white min-w-[150px]"
                onClick={handleSaveAppointment}
              >
                {editingId ? "Actualizar Cita" : "Agendar Cita"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative flex-1 w-full">
          <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Buscar por cliente o servicio..." 
            className="pl-9 bg-background/50 border-muted-foreground/20 focus:border-primary w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground w-full md:w-auto justify-end">
          <IoCalendarOutline className="h-4 w-4" />
          <span>{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:w-[400px] h-auto bg-muted/50 p-1 gap-1">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="pending">Pendientes</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmadas</TabsTrigger>
          <TabsTrigger value="completed">Completadas</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6 space-y-4">
          {filteredAppointments.map((app) => (
            <AppointmentCard key={app.id} appointment={app} />
          ))}
        </TabsContent>
        
        <TabsContent value="pending" className="mt-6 space-y-4">
          {filteredAppointments
            .filter(app => app.status === "Pendiente")
            .map((app) => (
              <AppointmentCard key={app.id} appointment={app} />
            ))}
        </TabsContent>

        <TabsContent value="confirmed" className="mt-6 space-y-4">
          {filteredAppointments
            .filter(app => app.status === "Confirmada")
            .map((app) => (
              <AppointmentCard key={app.id} appointment={app} />
            ))}
        </TabsContent>

        <TabsContent value="completed" className="mt-6 space-y-4">
          {filteredAppointments
            .filter(app => app.status === "Completada")
            .map((app) => (
              <AppointmentCard key={app.id} appointment={app} />
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Appointments;
