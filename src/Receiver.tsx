import { useCallback, useState, useMemo, useRef } from "react";
import Peer, { MediaConnection } from "skyway-js";

const VIDEO_URL =
  "https://media.istockphoto.com/id/1349332638/ja/%E3%83%93%E3%83%87%E3%82%AA/%E7%B4%AB%E8%89%B2%E3%81%AE%E3%83%89%E3%83%83%E3%83%88%E3%81%8C%E7%B4%AB%E8%89%B2%E3%81%AE%E6%8A%BD%E8%B1%A1%E7%9A%84%E3%81%AA%E5%85%89%E6%B2%A2%E3%81%AE%E3%81%82%E3%82%8B%E5%8B%95%E3%81%8D%E3%81%AE%E8%83%8C%E6%99%AF.mp4?s=mp4-640x640-is&k=20&c=nu2nvSycF0101l2H11sDcaGPLinkzd2vS4x3Ij2YVds=";

const Receiver = (props: { apikey: string }) => {
  const { apikey } = props;
  const [started, setStarted] = useState(false);
  const [peer, setPeer] = useState<Peer | undefined>();
  const [peerId, setPeerId] = useState<string | undefined>(undefined);
  const [errorMsg, setErrorMsg] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);

  // skyway: callイベント
  const onCall = useCallback(
    (call: MediaConnection) => {
      console.log("peer called.");
      call.answer();
      call.on("stream", (stream: MediaStream) => {
        if (videoRef.current) {
          videoRef.current.src = "";
          videoRef.current.srcObject = stream;
          console.log("start stream:", stream);
        }
      });
    },
    [videoRef]
  );

  // skyway: openイベント
  const onOpen = useCallback(
    (peerId: string) => {
      console.log("peer open:", peerId);
      setPeerId(peerId);
    },
    [setPeerId]
  );

  // 停止
  const onStop = useCallback(() => {
    setStarted(false);
    setErrorMsg("");

    // peerを破棄
    peer?.destroy();
    peer?.off("open", onOpen);
    peer?.off("call", onCall);
    setPeer(undefined);
    setPeerId("");
    if (videoRef.current) {
      videoRef.current.src = VIDEO_URL;
      videoRef.current.srcObject = null;
    }
  }, [setStarted, peer, setPeerId, setErrorMsg, onOpen, onCall, videoRef]);

  // 開始
  const onStart = useCallback(() => {
    setStarted(true);
    try {
      // peerを作成
      const newPeer = new Peer({
        key: apikey,
        //debug: 3,
      });
      setPeer(newPeer);
      newPeer.on("open", onOpen);
      newPeer.on("call", onCall);
    } catch (e: any) {
      console.error("failed to create peer.");
      console.error(e);
      setErrorMsg("failed to create peer.");
    }
  }, [setPeer, setErrorMsg, onOpen, onCall, apikey]);

  // 開始・停止ボタン
  const toggle = useCallback(() => {
    !started ? onStart() : onStop();
  }, [started, onStop, onStart]);

  // 接続中のPeerID
  const connectedState = useMemo(() => {
    return peerId ? <p>PeerID: {peerId}</p> : null;
  }, [peerId]);

  return (
    <div>
      <div>
        <button onClick={toggle} disabled={apikey.length === 0}>
          {started ? "STOP" : "START"}
        </button>
        {connectedState}
        <p style={{ color: "red" }}>{errorMsg}</p>
      </div>
      <div>
        <video
          ref={videoRef}
          src={VIDEO_URL}
          autoPlay
          muted
          loop
          playsInline
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </div>
  );
};

export default Receiver;
