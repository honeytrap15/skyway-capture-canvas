import { useRef, useCallback, useState, useMemo, ChangeEvent } from "react";
import Peer, { PeerError } from "skyway-js";

const Sender = (props: { apikey: string }) => {
  const { apikey } = props;
  const [started, setStarted] = useState(false);
  const [intervalId, setIntervalId] = useState<number>(0);
  const [peer, setPeer] = useState<Peer | undefined>();
  const [peerId, setPeerId] = useState<string | undefined>("");
  const [targetPeerId, setTargetPeerId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const W = 32;
  const R = 500;

  let counter = useRef(0);

  const render = useCallback(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      // 背景
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      // 円
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.arc(
        ctx.canvas.width / 2 +
          R * Math.cos((counter.current % 628) / 100) -
          W / 2,
        ctx.canvas.height / 2 +
          R * Math.sin((counter.current % 628) / 100) -
          W / 2,
        W,
        0,
        360
      );
      ctx.fill();
      ctx.stroke();

      // 時刻
      const now = new Date();
      ctx.fillStyle = "white";
      ctx.font = "50px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(
        now.toLocaleTimeString(),
        ctx.canvas.width / 2,
        ctx.canvas.height / 2
      );

      counter.current += 628 / 100;
    }
  }, [canvasRef, counter]);

  // 停止
  const onStop = useCallback(() => {
    setStarted(false);
    setErrorMsg("");

    // 描画を停止
    clearInterval(intervalId);
    setIntervalId(0);

    // canvasをクリア
    window.requestAnimationFrame(() => {
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      }
    });

    // peerを破棄
    peer?.destroy();
    setPeer(undefined);
    setPeerId("");
  }, [setStarted, intervalId, setIntervalId, peer, setPeer, setPeerId]);

  // 開始
  const onStart = useCallback(() => {
    // 描画を開始
    const id = window.setInterval(() => {
      window.requestAnimationFrame(render);
    }, 10);
    setIntervalId(id);
    setStarted(true);
    setErrorMsg("");

    try {
      // peerを作成
      const newPeer = new Peer({
        key: apikey,
        //debug: 3,
      });

      // peerを保持
      setPeer(newPeer);
      newPeer.on("error", (err: PeerError) => {
        console.log(err.message);
        setErrorMsg(err.message);
      });

      newPeer.on("open", (peerId: string) => {
        console.log("peer open:", peerId);
        console.log("peer call to:", targetPeerId);

        // canvasのキャプチャストリームで通信を開始
        const stream = canvasRef.current?.captureStream(10);
        newPeer.call(targetPeerId, stream, {
          videoCodec: "VP9",
        });
      });
    } catch (e: any) {
      console.error("failed to create peer.");
      console.error(e);
      setErrorMsg("failed to create peer.");
    }
  }, [
    apikey,
    render,
    setErrorMsg,
    setIntervalId,
    setPeer,
    setStarted,
    targetPeerId,
  ]);

  // ボタン押下
  const toggle = useCallback(() => {
    !started ? onStart() : onStop();
  }, [started, onStart, onStop]);

  const connectedState = useMemo(() => {
    return peerId ? <p>PeerID: {peerId}</p> : null;
  }, [peerId]);

  return (
    <div>
      <div>
        <input
          type="text"
          placeholder="target peer id"
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setTargetPeerId(e.target.value)
          }
        />
      </div>
      <div>
        <button
          onClick={toggle}
          disabled={apikey.length === 0 || targetPeerId.length === 0}
        >
          {started ? "STOP" : "START"}
        </button>
        {connectedState}
        <p style={{ color: "red" }}>{errorMsg}</p>
      </div>
      <div>
        <canvas
          ref={canvasRef}
          width="1980"
          height="1280"
          style={{ width: "50%", height: "50%" }}
        />
      </div>
    </div>
  );
};

export default Sender;
