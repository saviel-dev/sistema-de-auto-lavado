
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface Consumable {
  id: number;
  name: string;
  description: string;
  stock: number;
  unit: string;
  minStock: number;
  cost: number;
}

interface ConsumablesContextType {
  consumables: Consumable[];
  loading: boolean;
  addConsumable: (consumable: Omit<Consumable, 'id'>) => Promise<void>;
  updateConsumable: (id: number, updates: Partial<Consumable>) => Promise<void>;
  deleteConsumable: (id: number) => Promise<void>;
  refreshConsumables: () => Promise<void>;
}

const ConsumablesContext = createContext<ConsumablesContextType | undefined>(undefined);

export const ConsumablesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [consumables, setConsumables] = useState<Consumable[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConsumables = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('insumos')
        .select('*')
        .order('nombre', { ascending: true });

      if (error) throw error;

      const mappedData: Consumable[] = data.map((item: any) => ({
        id: item.id,
        name: item.nombre,
        description: item.descripcion,
        stock: item.stock,
        unit: item.unidad,
        minStock: item.stock_minimo,
        cost: item.costo
      }));

      setConsumables(mappedData);
    } catch (error) {
      console.error('Error fetching consumables:', error);
      toast.error('Error al cargar insumos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsumables();
  }, []);

  const addConsumable = async (consumable: Omit<Consumable, 'id'>) => {
    try {
      const { error } = await supabase
        .from('insumos')
        .insert([{
          nombre: consumable.name,
          descripcion: consumable.description,
          stock: consumable.stock,
          unidad: consumable.unit,
          stock_minimo: consumable.minStock,
          costo: consumable.cost
        }]);

      if (error) throw error;

      toast.success('Insumo agregado exitosamente');
      await fetchConsumables();
    } catch (error) {
      console.error('Error adding consumable:', error);
      toast.error('Error al agregar insumo');
      throw error;
    }
  };

  const updateConsumable = async (id: number, updates: Partial<Consumable>) => {
    try {
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.nombre = updates.name;
      if (updates.description !== undefined) dbUpdates.descripcion = updates.description;
      if (updates.stock !== undefined) dbUpdates.stock = updates.stock;
      if (updates.unit !== undefined) dbUpdates.unidad = updates.unit;
      if (updates.minStock !== undefined) dbUpdates.stock_minimo = updates.minStock;
      if (updates.cost !== undefined) dbUpdates.costo = updates.cost;

      const { error } = await supabase
        .from('insumos')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;

      toast.success('Insumo actualizado exitosamente');
      await fetchConsumables();
    } catch (error) {
      console.error('Error updating consumable:', error);
      toast.error('Error al actualizar insumo');
      throw error;
    }
  };

  const deleteConsumable = async (id: number) => {
    try {
      const { error } = await supabase
        .from('insumos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Insumo eliminado exitosamente');
      await fetchConsumables();
    } catch (error) {
      console.error('Error deleting consumable:', error);
      toast.error('Error al eliminar insumo');
      throw error;
    }
  };

  return (
    <ConsumablesContext.Provider
      value={{
        consumables,
        loading,
        addConsumable,
        updateConsumable,
        deleteConsumable,
        refreshConsumables: fetchConsumables
      }}
    >
      {children}
    </ConsumablesContext.Provider>
  );
};

export const useConsumables = () => {
  const context = useContext(ConsumablesContext);
  if (context === undefined) {
    throw new Error('useConsumables must be used within a ConsumablesProvider');
  }
  return context;
};
