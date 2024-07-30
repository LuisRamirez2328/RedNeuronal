import React, { useRef, useState } from 'react';

const CameraComponent = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [predictedClass, setPredictedClass] = useState(null);
  const [historyText, setHistoryText] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      videoRef.current.srcObject = stream;
      setCameraActive(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  };

  const takePhoto = async () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, 640, 480);
    const dataURL = canvas.toDataURL('image/jpeg');

    const blob = await (await fetch(dataURL)).blob();

    const formData = new FormData();
    formData.append('image', blob, 'image.jpg');

    try {
      const response = await fetch('http://localhost:5001/predict', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      setPredictedClass(data.predicted_class);
      if (data.history_text) {
        setHistoryText(data.history_text);
      } else {
        setHistoryText(null);
      }
      console.log(data);
    } catch (error) {
      console.error('Error sending image to server:', error);
    }
  };

  return (
    <>
      <div className='bg-[#181818] h-[100vh]'>
        <div className='flex flex-col items-center'>

          <div className='flex justify-center'>
            {!cameraActive && (
              <button className='p-3 mt-6 text-white font-semibold bg-[#FF8C00] rounded-lg hover:bg-[#e07a00]' onClick={startCamera}>Activar Cámara</button>
            )}
          </div>
        </div>

        <div className='flex flex-row items-center justify-center mt-9 space-x-12'>
          <video ref={videoRef} autoPlay muted style={{ width: '100%', maxWidth: '640px', display: cameraActive ? 'block' : 'none' }} className='rounded-3xl mb-5'></video>
          <canvas ref={canvasRef} style={{ display: 'none' }} width="640" height="480"></canvas>
          {cameraActive && (
            <button className='p-3 text-white font-semibold bg-[#FF8C00]  hover:bg-[#e07a00] mb-5 rounded-3xl ' style={{ width: '640px', height: '480px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={takePhoto}>Detectar Productos</button>
          )}
        </div>

        {cameraActive && (
          <div className='flex flex-col items-center mx-12'>
            <div className='bg-[#2c2c2c] rounded-3xl p-5 w-full text-center'>
              <h1 className='text-[#FF8C00] text-6xl font-semibold mb-8 capitalize'>Producto {predictedClass}</h1>
              {historyText && <h1 className='text-white text-xl font-medium text-left'>{historyText}</h1>}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CameraComponent;