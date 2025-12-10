
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string;
  category: string;
  stock: number;
  barcode?: string;
}

interface ProductContextType {
  products: Product[];
  loading: boolean;
  addProduct: (product: Omit<Product, 'id'>, imageFile?: File) => Promise<void>;
  updateProduct: (id: number, updates: Partial<Product>, imageFile?: File) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  updateStock: (productId: number, quantity: number, type: 'add' | 'subtract') => Promise<void>;
  getProductById: (id: number) => Product | undefined;
  getProductByBarcode: (barcode: string) => Product | undefined;
  checkStockAvailability: (productId: number, quantity: number) => boolean;
  refreshProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .order('nombre', { ascending: true });

      if (error) throw error;

      const mappedProducts: Product[] = data.map((item: any) => ({
        id: item.id,
        name: item.nombre,
        description: item.descripcion,
        price: item.precio,
        image: item.imagen_url,
        category: item.categoria,
        stock: item.stock,
        barcode: item.codigo_barras
      }));

      setProducts(mappedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const uploadImage = async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('productos')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('productos')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const addProduct = async (product: Omit<Product, 'id'>, imageFile?: File) => {
    try {
      let imageUrl = product.image;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const { error } = await supabase
        .from('productos')
        .insert([{
          nombre: product.name,
          descripcion: product.description,
          precio: product.price,
          imagen_url: imageUrl,
          categoria: product.category,
          stock: product.stock,
          codigo_barras: product.barcode
        }]);

      if (error) throw error;

      toast.success('Producto agregado exitosamente');
      await fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Error al agregar producto');
      throw error;
    }
  };

  const updateProduct = async (id: number, updates: Partial<Product>, imageFile?: File) => {
    try {
      let imageUrl = updates.image;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.nombre = updates.name;
      if (updates.description !== undefined) dbUpdates.descripcion = updates.description;
      if (updates.price !== undefined) dbUpdates.precio = updates.price;
      if (imageUrl !== undefined) dbUpdates.imagen_url = imageUrl;
      if (updates.category !== undefined) dbUpdates.categoria = updates.category;
      if (updates.stock !== undefined) dbUpdates.stock = updates.stock;
      if (updates.barcode !== undefined) dbUpdates.codigo_barras = updates.barcode;

      const { error } = await supabase
        .from('productos')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;

      toast.success('Producto actualizado exitosamente');
      await fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Error al actualizar producto');
      throw error;
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      const { error } = await supabase
        .from('productos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Producto eliminado exitosamente');
      await fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error al eliminar producto');
      throw error;
    }
  };

  const updateStock = async (productId: number, quantity: number, type: 'add' | 'subtract') => {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) throw new Error('Product not found');

      const newStock = type === 'add' 
        ? product.stock + quantity 
        : Math.max(0, product.stock - quantity);

      const { error } = await supabase
        .from('productos')
        .update({ stock: newStock })
        .eq('id', productId);

      if (error) throw error;

      // Optimistic update or refresh
      await fetchProducts();
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error('Error al actualizar stock');
      throw error;
    }
  };

  const getProductById = (id: number): Product | undefined => {
    return products.find(p => p.id === id);
  };

  const getProductByBarcode = (barcode: string): Product | undefined => {
    return products.find(p => p.barcode === barcode);
  };

  const checkStockAvailability = (productId: number, quantity: number): boolean => {
    const product = getProductById(productId);
    return product ? product.stock >= quantity : false;
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        addProduct,
        updateProduct,
        deleteProduct,
        updateStock,
        getProductById,
        getProductByBarcode,
        checkStockAvailability,
        refreshProducts: fetchProducts
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
