import sys
from PyQt5.QtWidgets import *
from PyQt5.QtCore import *
from PyQt5.QtGui import *

class TransportationDiagram(QGraphicsView):
    def __init__(self):
        super().__init__()
        self.scene = QGraphicsScene()
        self.setScene(self.scene)
        self.setRenderHint(QPainter.Antialiasing)
        self.sources = []
        self.destinations = []
        self.animations = QParallelAnimationGroup()

    def create_diagram(self, num_sources, num_destinations):
        self.scene.clear()
        self.animations = QParallelAnimationGroup()
        
        # Crear fuentes (buses)
        bus_size = 50
        for i in range(num_sources):
            x = 50
            y = 50 + i * 150
            bus = BusItem()
            bus.setPos(x, y)
            self.scene.addItem(bus)
            self.sources.append(bus)

        # Crear destinos (ciudades)
        city_size = 80
        for i in range(num_destinations):
            x = 600
            y = 50 + i * 150
            city = CityItem()
            city.setPos(x, y)
            self.scene.addItem(city)
            self.destinations.append(city)

        # Conectar con líneas
        self.draw_connections()

    def draw_connections(self):
        for source in self.sources:
            for dest in self.destinations:
                line = QGraphicsLineItem(
                    source.x() + 50, source.y() + 25,
                    dest.x(), dest.y() + 40)
                line.setPen(QPen(Qt.gray, 2, Qt.DashLine))
                self.scene.addItem(line)

    def animate_transport(self):
        for source in self.sources:
            for dest in self.destinations:
                animation = QPropertyAnimation(source, b"pos")
                animation.setDuration(2000)
                animation.setStartValue(source.pos())
                animation.setEndValue(QPointF(dest.x() - 50, dest.y()))
                animation.setEasingCurve(QEasingCurve.InOutQuad)
                self.animations.addAnimation(animation)
        
        self.animations.start()

class IconItem(QGraphicsPixmapItem):
    def __init__(self, image_path):
        super().__init__()
        pixmap = QPixmap(image_path)
        if pixmap.isNull():
            print(f"Error: No se pudo cargar la imagen {image_path}")
        self.setPixmap(pixmap)

class BusItem(IconItem):
    def __init__(self):
        super().__init__("img/bus.png") 

class CityItem(IconItem):
    def __init__(self):
        super().__init__("img/cityscape.png") 

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Modelo de Transporte")
        self.setGeometry(100, 100, 800, 600)
        
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        layout = QVBoxLayout()
        central_widget.setLayout(layout)
        
        # Controles de entrada
        control_layout = QHBoxLayout()
        self.source_spin = QSpinBox()
        self.source_spin.setRange(1, 5)
        self.dest_spin = QSpinBox()
        self.dest_spin.setRange(1, 5)
        
        control_layout.addWidget(QLabel("Fuentes:"))
        control_layout.addWidget(self.source_spin)
        control_layout.addWidget(QLabel("Destinos:"))
        control_layout.addWidget(self.dest_spin)
        
        generate_btn = QPushButton("Generar Diagrama")
        generate_btn.clicked.connect(self.generate_diagram)
        animate_btn = QPushButton("Iniciar Transporte")
        animate_btn.clicked.connect(self.start_animation)
        
        layout.addLayout(control_layout)
        layout.addWidget(generate_btn)
        layout.addWidget(animate_btn)
        
        # Vista del diagrama
        self.diagram = TransportationDiagram()
        layout.addWidget(self.diagram)
        
    def generate_diagram(self):
        num_sources = self.source_spin.value()
        num_destinations = self.dest_spin.value()
        self.diagram.create_diagram(num_sources, num_destinations)
        
    def start_animation(self):
        self.diagram.animate_transport()

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec_())