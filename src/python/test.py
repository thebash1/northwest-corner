import os
import sys
import random

from PyQt5.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QLabel, QSpinBox, QPushButton, QMessageBox, QGraphicsView, QGraphicsScene,
    QGraphicsPixmapItem, QGraphicsLineItem, QGraphicsPolygonItem, QGraphicsTextItem
)
from PyQt5.QtGui import QPixmap, QPen, QBrush, QPolygonF, QFont, QColor, QIcon
from PyQt5.QtCore import Qt, QPointF

# Lista de capitales de los departamentos de Colombia
CAPITALES_COLOMBIA = [
    "Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena", "Cúcuta", "Bucaramanga", "Pereira",
    "Manizales", "Ibagué", "Santa Marta", "Villavicencio", "Pasto", "Montería", "Armenia", "Neiva",
    "Sincelejo", "Valledupar", "Quibdó", "Riohacha", "Florencia", "San Andrés", "Mocoa", "Yopal",
    "Popayán", "Tunja", "Leticia", "Arauca", "Inírida", "Puerto Carreño", "Mitú", "San José del Guaviare"
]

# Colores predeterminados para los buses
BUS_COLORS = [Qt.blue, Qt.red, QColor(255, 165, 0), QColor(0, 100, 0)]  # Azul, Rojo, Naranja, Verde Oscuro

class IconItem(QGraphicsPixmapItem):
    def __init__(self, image_path: str, width: int, height: int):
        super().__init__()
        abs_path = os.path.join(os.path.dirname(__file__), image_path)
        pixmap = QPixmap(abs_path)
        if pixmap.isNull():
            raise FileNotFoundError(f"No se encontró el ícono: {image_path}")
        # Escalamos manteniendo proporción
        scaled = pixmap.scaled(width, height, Qt.KeepAspectRatio, Qt.SmoothTransformation)
        self.setPixmap(scaled)

class IconWindowManager:
    path="C:\\Users\\Usuario\\Desktop\\git-learn\\northwest-corner\\src\\img\\template.png"
    
    @staticmethod
    def apply_icon(window):
        """
        Aplica el ícono a la ventana proporcionada.
        :param window: Instancia de una ventana (QWidget o QMainWindow).
        """
        abs_path = os.path.abspath(IconWindowManager.path)
        if not os.path.exists(abs_path):
            raise FileNotFoundError(f"No se encontró el ícono en la ruta: {abs_path}")
        icon = QIcon(abs_path)
        window.setWindowIcon(icon)

class BusItem(IconItem):
    def __init__(self):
        super().__init__("img/bus.png", width=50, height=30)


class CityItem(IconItem):
    def __init__(self):
        super().__init__("img/cityscape.png", width=60, height=60)

class ValidationError:
    def show_error_message(self, message: str):
        """Muestra un mensaje de error en un cuadro de diálogo."""
        msg_box = QMessageBox(self)
        msg_box.setIcon(QMessageBox.Warning)
        msg_box.setWindowTitle("Error de Validación")
        msg_box.setText(message)
        msg_box.exec_()

    def add_data(list, item):
        if item not in list:
            list.append(item)

# ...existing code...

