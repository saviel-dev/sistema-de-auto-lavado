-- ============================================
-- AUTOLAVADO GOCHI - ESQUEMA DE BASE DE DATOS SUPABASE
-- Con Gestión de Usuarios y Roles
-- ============================================

-- ============================================
-- TABLA DE USUARIOS Y ROLES
-- ============================================

-- Tabla: usuarios
-- Gestiona usuarios del sistema con roles de acceso
CREATE TABLE IF NOT EXISTS usuarios (
  id BIGSERIAL PRIMARY KEY,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  nombre_completo TEXT NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('admin', 'trabajador')) DEFAULT 'trabajador',
  esta_activo BOOLEAN DEFAULT true,
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ DEFAULT NOW(),
  ultimo_acceso TIMESTAMPTZ
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_usuarios_auth_user_id ON usuarios(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);

-- Comentarios de documentación
COMMENT ON TABLE usuarios IS 'Usuarios del sistema con roles de acceso (admin o trabajador)';
COMMENT ON COLUMN usuarios.rol IS 'Rol del usuario: admin (acceso completo) o trabajador (acceso limitado)';
COMMENT ON COLUMN usuarios.esta_activo IS 'Indica si el usuario está activo en el sistema';

-- ============================================
-- TABLAS DE DATOS
-- ============================================

-- Tabla: productos
-- Almacena información del inventario de productos
CREATE TABLE IF NOT EXISTS productos (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10, 2) NOT NULL,
  imagen TEXT,
  categoria TEXT NOT NULL,
  existencias INTEGER NOT NULL DEFAULT 0,
  codigo_barras TEXT UNIQUE,
  creado_por BIGINT REFERENCES usuarios(id),
  actualizado_por BIGINT REFERENCES usuarios(id),
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_productos_codigo_barras ON productos(codigo_barras);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);
CREATE INDEX IF NOT EXISTS idx_productos_existencias ON productos(existencias);
CREATE INDEX IF NOT EXISTS idx_productos_creado_por ON productos(creado_por);

