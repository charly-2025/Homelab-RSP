import psutil


def get_rsp_status():
    disk = psutil.disk_usage("/")

    return {
        "cpu_percent": psutil.cpu_percent(interval=None),
        "ram_percent": psutil.virtual_memory().percent,
        "disk_percent": disk.percent,
    }