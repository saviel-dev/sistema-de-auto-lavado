import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface Movement {
  id: number;
  created_at: string;
  item_id: number;
  item_type: 'product' | 'consumable';
  item_name: string;
  type: 'entrada' | 'salida';
  quantity: number;
  reason: string;
  user_id?: string;
}

interface MovementContextType {
  movements: Movement[];
  loading: boolean;
  addMovement: (movement: Omit<Movement, 'id' | 'created_at' | 'item_name'>) => Promise<void>;
  refreshMovements: () => Promise<void>;
}

const MovementContext = createContext<MovementContextType | undefined>(undefined);

export const MovementProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('movimientos')
        .select(`
          *,
          productos ( nombre ),
          insumos ( nombre )
        `)
        .order('fecha', { ascending: false });

      if (error) {
        console.warn('Error fetching movements:', error);
        return;
      }

      const mappedMovements: Movement[] = data.map((m: any) => {
        const isProduct = !!m.producto_id;
        return {
          id: m.id,
          created_at: m.fecha,
          item_id: isProduct ? m.producto_id : m.insumo_id,
          item_type: isProduct ? 'product' : 'consumable',
          item_name: isProduct ? (m.productos?.nombre || 'Producto desconocido') : (m.insumos?.nombre || 'Insumo desconocido'),
          type: m.tipo,
          quantity: m.cantidad,
          reason: m.motivo,
        };
      });

      setMovements(mappedMovements);
    } catch (error) {
      console.error('Error fetching movements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, []);

  const addMovement = async (movement: Omit<Movement, 'id' | 'created_at' | 'item_name'>) => {
    try {
      // 1. Register movement in 'movimientos' table
      const dbMovement = {
        tipo: movement.type,
        cantidad: movement.quantity,
        motivo: movement.reason,
        fecha: new Date().toISOString(),
        producto_id: movement.item_type === 'product' ? movement.item_id : null,
        insumo_id: movement.item_type === 'consumable' ? movement.item_id : null,
      };

      const { error: moveError } = await supabase
        .from('movimientos')
        .insert([dbMovement]);

      if (moveError) throw moveError;

      // 2. Update Stock
      const tableName = movement.item_type === 'product' ? 'productos' : 'insumos';
      
      // Get current stock first to ensure accuracy (or use RPC if available, but simple read-write for now)
      const { data: currentItem, error: fetchError } = await supabase
        .from(tableName)
        .select('stock')
        .eq('id', movement.item_id)
        .single();
        
      if (fetchError) throw fetchError;
      
      const currentStock = Number(currentItem.stock);
      const newStock = movement.type === 'entrada' 
        ? currentStock + Number(movement.quantity)
        : Math.max(0, currentStock - Number(movement.quantity));

      const { error: updateError } = await supabase
        .from(tableName)
        .update({ stock: newStock })
        .eq('id', movement.item_id);

      if (updateError) throw updateError;

      toast.success('Movimiento registrado y stock actualizado');
      await fetchMovements();
    } catch (error: any) {
      console.error('Error adding movement:', error);
      toast.error('Error al registrar movimiento: ' + (error.message || 'Error desconocido'));
      throw error;
    }
  };

  return (
    <MovementContext.Provider value={{ movements, loading, addMovement, refreshMovements: fetchMovements }}>
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
