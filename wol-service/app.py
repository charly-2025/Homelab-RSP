import os
import subprocess

from dotenv import load_dotenv
from flask import Flask, jsonify
from wakeonlan import send_magic_packet

app = Flask(__name__)

load_dotenv()

PC_MAC = os.getenv("PC_MAC")
WOL_METHOD = os.getenv("WOL_METHOD")


@app.route("/wake", methods=["POST"])
def wake():
    try:
        if not WOL_METHOD:
            return jsonify({
                "success": False,
                "message": "WOL_METHOD is not configured."
            }), 500

        if WOL_METHOD == "etherwake":
            subprocess.run(
                ["etherwake", "-i", "eth0", PC_MAC],
                check=True
            )

        elif WOL_METHOD == "wakeonlan":
            send_magic_packet(PC_MAC)

        else:
            return jsonify({
                "success": False,
                "message": f"Invalid WOL_METHOD: '{WOL_METHOD}'. Expected 'etherwake' or 'wakeonlan'."
            }), 500

        return jsonify({
            "success": True,
            "method": WOL_METHOD
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=4000)
