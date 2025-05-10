#!/usr/bin/env python3

import sys
from PyQt5.QtWidgets import *
from PyQt5 import QtGui
from PyQt5.QtGui import QFont, QIcon

# clase propiedades de ventana
class Window(QMainWindow):
    def __init__(self):
        super().__init__()
        # self.initUI()

        def createBtn(nameBtn):
            return QPushButton(nameBtn)
        
        # def createMenu():
        #     menubar = QMenuBar()
        #     actionFile = menubar.addMenu("Archivo")
        #     actionFile.addAction("Nuevo archivo")
        #     actionFile.addSeparator()
        #     actionFile.addAction("Salir sin guardar")
            
        #     menubar.addMenu("Editar")
        #     menubar.addMenu("Ver")
        #     menubar.addMenu("Ayuda")
        
        #     return menubar
        
        # configuración básica de la ventana
        self.setWindowTitle("PyQt5 window")
        self.resize(1024,576)

        # widget para ventan principal
        centralWidget = QWidget()
        self.setCentralWidget(centralWidget)

        # layout para organizar elementos
        layout = QVBoxLayout()
        centralWidget.setLayout(layout)
        
        # botones
        btn = createBtn('btn1')
        
        # agregar elementos a widget
        layout.addWidget(btn)
        
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

if __name__ == "__main__": # ejecutar archivo
    font = QFont("Cascadia Code", 11) # fuente

    app = QApplication(sys.argv)
    app.setFont(font)
    mainWindow = Window()
    mainWindow.show()
    sys.exit(app.exec_())


