import os
import sys
import random

from PyQt5.QtWidgets import QMessageBox
from PyQt5.QtCore import Qt, QPointF, QLineF
from PyQt5.QtGui import QPixmap, QPen, QBrush, QPolygonF, QFont
from PyQt5.QtWidgets import (
    QApplication, QMainWindow, QWidget,
    QVBoxLayout, QHBoxLayout,
    QLabel, QSpinBox, QPushButton,
    QGraphicsView, QGraphicsScene, QGraphicsPixmapItem, QGraphicsLineItem, QGraphicsPolygonItem, QGraphicsTextItem
)

# Lista de capitales de los departamentos de Colombia
CAPITALES_COLOMBIA = [
    "Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena", "Cúcuta", "Bucaramanga", "Pereira",
    "Manizales", "Ibagué", "Santa Marta", "Villavicencio", "Pasto", "Montería", "Armenia", "Neiva",
    "Sincelejo", "Valledupar", "Quibdó", "Riohacha", "Florencia", "San Andrés", "Mocoa", "Yopal",
    "Popayán", "Tunja", "Leticia", "Arauca", "Inírida", "Puerto Carreño", "Mitú", "San José del Guaviare"
]

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

class BusItem(IconItem):
    def __init__(self):
        super().__init__("img/bus.png", width=50, height=30)

class CityItem(IconItem):
    def __init__(self):
        super().__init__("img/cityscape.png", width=60, height=60)

class TransportationDiagram(QGraphicsView):
    def __init__(self):
        super().__init__()
        self.scene = QGraphicsScene(self)
        self.setScene(self.scene)
        self.sources = []
        self.destinations = []

    def create_diagram(self, num_sources: int, num_destinations: int):
        self.scene.clear()
        self.sources.clear()
        self.destinations.clear()

        # Seleccionar nombres de ciudades aleatoriamente
        ciudades_seleccionadas = random.sample(CAPITALES_COLOMBIA, num_destinations)

        # Crear buses con texto
        for i in range(num_sources):
            x = 50
            y = 50 + i * 200
            bus = BusItem()
            bus.setPos(x, y)
            self.scene.addItem(bus)
            self.sources.append(bus)

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

        # Crear líneas con flechas y colores diferentes
        colors = [Qt.red, Qt.blue, Qt.green, Qt.yellow, Qt.magenta]
        for i, src in enumerate(self.sources):
            for j, dst in enumerate(self.destinations):
                # Crear línea
                line = QGraphicsLineItem(
                    src.x() + src.pixmap().width() / 2, src.y() + src.pixmap().height() / 2,
                    dst.x() + dst.pixmap().width() / 2, dst.y() + dst.pixmap().height() / 2
                )
                pen = QPen(colors[(i + j) % len(colors)], 2, Qt.SolidLine)
                pen.setCapStyle(Qt.RoundCap)
                line.setPen(pen)
                self.scene.addItem(line)

                # Crear flecha
                arrow = QGraphicsPolygonItem()
                arrow.setBrush(QBrush(colors[(i + j) % len(colors)]))
                arrow.setPolygon(self._create_arrow_polygon(
                    dst.x() + dst.pixmap().width() / 2, dst.y() + dst.pixmap().height() / 2
                ))
                self.scene.addItem(arrow)

    def _create_arrow_polygon(self, x, y):
        """Crea un triángulo para representar una flecha."""
        size = 10
        return QPolygonF([
            QPointF(x, y),
            QPointF(x - size, y - size / 2),
            QPointF(x - size, y + size / 2)
        ])

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Modelo de Transporte — Ofertas y Demandas")
        self.setGeometry(100, 100, 1024, 576)

        central = QWidget(self)
        self.setCentralWidget(central)
        vlay = QVBoxLayout(central)

        # Controles
        hlay = QHBoxLayout()
        self.spin_sources = QSpinBox()
        self.spin_sources.setRange(1, 5)
        self.spin_dest = QSpinBox()
        self.spin_dest.setRange(1, 5)

        hlay.addWidget(QLabel("Ofertas:"))
        hlay.addWidget(self.spin_sources)
        hlay.addWidget(QLabel("Demandas:"))
        hlay.addWidget(self.spin_dest)

        btn_gen = QPushButton("Generar Diagrama")
        btn_gen.clicked.connect(self.on_generate)

        hlay.addWidget(btn_gen)
        vlay.addLayout(hlay)

        # Vista de diagrama
        self.diagram = TransportationDiagram()
        vlay.addWidget(self.diagram)

    def on_generate(self):
        # Validar el número de buses y ciudades
        num_sources = self.spin_sources.value()
        num_destinations = self.spin_dest.value()

        if num_sources > 4 or num_destinations > 4:
            self.show_error_message("El número máximo de buses y ciudades es 4.")
            return

        self.diagram.create_diagram(num_sources, num_destinations)

    def show_error_message(self, message: str):
        """Muestra un mensaje de error en un cuadro de diálogo."""
        msg_box = QMessageBox(self)
        msg_box.setIcon(QMessageBox.Warning)
        msg_box.setWindowTitle("Error de Validación")
        msg_box.setText(message)
        msg_box.exec_()

if __name__ == "__main__":
    app = QApplication(sys.argv)
    win = MainWindow()
    win.show()
    sys.exit(app.exec_())