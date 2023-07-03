from paramiko import SSHClient
from scp import SCPClient


serverIP = ['192.168.1.151','192.168.1.98']

serverPass = {
    '192.168.1.151': 'test',
    '192.168.1.98': 'test',
    # '': '',
    # '': '',
    # '': '',
    # '': '',
    # '': '',
    # '': ''
}


def connectHost(host):
    usrname = 'test'
    passwd = serverPass[host]
    ssh = SSHClient()
    ssh.load_system_host_keys()
    ssh.connect(hostname=host, 
                # port = 'port',
                username=usrname,
                password=passwd)
                # pkey='load_key_if_relevant')
    # SCPCLient takes a paramiko transport as its only argument
    scp = SCPClient(ssh.get_transport())
    scp.put('file.txt', recursive=True, remote_path='~/Desktop')
    scp.close()


def loop():
    for _ in serverIP:
        connectHost(_)


loop()