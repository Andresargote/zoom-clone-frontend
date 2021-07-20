import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const SERVER_URL = "http://localhost:4001";

let connections = {};

const peerConnectionConfig = {
  iceServers: [
    // { 'urls': 'stun:stun.services.mozilla.com' },
    { urls: "stun:stun.l.google.com:19302" },
  ],
};

let socket = null;
let socketId = null;
let elms = 0;

function Video() {
  const [localVideoref, setLocalVideoref] = useState(React.createRef());
  const [videoAvailable, setVideoAvailable] = useState(false);
  const [audioAvailable, setAudioAvailable] = useState(false);

  const [video, setVideo] = useState(false);
  const [audio, setAudio] = useState(false);
  const [screen, setScreen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [screenAvailable, setScreenAvailable] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [newMessages, setNewMessages] = useState(0);
  const [askForUsername, setAskForUsername] = useState(true);
  const [username, setUsername] = useState("");
  const [sender, setSender] = useState("");

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(() => {
        setVideoAvailable(true);
      })
      .catch(() => {
        setVideoAvailable(false);
      });
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(() => {
        setAudioAvailable(true);
      })
      .catch(() => {
        setAudioAvailable(false);
      });
    if (videoAvailable || audioAvailable) {
      navigator.mediaDevices
        .getUserMedia({
          video: videoAvailable,
          audio: audioAvailable,
        })
        .then((stream) => {
          console.log(stream);
          window.localStream = stream;
          setLocalVideoref((localVideoref.current.srcObject = stream));
        })
        .then((stream) => {})
        .catch((e) => console.log(e));
    }
  }, [videoAvailable, audioAvailable]);

