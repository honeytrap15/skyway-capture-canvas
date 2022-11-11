import { useRef, useCallback, useState } from 'react';
import './App.css';

function App() {

  const [started, setStarted] = useState(false);
  const [intervalId, setIntervalId] = useState<number>(0);
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

  const toggle = useCallback(() => {
    if (started) {
      window.clearInterval(intervalId);
      setIntervalId(0);
      setStarted(false);
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      }
      window.cancelAnimationFrame(intervalId);
      setIntervalId(0);
    } else {
      const id = window.requestAnimationFrame(render);
      setIntervalId(id);
      setStarted(true);
    }
  }, [intervalId, started, setIntervalId, setStarted, render]);

  return (
    <div className="App">
      <div>
        <button onClick={toggle}>{ started ? 'STOP' : 'START' }</button>
      </div>
      <div>
        <canvas ref={canvasRef} width="1980" height="1280" style={{ width: '50%', height: '50%'}} />
      </div>
    </div>
  );
}

export default App;
