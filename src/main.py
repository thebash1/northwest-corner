#!/usr/bin/env python3

import sys
from PyQt5.QtWidgets import *
from PyQt5 import QtGui
from PyQt5.QtGui import QFontDatabase

# clase propiedades de ventana
class Window(QMainWindow):
    def __init__(self):
        super().__init__()
        # self.initUI()

        self.setWindowIcon(QtGui.QIcon('open-box.png'))

        # configuración básica de la ventana
        self.setWindowTitle("main.py")
        self.resize(1024,576)

        # widget para ventan principal
        centralWidget = QWidget()
        self.setCentralWidget(centralWidget)

        # layout para organizar elementos
        layout = QVBoxLayout()
        centralWidget.setLayout(layout)

        labelTittle = QLabel("Modelos de transporte")
        labelBus = QLabel("Cantidad de buses")
        labelNoun = QLabel("Cantidad de ciudades")

        # crear y configurar Qlabel
        layout.addWidget(labelTittle)
        layout.addWidget(labelBus)
        layout.addWidget(labelNoun)

        # botones
        button = QPushButton("iniciar")
        layout.addWidget(button)

        # fuente
        db = QFontDatabase()
        style = db.styles("JetBrains")

        font = db.font("JetBrains", "Regular", 12)
        self.setFont(font)
# region
    # def initUI(self):
    #     self.setGeometry(300, 300, 300, 220)
    #     self.setWindowTitle('Icon')
    #     self.setWindowIcon(QIcon('open-box.png')) 

# class FontDialog(QFontDialog):
#     def __init__(self):
#         QFontDialog.__init__(self)
#         self.fontSelected.connect(self.onFontSelect())

#     def onFontSelect(self):
#         font = self.currentFont("JetBrains")

#         print("Name: %s" % (font.family("Mono")))
#         print("Size: %i" % (font.pointSize(12)))
#         print("Italic: %s" % (font.italic(False)))
#         print("Underline: %s" % (font.underline(False)))
#         print("Strikeout: %s" % (font.strikeOut(False)))
    
#     def run(self):
#         self.show()

# endregion

if __name__ == "__main__":
    app = QApplication(sys.argv)
    main_window = Window()
    main_window.show()
    sys.exit(app.exec_())


