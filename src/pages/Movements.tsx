import React, { useState } from 'react';
import { useMovements } from '@/contexts/MovementContext';
import { useProducts } from '@/contexts/ProductContext';
import { useConsumables } from '@/contexts/ConsumablesContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpRight, ArrowDownLeft, Search, PlusCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const Movements = () => {
  const { movements, loading, addMovement } = useMovements();
  const { products } = useProducts();
  const { consumables } = useConsumables();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [itemType, setItemType] = useState<'product' | 'consumable'>('product');
  const [itemId, setItemId] = useState<string>('');
  const [movementType, setMovementType] = useState<'entrada' | 'salida'>('entrada');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');

  const filteredMovements = movements.filter(m =>
    m.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemId || !quantity || !reason) return;

    setIsSubmitting(true);
    try {
      await addMovement({
        item_id: Number(itemId),
        item_type: itemType,
        type: movementType,
        quantity: Number(quantity),
        reason: reason,
      });
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      // Error handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setItemType('product');
    setItemId('');
    setMovementType('entrada');
    setQuantity('');
    setReason('');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Movimientos de Inventario</h1>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700">
          <PlusCircle className="mr-2 h-4 w-4" />
          Registrar Movimiento
        </Button>
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

      <Card className="overflow-hidden border-none shadow-md">
        <CardHeader className="bg-white pb-4">
          <CardTitle>Historial de Movimientos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-purple-600 hover:bg-purple-600">
              <TableRow className="hover:bg-purple-600 border-none">
                <TableHead className="text-white font-semibold">Fecha</TableHead>
                <TableHead className="text-white font-semibold">Ítem</TableHead>
                <TableHead className="text-center text-white font-semibold">Tipo de Ítem</TableHead>
                <TableHead className="text-center text-white font-semibold">Cantidad</TableHead>
                <TableHead className="text-white font-semibold">Razón</TableHead>
                <TableHead className="text-center text-white font-semibold">Tipo Mov.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Cargando movimientos...</TableCell>
                </TableRow>
              ) : filteredMovements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No hay movimientos registrados</TableCell>
                </TableRow>
              ) : (
                filteredMovements.map((movement, index) => (
                  <TableRow key={movement.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <TableCell className="font-medium text-slate-700">
                      {movement.created_at 
                        ? format(new Date(movement.created_at), 'dd MMM yyyy, HH:mm', { locale: es })
                        : '-'}
                    </TableCell>
                    <TableCell className="font-medium text-slate-800">{movement.item_name}</TableCell>
                    <TableCell className="text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        movement.item_type === 'product' 
                          ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                          : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                      }`}>
                        {movement.item_type === 'product' ? 'Producto' : 'Insumo'}
                      </span>
                    </TableCell>
                    <TableCell className="text-center font-bold text-slate-700">{movement.quantity}</TableCell>
                    <TableCell className="text-slate-600 max-w-[200px] truncate" title={movement.reason}>{movement.reason}</TableCell>
                    <TableCell className="text-center">
                       <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold border ${
                         movement.type === 'entrada' 
                           ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                           : 'bg-rose-50 text-rose-700 border-rose-200'
                       }`}>
                          {movement.type === 'entrada' ? <ArrowDownLeft className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
                          {movement.type === 'entrada' ? 'ENTRADA' : 'SALIDA'}
                       </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Registrar Movimiento</DialogTitle>
            <DialogDescription>
              Registra una entrada o salida de inventario para productos o insumos.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Ítem</Label>
                <div className="flex rounded-md shadow-sm">
                  <button
                    type="button"
                    onClick={() => { setItemType('product'); setItemId(''); }}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-l-md border ${
                      itemType === 'product' 
                        ? 'bg-purple-600 text-white border-purple-600' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Producto
                  </button>
                  <button
                    type="button"
                    onClick={() => { setItemType('consumable'); setItemId(''); }}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-r-md border-t border-b border-r ${
                      itemType === 'consumable' 
                        ? 'bg-purple-600 text-white border-purple-600' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Insumo
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tipo Movimiento</Label>
                <Select value={movementType} onValueChange={(v: 'entrada'|'salida') => setMovementType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrada">Entrada (Stock)</SelectItem>
                    <SelectItem value="salida">Salida (Stock)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Seleccionar {itemType === 'product' ? 'Producto' : 'Insumo'}</Label>
              <Select value={itemId} onValueChange={setItemId}>
                <SelectTrigger>
                  <SelectValue placeholder={`Seleccione un ${itemType === 'product' ? 'producto' : 'insumo'}`} />
                </SelectTrigger>
                <SelectContent>
                  {itemType === 'product' ? (
                    products.map(p => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.name} (Stock: {p.stock})
                      </SelectItem>
                    ))
                  ) : (
                    consumables.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.name} (Stock: {c.stock} {c.unit})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Cantidad</Label>
                <Input 
                  id="quantity" 
                  type="number" 
                  min="1" 
                  value={quantity} 
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Razón / Motivo</Label>
                <Input 
                  id="reason" 
                  value={reason} 
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ej. Compra, Ajuste, Baja"
                  required 
                />
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Registrar Movimiento'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default Movements;
