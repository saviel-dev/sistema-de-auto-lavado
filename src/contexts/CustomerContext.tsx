import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  vehicle: string;
  vehicleType: string;
  licensePlate: string;
  status: "VIP" | "Regular" | "Normal";
  visits: number;
  image?: string;
  images?: string[]; // Nueva propiedad para galería
}

interface CustomerContextType {
  customers: Customer[];
  loading: boolean;
  addCustomer: (customer: Omit<Customer, 'id' | 'visits'>) => Promise<void>;
  updateCustomer: (id: number, updates: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: number) => Promise<void>;
  refreshCustomers: () => Promise<void>;
  uploadImage: (file: File) => Promise<string>; // Nueva función
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const CustomerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const mapSupabaseToCustomer = (data: any): Customer => ({
    id: data.id,
    name: data.nombre,
    email: data.email,
    phone: data.telefono,
    vehicle: data.vehiculo,
    vehicleType: data.tipo_vehiculo,
    licensePlate: data.placa,
    status: data.estado,
    visits: data.visitas,
    image: data.imagen_url,
    images: data.imagenes || [] // Mapear array de imágenes
  });

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;

      setCustomers(data?.map(mapSupabaseToCustomer) || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const uploadImage = async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('clientes')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('clientes')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error('Error al subir imagen: ' + error.message);
      throw error;
    }
  };

  const addCustomer = async (customerData: Omit<Customer, 'id' | 'visits'>) => {
    try {
      const dbData = {
        nombre: customerData.name,
        email: customerData.email,
        telefono: customerData.phone,
        vehiculo: customerData.vehicle,
        tipo_vehiculo: customerData.vehicleType,
        placa: customerData.licensePlate,
        estado: customerData.status,
        imagen_url: customerData.image,
        imagenes: customerData.images || [], // Guardar array
        visitas: 0
      };

      const { error } = await supabase.from('clientes').insert([dbData]);

      if (error) throw error;

      toast.success('Cliente agregado correctamente');
      await fetchCustomers();
    } catch (error: any) {
      console.error('Error adding customer:', error);
      toast.error('Error al agregar cliente: ' + error.message);
      throw error;
    }
  };

  const updateCustomer = async (id: number, updates: Partial<Customer>) => {
    try {
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.nombre = updates.name;
      if (updates.email) dbUpdates.email = updates.email;
      if (updates.phone) dbUpdates.telefono = updates.phone;
      if (updates.vehicle) dbUpdates.vehiculo = updates.vehicle;
      if (updates.vehicleType) dbUpdates.tipo_vehiculo = updates.vehicleType;
      if (updates.licensePlate) dbUpdates.placa = updates.licensePlate;
      if (updates.status) dbUpdates.estado = updates.status;
      if (updates.image) dbUpdates.imagen_url = updates.image;
      if (updates.images) dbUpdates.imagenes = updates.images; // Guardar array
      if (updates.visits !== undefined) dbUpdates.visitas = updates.visits;

      const { error } = await supabase
        .from('clientes')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;

      toast.success('Cliente actualizado correctamente');
      await fetchCustomers();
    } catch (error: any) {
      console.error('Error updating customer:', error);
      toast.error('Error al actualizar cliente: ' + error.message);
      throw error;
    }
  };

  const deleteCustomer = async (id: number) => {
    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Cliente eliminado correctamente');
      await fetchCustomers();
    } catch (error: any) {
      console.error('Error deleting customer:', error);
      toast.error('Error al eliminar cliente: ' + error.message);
      throw error;
    }
  };

  return (
    <CustomerContext.Provider
      value={{
        customers,
        loading,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        refreshCustomers: fetchCustomers,
        uploadImage
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomers = () => {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error('useCustomers must be used within a CustomerProvider');
  }
  return context;
};
