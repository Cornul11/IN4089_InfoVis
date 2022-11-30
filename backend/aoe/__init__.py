import os

from flask import Flask

from aoe.data import load_data


def create_app():
    app = Flask(__name__)

    data = load_data()

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    @app.route("/")
    def hello_world():
        return "<p>Hello, World!</p>"

    return app
