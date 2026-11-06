-- ============================================================
-- DATOS DE PRUEBA
-- Contraseña para TODOS los usuarios: 123456
-- ============================================================

-- Limpiar datos previos (por si ejecutas varias veces)
TRUNCATE calificaciones, inscripciones, materias, profesores, estudiantes, usuarios
RESTART IDENTITY CASCADE;

-- ============================================================
-- USUARIOS
-- ============================================================
INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES
-- 1 ADMIN
('Administrador General', 'admin@escuela.com',
 '$2b$10$rQZ8kY0qX7VxK5wJmN3uEeY6tLpR9sT2vB4nC8dF1gH3iJ5kL7mN',
 'admin'),

-- 3 PROFESORES
('Ana Martínez', 'ana@escuela.com',
 '$2b$10$rQZ8kY0qX7VxK5wJmN3uEeY6tLpR9sT2vB4nC8dF1gH3iJ5kL7mN',
 'profesor'),
('Roberto Sánchez', 'roberto@escuela.com',
 '$2b$10$rQZ8kY0qX7VxK5wJmN3uEeY6tLpR9sT2vB4nC8dF1gH3iJ5kL7mN',
 'profesor'),
('Lucía Torres', 'lucia@escuela.com',
 '$2b$10$rQZ8kY0qX7VxK5wJmN3uEeY6tLpR9sT2vB4nC8dF1gH3iJ5kL7mN',
 'profesor'),

-- 8 ESTUDIANTES (uno de ellos es el de prueba)
('Laura Pérez', 'estudiante@escuela.com',
 '$2b$10$rQZ8kY0qX7VxK5wJmN3uEeY6tLpR9sT2vB4nC8dF1gH3iJ5kL7mN',
 'estudiante'),
('Diego Ruiz', 'diego@escuela.com',
 '$2b$10$rQZ8kY0qX7VxK5wJmN3uEeY6tLpR9sT2vB4nC8dF1gH3iJ5kL7mN',
 'estudiante'),
('María López', 'maria@escuela.com',
 '$2b$10$rQZ8kY0qX7VxK5wJmN3uEeY6tLpR9sT2vB4nC8dF1gH3iJ5kL7mN',
 'estudiante'),
('Carlos Gómez', 'carlos@escuela.com',
 '$2b$10$rQZ8kY0qX7VxK5wJmN3uEeY6tLpR9sT2vB4nC8dF1gH3iJ5kL7mN',
 'estudiante'),
('Sofía Ramírez', 'sofia@escuela.com',
 '$2b$10$rQZ8kY0qX7VxK5wJmN3uEeY6tLpR9sT2vB4nC8dF1gH3iJ5kL7mN',
 'estudiante'),
('Andrés Castro', 'andres@escuela.com',
 '$2b$10$rQZ8kY0qX7VxK5wJmN3uEeY6tLpR9sT2vB4nC8dF1gH3iJ5kL7mN',
 'estudiante'),
('Valentina Ortiz', 'valentina@escuela.com',
 '$2b$10$rQZ8kY0qX7VxK5wJmN3uEeY6tLpR9sT2vB4nC8dF1gH3iJ5kL7mN',
 'estudiante'),
('Mateo Herrera', 'mateo@escuela.com',
 '$2b$10$rQZ8kY0qX7VxK5wJmN3uEeY6tLpR9sT2vB4nC8dF1gH3iJ5kL7mN',
 'estudiante');

-- ============================================================
-- PROFESORES (usuario_id 2, 3, 4)
-- ============================================================
INSERT INTO profesores (usuario_id, documento, especialidad, telefono) VALUES
(2, 'PROF-001', 'Matemáticas',   '+57 300 111 0001'),
(3, 'PROF-002', 'Física',        '+57 300 111 0002'),
(4, 'PROF-003', 'Historia',      '+57 300 111 0003');

-- ============================================================
-- ESTUDIANTES (usuario_id 5 al 12)
-- ============================================================
INSERT INTO estudiantes (usuario_id, documento, fecha_nacimiento, telefono, direccion) VALUES
(5,  'EST-1001', '2004-03-15', '+57 301 222 0001', 'Calle 10 #5-20'),
(6,  'EST-1002', '2003-07-22', '+57 301 222 0002', 'Carrera 8 #12-45'),
(7,  'EST-1003', '2005-01-10', '+57 301 222 0003', 'Av. Principal #45-12'),
(8,  'EST-1004', '2004-11-08', '+57 301 222 0004', 'Calle 20 #8-30'),
(9,  'EST-1005', '2003-05-19', '+57 301 222 0005', 'Carrera 15 #22-08'),
(10, 'EST-1006', '2005-09-30', '+57 301 222 0006', 'Calle 5 #3-18'),
(11, 'EST-1007', '2004-12-12', '+57 301 222 0007', 'Av. Sur #67-90'),
(12, 'EST-1008', '2003-02-25', '+57 301 222 0008', 'Calle 30 #18-22');

-- ============================================================
-- MATERIAS (profesor_id 1, 2, 3)
-- ============================================================
INSERT INTO materias (codigo, nombre, descripcion, creditos, cupo, profesor_id) VALUES
('MAT-101', 'Matemáticas I',
 'Álgebra, funciones y fundamentos numéricos.', 4, 30, 1),

('MAT-201', 'Cálculo Diferencial',
 'Límites, derivadas y aplicaciones.', 4, 25, 1),

('FIS-101', 'Física Mecánica',
 'Cinemática, dinámica y energía.', 5, 25, 2),

('FIS-201', 'Física Avanzada',
 'Mecánica clásica y movimiento ondulatorio.', 5, 20, 2),

