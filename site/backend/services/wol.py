import requests


def wake_pc():

    requests.post(
        "http://host.docker.internal:4000/wake",
        timeout=5
    )
