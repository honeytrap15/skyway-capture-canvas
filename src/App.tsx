import { useRef, useCallback, useState, ChangeEvent } from 'react';
import './App.css';
import Receiver from './Receiver';
import Sender from './Sender';


function App() {
  const [apikey, setApiKey] = useState("");
  const [role, setRole] = useState("");

  return (
    <div className="App">
      <div>
        <input
          type="text"
          placeholder="skyway apikey"
          onChange={ (e: ChangeEvent<HTMLInputElement>) => setApiKey(e.target.value) }
        />
      </div>

      <div>
        <input
          id="receiver"
          type="radio"
          name="role"
          value="1"
          onChange={ (e: ChangeEvent<HTMLInputElement>) => setRole(e.target.value) }
        />
        <label htmlFor="receiver">Receiver</label>

        <input
          id="sender"
          type="radio"
          name="role"
          value="2"
          onChange={ (e: ChangeEvent<HTMLInputElement>) => setRole(e.target.value) }
        />
        <label htmlFor="sender">Sender</label>
      </div>

      <div>
        { role == "1" ? <Receiver apikey={apikey} /> : null }
        { role == "2" ? <Sender apikey={apikey} /> : null }
      </div>
    </div>
  );
}

export default App;