('HIS-101', 'Historia Universal',
 'Civilizaciones antiguas y edad contemporánea.', 3, 30, 3),

('HIS-201', 'Historia de América',
 'Procesos históricos del continente americano.', 3, 25, 3);

-- ============================================================
-- INSCRIPCIONES (período 2025-1)
-- ============================================================
INSERT INTO inscripciones (estudiante_id, materia_id, periodo, fecha, estado) VALUES
-- Laura Pérez (est. 1) → 4 materias
(1, 1, '2025-1', '2025-02-10', 'inscrita'),
(1, 3, '2025-1', '2025-02-10', 'inscrita'),
(1, 5, '2025-1', '2025-02-10', 'inscrita'),
(1, 2, '2025-1', '2025-02-10', 'inscrita'),

-- Diego Ruiz (est. 2) → 3 materias
(2, 1, '2025-1', '2025-02-11', 'inscrita'),
(2, 4, '2025-1', '2025-02-11', 'inscrita'),
(2, 6, '2025-1', '2025-02-11', 'inscrita'),

-- María López (est. 3) → 3 materias
(3, 3, '2025-1', '2025-02-11', 'inscrita'),
(3, 5, '2025-1', '2025-02-11', 'inscrita'),
(3, 1, '2025-1', '2025-02-11', 'inscrita'),

-- Carlos Gómez (est. 4) → 2 materias
(4, 2, '2025-1', '2025-02-12', 'inscrita'),
(4, 4, '2025-1', '2025-02-12', 'inscrita'),

-- Sofía Ramírez (est. 5) → 3 materias
(5, 1, '2025-1', '2025-02-12', 'inscrita'),
(5, 3, '2025-1', '2025-02-12', 'inscrita'),
(5, 6, '2025-1', '2025-02-12', 'inscrita'),

-- Andrés Castro (est. 6) → 2 materias
(6, 5, '2025-1', '2025-02-13', 'inscrita'),
(6, 2, '2025-1', '2025-02-13', 'inscrita'),

-- Valentina Ortiz (est. 7) → 2 materias
(7, 4, '2025-1', '2025-02-13', 'inscrita'),
(7, 1, '2025-1', '2025-02-13', 'inscrita'),

-- Mateo Herrera (est. 8) → 1 materia (cancelada de ejemplo)
(8, 3, '2025-1', '2025-02-14', 'inscrita'),
(8, 6, '2025-1', '2025-02-14', 'cancelada');

-- ============================================================
-- CALIFICACIONES (notas 0.0 a 5.0)
-- ============================================================
-- Estudiante 1 (Laura) - inscripción 1 (Matemáticas I)
INSERT INTO calificaciones (inscripcion_id, tipo, nota) VALUES
(1, 'parcial1', 4.5),
(1, 'parcial2', 4.2),
(1, 'trabajos', 4.8),
(1, 'final',    4.6);

-- Laura - inscripción 2 (Física Mecánica)
INSERT INTO calificaciones (inscripcion_id, tipo, nota) VALUES
(2, 'parcial1', 4.0),
(2, 'parcial2', 3.8),
(2, 'trabajos', 4.2),
(2, 'final',    4.0);

-- Laura - inscripción 3 (Historia Universal)
INSERT INTO calificaciones (inscripcion_id, tipo, nota) VALUES
(3, 'parcial1', 3.8),
(3, 'parcial2', 4.1),
(3, 'trabajos', 4.0),
(3, 'final',    3.9);

-- Laura - inscripción 4 (Cálculo)
INSERT INTO calificaciones (inscripcion_id, tipo, nota) VALUES
(4, 'parcial1', 4.2),
(4, 'parcial2', 4.4),
(4, 'trabajos', 4.5),
(4, 'final',    4.3);

-- Diego - inscripción 5 (Matemáticas I)
INSERT INTO calificaciones (inscripcion_id, tipo, nota) VALUES
(5, 'parcial1', 3.5),
(5, 'parcial2', 3.8),
(5, 'trabajos', 4.0),
(5, 'final',    3.7);

-- Diego - inscripción 6 (Física Avanzada)
INSERT INTO calificaciones (inscripcion_id, tipo, nota) VALUES
(6, 'parcial1', 3.2),
(6, 'parcial2', 3.5),
(6, 'trabajos', 3.8),
(6, 'final',    3.4);

-- María - inscripción 8 (Física Mecánica)
INSERT INTO calificaciones (inscripcion_id, tipo, nota) VALUES
(8, 'parcial1', 2.8),
(8, 'parcial2', 3.0),
(8, 'trabajos', 3.2),
(8, 'final',    2.9);

-- Carlos - inscripción 11 (Cálculo)
INSERT INTO calificaciones (inscripcion_id, tipo, nota) VALUES
(11, 'parcial1', 4.0),
(11, 'parcial2', 4.3),
(11, 'trabajos', 3.9),
(11, 'final',    4.2);

-- Sofía - inscripción 13 (Matemáticas I)
INSERT INTO calificaciones (inscripcion_id, tipo, nota) VALUES
(13, 'parcial1', 4.6),
(13, 'parcial2', 4.7),
(13, 'trabajos', 4.8),
(13, 'final',    4.5);

-- ============================================================
-- VERIFICACIÓN
-- ============================================================
SELECT 'usuarios'       AS tabla, COUNT(*) FROM usuarios
UNION ALL SELECT 'estudiantes',   COUNT(*) FROM estudiantes
UNION ALL SELECT 'profesores',    COUNT(*) FROM profesores
UNION ALL SELECT 'materias',      COUNT(*) FROM materias
UNION ALL SELECT 'inscripciones', COUNT(*) FROM inscripciones
UNION ALL SELECT 'calificaciones',COUNT(*) FROM calificaciones;