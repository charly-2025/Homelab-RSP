from flask import Flask, jsonify, request
import subprocess
import os

app = Flask(__name__)

PC_MAC = os.getenv("PC_MAC")
API_TOKEN = os.getenv("WOL_API_TOKEN")


@app.route("/wake", methods=["POST"])
def wake():
    
    if request.headers.get("X-API-Key") != API_TOKEN:
        return jsonify({
            "success": False,
            "message": "Unauthorized"
        }), 401

    if not PC_MAC:
        return jsonify({
            "success": False,
            "message": "PC_MAC environment variable is not set."
        }), 500

    try:
        result = subprocess.run(
            [
                "etherwake",
                "-i",
                "eth0",
                PC_MAC
            ],
            capture_output=True,
            text=True,
            check=True
        )

        return jsonify({
            "success": True,
            "message": "Magic Packet sent.",
            "output": result.stdout.strip()
        }), 200

    except subprocess.CalledProcessError as e:
        return jsonify({
            "success": False,
            "message": "Failed to send Magic Packet.",
            "error": e.stderr.strip()
        }), 500


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=4000
    )
