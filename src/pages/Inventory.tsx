import { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { 
  IoAddOutline, 
  IoTrashOutline, 
  IoPencilOutline, 
  IoImageOutline,
  IoCubeOutline 
} from "react-icons/io5";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Toaster } from "@/components/ui/toaster";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string;
  category: string;
  stock: number;
}

const initialProducts: Product[] = [
  {
    id: 1,
    name: "Cera Premium",
    description: "Cera de alta calidad para protección y brillo duradero",
    price: "15",
    image: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=400&h=300&fit=crop",
    category: "Cuidado",
    stock: 25,
  },
  {
    id: 2,
    name: "Shampoo Automotriz",
    description: "Shampoo concentrado pH neutro para lavado profesional",
    price: "8",
    image: "https://images.unsplash.com/photo-1563298723-dcfebaa392e3?w=400&h=300&fit=crop",
    category: "Limpieza",
    stock: 40,
  },
  {
    id: 3,
    name: "Microfibra Premium",
    description: "Paños de microfibra ultra absorbentes",
    price: "5",
    image: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=400&h=300&fit=crop",
    category: "Accesorios",
    stock: 60,
  },
];

const Inventory = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [dolarRate, setDolarRate] = useState<number | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showDescription, setShowDescription] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    stock: "",
    image: "",
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData(prev => ({
          ...prev,
          image: result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateBsPrice = (usdPrice: string) => {
    if (!dolarRate) return 'Cargando...';
    const price = parseFloat(usdPrice) || 0;
    return (price * dolarRate).toFixed(2);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      toast({
        title: "Error",
        description: "Por favor complete los campos obligatorios.",
        variant: "destructive",
      });
      return;
    }

    if (editingId !== null) {
      setProducts(products.map(product => 
        product.id === editingId 
          ? { 
              ...product, 
              name: formData.name, 
              description: formData.description, 
              price: formData.price,
              category: formData.category,
              stock: parseInt(formData.stock) || 0,
              image: formData.image || product.image
            } 
          : product
      ));
      toast({
        title: "Producto actualizado",
        description: "El producto ha sido actualizado exitosamente.",
      });
    } else {
      const newProduct: Product = {
        id: Date.now(),
        name: formData.name,
        description: formData.description,
        price: formData.price,
        category: formData.category,
        stock: parseInt(formData.stock) || 0,
        image: formData.image || "https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=400&h=300&fit=crop",
      };
      setProducts([...products, newProduct]);
      toast({
        title: "Producto agregado",
        description: "El producto ha sido agregado exitosamente.",
      });
    }

    setFormData({ name: "", price: "", description: "", category: "", stock: "", image: "" });
    setImagePreview("");
    setEditingId(null);
    setIsDialogOpen(false);
  };

  const handleEditClick = (product: Product) => {
    setFormData({
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category,
      stock: product.stock.toString(),
      image: product.image,
    });
    setImagePreview(product.image);
    setShowDescription(!!product.description);
    setEditingId(product.id);
    setIsDialogOpen(true);
  };

  const handleDeleteProduct = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setProducts(products.filter(product => product.id !== id));
    toast({
      title: "Producto eliminado",
      description: "El producto ha sido eliminado exitosamente.",
    });
  };

  const handleAddNewClick = () => {
    setFormData({ name: "", price: "", description: "", category: "", stock: "", image: "" });
    setImagePreview("");
    setShowDescription(false);
    setEditingId(null);
    setIsDialogOpen(true);
  };

  // Get unique categories
  const categories = ["all", ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number = 0) => ({
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
        delay: i * 0.1
      }
    })
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Inventario</h1>
            <p className="text-sm md:text-base text-muted-foreground">Gestiona los productos de tu negocio</p>
          </div>
          <motion.div variants={itemVariants}>
            <Button 
              onClick={handleAddNewClick} 
              className="gap-2"
            >
              <IoAddOutline className="h-5 w-5" />
              Nuevo Producto
            </Button>
          </motion.div>
        </div>

        <motion.div 
          className="flex flex-col md:flex-row gap-4"
          variants={itemVariants}
        >
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="w-full md:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="all">Todas las categorías</option>
              {categories.filter(cat => cat !== "all").map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          variants={containerVariants}
        >
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              custom={index}
              variants={itemVariants}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                <div className="relative h-48 w-full overflow-hidden bg-muted">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                </div>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    {product.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-primary">
                        ${parseFloat(product.price).toFixed(2)}
                      </span>
                      <span className="text-xs text-muted-foreground">USD</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-semibold text-foreground">
                        Bs. {calculateBsPrice(product.price)}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="gap-2 justify-center">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEditClick(product)}
                  >
                    <IoPencilOutline className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => handleDeleteProduct(e, product.id)}
                  >
                    <IoTrashOutline className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => !open && setIsDialogOpen(false)}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId !== null ? 'Editar Producto' : 'Nuevo Producto'}
              </DialogTitle>
              <DialogDescription>
                {editingId !== null 
                  ? 'Actualiza la información del producto.'
                  : 'Completa la información para agregar un nuevo producto.'}
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
                  placeholder="Ej. Cera Premium"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Categoría
                </Label>
                <Input
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="Ej. Cuidado, Limpieza"
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
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="0.00"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="stock" className="text-right">
                  Stock mínimo
                </Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  value={formData.stock}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="0"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">
                  Descripción
                </Label>
                <div className="col-span-3 flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showDescription"
                    checked={showDescription}
                    onChange={(e) => {
                      setShowDescription(e.target.checked);
                      if (!e.target.checked) {
                        setFormData(prev => ({ ...prev, description: "" }));
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="showDescription" className="cursor-pointer">
                    Agregar descripción
                  </Label>
                </div>
              </div>
              {showDescription && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="col-span-3"
                    placeholder="Descripción del producto"
                    rows={3}
                  />
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="image" className="text-right">
                  Imagen
                </Label>
                <div className="col-span-3 space-y-2">
                  <Input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="cursor-pointer"
                  />
                  {imagePreview && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {!imagePreview && (
                    <div className="flex items-center justify-center w-full h-48 bg-muted rounded-lg border-2 border-dashed">
                      <div className="text-center">
                        <IoImageOutline className="h-12 w-12 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mt-2">
                          Vista previa de imagen
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" onClick={(e) => handleSaveProduct(e)}>
                {editingId !== null ? 'Actualizar' : 'Guardar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
};

export default Inventory;
