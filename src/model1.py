import sys
from PyQt5.QtWidgets import (
    QApplication, QMainWindow, QWidget,
    QVBoxLayout, QHBoxLayout,
    QLabel, QSpinBox, QPushButton,
    QGraphicsView, QGraphicsScene, QGraphicsPixmapItem, QGraphicsLineItem
)
from PyQt5.QtCore import Qt, QPointF, QParallelAnimationGroup, QPropertyAnimation, QEasingCurve
from PyQt5.QtGui import QPixmap, QPen, QPainter

class IconItem(QGraphicsPixmapItem):
    def __init__(self, image_path: str, width: int, height: int):
        super().__init__()
        pixmap = QPixmap(image_path)
        if pixmap.isNull():
            raise FileNotFoundError(f"No se encontró el ícono: {image_path}")
        # Escalamos manteniendo proporción
        scaled = pixmap.scaled(width, height, Qt.KeepAspectRatio, Qt.SmoothTransformation)
        self.setPixmap(scaled)

class BusItem(IconItem):
    def __init__(self):
        # Ruta relativa desde el ejecutable o desde tu script
        super().__init__("img/bus.png", width=50, height=30)

class CityItem(IconItem):
    def __init__(self):
        super().__init__("img/cityscape.png", width=80, height=80)

class TransportationDiagram(QGraphicsView):
    def __init__(self):
        super().__init__()
        self.scene = QGraphicsScene(self)
        self.setScene(self.scene)
        # self.setRenderHint(self.RenderHints(QPainter))
        self.sources = []
        self.destinations = []
        self.animations = QParallelAnimationGroup(self)

    def create_diagram(self, num_sources: int, num_destinations: int):
        self.scene.clear()
        self.sources.clear()
        self.destinations.clear()
        self.animations = QParallelAnimationGroup(self)

        # Crear fuentes (ofertas)
        for i in range(num_sources):
            x = 50
            y = 50 + i * 150
            bus = BusItem()
            bus.setPos(x, y)
            self.scene.addItem(bus)
            self.sources.append(bus)

        # Crear destinos (demandas)
        for i in range(num_destinations):
            x = 600
            y = 50 + i * 150
            city = CityItem()
            city.setPos(x, y)
            self.scene.addItem(city)
            self.destinations.append(city)

        # Dibujar conexiones
        for src in self.sources:
            for dst in self.destinations:
                line = QGraphicsLineItem(
                    src.x() + src.pixmap().width(), src.y() + src.pixmap().height() / 2,
                    dst.x(),                 dst.y() + dst.pixmap().height() / 2
                )
                line.setPen(QPen(Qt.darkGreen, 2, Qt.DashLine))
                self.scene.addItem(line)

    def animate_transport(self):
        # Mueve cada bus hacia cada ciudad (solo de ejemplo; lo normal es un solo destino)
        for src in self.sources:
            for dst in self.destinations:
                anim = QPropertyAnimation(src, b"pos", self)
                anim.setDuration(2000)
                anim.setStartValue(src.pos())
                anim.setEndValue(QPointF(dst.x() - src.pixmap().width(), dst.y()))
                anim.setEasingCurve(QEasingCurve.InOutQuad)
                self.animations.addAnimation(anim)
        self.animations.start()

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Modelo de Transporte — Ofertas y Demandas")
        self.setGeometry(100, 100, 800, 600)

        central = QWidget(self)
        self.setCentralWidget(central)
        vlay = QVBoxLayout(central)

        # Controles
        hlay = QHBoxLayout()
        self.spin_sources = QSpinBox()
        self.spin_sources.setRange(1, 5)
        self.spin_dest   = QSpinBox()
        self.spin_dest.setRange(1, 5)

        hlay.addWidget(QLabel("Ofertas:"))
        hlay.addWidget(self.spin_sources)
        hlay.addWidget(QLabel("Demandas:"))
        hlay.addWidget(self.spin_dest)

        btn_gen = QPushButton("Generar Diagrama")
        btn_gen.clicked.connect(self.on_generate)
        btn_anim = QPushButton("Iniciar Transporte")
        btn_anim.clicked.connect(self.on_animate)

        hlay.addWidget(btn_gen)
        hlay.addWidget(btn_anim)
        vlay.addLayout(hlay)

        # Vista de diagrama
        self.diagram = TransportationDiagram()
        vlay.addWidget(self.diagram)

    def on_generate(self):
        self.diagram.create_diagram(
            self.spin_sources.value(),
            self.spin_dest.value()
        )

    def on_animate(self):
        self.diagram.animate_transport()

if __name__ == "__main__":
    app = QApplication(sys.argv)
    win = MainWindow()
    win.show()
    sys.exit(app.exec_())
