import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  IoSettingsOutline, 
  IoTimeOutline, 
  IoShieldCheckmarkOutline,
  IoLogoInstagram,
  IoLogoFacebook,
  IoLogoWhatsapp,
  IoSaveOutline,
  IoBusinessOutline,
  IoShareSocialOutline,
  IoCheckmarkCircleOutline,
  IoWarningOutline
} from "react-icons/io5";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

const Settings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showLogoutSuccess, setShowLogoutSuccess] = useState(false);

  const handleSave = () => {
    setLoading(true);
    // Simular guardado
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Configuración guardada",
        description: "Los cambios han sido aplicados correctamente.",
      });
    }, 1000);
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);
    // Simular proceso de cierre de sesión
    setTimeout(() => {
      setShowLogoutSuccess(true);
    }, 500);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Toaster />
      
      {/* Logout Confirmation Modal */}
      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <IoWarningOutline className="h-6 w-6" />
              ¿Estás seguro?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción cerrará la sesión en todos los dispositivos donde tu cuenta esté activa. Tendrás que volver a iniciar sesión en cada uno de ellos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleLogoutConfirm}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Sí, cerrar sesiones
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success Modal */}
      <Dialog open={showLogoutSuccess} onOpenChange={setShowLogoutSuccess}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
              <IoCheckmarkCircleOutline className="h-10 w-10 text-green-600" />
            </div>
            <DialogTitle className="text-center text-xl">¡Sesiones Cerradas!</DialogTitle>
            <DialogDescription className="text-center">
              Se ha cerrado la sesión exitosamente en todos los dispositivos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button 
              type="button" 
              className="bg-green-600 hover:bg-green-700 text-white min-w-[120px]"
              onClick={() => setShowLogoutSuccess(false)}
            >
              Entendido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
          Configuración
        </h1>
        <p className="text-muted-foreground text-lg">
          Personaliza y administra tu negocio
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2 -mx-4 px-4 md:mx-0 md:px-0">
          <TabsList className="w-full justify-start md:justify-center p-1 h-auto bg-muted/50 rounded-xl overflow-x-auto flex-nowrap">
            <TabsTrigger 
              value="general" 
              className="flex-1 min-w-[120px] py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300"
            >
              <div className="flex items-center gap-2">
                <IoSettingsOutline className="h-4 w-4" />
                <span>General</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="operations" 
              className="flex-1 min-w-[120px] py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300"
            >
              <div className="flex items-center gap-2">
                <IoTimeOutline className="h-4 w-4" />
                <span>Operaciones</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="flex-1 min-w-[120px] py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300"
            >
              <div className="flex items-center gap-2">
                <IoShieldCheckmarkOutline className="h-4 w-4" />
                <span>Seguridad</span>
              </div>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* GENERAL SETTINGS */}
        <TabsContent value="general" className="space-y-6">
          <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-2">
            <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-card to-muted/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <IoBusinessOutline className="h-6 w-6" />
                  </div>
                  Información del Negocio
                </CardTitle>
                <CardDescription>Datos básicos y de contacto</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="business-name">Nombre del Negocio</Label>
                  <Input id="business-name" defaultValue="Autolavado Gochi" placeholder="Ej. Autolavado Gochi" className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business-rif">RIF / Identificación</Label>
                  <Input id="business-rif" defaultValue="J-12345678-9" placeholder="Ej. J-12345678-9" className="bg-background/50" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="business-phone">Teléfono</Label>
                    <Input id="business-phone" defaultValue="0412-1234567" placeholder="Ej. 0412-1234567" className="bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="business-email">Email</Label>
                    <Input id="business-email" type="email" defaultValue="contacto@gochi.com" placeholder="Ej. contacto@gochi.com" className="bg-background/50" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business-address">Dirección Física</Label>
                  <Input id="business-address" defaultValue="Av. Principal, Local 123, Ciudad" placeholder="Ej. Av. Principal, Local 123" className="bg-background/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-card to-muted/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                    <IoShareSocialOutline className="h-6 w-6" />
                  </div>
                  Redes Sociales
                </CardTitle>
                <CardDescription>Conecta con tus clientes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="instagram" className="flex items-center gap-2 text-pink-600 font-medium">
                    <IoLogoInstagram className="h-5 w-5" /> Instagram
                  </Label>
                  <Input id="instagram" placeholder="@usuario" defaultValue="@autolavadogochi" className="bg-background/50 border-pink-100 focus:border-pink-300 focus:ring-pink-200" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook" className="flex items-center gap-2 text-blue-600 font-medium">
                    <IoLogoFacebook className="h-5 w-5" /> Facebook
                  </Label>
                  <Input id="facebook" placeholder="/pagina" defaultValue="/autolavadogochi" className="bg-background/50 border-blue-100 focus:border-blue-300 focus:ring-blue-200" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="flex items-center gap-2 text-green-600 font-medium">
                    <IoLogoWhatsapp className="h-5 w-5" /> WhatsApp Business
                  </Label>
                  <Input id="whatsapp" placeholder="58..." defaultValue="584121234567" className="bg-background/50 border-green-100 focus:border-green-300 focus:ring-green-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* OPERATIONS SETTINGS */}
        <TabsContent value="operations" className="space-y-6">
          <motion.div variants={itemVariants}>
            <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-card to-muted/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                    <IoTimeOutline className="h-6 w-6" />
                  </div>
                  Horarios de Atención
                </CardTitle>
                <CardDescription>Define cuándo está abierto tu negocio</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="opening-time" className="text-base">Hora de Apertura</Label>
                    <div className="relative">
                      <Input 
                        id="opening-time" 
                        type="time" 
                        defaultValue="08:00" 
                        className="text-lg p-6 bg-background/50 text-center font-mono"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="closing-time" className="text-base">Hora de Cierre</Label>
                    <div className="relative">
                      <Input 
                        id="closing-time" 
                        type="time" 
                        defaultValue="18:00" 
                        className="text-lg p-6 bg-background/50 text-center font-mono"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 pt-4 border-t">
                  <Label className="text-base">Días Laborables</Label>
                  <div className="flex flex-wrap gap-3">
                    {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
                      <motion.div
                        key={day}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button 
                          variant={day === 'Dom' ? "outline" : "default"} 
                          className={`rounded-full w-12 h-12 p-0 font-medium ${
                            day !== 'Dom' ? 'bg-primary shadow-md shadow-primary/30' : 'border-dashed'
                          }`}
                        >
                          {day}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    * Los días marcados en azul son laborables
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* SECURITY SETTINGS */}
        <TabsContent value="security" className="space-y-6">
          <motion.div variants={itemVariants}>
            <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-card to-muted/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
                    <IoShieldCheckmarkOutline className="h-6 w-6" />
                  </div>
                  Seguridad de la Cuenta
                </CardTitle>
                <CardDescription>Protege tu acceso al sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="max-w-md space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Contraseña Actual</Label>
                    <Input id="current-password" type="password" placeholder="Ingresa tu contraseña actual" className="bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nueva Contraseña</Label>
                    <Input id="new-password" type="password" placeholder="Ingresa la nueva contraseña" className="bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                    <Input id="confirm-password" type="password" placeholder="Repite la nueva contraseña" className="bg-background/50" />
                  </div>
                </div>
                
                <div className="pt-6 border-t flex flex-col md:flex-row gap-4 justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    ¿Detectas actividad sospechosa?
                  </p>
                  <Button 
                    variant="destructive" 
                    className="w-full md:w-auto shadow-md shadow-destructive/20"
                    onClick={handleLogoutClick}
                  >
                    Cerrar Sesión en Todos los Dispositivos
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      <motion.div 
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
      >
        <Button 
          onClick={handleSave} 
          disabled={loading}
          size="lg"
          className="rounded-full h-14 px-8 gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-xl shadow-primary/30 transition-all duration-300 hover:scale-105"
        >
          <IoSaveOutline className="h-6 w-6" />
          {loading ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </motion.div>
      
      {/* Spacer for FAB */}
      <div className="h-20"></div>
    </motion.div>
  );
};

export default Settings;
