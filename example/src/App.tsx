import {useState} from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import {CryptoTerminalMVP} from "../../src";

function App() {
    const test = async () => {
        const device = new CryptoTerminalMVP();
        device.debug = true;
        const status = await device.connect();

        if (device.isConnected()) {
            console.log("deviceInfo", device.deviceInfo());
            console.log("getPayment", await device.getPayment());
            console.log("requestPayment", await device.requestPayment('https://www.youtube.com/watch?v=Kv3jSqfpWIU&ab_channel=DongfangHour'));
        } else {
            console.log("Not connected", status)
        }
    }


    return (
        <div className="App">
            <div>
                <a href="https://vitejs.dev" target="_blank">
                    <img src="/vite.svg" className="logo" alt="Vite logo"/>
                </a>
                <a href="https://reactjs.org" target="_blank">
                    <img src={reactLogo} className="logo react" alt="React logo"/>
                </a>
            </div>
            <h1>Vite + React</h1>
            <div className="card">
                {/*<button onClick={() => setCount((count) => count + 1)}>*/}
                <button onClick={test}>
                    Connect
                </button>
                <p>
                    Edit <code>src/App.tsx</code> and save to test HMR
                </p>
            </div>
            <p className="read-the-docs">
                Click on the Vite and React logos to learn more
            </p>
        </div>
    )
}

export default App