-- Tabla: movimientos
-- Registra entradas y salidas de inventario
CREATE TABLE IF NOT EXISTS movimientos (
  id BIGSERIAL PRIMARY KEY,
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'salida')),
  producto_id BIGINT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  nombre_producto TEXT NOT NULL,
  cantidad INTEGER NOT NULL CHECK (cantidad > 0),
  motivo TEXT NOT NULL,
  creado_por BIGINT REFERENCES usuarios(id),
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_movimientos_producto_id ON movimientos(producto_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_tipo ON movimientos(tipo);
CREATE INDEX IF NOT EXISTS idx_movimientos_creado_en ON movimientos(creado_en DESC);
CREATE INDEX IF NOT EXISTS idx_movimientos_creado_por ON movimientos(creado_por);

-- Tabla: clientes
-- Información de clientes del autolavado
CREATE TABLE IF NOT EXISTS clientes (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  correo TEXT,
  telefono TEXT NOT NULL,
  vehiculo TEXT,
  tipo_vehiculo TEXT,
  placa TEXT,
  estatus TEXT CHECK (estatus IN ('VIP', 'Regular', 'Normal')) DEFAULT 'Normal',
  visitas INTEGER DEFAULT 0,
  imagenes JSONB DEFAULT '[]'::jsonb,
  creado_por BIGINT REFERENCES usuarios(id),
  actualizado_por BIGINT REFERENCES usuarios(id),
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_clientes_telefono ON clientes(telefono);
CREATE INDEX IF NOT EXISTS idx_clientes_placa ON clientes(placa);
CREATE INDEX IF NOT EXISTS idx_clientes_creado_por ON clientes(creado_por);

-- Tabla: ventas
-- Registro de ventas realizadas
CREATE TABLE IF NOT EXISTS ventas (
  id BIGSERIAL PRIMARY KEY,
  venta_id TEXT UNIQUE NOT NULL,
  cliente_id BIGINT REFERENCES clientes(id),
  nombre_cliente TEXT,
  total DECIMAL(10, 2) NOT NULL,
  metodo_pago TEXT NOT NULL,
  articulos JSONB NOT NULL,
  creado_por BIGINT REFERENCES usuarios(id),
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_ventas_cliente_id ON ventas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_ventas_creado_en ON ventas(creado_en DESC);
CREATE INDEX IF NOT EXISTS idx_ventas_venta_id ON ventas(venta_id);
CREATE INDEX IF NOT EXISTS idx_ventas_creado_por ON ventas(creado_por);

-- Tabla: servicios
-- Servicios ofrecidos por el autolavado
CREATE TABLE IF NOT EXISTS servicios (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio_usd DECIMAL(10, 2) NOT NULL,
  duracion_minutos INTEGER,
  esta_activo BOOLEAN DEFAULT true,
  creado_por BIGINT REFERENCES usuarios(id),
  actualizado_por BIGINT REFERENCES usuarios(id),
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_servicios_esta_activo ON servicios(esta_activo);
CREATE INDEX IF NOT EXISTS idx_servicios_creado_por ON servicios(creado_por);

-- Tabla: pedidos
-- Gestión de pedidos y citas programadas
CREATE TABLE IF NOT EXISTS pedidos (
  id BIGSERIAL PRIMARY KEY,
  tipo_pedido TEXT CHECK (tipo_pedido IN ('por-llegada', 'cita')) DEFAULT 'por-llegada',
  cliente_id BIGINT REFERENCES clientes(id),
  nombre_cliente TEXT NOT NULL,
  vehiculo_cliente TEXT,
  servicios JSONB NOT NULL,
  estatus TEXT CHECK (estatus IN ('Pendiente', 'Confirmada', 'En Proceso', 'Completada', 'Cancelada')) DEFAULT 'Pendiente',
  fecha_programada DATE,
  hora_programada TIME,
  monto_total DECIMAL(10, 2),
  notas TEXT,
  creado_por BIGINT REFERENCES usuarios(id),
  actualizado_por BIGINT REFERENCES usuarios(id),
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pedidos_cliente_id ON pedidos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_estatus ON pedidos(estatus);
CREATE INDEX IF NOT EXISTS idx_pedidos_fecha_programada ON pedidos(fecha_programada);
CREATE INDEX IF NOT EXISTS idx_pedidos_creado_por ON pedidos(creado_por);

-- Tabla: configuracion_sistema
-- Configuración del sistema (solo accesible por administradores)
CREATE TABLE IF NOT EXISTS configuracion_sistema (
  id BIGSERIAL PRIMARY KEY,
  clave_configuracion TEXT UNIQUE NOT NULL,
  valor_configuracion TEXT NOT NULL,
  descripcion TEXT,
  es_publico BOOLEAN DEFAULT false,
  actualizado_por BIGINT REFERENCES usuarios(id),
  actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_configuracion_sistema_clave ON configuracion_sistema(clave_configuracion);

COMMENT ON TABLE configuracion_sistema IS 'Configuración del sistema - Solo accesible por administradores';
COMMENT ON COLUMN configuracion_sistema.es_publico IS 'Si es true, los trabajadores pueden leer (pero no modificar) esta configuración';

-- Tabla: registro_auditoria
-- Registro de auditoría de acciones importantes del sistema
CREATE TABLE IF NOT EXISTS registro_auditoria (
  id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT REFERENCES usuarios(id),
  accion TEXT NOT NULL,
  nombre_tabla TEXT NOT NULL,
  registro_id BIGINT,
  valores_anteriores JSONB,
  valores_nuevos JSONB,
  direccion_ip TEXT,
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_registro_auditoria_usuario_id ON registro_auditoria(usuario_id);
CREATE INDEX IF NOT EXISTS idx_registro_auditoria_nombre_tabla ON registro_auditoria(nombre_tabla);
CREATE INDEX IF NOT EXISTS idx_registro_auditoria_creado_en ON registro_auditoria(creado_en DESC);

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función para actualizar la columna actualizado_en automáticamente
CREATE OR REPLACE FUNCTION actualizar_columna_actualizado_en()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar automáticamente la columna actualizado_en
DROP TRIGGER IF EXISTS actualizar_usuarios_actualizado_en ON usuarios;
CREATE TRIGGER actualizar_usuarios_actualizado_en
  BEFORE UPDATE ON usuarios
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_columna_actualizado_en();

DROP TRIGGER IF EXISTS actualizar_productos_actualizado_en ON productos;
CREATE TRIGGER actualizar_productos_actualizado_en
  BEFORE UPDATE ON productos
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_columna_actualizado_en();

DROP TRIGGER IF EXISTS actualizar_clientes_actualizado_en ON clientes;
CREATE TRIGGER actualizar_clientes_actualizado_en
  BEFORE UPDATE ON clientes
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_columna_actualizado_en();

DROP TRIGGER IF EXISTS actualizar_servicios_actualizado_en ON servicios;
CREATE TRIGGER actualizar_servicios_actualizado_en
  BEFORE UPDATE ON servicios
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_columna_actualizado_en();

DROP TRIGGER IF EXISTS actualizar_pedidos_actualizado_en ON pedidos;
CREATE TRIGGER actualizar_pedidos_actualizado_en
  BEFORE UPDATE ON pedidos
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_columna_actualizado_en();

-- Función para obtener el rol del usuario actual
CREATE OR REPLACE FUNCTION obtener_rol_usuario()
RETURNS TEXT AS $$
  SELECT rol FROM usuarios WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Función para verificar si el usuario es administrador
CREATE OR REPLACE FUNCTION es_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM usuarios 
    WHERE auth_user_id = auth.uid() 
    AND rol = 'admin' 
    AND esta_activo = true
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Función para verificar si el usuario es trabajador
CREATE OR REPLACE FUNCTION es_trabajador()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM usuarios 
    WHERE auth_user_id = auth.uid() 
    AND rol = 'trabajador' 
    AND esta_activo = true
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Función para actualizar existencias de productos
CREATE OR REPLACE FUNCTION actualizar_existencias_producto(
  p_producto_id BIGINT,
  p_cantidad INTEGER,
  p_operacion TEXT
)
RETURNS void AS $$
BEGIN
  IF p_operacion = 'agregar' THEN
    UPDATE productos 
    SET existencias = existencias + p_cantidad 
    WHERE id = p_producto_id;
  ELSIF p_operacion = 'restar' THEN
    UPDATE productos 
    SET existencias = GREATEST(0, existencias - p_cantidad)
    WHERE id = p_producto_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para registrar una venta completa (con movimientos y actualización de existencias)
CREATE OR REPLACE FUNCTION registrar_venta(
  p_venta_id TEXT,
  p_cliente_id BIGINT,
  p_nombre_cliente TEXT,
  p_total DECIMAL,
  p_metodo_pago TEXT,
  p_articulos JSONB,
  p_usuario_id BIGINT
)
RETURNS BIGINT AS $$
DECLARE
  v_venta_id BIGINT;
  v_articulo JSONB;
BEGIN
  -- Insertar venta
  INSERT INTO ventas (venta_id, cliente_id, nombre_cliente, total, metodo_pago, articulos, creado_por)
  VALUES (p_venta_id, p_cliente_id, p_nombre_cliente, p_total, p_metodo_pago, p_articulos, p_usuario_id)
  RETURNING id INTO v_venta_id;
  
  -- Registrar movimientos y actualizar existencias para cada producto
  FOR v_articulo IN SELECT * FROM jsonb_array_elements(p_articulos)
  LOOP
    IF (v_articulo->>'tipo')::text = 'producto' THEN
      -- Registrar movimiento de salida
      INSERT INTO movimientos (tipo, producto_id, nombre_producto, cantidad, motivo, creado_por)
      VALUES (
        'salida',
        (v_articulo->>'itemId')::bigint,
        (v_articulo->>'nombre')::text,
        (v_articulo->>'cantidad')::integer,
        'Venta ' || p_venta_id,
        p_usuario_id
      );
      
      -- Actualizar existencias
      PERFORM actualizar_existencias_producto(
        (v_articulo->>'itemId')::bigint,
        (v_articulo->>'cantidad')::integer,
        'restar'
      );
    END IF;
  END LOOP;
  
  RETURN v_venta_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SEGURIDAD A NIVEL DE FILA (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion_sistema ENABLE ROW LEVEL SECURITY;
ALTER TABLE registro_auditoria ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS DE SEGURIDAD - USUARIOS
-- ============================================

DROP POLICY IF EXISTS "Los usuarios pueden ver su propio perfil" ON usuarios;
CREATE POLICY "Los usuarios pueden ver su propio perfil" ON usuarios
  FOR SELECT USING (auth_user_id = auth.uid());

DROP POLICY IF EXISTS "Los administradores pueden ver todos los usuarios" ON usuarios;
CREATE POLICY "Los administradores pueden ver todos los usuarios" ON usuarios
  FOR SELECT USING (es_admin());

DROP POLICY IF EXISTS "Los administradores pueden crear usuarios" ON usuarios;
CREATE POLICY "Los administradores pueden crear usuarios" ON usuarios
  FOR INSERT WITH CHECK (es_admin());

DROP POLICY IF EXISTS "Los administradores pueden actualizar usuarios" ON usuarios;
CREATE POLICY "Los administradores pueden actualizar usuarios" ON usuarios
  FOR UPDATE USING (es_admin());

DROP POLICY IF EXISTS "Los administradores pueden eliminar usuarios" ON usuarios;
CREATE POLICY "Los administradores pueden eliminar usuarios" ON usuarios
  FOR DELETE USING (es_admin());

-- ============================================
-- POLÍTICAS DE SEGURIDAD - PRODUCTOS
-- ============================================

DROP POLICY IF EXISTS "Todos pueden ver productos" ON productos;
CREATE POLICY "Todos pueden ver productos" ON productos
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Trabajadores y admins pueden crear productos" ON productos;
CREATE POLICY "Trabajadores y admins pueden crear productos" ON productos
  FOR INSERT WITH CHECK (es_admin() OR es_trabajador());

DROP POLICY IF EXISTS "Solo administradores pueden actualizar productos" ON productos;
CREATE POLICY "Solo administradores pueden actualizar productos" ON productos
  FOR UPDATE USING (es_admin());

DROP POLICY IF EXISTS "Solo administradores pueden eliminar productos" ON productos;
CREATE POLICY "Solo administradores pueden eliminar productos" ON productos
  FOR DELETE USING (es_admin());

-- ============================================
-- POLÍTICAS DE SEGURIDAD - MOVIMIENTOS
-- ============================================

DROP POLICY IF EXISTS "Todos pueden ver movimientos" ON movimientos;
CREATE POLICY "Todos pueden ver movimientos" ON movimientos
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Trabajadores y admins pueden crear movimientos" ON movimientos;
CREATE POLICY "Trabajadores y admins pueden crear movimientos" ON movimientos
  FOR INSERT WITH CHECK (es_admin() OR es_trabajador());

DROP POLICY IF EXISTS "Solo administradores pueden actualizar movimientos" ON movimientos;
CREATE POLICY "Solo administradores pueden actualizar movimientos" ON movimientos
  FOR UPDATE USING (es_admin());

DROP POLICY IF EXISTS "Solo administradores pueden eliminar movimientos" ON movimientos;
CREATE POLICY "Solo administradores pueden eliminar movimientos" ON movimientos
  FOR DELETE USING (es_admin());

-- ============================================
-- POLÍTICAS DE SEGURIDAD - VENTAS
-- ============================================

DROP POLICY IF EXISTS "Todos pueden ver ventas" ON ventas;
CREATE POLICY "Todos pueden ver ventas" ON ventas
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Trabajadores y admins pueden crear ventas" ON ventas;
CREATE POLICY "Trabajadores y admins pueden crear ventas" ON ventas
  FOR INSERT WITH CHECK (es_admin() OR es_trabajador());

DROP POLICY IF EXISTS "Solo administradores pueden actualizar ventas" ON ventas;
CREATE POLICY "Solo administradores pueden actualizar ventas" ON ventas
  FOR UPDATE USING (es_admin());

DROP POLICY IF EXISTS "Solo administradores pueden eliminar ventas" ON ventas;
CREATE POLICY "Solo administradores pueden eliminar ventas" ON ventas
  FOR DELETE USING (es_admin());

-- ============================================
-- POLÍTICAS DE SEGURIDAD - SERVICIOS
-- ============================================

DROP POLICY IF EXISTS "Todos pueden ver servicios" ON servicios;
CREATE POLICY "Todos pueden ver servicios" ON servicios
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Trabajadores y admins pueden crear servicios" ON servicios;
CREATE POLICY "Trabajadores y admins pueden crear servicios" ON servicios
  FOR INSERT WITH CHECK (es_admin() OR es_trabajador());

DROP POLICY IF EXISTS "Solo administradores pueden actualizar servicios" ON servicios;
CREATE POLICY "Solo administradores pueden actualizar servicios" ON servicios
  FOR UPDATE USING (es_admin());

DROP POLICY IF EXISTS "Solo administradores pueden eliminar servicios" ON servicios;
CREATE POLICY "Solo administradores pueden eliminar servicios" ON servicios
  FOR DELETE USING (es_admin());

-- ============================================
-- POLÍTICAS DE SEGURIDAD - PEDIDOS
-- ============================================

DROP POLICY IF EXISTS "Todos pueden ver pedidos" ON pedidos;
CREATE POLICY "Todos pueden ver pedidos" ON pedidos
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Trabajadores y admins pueden crear pedidos" ON pedidos;
CREATE POLICY "Trabajadores y admins pueden crear pedidos" ON pedidos
  FOR INSERT WITH CHECK (es_admin() OR es_trabajador());

DROP POLICY IF EXISTS "Trabajadores y admins pueden actualizar pedidos" ON pedidos;
CREATE POLICY "Trabajadores y admins pueden actualizar pedidos" ON pedidos
  FOR UPDATE USING (es_admin() OR es_trabajador());

DROP POLICY IF EXISTS "Solo administradores pueden eliminar pedidos" ON pedidos;
CREATE POLICY "Solo administradores pueden eliminar pedidos" ON pedidos
  FOR DELETE USING (es_admin());

-- ============================================
-- POLÍTICAS DE SEGURIDAD - CLIENTES
-- ============================================

DROP POLICY IF EXISTS "Todos pueden ver clientes" ON clientes;
CREATE POLICY "Todos pueden ver clientes" ON clientes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Trabajadores y admins pueden crear clientes" ON clientes;
CREATE POLICY "Trabajadores y admins pueden crear clientes" ON clientes
  FOR INSERT WITH CHECK (es_admin() OR es_trabajador());

DROP POLICY IF EXISTS "Trabajadores y admins pueden actualizar clientes" ON clientes;
CREATE POLICY "Trabajadores y admins pueden actualizar clientes" ON clientes
  FOR UPDATE USING (es_admin() OR es_trabajador());

DROP POLICY IF EXISTS "Solo administradores pueden eliminar clientes" ON clientes;
CREATE POLICY "Solo administradores pueden eliminar clientes" ON clientes
  FOR DELETE USING (es_admin());

-- ============================================
-- POLÍTICAS DE SEGURIDAD - CONFIGURACIÓN SISTEMA
-- ============================================

DROP POLICY IF EXISTS "Trabajadores pueden leer configuraciones públicas" ON configuracion_sistema;
CREATE POLICY "Trabajadores pueden leer configuraciones públicas" ON configuracion_sistema
  FOR SELECT USING (es_publico = true OR es_admin());

DROP POLICY IF EXISTS "Solo administradores pueden modificar configuraciones" ON configuracion_sistema;
CREATE POLICY "Solo administradores pueden modificar configuraciones" ON configuracion_sistema
  FOR ALL USING (es_admin());

-- ============================================
-- POLÍTICAS DE SEGURIDAD - REGISTRO AUDITORÍA
-- ============================================

DROP POLICY IF EXISTS "Solo administradores pueden ver registro de auditoría" ON registro_auditoria;
CREATE POLICY "Solo administradores pueden ver registro de auditoría" ON registro_auditoria
  FOR SELECT USING (es_admin());

DROP POLICY IF EXISTS "El sistema puede insertar en registro de auditoría" ON registro_auditoria;
CREATE POLICY "El sistema puede insertar en registro de auditoría" ON registro_auditoria
  FOR INSERT WITH CHECK (true);

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Insertar productos de ejemplo
INSERT INTO productos (nombre, descripcion, precio, categoria, existencias, codigo_barras, imagen)
SELECT * FROM (VALUES
  ('Cera Premium', 'Cera de alta calidad para protección y brillo duradero', 15.00, 'Cuidado', 25, '7501234567890', 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=400&h=300&fit=crop'),
  ('Shampoo Automotriz', 'Shampoo concentrado pH neutro para lavado profesional', 8.00, 'Limpieza', 40, '7501234567906', 'https://images.unsplash.com/photo-1563298723-dcfebaa392e3?w=400&h=300&fit=crop'),
  ('Microfibra Premium', 'Paños de microfibra ultra absorbentes', 5.00, 'Accesorios', 60, '7501234567913', 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=400&h=300&fit=crop'),
  ('Aromatizante', 'Aromatizante de larga duración', 3.00, 'Accesorios', 50, '7501234567920', 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=400&h=300&fit=crop')
) AS v(nombre, descripcion, precio, categoria, existencias, codigo_barras, imagen)
WHERE NOT EXISTS (SELECT 1 FROM productos LIMIT 1);

-- Insertar servicios de ejemplo
INSERT INTO servicios (nombre, descripcion, precio_usd, duracion_minutos, esta_activo)
SELECT * FROM (VALUES
  ('Lavado Express', 'Lavado exterior rápido', 5.00, 15, true),
  ('Lavado Completo', 'Lavado exterior e interior', 10.00, 30, true),
  ('Encerado Premium', 'Encerado profesional con cera de carnauba', 20.00, 45, true),
  ('Pulido', 'Pulido profesional de pintura', 25.00, 60, true)
) AS v(nombre, descripcion, precio_usd, duracion_minutos, esta_activo)
WHERE NOT EXISTS (SELECT 1 FROM servicios LIMIT 1);

-- Insertar configuraciones del sistema
INSERT INTO configuracion_sistema (clave_configuracion, valor_configuracion, descripcion, es_publico)
SELECT * FROM (VALUES
  ('nombre_negocio', 'Autolavado Gochi', 'Nombre del negocio', true),
  ('moneda', 'USD', 'Moneda principal', true),
  ('tasa_impuesto', '0.16', 'Tasa de impuesto (IVA)', false),
  ('umbral_existencias_bajas', '10', 'Umbral de existencias bajas', false)
) AS v(clave_configuracion, valor_configuracion, descripcion, es_publico)
WHERE NOT EXISTS (SELECT 1 FROM configuracion_sistema LIMIT 1);

-- Insertar usuario administrador inicial
-- NOTA: El auth_user_id debe ser reemplazado con el UUID real después de que el usuario se registre en Supabase Auth
INSERT INTO usuarios (auth_user_id, email, nombre_completo, rol, esta_activo, creado_en)
SELECT * FROM (VALUES
  (
    '00000000-0000-0000-0000-000000000000'::uuid,  -- Reemplazar con UUID real de Supabase Auth
    'julianherrera.dev@gmail.com',
    'Julian Herrera',
    'admin',
    true,
    NOW()
  )
) AS v(auth_user_id, email, nombre_completo, rol, esta_activo, creado_en)
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'julianherrera.dev@gmail.com');

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================

/*
PERMISOS POR ROL:

ADMINISTRADOR (admin):
- Acceso completo a todas las tablas
- Puede crear, leer, actualizar y eliminar usuarios
- Puede modificar configuración del sistema
- Puede ver registro de auditoría
- Puede eliminar cualquier registro

TRABAJADOR (trabajador):
- Puede agregar productos y servicios
- Puede registrar entradas en movimientos
- Puede registrar y procesar ventas
- Puede registrar y gestionar pedidos
- Puede ver productos, movimientos, ventas
- NO puede acceder a configuracion_sistema (excepto públicos en lectura)
- NO puede eliminar registros
- NO puede ver registro_auditoria
- NO puede gestionar usuarios

PARA CREAR EL PRIMER USUARIO ADMINISTRADOR:
Después de que un usuario se registre con Supabase Auth, ejecutar:

INSERT INTO usuarios (auth_user_id, email, nombre_completo, rol)
VALUES (
  'uuid-del-usuario-de-auth',
  'admin@autolavadogochi.com',
  'Administrador',
  'admin'
);
*/
