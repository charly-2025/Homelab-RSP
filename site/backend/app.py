from flask import Flask, jsonify,redirect
from flask_cors import CORS
import dotenv
import os
import requests

app = Flask(__name__)
CORS(app)

@app.route("/api/wake", methods=["POST"])
def wake():
   requests.post("http://host.docker.internal:4000/wake")
   return jsonify({"message":"magic packet sent", "status_code": 200})

if __name__ == "__main__":
    app.run(port=3000, debug=True, host="0.0.0.0")