/*   async function getPermissions() {
    try {
      await navigator.mediaDevices
        .getUserMedia({ video: true })
        .then(() => {
          setVideoAvailable(true);
        })
        .catch(() => {
          setVideoAvailable(false);
        });

      await navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(() => {
          setAudioAvailable(true);
        })
        .catch(() => {
          setAudioAvailable(false);
        });

      if (videoAvailable || audioAvailable) {
        navigator.mediaDevices
          .getUserMedia({
            video: videoAvailable,
            audio: audioAvailable,
          })
          .then((stream) => {
            console.log(stream);
            window.localStream = stream;
            setLocalVideoref((localVideoref.current.srcObject = stream));
          })
          .then((stream) => {})
          .catch((e) => console.log(e));
      }
    } catch (e) {
      console.log(e);
    }
  } */

  const getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);

    getUserMedia();
    connectToSocketServer();
  };

  const getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({ video: video, audio: audio })
        .then(() => getUserMediaSuceess())
        .then((stream) => {})
        .catch((e) => console.log(e));
    } else {
      try {
        console.log("Entro!!");
        let tracks = localVideoref.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      } catch (e) {}
    }
  };

  const getUserMediaSuceess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    setLocalVideoref((localVideoref.current.srcObject = stream));

    for (let id in connections) {
      if (id === socketId) continue;

      connections[id].addStream(window.localStream);

      connections[id].createOffer().then((description) => {
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socket.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription })
            );
          })
          .catch((e) => console.log(e));
      });
    }

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setVideo(false);
          setAudio(false);

          try {
            let tracks = this.localVideoref.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          } catch (e) {
            console.log(e);
          }

          let blackSilence = (...args) =>
            new MediaStream([this.black(...args), this.silence()]);
          window.localStream = blackSilence();
          this.localVideoref.current.srcObject = window.localStream;

          for (let id in connections) {
            connections[id].addStream(window.localStream);

            connections[id].createOffer().then((description) => {
              connections[id]
                .setLocalDescription(description)
                .then(() => {
                  socket.emit(
                    "signal",
                    id,
                    JSON.stringify({ sdp: connections[id].localDescription })
                  );
                })
                .catch((e) => console.log(e));
            });
          }
        })
    );
  };

  const getDisplayMedia = () => {
    if (screen) {
      if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices
          .getDisplayMedia({ video: true, audio: true })
          .then(getDisplayMediaSuccess)
          .then((stream) => {})
          .catch((e) => console.log(e));
      }
    }
  };

  const getDisplayMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    setLocalVideoref((localVideoref.current.srcObject = stream));

    for (let id in connections) {
      if (id === socketId) continue;

      connections[id].addStream(window.localStream);

      connections[id].createOffer().then((description) => {
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socket.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription })
            );
          })
          .catch((e) => console.log(e));
      });
    }

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setScreen(false);

          try {
            let tracks = this.localVideoref.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          } catch (e) {
            console.log(e);
          }

          let blackSilence = (...args) =>
            new MediaStream([this.black(...args), this.silence()]);
          window.localStream = blackSilence();
          setLocalVideoref(
            (localVideoref.current.srcObject = window.localStream)
          );

          getUserMedia();
        })
    );
  };

  const gotMessageFromServer = (fromId, message) => {
    let signal = JSON.parse(message);

    if (fromId !== socketId) {
      if (signal.sdp) {
        connections[fromId]
          .setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            if (signal.sdp.type === "offer") {
              connections[fromId]
                .createAnswer()
                .then((description) => {
                  connections[fromId]
                    .setLocalDescription(description)
                    .then(() => {
                      socket.emit(
                        "signal",
                        fromId,
                        JSON.stringify({
                          sdp: connections[fromId].localDescription,
                        })
                      );
                    })
                    .catch((e) => console.log(e));
                })
                .catch((e) => console.log(e));
            }
          })
          .catch((e) => console.log(e));
      }

      if (signal.ice) {
        connections[fromId]
          .addIceCandidate(new RTCIceCandidate(signal.ice))
          .catch((e) => console.log(e));
      }
    }
  };

  const changeCssVideos = (main) => {
    let widthMain = main.offsetWidth;
    let minWidth = "30%";
    if ((widthMain * 30) / 100 < 300) {
      minWidth = "300px";
    }
    let minHeight = "40%";

    let height = String(100 / elms) + "%";
    let width = "";
    if (elms === 0 || elms === 1) {
      width = "100%";
      height = "100%";
    } else if (elms === 2) {
      width = "45%";
      height = "100%";
    } else if (elms === 3 || elms === 4) {
      width = "35%";
      height = "50%";
    } else {
      width = String(100 / elms) + "%";
    }

    let videos = main.querySelectorAll("video");
    for (let a = 0; a < videos.length; ++a) {
      videos[a].style.minWidth = minWidth;
      videos[a].style.minHeight = minHeight;
      videos[a].style.setProperty("width", width);
      videos[a].style.setProperty("height", height);
    }

    return { minWidth, minHeight, width, height };
  };

  const connectToSocketServer = () => {
    socket = io.connect(SERVER_URL, { secure: true });

    socket.on("signal", gotMessageFromServer);

    socket.on("connect", () => {
      socket.emit("join-call", window.location.href);
      socketId = socket.id;

      socket.on("chat-message", addMessage);

      socket.on("user-left", (id) => {
        let video = document.querySelector(`[data-socket="${id}"]`);
        if (video !== null) {
          elms--;
          video.parentNode.removeChild(video);

          let main = document.getElementById("main");
          changeCssVideos(main);
        }
      });

      socket.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          connections[socketListId] = new RTCPeerConnection(
            peerConnectionConfig
          );
          // Wait for their ice candidate
          connections[socketListId].onicecandidate = function (event) {
            if (event.candidate != null) {
              socket.emit(
                "signal",
                socketListId,
                JSON.stringify({ ice: event.candidate })
              );
            }
          };

          // Wait for their video stream
          connections[socketListId].onaddstream = (event) => {
            // TODO mute button, full screen button
            let searchVidep = document.querySelector(
              `[data-socket="${socketListId}"]`
            );
            if (searchVidep !== null) {
              // if i don't do this check it make an empyt square
              searchVidep.srcObject = event.stream;
            } else {
              elms = clients.length;
              let main = document.getElementById("main");
              let cssMesure = changeCssVideos(main);

              let video = document.createElement("video");

              let css = {
                minWidth: cssMesure.minWidth,
                minHeight: cssMesure.minHeight,
                maxHeight: "100%",
                margin: "10px",
                borderStyle: "solid",
                borderColor: "#bdbdbd",
                objectFit: "fill",
              };
              for (let i in css) video.style[i] = css[i];

              video.style.setProperty("width", cssMesure.width);
              video.style.setProperty("height", cssMesure.height);
              video.setAttribute("data-socket", socketListId);
              video.srcObject = event.stream;
              video.autoplay = true;
              video.playsinline = true;

              main.appendChild(video);
            }
          };

          // Add the local video stream
          if (window.localStream !== undefined && window.localStream !== null) {
            connections[socketListId].addStream(window.localStream);
          } else {
            let blackSilence = (...args) =>
              new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            connections[socketListId].addStream(window.localStream);
          }
        });

        if (id === socketId) {
          for (let id2 in connections) {
            if (id2 === socketId) continue;

            try {
              connections[id2].addStream(window.localStream);
            } catch (e) {}

            connections[id2].createOffer().then((description) => {
              connections[id2]
                .setLocalDescription(description)
                .then(() => {
                  socket.emit(
                    "signal",
                    id2,
                    JSON.stringify({ sdp: connections[id2].localDescription })
                  );
                })
                .catch((e) => console.log(e));
            });
          }
        }
      });
    });
  };

  const silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();
    let dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };

  const black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), {
      width,
      height,
    });
    canvas.getContext("2d").fillRect(0, 0, width, height);
    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

  const handleVideo = () => {
    setVideo(!video);
    getUserMedia();
  };

  const handleAudio = () => {
    setAudio(!audio);
    getUserMedia();
  };

  const handleEndCall = () => {
    try {
      let tracks = this.localVideoref.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    } catch (e) {}
    window.location.href = "/";
  };

  const openChat = () => {
    setShowModal(true);
    setNewMessages(0);
  };

  const closeChat = () => {
    setShowModal(true);
  };

  const handleMessage = (e) => {
    setMessage(e.target.value);
  };

  const addMessage = (data, sender, socketIdSender) => {
    setMessages([...messages, { sender: sender, data: data }]);
    if (socketIdSender !== socketId) {
      setNewMessages(newMessages + 1);
    }
  };

  const handleUsername = (e) => {
    setUsername(e.target.value);
  };

  const sendMessage = () => {
    socket.emit("chat-message", message, username);
    setMessage("");
    setSender(username);
  };

  const connect = () => {
    setAskForUsername(false);
    getMedia();
  };

  const isChrome = () => {
    let userAgent = (navigator && (navigator.userAgent || "")).toLowerCase();
    let vendor = (navigator && (navigator.vendor || "")).toLowerCase();
    let matchChrome = /google inc/.test(vendor)
      ? userAgent.match(/(?:chrome|crios)\/(\d+)/)
      : null;
    // let matchFirefox = userAgent.match(/(?:firefox|fxios)\/(\d+)/)
    // return matchChrome !== null || matchFirefox !== null
    return matchChrome !== null;
  };

  return (
    <>
      {isChrome() === false && (
        <div
          style={{
            background: "white",
            width: "30%",
            height: "auto",
            padding: "20px",
            minWidth: "400px",
            textAlign: "center",
            margin: "auto",
            marginTop: "50px",
            justifyContent: "center",
          }}
        >
          <h1>Sorry, this works only with Google Chrome</h1>
        </div>
      )}

      {askForUsername === true ? (
        <div>
          <div
            style={{
              background: "white",
              width: "30%",
              height: "auto",
              padding: "20px",
              minWidth: "400px",
              textAlign: "center",
              margin: "auto",
              marginTop: "50px",
              justifyContent: "center",
            }}
          >
            <p style={{ margin: 0, fontWeight: "bold", paddingRight: "50px" }}>
              Set your username
            </p>
            <input
              placeholder="Username"
              value={username}
              onChange={(e) => handleUsername(e)}
            />
            <button
              variant="contained"
              color="primary"
              onClick={connect}
              style={{ margin: "20px" }}
            >
              Connect
            </button>
          </div>

          <div
            style={{
              justifyContent: "center",
              textAlign: "center",
              paddingTop: "40px",
            }}
          >
            <video
              id="my-video"
              ref={localVideoref}
              autoPlay
              muted
              style={{
                borderStyle: "solid",
                borderColor: "#bdbdbd",
                objectFit: "fill",
                width: "60%",
                height: "30%",
              }}
            ></video>
          </div>
        </div>
      ) : (
        <div>
          <div
            className="btn-down"
            style={{
              backgroundColor: "whitesmoke",
              color: "whitesmoke",
              textAlign: "center",
            }}
          >
            <button style={{ color: "#424242" }} onClick={handleVideo}>
              {video === true ? "Video prendido" : "Video apagado"}
            </button>

            <button style={{ color: "#f44336" }} onClick={handleEndCall}>
              Cerrar llamada
            </button>

            <button style={{ color: "#424242" }} onClick={handleAudio}>
              {audio === true ? "Microfono prendido" : "Microfono apagado"}
            </button>

            {/* {screenAvailable === true ?
								<button style={{ color: "#424242" }} onClick={this.handleScreen}>
									{this.state.screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon />}
								</button>
								: null} */}

            <div max={999} color="secondary" onClick={openChat}>
              {newMessages}
              <button style={{ color: "#424242" }} onClick={openChat}>
                Chat
              </button>
            </div>
          </div>

          {/* <Modal show={this.state.showModal} onHide={this.closeChat} style={{ zIndex: "999999" }}>
							<Modal.Header closeButton>
								<Modal.Title>Chat Room</Modal.Title>
							</Modal.Header>
							<Modal.Body style={{ overflow: "auto", overflowY: "auto", height: "400px", textAlign: "left" }} >
								{this.state.messages.length > 0 ? this.state.messages.map((item, index) => (
									<div key={index} style={{textAlign: "left"}}>
										<p style={{ wordBreak: "break-all" }}><b>{item.sender}</b>: {item.data}</p>
									</div>
								)) : <p>No message yet</p>}
							</Modal.Body>
							<Modal.Footer className="div-send-msg">
								<Input placeholder="Message" value={this.state.message} onChange={e => this.handleMessage(e)} />
								<Button variant="contained" color="primary" onClick={this.sendMessage}>Send</Button>
							</Modal.Footer>
						</Modal> */}

          {/* <div className="container">
							<div style={{ paddingTop: "20px" }}>
								<Input value={window.location.href} disable="true"></Input>
								<Button style={{backgroundColor: "#3f51b5",color: "whitesmoke",marginLeft: "20px",
									marginTop: "10px",width: "120px",fontSize: "10px"
								}} onClick={this.copyUrl}>Copy invite link</Button>
							</div>

						</div> */}
          <div
            id="main"
            className="flex-container"
            style={{ margin: 0, padding: 0 }}
          >
            <video
              id="my-video"
              ref={localVideoref}
              autoPlay
              muted
              style={{
                borderStyle: "solid",
                borderColor: "#bdbdbd",
                margin: "10px",
                objectFit: "fill",
                width: "100%",
                height: "100%",
              }}
            ></video>
          </div>
        </div>
      )}
    </>
  );
}

export default Video;
