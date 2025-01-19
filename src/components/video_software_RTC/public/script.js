// script.js

const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myPeer = new Peer(undefined, {
    host: '/',
    port: '3001'
});
const peers = {};
const myVideo = document.createElement('video');
myVideo.muted = true;
let isMuted = false;
let audioTrack;

const MAX_USERS = 2

// Function to create a video container with mute overlay
function createVideoContainer(video) {
    const container = document.createElement('div');
    container.classList.add('video-container');
    container.appendChild(video);

    const muteOverlay = document.createElement('img');
    muteOverlay.src = '/assets/mute.png'; // Update to the correct path
    muteOverlay.classList.add('mute-overlay');
    muteOverlay.style.display = 'none'; // Hidden by default

    container.appendChild(muteOverlay);
    return { container, muteOverlay };
}

// Function to add video streams to the grid
function addVideoStream(video, stream, userId) {
    const { container, muteOverlay } = createVideoContainer(video);
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });

    videoGrid.append(container);

    // Store reference to muteOverlay for this user
    if (userId) {
        peers[userId] = { video, muteOverlay };
    }

    return muteOverlay; // Return overlay for updates
}

socket.on('room-full', () => {
    alert('This call is full. You cannot join this call, at this time.')
    window.location.href = 'https://balls.com'
})

// Request user media
navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
    const muteOverlay = addVideoStream(myVideo, stream, 'self');

    audioTrack = stream.getAudioTracks()[0];

    // Handle mute button click
    const muteButton = document.getElementById('mute-button');
    muteButton.addEventListener('click', () => {
        if (audioTrack) {
            isMuted = !isMuted;
            audioTrack.enabled = !isMuted; // Toggle audio track
            muteOverlay.style.display = isMuted ? 'block' : 'none'; // Update local overlay
            muteButton.textContent = isMuted ? 'Unmute' : 'Mute'; // Update button text

            // Broadcast mute state change
            socket.emit('mute-state-changed', { userId: myPeer.id, isMuted });
        }
    });

    myPeer.on('call', call => {
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream, call.peer);
        });
    });

    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream);
    });

    socket.on('user-disconnected', userId => {
        if (peers[userId]) {
            peers[userId].video.parentElement.remove(); // Remove the container
            delete peers[userId];
        }
    });

    // Listen for mute state changes from other users
    socket.on('mute-state-changed', ({ userId, isMuted }) => {
        if (peers[userId]) {
            const { muteOverlay } = peers[userId];
            muteOverlay.style.display = isMuted ? 'block' : 'none'; // Update overlay
        }
    });
});

// Handle new user connections
function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream, userId);
    });
    call.on('close', () => {
        if (peers[userId]) {
            peers[userId].video.parentElement.remove(); // Remove the container
            delete peers[userId];
        }
    });

    peers[userId] = call;
}

// Notify server when the peer connection is ready
myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
});
