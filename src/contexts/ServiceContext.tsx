
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  popular: boolean;
}

interface ServiceContextType {
  services: Service[];
  loading: boolean;
  addService: (service: Omit<Service, 'id'>) => Promise<void>;
  updateService: (id: number, service: Partial<Service>) => Promise<void>;
  deleteService: (id: number) => Promise<void>;
  refreshServices: () => Promise<void>;
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

export const useServices = () => {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error('useServices must be used within a ServiceProvider');
  }
  return context;
};

export const ServiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('servicios')
        .select('*')
        .order('nombre', { ascending: true });

      if (error) {
        throw error;
      }

      // Map Spanish DB columns to English app interface
      const mappedServices: Service[] = data.map((item: any) => ({
        id: item.id,
        name: item.nombre,
        description: item.descripcion,
        price: item.precio,
        popular: item.es_popular
      }));

      setServices(mappedServices);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Error al cargar servicios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const addService = async (service: Omit<Service, 'id'>) => {
    try {
      const { error } = await supabase
        .from('servicios')
        .insert([{
          nombre: service.name,
          descripcion: service.description,
          precio: service.price,
          es_popular: service.popular
        }]);

      if (error) throw error;
      
      toast.success('Servicio creado exitosamente');
      await fetchServices();
    } catch (error) {
      console.error('Error adding service:', error);
      toast.error('Error al crear servicio');
      throw error;
    }
  };

  const updateService = async (id: number, service: Partial<Service>) => {
    try {
      const updates: any = {};
      if (service.name !== undefined) updates.nombre = service.name;
      if (service.description !== undefined) updates.descripcion = service.description;
      if (service.price !== undefined) updates.precio = service.price;
      if (service.popular !== undefined) updates.es_popular = service.popular;

      const { error } = await supabase
        .from('servicios')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast.success('Servicio actualizado correctamente');
      await fetchServices();
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error('Error al actualizar servicio');
      throw error;
    }
  };

  const deleteService = async (id: number) => {
    try {
      const { error } = await supabase
        .from('servicios')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Servicio eliminado correctamente');
      await fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Error al eliminar servicio');
      throw error;
    }
  };

  return (
    <ServiceContext.Provider value={{
      services,
      loading,
      addService,
      updateService,
      deleteService,
      refreshServices: fetchServices
    }}>
      {children}
    </ServiceContext.Provider>
  );
};
