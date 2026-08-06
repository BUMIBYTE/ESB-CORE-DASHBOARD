import React, { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

export default function RealSshTerminal() {
    const terminalRef = useRef(null);
    const wsRef = useRef(null);
    const inputBuffer = useRef('');
    const connectionState = useRef('DISCONNECTED'); // DISCONNECTED -> AWAITING_PASSWORD -> CONNECTED
    const sessionData = useRef({ user: '', host: '' });

    useEffect(() => {
        const term = new Terminal({
            cursorBlink: true,
            theme: { background: '#0f172a', foreground: '#f8fafc' },
            fontFamily: 'Fira Code, monospace',
            fontSize: 14,
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        term.open(terminalRef.current);
        fitAddon.fit();

        printLocalPrompt(term);

        term.onData((data) => {
            // JIKA SUDAH CONNECTED: Kirim ketikan mentah ke WebSocket .NET Proxy
            if (connectionState.current === 'CONNECTED' && wsRef.current) {
                wsRef.current.send(data);
                return;
            }

            const code = data.charCodeAt(0);

            // JIKA MENUNGGU PASSWORD
            if (connectionState.current === 'AWAITING_PASSWORD') {
                if (code === 13) { // ENTER
                    term.write('\r\n');
                    const pass = inputBuffer.current;
                    inputBuffer.current = '';
                    connectToDotnetProxy(sessionData.current.host, sessionData.current.user, pass, term);
                } else if (code === 127) { // BACKSPACE
                    if (inputBuffer.current.length > 0) inputBuffer.current = inputBuffer.current.slice(0, -1);
                } else if (code >= 32) {
                    inputBuffer.current += data;
                }
                return;
            }

            // JIKA DI PROMPT LOKAL
            if (code === 13) { // ENTER
                term.write('\r\n');
                handleLocalCommand(inputBuffer.current.trim(), term);
                inputBuffer.current = '';
            } else if (code === 127) { // BACKSPACE
                if (inputBuffer.current.length > 0) {
                    inputBuffer.current = inputBuffer.current.slice(0, -1);
                    term.write('\b \b');
                }
            } else if (code >= 32) {
                inputBuffer.current += data;
                term.write(data);
            }
        });

        return () => {
            if (wsRef.current) wsRef.current.close();
            term.dispose();
        };
    }, []);

    const printLocalPrompt = (term) => {
        term.write('\x1b[32mweb-terminal@local\x1b[0m:\x1b[34m~\x1b[0m$ ');
    };

    const handleLocalCommand = (cmd, term) => {
        if (!cmd) { printLocalPrompt(term); return; }
        if (cmd === 'clear') { term.clear(); printLocalPrompt(term); return; }

        if (cmd.startsWith('ssh ')) {
            const target = cmd.split(' ').pop();
            if (target.includes('@')) {
                const [user, host] = target.split('@');
                sessionData.current = { user, host };
                connectionState.current = 'AWAITING_PASSWORD';
                term.write(`${user}@${host}'s password: `);
            } else {
                term.write('\x1b[31mFormat: ssh user@host\x1b[0m\r\n');
                printLocalPrompt(term);
            }
        } else {
            term.write(`bash: ${cmd}: command not found\r\n`);
            printLocalPrompt(term);
        }
    };

    const connectToDotnetProxy = (host, user, pass, term) => {
        term.write(`\x1b[33mConnecting to ${user}@${host} via .NET Proxy...\x1b[0m\r\n`);

        // Sesuaikan PORT backend .NET Anda (misal localhost:5001)
        const wsUrl = `ws://localhost:5001/ws/ssh?host=${encodeURIComponent(host)}&user=${encodeURIComponent(user)}&pass=${encodeURIComponent(pass)}`;
        
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            connectionState.current = 'CONNECTED';
        };

        ws.onmessage = (event) => {
            // Terima stream output dari .NET -> Tampilkan di Xterm
            term.write(event.data);
        };

        ws.onerror = () => {
            term.write('\r\n\x1b[31m[WebSocket / SSH Error]\x1b[0m\r\n');
        };

        ws.onclose = () => {
            term.write('\r\n\x1b[31mConnection closed.\x1b[0m\r\n');
            connectionState.current = 'DISCONNECTED';
            printLocalPrompt(term);
        };
    };

    return (
        <div className="p-4 bg-slate-950 rounded-lg">
            <div className="h-[500px] w-full" ref={terminalRef} />
        </div>
    );
}