class TransportationDiagram(QGraphicsView):
    def __init__(self):
        super().__init__()
        self.scene = QGraphicsScene(self)
        self.setScene(self.scene)
        self.sources = []
        self.destinations = []
        self.relations = {}  # Diccionario para guardar las relaciones

    def create_diagram(self, num_sources: int, num_destinations: int):
        self.scene.clear()
        self.sources.clear()
        self.destinations.clear()
        self.relations.clear()  # Limpiar relaciones previas

        # Seleccionar nombres de ciudades aleatoriamente
        ciudades_seleccionadas = random.sample(CAPITALES_COLOMBIA, num_destinations)

        # Crear buses con texto
        for i in range(num_sources):
            x = 50
            y = 50 + i * 200
            bus = BusItem()
            bus.setPos(x, y)
            self.scene.addItem(bus)
            self.sources.append((bus, BUS_COLORS[i % len(BUS_COLORS)]))  # Asociar bus con su color

            # Agregar texto encima del bus
            text = QGraphicsTextItem(f"Bus {i + 1}")
            text.setFont(QFont("Arial", 10))
            text.setDefaultTextColor(Qt.black)
            text.setPos(x, y - 20)  # Posicionar el texto encima del bus
            self.scene.addItem(text)

        # Crear ciudades con texto
        for i, city_name in enumerate(ciudades_seleccionadas):
            x = 600
            y = 50 + i * 200
            city = CityItem()
            city.setPos(x, y)
            self.scene.addItem(city)
            self.destinations.append(city)

            # Agregar texto encima de la ciudad
            text = QGraphicsTextItem(city_name)
            text.setFont(QFont("Arial", 10))
            text.setDefaultTextColor(Qt.black)
            text.setPos(x, y - 20)  # Posicionar el texto encima de la ciudad
            self.scene.addItem(text)

        # Crear líneas con flechas, colores únicos por bus y etiquetas
        for bus_index, (bus, color) in enumerate(self.sources):
            bus_name = f"bus{bus_index + 1}"
            self.relations[bus_name] = []  # Inicializar lista de relaciones para el bus

            for city_index, dst in enumerate(self.destinations):
                city_name = ciudades_seleccionadas[city_index]

                # Coordenadas de inicio y fin de la línea
                start_x = bus.x() + bus.pixmap().width()
                start_y = bus.y() + bus.pixmap().height() / 2
                end_x = dst.x() - 10
                end_y = dst.y() + dst.pixmap().height() / 2

                # Crear línea
                line = QGraphicsLineItem(start_x, start_y, end_x, end_y)
                pen = QPen(color, 2, Qt.SolidLine)
                pen.setCapStyle(Qt.RoundCap)
                line.setPen(pen)
                self.scene.addItem(line)

                # Crear flecha
                arrow = QGraphicsPolygonItem()
                arrow.setBrush(QBrush(color))
                arrow.setPolygon(self._create_arrow_polygon(end_x, end_y))
                self.scene.addItem(arrow)

                # Crear etiquetas xij y cij
                xij = f"x{bus_index + 1}{city_index + 1}"
                cij = f"c{bus_index + 1}{city_index + 1}"

                # Calcular posición de las etiquetas
                xij_x = start_x + 100  # 20 píxeles a la derecha del bus
                xij_y = start_y

                cij_x = end_x - 100  # 20 píxeles a la izquierda de la ciudad
                cij_y = end_y

                # Agregar texto xij
                xij_text = QGraphicsTextItem(xij)
                xij_text.setFont(QFont("Arial", 10))
                xij_text.setDefaultTextColor(Qt.black)
                xij_text.setPos(xij_x, xij_y - 10)  # Ajustar ligeramente hacia arriba
                self.scene.addItem(xij_text)

                # Agregar texto cij
                cij_text = QGraphicsTextItem(cij)
                cij_text.setFont(QFont("Arial", 10))
                cij_text.setDefaultTextColor(Qt.black)
                cij_text.setPos(cij_x, cij_y - 10)  # Ajustar ligeramente hacia arriba
                self.scene.addItem(cij_text)

                # Guardar relación en el diccionario
                self.relations[bus_name].append((xij, cij))
                if city_name not in self.relations:
                    self.relations[city_name] = []
                self.relations[city_name].append((xij, cij))

    def _create_arrow_polygon(self, x, y):
        """Crea un triángulo para representar una flecha."""
        size = 10
        return QPolygonF([
            QPointF(x, y),
            QPointF(x - size, y - size / 2),
            QPointF(x - size, y + size / 2)
        ])
    
