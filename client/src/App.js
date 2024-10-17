import React, { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
import io from 'socket.io-client';

const socket = io('https://studious-space-guacamole-jjrrww759w5ghpvpx-5000.app.github.dev',{
  transports: ['websocket'],
});

function App() {
    const [peerId, setPeerId] = useState('');
    const [myStream, setMyStream] = useState(null);
    const [otherPeerId, setOtherPeerId] = useState('');
    const videoRef = useRef();
    const userVideoRef = useRef();
    const peer = useRef();

    useEffect(() => {

        peer.current = new Peer();

        peer.current.on('open', (id) => {
            setPeerId(id);
            console.log(`My peer ID: ${id}`);
        });

        peer.current.on('call', (call) => {
            if (myStream) {
                call.answer(myStream);
                call.on('stream', (remoteStream) => {
                    videoRef.current.srcObject = remoteStream;
                });
            }
        });

        socket.on('start-call', (data) => {
            setOtherPeerId(data.to);
            if (myStream) {
                peer.current.call(data.to, myStream);
            }
        });

        return () => {
            peer.current.destroy();
        };
    }, [myStream]);

    const startStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setMyStream(stream);
            userVideoRef.current.srcObject = stream;
            socket.emit('join-lobby');
        } catch (error) {
            console.error('Error accessing media devices.', error);
        }
    };

    return (
        <div>
            <h1>Peer ID: {peerId}</h1>
            <button onClick={startStream}>Start Video</button>
            <video ref={userVideoRef} autoPlay playsInline muted />
            <video ref={videoRef} autoPlay playsInline />
        </div>
    );
}

export default App;
