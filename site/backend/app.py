from flask import Flask
from flask_cors import CORS

from routes.wake import wake
from routes.pc import pc
from routes.rsp import rsp

app = Flask(__name__)
CORS(app)

app.register_blueprint(wake)
app.register_blueprint(pc)
app.register_blueprint(rsp)

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=3000,
        debug=True
    )
