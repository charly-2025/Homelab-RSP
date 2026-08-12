from flask import Blueprint, request, jsonify
import RPi.GPIO as GPIO

from services.rsp_monitor import get_rsp_status

rsp = Blueprint("rsp", __name__)

FAN_PIN = 18
PWM_FREQ = 100

GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)
GPIO.setup(FAN_PIN, GPIO.OUT)
fan_pwm = GPIO.PWM(FAN_PIN, PWM_FREQ)
fan_pwm.start(0)

current_speed = 0


@rsp.route("/api/rsp/status")
def rsp_status():
    try:
        return jsonify(get_rsp_status())
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@rsp.route("/api/rsp/fan", methods=["POST"])
def set_fan_speed():
    global current_speed
    data = request.get_json(silent=True) or {}
    speed = data.get("speed")

    if speed is None:
        return jsonify({"message": "Le champ 'speed' est requis."}), 400

    try:
        speed = int(speed)
    except (TypeError, ValueError):
        return jsonify({"message": "'speed' doit être un entier."}), 400

    if not 0 <= speed <= 100:
        return jsonify({"message": "'speed' doit être compris entre 0 et 100."}), 400

    fan_pwm.ChangeDutyCycle(speed)
    current_speed = speed

    return jsonify({"message": "Vitesse mise à jour.", "speed": current_speed}), 200


@rsp.route("/api/rsp/fan", methods=["GET"])
def get_fan_speed():
    return jsonify({"speed": current_speed}), 200