from flask import Flask, jsonify
import subprocess
import os

app = Flask(__name__)

PC_MAC = os.getenv("PC_MAC")

@app.route("/wake", methods=["POST"])
def wake():
    result = subprocess.run(
        [
            "etherwake",
            "-i",
            "eth0",
            PC_MAC
        ],
        capture_output=True,
        text=True
    )

    return jsonify({
        "status": result.returncode == 0,
        "output": result.stdout,
        "error": result.stderr
    })


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=4000
    )
