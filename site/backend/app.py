from flask import Flask, jsonify,redirect
from flask_cors import CORS
import dotenv
import os

dotenv.load_dotenv()
PC_MAC = os.getenv("PC_MAC")

app = Flask(__name__)
CORS(app)

@app.route("/api/wake", methods=["POST"])
def wake():
    os.system(f"etherwake -i eth0 {PC_MAC}")
    return jsonify({"message": f"Wake-on-LAN signal sent on {PC_MAC}","status_code": 200})


if __name__ == "__main__":
    app.run(port=3000, debug=True, host="0.0.0.0")
