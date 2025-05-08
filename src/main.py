#!/usr/bin/env python3

from PyQt5.QtWidgets import *
import sys

# clase propiedades de ventana
class Window(QMainWindow):
    def __init__(self):
        QMainWindow.__init__(self)
        self.setWindowTitle("Modelos de transporte")
        self.resize(400,300)
        
        layout = QGridLayout()
        self.setLayout(layout)

        label = QLabel("Ventana de principal")
        label.setText("prueba")
        #label.setAlignment()
        layout.addWidget(label, 0, 0)

# funcion para crear ventana
def createWindow(tittle, width, height):
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


# app = QApplication(sys.argv)
# screen = Window()
# screen.show()
# sys.exit(app.exec_())
