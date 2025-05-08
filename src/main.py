#!/usr/bin/env python3

from PyQt5.QtWidgets import *
import sys

# clase propiedades de ventana
class Window(QMainWindow):
    def __init__(self):
        super().__init__()

        # configuración básica de la ventana
        self.setWindowTitle("Modelos de transporte")
        self.resize(1024,576)

        # widget para ventan principal
        centralWidget = QWidget()
        self.setCentralWidget(centralWidget)

        # layout para organizar elementos
        layout = QVBoxLayout()
        centralWidget.setLayout(layout)

        label = QLabel("Ventana de principal")

        # crear y configurar Qlabel
        layout.addWidget(label)

        # botones
        button = QPushButton("gai")
        layout.addWidget(button)

# funcion para crear ventana
def createWindow(Qwidget, tittle, width, height):
    window = Window()
    window.setWindowTitle(tittle)
    window.setNormal()
    window.setMinimumWidth(width)
    window.setMaximumWidth(width)
    window.setMinimumHeight(height)
    window.setMaximumHeight(height)

    # minimizar y máximar ventana 
    window.showMinimized()
    window.showMaximized()

if __name__ == "__main__":

    app = QApplication(sys.argv)
    main_window = Window()
    main_window.show()
    sys.exit(app.exec_())
