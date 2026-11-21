import importlib
import os

MODULES_DIR = os.path.dirname(__file__)

def load_modules(app):
    for filename in os.listdir(MODULES_DIR):
        if filename.endswith(".py") and filename != "loader.py" and filename != "__init__.py":
            module_name = f"modules.{filename[:-3]}"
            module = importlib.import_module(module_name)
            if hasattr(module, "register"):
                module.register(app)
                print(f"✅ Módulo cargado: {filename}")
