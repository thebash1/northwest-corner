#!/usr/bin/env python3

import os
import sys
from PyQt5.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QLabel, QSpinBox, QPushButton
)
from PyQt5.QtGui import QPixmap
from PyQt5.QtCore import Qt
from model1 import MainWindow as DiagramWindow  # Importar la ventana del diagrama

class StartWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Modelo de Transporte — Inicio")
        self.setGeometry(100, 100, 1024, 576)

        # Configurar el widget central
        central_widget = QWidget(self)
        self.setCentralWidget(central_widget)
        layout = QVBoxLayout(central_widget)

        # Obtener la ruta absoluta de la imagen de la plantilla
        current_dir = os.path.dirname(os.path.abspath(__file__))
        image_path = os.path.join(current_dir, "Plantilla-programa-IO1.png")

        # Agregar la imagen de la plantilla
        self.image_label = QLabel(self)
        pixmap = QPixmap(image_path)
        if pixmap.isNull():
            print(f"Error: No se pudo cargar la imagen en {image_path}. Verifica que el archivo exista.")
        self.image_label.setPixmap(pixmap)
        self.image_label.setAlignment(Qt.AlignCenter)
        layout.addWidget(self.image_label)

        # Controles para ingresar datos
        controls_layout = QHBoxLayout()
        self.spin_buses = QSpinBox()
        self.spin_buses.setRange(1, 9)  # Máximo 4 buses
        self.spin_cities = QSpinBox()
        self.spin_cities.setRange(1, 9)  # Máximo 4 ciudades

        controls_layout.addWidget(QLabel("Número de buses:"))
        controls_layout.addWidget(self.spin_buses)
        controls_layout.addWidget(QLabel("Número de ciudades:"))
        controls_layout.addWidget(self.spin_cities)
        layout.addLayout(controls_layout)

        # Botón para iniciar el programa
        self.start_button = QPushButton("Iniciar Programa")
        self.start_button.clicked.connect(self.start_program)
        layout.addWidget(self.start_button, alignment=Qt.AlignCenter)

    def start_program(self):
        # Obtener los valores ingresados
        num_buses = self.spin_buses.value()
        num_cities = self.spin_cities.value()

        # Abrir la ventana del diagrama y pasar los valores
        self.diagram_window = DiagramWindow()
        self.diagram_window.spin_sources.setValue(num_buses)
        self.diagram_window.spin_dest.setValue(num_cities)
        self.diagram_window.show()

if __name__ == "__main__":
    app = QApplication(sys.argv)
    start_window = StartWindow()
    start_window.show()
    sys.exit(app.exec_())