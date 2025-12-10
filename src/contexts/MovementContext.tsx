import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/components/ui/use-toast";

export interface Movement {
  id: number;
  type: "entry" | "exit";
  productId: number;
  productName: string;
  quantity: number;
  date: string;
  reason: string;
}

interface CartItem {
  id: string; // Cart ID
  type: "service" | "product";
  itemId: number;
  name: string;
  price: number;
  quantity: number;
}

interface MovementContextType {
  movements: Movement[];
  loading: boolean;
  addMovement: (movement: Omit<Movement, 'id' | 'date'>) => Promise<boolean>;
  registerSaleMovements: (saleId: string, cartItems: CartItem[]) => Promise<void>;
  refreshMovements: () => Promise<void>;
}

const MovementContext = createContext<MovementContextType | undefined>(undefined);

export const MovementProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  const fetchMovements = async () => {
    try {
      setLoading(true);
      // Join con la tabla productos para obtener el nombre
      const { data, error } = await supabase
        .from('movimientos')
        .select(`
          *,
          productos (
            nombre
          )
        `)
        .order('fecha', { ascending: false });

      if (error) throw error;

      if (data) {
        const mappedMovements: Movement[] = data.map((item: any) => ({
           id: item.id,
           type: item.tipo === 'entrada' ? 'entry' : 'exit',
           productId: item.producto_id,
           productName: item.productos?.nombre || 'Producto desconocido',
           quantity: item.cantidad,
           date: item.fecha,
           reason: item.motivo
        }));
        setMovements(mappedMovements);
      }
    } catch (error) {
      console.error('Error fetching movements:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los movimientos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('movements_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'movimientos',
        },
        () => {
          // Refresh list when a new movement is inserted
          fetchMovements();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const refreshMovements = async () => {
      await fetchMovements();
  };

  const addMovement = async (movement: Omit<Movement, 'id' | 'date'>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('movimientos')
        .insert([{
            tipo: movement.type === 'entry' ? 'entrada' : 'salida',
            producto_id: movement.productId,
            cantidad: movement.quantity,
            motivo: movement.reason,
            fecha: new Date().toISOString()
        }]);

      if (error) throw error;
      
      await fetchMovements();
      return true;
    } catch (error) {
      console.error('Error adding movement:', error);
      toast({
        title: "Error",
        description: "No se pudo registrar el movimiento.",
        variant: "destructive",
      });
      return false;
    }
  };

  const registerSaleMovements = async (saleId: string, cartItems: CartItem[]) => {
    const productItems = cartItems.filter(item => item.type === "product");
    
    if (productItems.length === 0) return;

    try {
        const movementsToInsert = productItems.map(item => ({
            tipo: 'salida',
            producto_id: item.itemId,
            cantidad: item.quantity,
            motivo: `Venta #${saleId}`,
            fecha: new Date().toISOString()
        }));

        const { error } = await supabase
            .from('movimientos')
            .insert(movementsToInsert);

        if (error) throw error;
        
        // Background refresh, don't await to not block UI if not needed
        refreshMovements();
    } catch (error) {
        console.error("Error registering sale movements", error);
        // We log error but maybe don't block the sale flow?
        // Ideally this should be server-side trigger but we do it client side as per request.
    }
  };

  return (
    <MovementContext.Provider
      value={{
        movements,
        loading,
        addMovement,
        registerSaleMovements,
        refreshMovements
      }}
    >
      {children}
    </MovementContext.Provider>
  );
};

export const useMovements = () => {
  const context = useContext(MovementContext);
  if (context === undefined) {
    throw new Error('useMovements must be used within a MovementProvider');
  }
  return context;
};
