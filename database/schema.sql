-- ============================================================
-- SISTEMA DE GESTIÓN ESCOLAR
-- Script de creación de base de datos
-- PostgreSQL 14+
-- ============================================================

-- Eliminar tablas si existen (orden inverso por dependencias)
DROP TABLE IF EXISTS calificaciones CASCADE;
DROP TABLE IF EXISTS inscripciones CASCADE;
DROP TABLE IF EXISTS materias CASCADE;
DROP TABLE IF EXISTS profesores CASCADE;
DROP TABLE IF EXISTS estudiantes CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- ============================================================
-- 1. TABLA: usuarios
-- Datos de login y rol de cada persona
-- ============================================================
CREATE TABLE usuarios (
  id             SERIAL PRIMARY KEY,
  nombre         VARCHAR(100) NOT NULL,
  email          VARCHAR(120) UNIQUE NOT NULL,
  password_hash  VARCHAR(255) NOT NULL,
  rol            VARCHAR(20) NOT NULL
                 CHECK (rol IN ('admin', 'profesor', 'estudiante')),
  activo         BOOLEAN DEFAULT TRUE,
  creado_en      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol   ON usuarios(rol);

-- ============================================================
-- 2. TABLA: estudiantes
-- Relación 1:1 con usuarios
-- ============================================================
CREATE TABLE estudiantes (
  id                SERIAL PRIMARY KEY,
  usuario_id        INTEGER UNIQUE NOT NULL
                    REFERENCES usuarios(id) ON DELETE CASCADE,
  documento         VARCHAR(20) UNIQUE NOT NULL,
  fecha_nacimiento  DATE NOT NULL,
  telefono          VARCHAR(20),
  direccion         VARCHAR(255),
  estado            VARCHAR(10) NOT NULL DEFAULT 'activo'
                    CHECK (estado IN ('activo', 'inactivo')),
  creado_en         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_estudiantes_estado    ON estudiantes(estado);
CREATE INDEX idx_estudiantes_documento ON estudiantes(documento);

-- ============================================================
-- 3. TABLA: profesores
-- Relación 1:1 con usuarios
-- ============================================================
CREATE TABLE profesores (
  id             SERIAL PRIMARY KEY,
  usuario_id     INTEGER UNIQUE NOT NULL
                 REFERENCES usuarios(id) ON DELETE CASCADE,
  documento      VARCHAR(20) UNIQUE NOT NULL,
  especialidad   VARCHAR(100) NOT NULL,
  telefono       VARCHAR(20),
  estado         VARCHAR(10) NOT NULL DEFAULT 'activo'
                 CHECK (estado IN ('activo', 'inactivo')),
  creado_en      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_profesores_estado ON profesores(estado);

-- ============================================================
-- 4. TABLA: materias
-- Cada materia tiene un profesor asignado
-- Relación: profesores 1:N materias
-- ============================================================
CREATE TABLE materias (
  id             SERIAL PRIMARY KEY,
  codigo         VARCHAR(20) UNIQUE NOT NULL,
  nombre         VARCHAR(100) NOT NULL,
  descripcion    TEXT,
  creditos       INTEGER NOT NULL DEFAULT 3
                 CHECK (creditos > 0),
  cupo           INTEGER NOT NULL DEFAULT 30
                 CHECK (cupo > 0),
  profesor_id    INTEGER
                 REFERENCES profesores(id) ON DELETE SET NULL,
  estado         VARCHAR(10) NOT NULL DEFAULT 'activo'
                 CHECK (estado IN ('activo', 'inactivo')),
  creado_en      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_materias_profesor ON materias(profesor_id);
CREATE INDEX idx_materias_estado   ON materias(estado);

-- ============================================================
-- 5. TABLA: inscripciones
-- Tabla puente N:M entre estudiantes y materias
-- ============================================================
CREATE TABLE inscripciones (
  id             SERIAL PRIMARY KEY,
  estudiante_id  INTEGER NOT NULL
                 REFERENCES estudiantes(id) ON DELETE CASCADE,
  materia_id     INTEGER NOT NULL
                 REFERENCES materias(id) ON DELETE CASCADE,
  periodo        VARCHAR(20) NOT NULL,  -- ej. '2025-1'
  fecha          DATE NOT NULL DEFAULT CURRENT_DATE,
  estado         VARCHAR(15) NOT NULL DEFAULT 'inscrita'
                 CHECK (estado IN ('inscrita', 'cancelada', 'completada')),
  creado_en      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Evitar duplicados: un estudiante no puede inscribirse 2 veces
  -- a la misma materia en el mismo período
  CONSTRAINT uq_inscripcion_unica UNIQUE (estudiante_id, materia_id, periodo)
);

CREATE INDEX idx_inscripciones_estudiante ON inscripciones(estudiante_id);
CREATE INDEX idx_inscripciones_materia    ON inscripciones(materia_id);
CREATE INDEX idx_inscripciones_periodo    ON inscripciones(periodo);

-- ============================================================
-- 6. TABLA: calificaciones
-- Notas asociadas a cada inscripción
-- Relación: inscripciones 1:N calificaciones
-- ============================================================
CREATE TABLE calificaciones (
  id              SERIAL PRIMARY KEY,
  inscripcion_id  INTEGER NOT NULL
                  REFERENCES inscripciones(id) ON DELETE CASCADE,
  tipo            VARCHAR(20) NOT NULL
                  CHECK (tipo IN ('parcial1', 'parcial2', 'trabajos', 'final')),
  nota            NUMERIC(3,2) NOT NULL
                  CHECK (nota >= 0 AND nota <= 5),
  observacion     TEXT,
  creado_en       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Una inscripción solo puede tener una nota por tipo
  CONSTRAINT uq_calificacion_tipo UNIQUE (inscripcion_id, tipo)
);

CREATE INDEX idx_calificaciones_inscripcion ON calificaciones(inscripcion_id);

-- ============================================================
-- TRIGGER: actualizar "actualizado_en" automáticamente
-- ============================================================
CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_usuarios_ts
  BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trg_estudiantes_ts
  BEFORE UPDATE ON estudiantes
  FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trg_profesores_ts
  BEFORE UPDATE ON profesores
  FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trg_materias_ts
  BEFORE UPDATE ON materias
  FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trg_calificaciones_ts
  BEFORE UPDATE ON calificaciones
  FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

-- ============================================================
-- VISTA: promedio por inscripción
-- (facilita las consultas del dashboard)
-- ============================================================
CREATE OR REPLACE VIEW vista_promedios AS
SELECT
  i.id              AS inscripcion_id,
  i.estudiante_id,
  i.materia_id,
  i.periodo,
  e.usuario_id      AS estudiante_usuario_id,
  u.nombre          AS estudiante_nombre,
  m.nombre          AS materia_nombre,
  m.codigo          AS materia_codigo,
  -- Promedio ponderado: parcial1 20%, parcial2 20%, trabajos 20%, final 40%
  ROUND(
    COALESCE(SUM(CASE WHEN c.tipo = 'parcial1' THEN c.nota END) * 0.20, 0) +
    COALESCE(SUM(CASE WHEN c.tipo = 'parcial2' THEN c.nota END) * 0.20, 0) +
    COALESCE(SUM(CASE WHEN c.tipo = 'trabajos' THEN c.nota END) * 0.20, 0) +
    COALESCE(SUM(CASE WHEN c.tipo = 'final'    THEN c.nota END) * 0.40, 0),
    2
  ) AS promedio
FROM inscripciones i
JOIN estudiantes e ON e.id = i.estudiante_id
JOIN usuarios    u ON u.id = e.usuario_id
JOIN materias    m ON m.id = i.materia_id
LEFT JOIN calificaciones c ON c.inscripcion_id = i.id
WHERE i.estado = 'inscrita'
GROUP BY i.id, i.estudiante_id, i.materia_id, i.periodo,
         e.usuario_id, u.nombre, m.nombre, m.codigo;

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================