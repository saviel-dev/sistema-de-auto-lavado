import React, { useState } from 'react';
import { useMovements } from '@/contexts/MovementContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpRight, ArrowDownLeft, Search } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const Movements = () => {
  const { movements, loading } = useMovements();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMovements = movements.filter(m =>
    m.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Movimientos de Inventario</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por ítem o razón..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Movimientos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Ítem</TableHead>
                <TableHead>Tipo de Ítem</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Razón</TableHead>
                <TableHead>Tipo Mov.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">Cargando...</TableCell>
                </TableRow>
              ) : filteredMovements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">No hay movimientos registrados</TableCell>
                </TableRow>
              ) : (
                filteredMovements.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell>
                      {movement.created_at 
                        ? format(new Date(movement.created_at), 'dd/MM/yyyy HH:mm', { locale: es })
                        : '-'}
                    </TableCell>
                    <TableCell className="font-medium">{movement.item_name}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${movement.item_type === 'product' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                        {movement.item_type === 'product' ? 'Producto' : 'Insumo'}
                      </span>
                    </TableCell>
                    <TableCell>{movement.quantity}</TableCell>
                    <TableCell>{movement.reason}</TableCell>
                    <TableCell>
                         <span className={`flex items-center gap-1 ${movement.type === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                            {movement.type === 'entrada' ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                            {movement.type === 'entrada' ? 'Entrada' : 'Salida'}
                         </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Movements;
