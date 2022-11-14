import { useRef, useCallback, useState, ChangeEvent } from 'react';
import './App.css';
import Peer from 'skyway-js'

function App() {

  const [started, setStarted] = useState(false);
  const [intervalId, setIntervalId] = useState<number>(0);
  const [apikey, setApiKey] = useState("");
  const [peer, setPeer] = useState<Peer|undefined>();
  const [peerId, setPeerId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const W = 32;
  const R = 500;

  let counter = useRef(0);

  const render = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      // 背景
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      // 円
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(
        ((ctx.canvas.width / 2) + (R * Math.cos((counter.current % 628) / 100))) - (W / 2),
        ((ctx.canvas.height / 2) + (R * Math.sin((counter.current % 628) / 100))) - (W / 2),
        W,
        0,
        360,
      );
      ctx.fill();
      ctx.stroke();

      // 時刻
      const now = new Date();
      ctx.fillStyle = 'white';
      ctx.font = '50px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(now.toLocaleTimeString(), ctx.canvas.width / 2, ctx.canvas.height / 2);
      
      counter.current += 628 / 100;
      const id = window.requestAnimationFrame(render);
      setIntervalId(id);
    }
  }, [canvasRef, counter, setIntervalId]);

  const onOpen = useCallback((peerId: string) => {
    console.log("peer open:", peerId);
  }, []);

  // 停止
  const onStop = useCallback(() => {
    setStarted(false);
    setErrorMsg("");

    // 描画を停止
    window.cancelAnimationFrame(intervalId);
    setIntervalId(0);

    // canvasをクリア
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    // peerを破棄
    peer?.destroy();
    peer?.off("open", onOpen);
    setPeer(undefined)
    setPeerId("");
  }, [setStarted, intervalId, setIntervalId, peer, setPeer, setPeerId]);

  // 開始
  const onStart = useCallback(() => {
    // 描画を開始
    const id = window.requestAnimationFrame(render);
    setIntervalId(id);
    setStarted(true);

    // peerを作成
    try {
      const newPeerId = Math.floor(Math.random() * 1000000)
      const newPeer = new Peer(`${newPeerId}`, {
        key: apikey,
      });
      newPeer.on("open", onOpen);
      console.log("create peer:", newPeerId);
      // peerを保持
      setPeer(newPeer);
      setPeerId(`${newPeerId}`);
    } catch (e: any) {
      console.error("failed to create peer.");
      console.error(e);
      setErrorMsg("failed to create peer.");
    }
  }, [setIntervalId, setStarted, setPeer, setPeerId, setErrorMsg, onStop]);

  // ボタン押下
  const toggle = useCallback(() => {
    !started ? onStart() : onStop();
  }, [started, onStart, onStop]);

  return (
    <div className="App">
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div>
          <input type="text" placeholder="skyway apikey" onChange={ (e: ChangeEvent<HTMLInputElement>) => setApiKey(e.target.value) } readOnly={started} />
        </div>
        <div>
          <button onClick={toggle} disabled={apikey.length == 0}>{ started ? 'STOP' : 'START' }</button>
        </div>
      </div>
      <div>
        <p style={{ color: "red" }}>{ errorMsg }</p>
      </div>
      <div>
        <canvas ref={canvasRef} width="1980" height="1280" style={{ width: '50%', height: '50%'}} />
      </div>
    </div>
  );
}

export default App;
