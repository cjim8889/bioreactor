from flask import Flask
from config import Config
from app.models import db

from app.errors import bp as errors_bp
from app.main import bp as main_bp
import time



# from app import routes

app = Flask(__name__)
app.config.from_object(Config)

@app.before_request
def before_request():
    db.connect()

@app.after_request
def after_request(response):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    db.close()
    return response


app.register_blueprint(main_bp)
app.register_blueprint(errors_bp)
