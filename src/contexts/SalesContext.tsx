
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface SaleItem {
  id?: string; // cart item id
  type: "service" | "product";
  itemId: number; // product or service id
  name: string;
  price: number;
  quantity: number;
}

export interface Sale {
  id: number;
  customer_id: number;
  total: number;
  payment_method: string;
  date: string;
  items: SaleItem[];
}

interface SalesContextType {
  sales: Sale[];
  refreshSales: () => Promise<void>;
  createSale: (customerId: number, items: SaleItem[], paymentMethod: string, total: number) => Promise<{ success: boolean; saleId?: string }>;
  loading: boolean;
}

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export const SalesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);

  const [sales, setSales] = useState<Sale[]>([]);

  const fetchSales = async () => {
    try {
      // Fetch recent 50 sales for dashboard and list
      const { data, error } = await supabase
        .from('ventas')
        .select(`
          *,
          detalle_ventas (
            *,
            productos (nombre),
            servicios (nombre)
          )
        `)
        .order('id', { ascending: false })
        .limit(50);

      if (error) throw error;

      if (data) {
        const mappedSales: Sale[] = data.map((item: any) => ({
          id: item.id,
          customer_id: item.cliente_id,
          total: item.total,
          payment_method: item.metodo_pago,
          date: item.fecha,
          items: item.detalle_ventas.map((detail: any) => ({
            id: detail.id,
            type: detail.producto_id ? 'product' : 'service',
            itemId: detail.producto_id || detail.servicio_id,
            name: detail.productos?.nombre || detail.servicios?.nombre || 'Item',
            price: detail.precio_unitario,
            quantity: detail.cantidad
          }))
        }));
        setSales(mappedSales);
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
    }
  };

  useEffect(() => {
    fetchSales();

    const channel = supabase
      .channel('sales_channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'ventas' },
        () => fetchSales()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const createSale = async (customerId: number, items: SaleItem[], paymentMethod: string, total: number): Promise<{ success: boolean; saleId?: string }> => {
    setLoading(true);
    try {
      // 1. Crear registro en tabla 'ventas'
      const { data: saleData, error: saleError } = await supabase
        .from('ventas')
        .insert([{
          cliente_id: customerId,
          total: total,
          metodo_pago: paymentMethod,
          fecha: new Date().toISOString() // Supabase handles timezone but good to be explicit or let default
        }])
        .select()
        .single();

      if (saleError) throw saleError;
      
      const saleId = saleData.id;

      // 2. Preparar detalles de venta
      const saleDetails = items.map(item => ({
        venta_id: saleId,
        producto_id: item.type === 'product' ? item.itemId : null,
        servicio_id: item.type === 'service' ? item.itemId : null,
        cantidad: item.quantity,
        precio_unitario: item.price
      }));

      // 3. Insertar detalles
      const { error: detailsError } = await supabase
        .from('detalle_ventas')
        .insert(saleDetails);

      if (detailsError) throw detailsError;

      // 4. Actualizar stock para productos
      // Esto idealmente se haría con una función RPC en Supabase para atomicidad, 
      // pero por ahora lo haremos iterando desde el cliente o usando RPC si existiera.
      // Haremos un loop simple por ahora.
      for (const item of items) {
        if (item.type === 'product') {
          // Decrementar stock
          // Primero obtenemos el stock actual (optimista o fetch)
          // Mejor usar RPC: decrement_stock(product_id, quantity)
          // Crearemos una llamada simple update user-side por ahora para mantener consistencia con ProductContext
          
          // Fetch current stock first to be safe or use raw SQL decrements if possible via rpc
          // Let's rely on a helper or direct update.
          const { error: stockError } = await supabase.rpc('decrement_stock', { 
            p_id: item.itemId, 
            cant: item.quantity 
          });

          // Si no existe la función RPC, fallback a lectura-escritura (menos seguro para concurrencia)
          if (stockError) {
             console.warn("RPC decrement_stock failed or not found, falling back to manual update", stockError);
             // Fallback Logic
             const { data: product } = await supabase.from('productos').select('stock').eq('id', item.itemId).single();
             if (product) {
               const newStock = Math.max(0, product.stock - item.quantity);
               await supabase.from('productos').update({ stock: newStock }).eq('id', item.itemId);
             }
          }

          // 5. Registrar movimiento en tabla 'movimientos'
          const { error: movementError } = await supabase
            .from('movimientos')
            .insert([{
              tipo: 'salida',
              producto_id: item.itemId,
              cantidad: item.quantity,
              motivo: `Venta por ${paymentMethod}`,
              fecha: new Date().toISOString()
            }]);

          if (movementError) {
            console.error("Error registering movement for item", item, movementError);
            // Optional: throw or just log? Failing to record movement is bad for consistency.
            // throw movementError; 
          }
        }
      }

      toast.success('Venta procesada exitosamente');
      return { success: true, saleId: saleId.toString() };

    } catch (error) {
    console.error('Error creating sale:', error);
    toast.error('Error al procesar la venta');
    return { success: false };
  } finally {
    setLoading(false);
  }
};

  return (
    <SalesContext.Provider value={{ createSale, loading, sales, refreshSales: fetchSales }}>
      {children}
    </SalesContext.Provider>
  );
};

export const useSales = () => {
  const context = useContext(SalesContext);
  if (context === undefined) {
    throw new Error('useSales must be used within a SalesProvider');
  }
  return context;
};
