import { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  IoAddOutline, 
  IoTrashOutline,
  IoCashOutline,
  IoCardOutline,
  IoPhonePortraitOutline,
  IoCubeOutline,
  IoCartOutline,
  IoCheckmarkCircleOutline,
  IoDownloadOutline
} from "react-icons/io5";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Toaster } from "@/components/ui/toaster";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CartItem {
  id: string;
  type: "service" | "product";
  itemId: number;
  name: string;
  price: number;
  quantity: number;
}

interface Service {
  id: number;
  name: string;
  price: string;
}

interface Product {
  id: number;
  name: string;
  price: string;
}

// Datos de ejemplo
const services: Service[] = [
  { id: 1, name: "Lavado Express", price: "5" },
  { id: 2, name: "Lavado Completo", price: "10" },
  { id: 3, name: "Encerado Premium", price: "20" },
  { id: 4, name: "Pulido", price: "25" },
];

const products: Product[] = [
  { id: 1, name: "Cera Premium", price: "15" },
  { id: 2, name: "Shampoo Automotriz", price: "8" },
  { id: 3, name: "Microfibra Premium", price: "5" },
  { id: 4, name: "Aromatizante", price: "3" },
];

const POS = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [dolarRate, setDolarRate] = useState<number | null>(null);
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const [lastSale, setLastSale] = useState<{ id: string; total: number } | null>(null);
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

  const addToCart = (type: "service" | "product", item: Service | Product) => {
    const cartItemId = `${type}-${item.id}`;
    const existingItem = cart.find(ci => ci.id === cartItemId);

    if (existingItem) {
      // Si es un producto, incrementar cantidad
      if (type === "product") {
        setCart(cart.map(ci => 
          ci.id === cartItemId 
            ? { ...ci, quantity: ci.quantity + 1 }
            : ci
        ));
      } else {
        // Para servicios, simplemente notificar que ya está agregado
        toast({
          title: "Servicio ya agregado",
          description: "Este servicio ya está en el carrito.",
        });
      }
    } else {
      const newItem: CartItem = {
        id: cartItemId,
        type,
        itemId: item.id,
        name: item.name,
        price: parseFloat(item.price),
        quantity: 1,
      };
      setCart([...cart, newItem]);
      toast({
        title: "Agregado al carrito",
        description: `${item.name} ha sido agregado.`,
      });
    }
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(cart.filter(item => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
    } else {
      setCart(cart.map(item => 
        item.id === cartItemId 
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateBsPrice = (usdPrice: number) => {
    if (!dolarRate) return 'Cargando...';
    return (usdPrice * dolarRate).toFixed(2);
  };

  const processSale = () => {
    if (cart.length === 0) {
      toast({
        title: "Carrito vacío",
        description: "Agrega items al carrito antes de procesar la venta.",
        variant: "destructive",
      });
      return;
    }

    if (!paymentMethod) {
      toast({
        title: "Método de pago requerido",
        description: "Selecciona un método de pago.",
        variant: "destructive",
      });
      return;
    }

    const total = calculateSubtotal();
    const saleId = `#${Date.now().toString().slice(-6)}`;
    
    setLastSale({ id: saleId, total });
    setShowThankYouModal(true);
  };

  const closeAndClear = () => {
    setShowThankYouModal(false);
    setCart([]);
    setPaymentMethod("");
    setLastSale(null);
  };

  const exportToPDF = () => {
    if (!lastSale) return;

    const doc = new jsPDF();
    const primaryColor = [29, 78, 216]; // Blue-700
    const grayColor = [107, 114, 128]; // Gray-500
    
    // Encabezado
    doc.setFontSize(22);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("Autolavado Gochi", 105, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text("Av. Principal Las Mercedes, Caracas", 105, 28, { align: "center" });
    doc.text("Tel: +58 412-1234567 | Email: contacto@autolavadogochi.com", 105, 33, { align: "center" });
    doc.text("RIF: J-12345678-9", 105, 38, { align: "center" });

    doc.setDrawColor(200, 200, 200);
    doc.line(20, 45, 190, 45);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Recibo de Venta`, 20, 55);
    
    doc.setFontSize(10);
    doc.text(`ID: ${lastSale.id}`, 20, 62);
    doc.text(`Fecha: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 20, 67);
    doc.text(`Método de Pago: ${paymentMethod}`, 20, 72);

    const tableColumn = ["Item", "Cant.", "Precio Unit.", "Total"];
    const tableRows = cart.map(item => [
      item.name,
      item.quantity.toString(),
      `$${item.price.toFixed(2)}`,
      `$${(item.price * item.quantity).toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 80,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: primaryColor, textColor: 255, halign: 'center' },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { halign: 'center' },
        2: { halign: 'right' },
        3: { halign: 'right' }
      },
      styles: { fontSize: 10, cellPadding: 3 },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    doc.setFontSize(11);
    doc.text(`Subtotal:`, 140, finalY);
    doc.text(`$${lastSale.total.toFixed(2)}`, 190, finalY, { align: "right" });
    
    doc.setFontSize(14);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text(`Total USD:`, 140, finalY + 10);
    doc.text(`$${lastSale.total.toFixed(2)}`, 190, finalY + 10, { align: "right" });
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Bs:`, 140, finalY + 18);
    doc.text(`Bs. ${calculateBsPrice(lastSale.total)}`, 190, finalY + 18, { align: "right" });

    doc.setFontSize(10);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text("¡Gracias por su preferencia!", 105, finalY + 40, { align: "center" });
    doc.text("Conserve este recibo para cualquier reclamo.", 105, finalY + 45, { align: "center" });

    doc.save(`recibo_${lastSale.id.replace('#', '')}.pdf`);

    toast({
      title: "PDF generado",
      description: "El recibo se ha descargado exitosamente.",
    });
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <Toaster />
      <motion.div 
        className="flex flex-col gap-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">POS - Punto de Venta</h1>
            <p className="text-muted-foreground mt-1">Procesa ventas de servicios y productos</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="services" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="services">Servicios</TabsTrigger>
                <TabsTrigger value="products">Productos</TabsTrigger>
              </TabsList>
              
              <TabsContent value="services" className="mt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {services.map((service) => (
                    <Card 
                      key={service.id} 
                      className="cursor-pointer hover:border-primary transition-all duration-200 hover:shadow-md active:scale-[0.98]"
                      onClick={() => addToCart("service", service)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <IoCubeOutline className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg">{service.name}</CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-2xl font-bold text-primary">${parseFloat(service.price).toFixed(2)}</span>
                          <Button size="sm" className="gap-1">
                            <IoAddOutline className="h-4 w-4" /> Agregar
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Bs. {calculateBsPrice(parseFloat(service.price))}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="products" className="mt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {products.map((product) => (
                    <Card 
                      key={product.id} 
                      className="cursor-pointer hover:border-primary transition-all duration-200 hover:shadow-md active:scale-[0.98]"
                      onClick={() => addToCart("product", product)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <IoCubeOutline className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg">{product.name}</CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-2xl font-bold text-primary">${parseFloat(product.price).toFixed(2)}</span>
                          <Button size="sm" className="gap-1">
                            <IoAddOutline className="h-4 w-4" /> Agregar
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Bs. {calculateBsPrice(parseFloat(product.price))}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-1">
            <Card className="h-fit sticky top-6 shadow-lg border-t-4 border-t-primary">
              <CardHeader className="pb-4 border-b">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <IoCartOutline className="h-6 w-6" />
                  Carrito
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {cart.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/30">
                      <IoCartOutline className="h-12 w-12 mx-auto mb-2 opacity-20" />
                      <p>El carrito está vacío</p>
                      <p className="text-sm">Selecciona items para comenzar</p>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <motion.div 
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            ${item.price.toFixed(2)} x {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.type === 'product' && (
                            <div className="flex items-center gap-1 bg-background rounded-md border px-1 h-8">
                              <button 
                                onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, item.quantity - 1); }}
                                className="w-6 h-full flex items-center justify-center hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                              >
                                -
                              </button>
                              <span className="w-4 text-center text-sm font-medium">{item.quantity}</span>
                              <button 
                                onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, item.quantity + 1); }}
                                className="w-6 h-full flex items-center justify-center hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                              >
                                +
                              </button>
                            </div>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => { e.stopPropagation(); removeFromCart(item.id); }}
                          >
                            <IoTrashOutline className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <div className="flex justify-between items-end">
                    <span className="text-lg font-semibold">Subtotal:</span>
                    <span className="text-2xl font-bold text-primary">${calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span className="text-sm">En Bolívares:</span>
                    <span className="font-medium">Bs. {calculateBsPrice(calculateSubtotal())}</span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <label className="text-sm font-medium">Método de pago:</label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={paymentMethod === "Efectivo" ? "default" : "outline"}
                      className={`h-20 flex flex-col gap-2 transition-all duration-200 ${paymentMethod === "Efectivo" ? "ring-2 ring-primary ring-offset-2" : "hover:border-primary/50"}`}
                      onClick={() => setPaymentMethod("Efectivo")}
                    >
                      <IoCashOutline className="h-6 w-6" />
                      <span className="text-xs">Efectivo</span>
                    </Button>
                    <Button
                      variant={paymentMethod === "Tarjeta" ? "default" : "outline"}
                      className={`h-20 flex flex-col gap-2 transition-all duration-200 ${paymentMethod === "Tarjeta" ? "ring-2 ring-primary ring-offset-2" : "hover:border-primary/50"}`}
                      onClick={() => setPaymentMethod("Tarjeta")}
                    >
                      <IoCardOutline className="h-6 w-6" />
                      <span className="text-xs">Tarjeta</span>
                    </Button>
                    <Button
                      variant={paymentMethod === "Transferencia" ? "default" : "outline"}
                      className={`h-20 flex flex-col gap-2 transition-all duration-200 ${paymentMethod === "Transferencia" ? "ring-2 ring-primary ring-offset-2" : "hover:border-primary/50"}`}
                      onClick={() => setPaymentMethod("Transferencia")}
                    >
                      <IoPhonePortraitOutline className="h-6 w-6" />
                      <span className="text-xs">Transf.</span>
                    </Button>
                  </div>
                </div>

                <motion.div
                  whileTap={{ scale: 0.95 }}
                  className="w-full mt-4"
                >
                  <Button 
                    className="w-full h-12 text-lg font-semibold shadow-md" 
                    size="lg"
                    onClick={processSale}
                    disabled={cart.length === 0 || !paymentMethod}
                  >
                    Procesar Venta
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Dialog open={showThankYouModal} onOpenChange={closeAndClear}>
          <DialogContent className="sm:max-w-md border-0 shadow-2xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex flex-col items-center text-center space-y-6 py-6"
            >
              <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                className="flex justify-center"
              >
                <div className="rounded-full bg-green-100 p-3">
                  <IoCheckmarkCircleOutline className="h-16 w-16 text-green-600" />
                </div>
              </motion.div>

              <DialogHeader className="space-y-2">
                <DialogTitle className="text-2xl font-bold text-center text-gray-900">
                  ¡Gracias por tu Compra!
                </DialogTitle>
                <DialogDescription className="text-center text-gray-500">
                  La transacción ha sido completada exitosamente.
                </DialogDescription>
              </DialogHeader>

              {lastSale && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="w-full bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3"
                >
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">ID de Pedido</span>
                    <span className="font-mono font-medium text-gray-900">{lastSale.id}</span>
                  </div>
                  <div className="h-px bg-gray-200 w-full"></div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Total Pagado</span>
                    <div className="text-right">
                      <div className="font-bold text-xl text-primary">${lastSale.total.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">Bs. {calculateBsPrice(lastSale.total)}</div>
                    </div>
                  </div>
                </motion.div>
              )}

              <DialogFooter className="flex flex-col sm:flex-row gap-3 w-full sm:justify-center mt-4">
                <Button
                  onClick={exportToPDF}
                  className="flex-1 gap-2 bg-primary hover:bg-primary/90 text-white shadow-sm"
                >
                  <IoDownloadOutline className="h-5 w-5" />
                  Descargar Recibo
                </Button>
                <Button
                  variant="outline"
                  onClick={closeAndClear}
                  className="flex-1 border-gray-200 hover:bg-gray-50 hover:text-gray-900"
                >
                  Cerrar
                </Button>
              </DialogFooter>
            </motion.div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
};

export default POS;