class DiagramWindow(QMainWindow):
    def __init__(self, start_window):
        super().__init__()
        self.start_window = start_window
        self.setWindowTitle("Modelo de Transporte — Ofertas y Demandas")
        self.setFixedSize(1024, 576)  # Establecer tamaño fijo

        IconWindowManager.apply_icon(self)

        central = QWidget(self)
        self.setCentralWidget(central)
        vlay = QVBoxLayout(central)

        # Controles
        hlay = QHBoxLayout()
        self.spin_sources = QSpinBox()
        self.spin_sources.setRange(1,9)
        self.spin_dest = QSpinBox()
        self.spin_dest.setRange(1,9)

        hlay.addWidget(QLabel("Ofertas:"))
        hlay.addWidget(self.spin_sources)
        hlay.addWidget(QLabel("Demandas:"))
        hlay.addWidget(self.spin_dest)

        btn_gen = QPushButton("Generar Diagrama")
        btn_gen.clicked.connect(self.on_generate)

        btn_back = QPushButton()
        btn_back.setIcon(QIcon.fromTheme("go-previous"))  # Ícono de flecha para regresar
        btn_back.setText("Regresar")
        btn_back.clicked.connect(self.go_back)

        hlay.addWidget(btn_gen)
        hlay.addWidget(btn_back)
        vlay.addLayout(hlay)

        # Vista de diagrama
        self.diagram = TransportationDiagram()
        vlay.addWidget(self.diagram)

    def on_generate(self):
        # Validar el número de buses y ciudades
        num_sources = self.spin_sources.value()
        num_destinations = self.spin_dest.value()

        if num_sources > 4 or num_destinations > 4:
            ValidationError.show_error_message(self,"El número máximo de buses y ciudades es 4.")
            return
        
        self.diagram.create_diagram(num_sources, num_destinations)

    def go_back(self):
        self.close()
        self.start_window.show()

class MainWindow(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Modelo de trasporte - Inicio")
        self.resize(1024, 576)

        IconWindowManager.apply_icon(self)

        # Layout principal
        main_layout = QVBoxLayout(self)

        # Contenedor para la imagen
        self.image_label = QLabel(self)
        pixmap = QPixmap("C:\\Users\\Usuario\\Desktop\\git-learn\\northwest-corner\\src\\img\\template.png")
        if pixmap.isNull():
            print("Error: No se pudo cargar la imagen. Verifica la ruta.")
            self.image_label.setText("No se pudo cargar la imagen")
            self.image_label.setAlignment(Qt.AlignCenter)
        else:
            scaled_pixmap = pixmap.scaled(self.width(), self.height(), Qt.KeepAspectRatio, Qt.SmoothTransformation)
            self.image_label.setPixmap(scaled_pixmap)
        self.image_label.setAlignment(Qt.AlignCenter)

        # Contenedor para superposición
        overlay_widget = QWidget(self)
        overlay_layout = QVBoxLayout(overlay_widget)
        overlay_layout.setAlignment(Qt.AlignTop)  # Controles en la parte superior

        # Controles
        controls_layout = QHBoxLayout()
        self.spin_buses = QSpinBox()
        self.spin_buses.setRange(1,9)
        self.spin_cities = QSpinBox()
        self.spin_cities.setRange(1,9)

        controls_layout.addWidget(QLabel("Número de buses:"))
        controls_layout.addWidget(self.spin_buses)
        controls_layout.addWidget(QLabel("Número de ciudades:"))
        controls_layout.addWidget(self.spin_cities)

        # Botón
        self.start_button = QPushButton("Iniciar Programa")
        self.start_button.clicked.connect(self.start_program)

        overlay_layout.addLayout(controls_layout)
        overlay_layout.addWidget(self.start_button, alignment=Qt.AlignCenter)

        # Agregar widgets al layout principal
        main_layout.addWidget(self.image_label)
        main_layout.addWidget(overlay_widget)

    def start_program(self):
        # Obtener los valores ingresados
        num_buses = self.spin_buses.value()
        num_cities = self.spin_cities.value()
        if num_buses > 4 or num_cities > 4:
            ValidationError.show_error_message(self, "El número máximo de buses y ciudades es 4.")
            return
        
        # Abrir la ventana del diagrama y pasar los valores
        self.diagram_window = DiagramWindow(self)
        self.diagram_window.spin_sources.setValue(num_buses)
        self.diagram_window.spin_dest.setValue(num_cities)
        self.diagram_window.show()
        self.diagram_window.on_generate()
        self.hide()

if __name__ == "__main__":
    app = QApplication(sys.argv)
    start_window = MainWindow()
    start_window.show()
    sys.exit(app.exec_())