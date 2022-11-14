import { useRef, useCallback, useState, useMemo, ChangeEvent } from 'react';
import Peer from 'skyway-js';


export default (props: { apikey: string }) => {
  const VIDEO_URL = "https://media.istockphoto.com/id/1349332638/ja/%E3%83%93%E3%83%87%E3%82%AA/%E7%B4%AB%E8%89%B2%E3%81%AE%E3%83%89%E3%83%83%E3%83%88%E3%81%8C%E7%B4%AB%E8%89%B2%E3%81%AE%E6%8A%BD%E8%B1%A1%E7%9A%84%E3%81%AA%E5%85%89%E6%B2%A2%E3%81%AE%E3%81%82%E3%82%8B%E5%8B%95%E3%81%8D%E3%81%AE%E8%83%8C%E6%99%AF.mp4?s=mp4-640x640-is&k=20&c=nu2nvSycF0101l2H11sDcaGPLinkzd2vS4x3Ij2YVds="
  const { apikey } = props;
  const [started, setStarted] = useState(false);
  const [peer, setPeer] = useState<Peer|undefined>();
  const [peerId, setPeerId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const onOpen = useCallback((peerId: string) => {
    console.log("peer open:", peerId);
  }, []);

  const toggle = useCallback(() => {
    if (started) {
      setStarted(false);
      setErrorMsg("");

      // peerを破棄
      peer?.destroy();
      peer?.off("open", onOpen);
      setPeer(undefined);
      setPeerId("");
    } else {
      setStarted(true);
      try {
        // peerを作成
        const newPeerId = Math.floor(Math.random() * 1000000)
        const newPeer = new Peer(`${newPeerId}`, {
          key: apikey
        });
        newPeer.on("open", onOpen);
        console.log("create peer:", newPeerId);
        setPeer(newPeer);
        setPeerId(`${newPeerId}`);
      } catch (e: any) {
        console.error("failed to create peer.");
        console.error(e);
        setErrorMsg("failed to create peer.");
      }
    }
  }, [started, apikey, setStarted, setPeer, setPeerId, setErrorMsg]);

  const connectedState = useMemo(() => {
    if (peerId.length == 0) {
      return null;
    } else {
      return (
        <p>PeerID: { peerId }</p>
      );
    }
  }, [peerId]);

  return (
    <div>
      <div>
        <button onClick={toggle} disabled={ apikey.length == 0}>
          { started ? 'STOP' : 'START' }
        </button>
        { connectedState }
        <p style={{ color: "red" }}>{ errorMsg }</p>
      </div>
      <div>
        <video src={VIDEO_URL} autoPlay muted loop />
      </div>
    </div>
  )
}
