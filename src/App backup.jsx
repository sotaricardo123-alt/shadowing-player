import { useEffect, useRef, useState } from "react";

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  // 添加音频数据引用
  const audioDataRef = useRef(null);
  const audioDurationRef = useRef(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const [videoSrc, setVideoSrc] = useState(null);
  const [playbackRate, setPlaybackRate] = useState(1);

  const [pointA, setPointA] = useState(null);
  const [pointB, setPointB] = useState(null);
  const [loopEnabled, setLoopEnabled] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [audioSrc, setAudioSrc] = useState(null);

  const [audioBuffer, setAudioBuffer] = useState(null);
  
  // 添加快捷键状态提示
  const [showShortcutHint, setShowShortcutHint] = useState(false);

  /* ======================
     播放速度
  ====================== */
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  /* ======================
     A–B Loop
  ====================== */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      if (
        loopEnabled &&
        pointA !== null &&
        pointB !== null &&
        video.currentTime >= pointB
      ) {
        video.currentTime = pointA;
        video.play();
      }
    };

    video.addEventListener("timeupdate", onTimeUpdate);
    return () => video.removeEventListener("timeupdate", onTimeUpdate);
  }, [loopEnabled, pointA, pointB]);

  /* ======================
     画音频波形 + 点击跳转 + 循环区高亮
  ====================== */
  useEffect(() => {
    if (!audioBuffer || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const data = audioBuffer.getChannelData(0);
    
    // 保存音频数据用于计算时间
    audioDataRef.current = data;
    audioDurationRef.current = audioBuffer.duration;

    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制背景
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 如果有A-B点，绘制循环区高亮
    if (pointA !== null && pointB !== null && pointA < pointB) {
      const xA = (pointA / audioDurationRef.current) * canvas.width;
      const xB = (pointB / audioDurationRef.current) * canvas.width;
      
      // 绘制高亮背景
      ctx.fillStyle = loopEnabled ? "rgba(76, 175, 80, 0.2)" : "rgba(100, 100, 100, 0.2)";
      ctx.fillRect(xA, 0, xB - xA, canvas.height);
      
      // 绘制边界线
      ctx.strokeStyle = loopEnabled ? "#4caf50" : "#666";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(xA, 0);
      ctx.lineTo(xA, canvas.height);
      ctx.moveTo(xB, 0);
      ctx.lineTo(xB, canvas.height);
      ctx.stroke();
    }
    
    // 绘制波形
    ctx.strokeStyle = "#4caf50";
    ctx.lineWidth = 2;
    ctx.beginPath();

    const step = Math.floor(data.length / canvas.width);
    const mid = canvas.height / 2;

    for (let i = 0; i < canvas.width; i++) {
      const sample = data[i * step] || 0;
      const y = mid - sample * mid * 0.8;
      if (i === 0) {
        ctx.moveTo(i, y);
      } else {
        ctx.lineTo(i, y);
      }
    }

    ctx.stroke();
    
    // 绘制当前播放位置指示器
    if (videoRef.current && audioDurationRef.current > 0) {
      const currentTime = videoRef.current.currentTime;
      const x = (currentTime / audioDurationRef.current) * canvas.width;
      
      ctx.strokeStyle = "#ff4444";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
      
      // 绘制指示器三角形
      ctx.fillStyle = "#ff4444";
      ctx.beginPath();
      ctx.moveTo(x - 5, 5);
      ctx.lineTo(x + 5, 5);
      ctx.lineTo(x, 15);
      ctx.closePath();
      ctx.fill();
    }
    
    // 绘制A/B点标记
    if (pointA !== null) {
      const xA = (pointA / audioDurationRef.current) * canvas.width;
      drawMarker(ctx, xA, "A", loopEnabled ? "#4caf50" : "#ff4444");
    }
    
    if (pointB !== null) {
      const xB = (pointB / audioDurationRef.current) * canvas.width;
      drawMarker(ctx, xB, "B", loopEnabled ? "#4caf50" : "#44aaff");
    }

  }, [audioBuffer, pointA, pointB, loopEnabled]);

  // 绘制标记点
  const drawMarker = (ctx, x, label, color) => {
    // 绘制阴影效果
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 5;
    ctx.shadowOffsetY = 2;
    
    // 绘制标记圆
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, 30, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // 重置阴影
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    
    // 绘制标签
    ctx.fillStyle = "#fff";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x, 30);
    
    // 绘制时间标签
    const time = (x / canvasRef.current.width) * audioDurationRef.current;
    ctx.font = "10px Arial";
    ctx.fillText(formatTime(time), x, 50);
  };

  /* ======================
     快捷键支持
  ====================== */
  useEffect(() => {
    const handleKeyDown = (e) => {
      // 防止快捷键触发输入框等元素
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      const video = videoRef.current;
      if (!video) return;
      
      switch (e.key.toLowerCase()) {
        case ' ': // 空格键 - 播放/暂停
          e.preventDefault();
          video.paused ? video.play() : video.pause();
          setShowShortcutHint(false);
          break;
          
        case 'arrowleft': // 左箭头 - 后退5秒
          e.preventDefault();
          video.currentTime = Math.max(0, video.currentTime - 5);
          break;
          
        case 'arrowright': // 右箭头 - 前进5秒
          e.preventDefault();
          video.currentTime = Math.min(video.duration, video.currentTime + 5);
          break;
          
        case 'arrowup': // 上箭头 - 加快速度
          e.preventDefault();
          const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
          const currentIndex = speeds.indexOf(playbackRate);
          if (currentIndex < speeds.length - 1) {
            setPlaybackRate(speeds[currentIndex + 1]);
          }
          break;
          
        case 'arrowdown': // 下箭头 - 减慢速度
          e.preventDefault();
          const speedsDown = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
          const currentIndexDown = speedsDown.indexOf(playbackRate);
          if (currentIndexDown > 0) {
            setPlaybackRate(speedsDown[currentIndexDown - 1]);
          }
          break;
          
        case 'a': // A键 - 设置A点
          if (e.ctrlKey || e.metaKey) break; // 防止Ctrl+A全选
          e.preventDefault();
          setPointA(video.currentTime);
          showTempHint("A点已设置");
          break;
          
        case 'b': // B键 - 设置B点
          e.preventDefault();
          setPointB(video.currentTime);
          showTempHint("B点已设置");
          break;
          
        case 'l': // L键 - 切换循环
          e.preventDefault();
          if (pointA !== null && pointB !== null) {
            setLoopEnabled(!loopEnabled);
            showTempHint(loopEnabled ? "循环已关闭" : "循环已开启");
          }
          break;
          
        case 'c': // C键 - 清除循环点
          e.preventDefault();
          setPointA(null);
          setPointB(null);
          setLoopEnabled(false);
          showTempHint("循环点已清除");
          break;
          
        case 'r': // R键 - 开始/停止录音
          e.preventDefault();
          if (!isRecording) {
            startRecording();
            showTempHint("开始录音");
          } else {
            stopRecording();
            showTempHint("停止录音");
          }
          break;
          
        case 'f': // F键 - 显示快捷键提示
          e.preventDefault();
          setShowShortcutHint(!showShortcutHint);
          break;
          
        case 'escape': // ESC键 - 隐藏提示
          setShowShortcutHint(false);
          break;
      }
    };
    
    // 显示临时提示
    const showTempHint = (message) => {
      setShowShortcutHint(true);
      setTimeout(() => {
        setShowShortcutHint(false);
      }, 1500);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [playbackRate, pointA, pointB, loopEnabled, isRecording]);

  /* ======================
     处理波形点击
  ====================== */
  const handleWaveformClick = (e) => {
    if (!audioDurationRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const canvasX = (clickX / rect.width) * canvas.width;
    
    // 计算点击位置对应的时间
    const clickTime = (canvasX / canvas.width) * audioDurationRef.current;
    
    if (videoRef.current) {
      videoRef.current.currentTime = clickTime;
      videoRef.current.play();
    }
    
    // 如果按住Shift键，设置A点；按住Ctrl键，设置B点
    if (e.shiftKey) {
      setPointA(clickTime);
      showTempHint("A点已设置");
    } else if (e.ctrlKey) {
      setPointB(clickTime);
      showTempHint("B点已设置");
    }
  };

  // 显示临时提示（需要在组件内部定义）
  const showTempHint = (message) => {
    setShowShortcutHint(message);
    setTimeout(() => {
      setShowShortcutHint(false);
    }, 1500);
  };

  /* ======================
     拖拽A/B点
  ====================== */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isDragging = false;
    let dragTarget = null; // 'A' 或 'B'

    const onMouseDown = (e) => {
      if (!pointA && !pointB) return;
      
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const canvasX = (clickX / rect.width) * canvas.width;
      
      // 计算点击位置对应的时间
      const clickTime = (canvasX / canvas.width) * audioDurationRef.current;
      
      // 检查是否点击在A点附近
      if (pointA !== null) {
        const xA = (pointA / audioDurationRef.current) * canvas.width;
        if (Math.abs(canvasX - xA) < 15) {
          isDragging = true;
          dragTarget = 'A';
          canvas.style.cursor = 'grabbing';
          return;
        }
      }
      
      // 检查是否点击在B点附近
      if (pointB !== null) {
        const xB = (pointB / audioDurationRef.current) * canvas.width;
        if (Math.abs(canvasX - xB) < 15) {
          isDragging = true;
          dragTarget = 'B';
          canvas.style.cursor = 'grabbing';
          return;
        }
      }
    };

    const onMouseMove = (e) => {
      if (!isDragging || !audioDurationRef.current) return;
      
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const canvasX = (mouseX / rect.width) * canvas.width;
      
      // 限制在画布范围内
      const clampedX = Math.max(0, Math.min(canvasX, canvas.width));
      const newTime = (clampedX / canvas.width) * audioDurationRef.current;
      
      if (dragTarget === 'A') {
        setPointA(newTime);
      } else if (dragTarget === 'B') {
        setPointB(newTime);
      }
    };

    const onMouseUp = () => {
      isDragging = false;
      dragTarget = null;
      if (canvas) {
        canvas.style.cursor = 'pointer';
      }
    };

    // 鼠标悬停效果
    const onMouseOver = (e) => {
      if (!pointA && !pointB) return;
      
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const canvasX = (mouseX / rect.width) * canvas.width;
      
      let nearMarker = false;
      
      if (pointA !== null) {
        const xA = (pointA / audioDurationRef.current) * canvas.width;
        if (Math.abs(canvasX - xA) < 15) {
          nearMarker = true;
        }
      }
      
      if (pointB !== null) {
        const xB = (pointB / audioDurationRef.current) * canvas.width;
        if (Math.abs(canvasX - xB) < 15) {
          nearMarker = true;
        }
      }
      
      if (canvas) {
        canvas.style.cursor = nearMarker ? 'grab' : 'pointer';
      }
    };

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseOver);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mousemove', onMouseOver);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [pointA, pointB]);

  /* ======================
     录音
  ====================== */
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });
      const mediaRecorder = new MediaRecorder(stream);

      audioChunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioSrc(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("录音失败:", err);
      alert("无法访问麦克风，请检查权限设置");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  /* ======================
     文件上传
  ====================== */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setVideoSrc(URL.createObjectURL(file));
    setPointA(null);
    setPointB(null);
    setLoopEnabled(false);
    setAudioSrc(null);

    const audioCtx = new AudioContext();
    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const buffer = await audioCtx.decodeAudioData(reader.result);
        setAudioBuffer(buffer);
      } catch (err) {
        console.error("音频解码失败:", err);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  /* ======================
     UI
  ====================== */
  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }} tabIndex={0}>
      <h1>Shadowing Practice Player</h1>
      
      {/* 快捷键提示框 */}
      {showShortcutHint && typeof showShortcutHint === 'string' ? (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#4caf50',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '5px',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          animation: 'fadeIn 0.3s'
        }}>
          {showShortcutHint}
        </div>
      ) : null}

      <input
        type="file"
        accept="video/*,audio/*"
        onChange={handleFileChange}
        style={{ marginBottom: '10px' }}
      />
      
      {/* 快捷键帮助按钮 */}
      <button
        onClick={() => setShowShortcutHint(true)}
        style={{
          marginLeft: '10px',
          padding: '5px 10px',
          background: '#666',
          color: 'white',
          border: 'none',
          borderRadius: '3px',
          cursor: 'pointer'
        }}
      >
        📋 快捷键帮助
      </button>

      <br /><br />

      {videoSrc && (
        <>
          <div
            style={{
              width: "720px",
              maxWidth: "100%",
              aspectRatio: "16 / 9",
              background: "#000",
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "8px",
              overflow: "hidden"
            }}
          >
            <video
              ref={videoRef}
              src={videoSrc}
              controls
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          </div>

          {/* 波形图 */}
          <div style={{ position: 'relative' }}>
            <canvas
              ref={canvasRef}
              width={720}
              height={180}
              style={{
                width: "100%",
                background: "#111",
                marginBottom: 10,
                cursor: "pointer",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
              }}
              onClick={handleWaveformClick}
              title="点击跳转到对应时间 | Shift+点击设置A点 | Ctrl+点击设置B点"
            />
            
            {/* 时间刻度 */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '-10px',
              color: '#888',
              fontSize: '12px',
            }}>
              <span>0:00</span>
              <span>{audioDurationRef.current ? formatTime(audioDurationRef.current / 2) : '0:00'}</span>
              <span>{audioDurationRef.current ? formatTime(audioDurationRef.current) : '0:00'}</span>
            </div>
          </div>
          
          {/* 操作提示 */}
          <div style={{
            fontSize: '12px',
            color: '#666',
            marginBottom: '20px',
            padding: '10px',
            background: '#f5f5f5',
            borderRadius: '6px',
            borderLeft: '4px solid #4caf50'
          }}>
            💡 <strong>操作提示：</strong>
            点击波形跳转 | 拖动A/B点调整位置 | 
            Shift+点击设置A点 | Ctrl+点击设置B点 | 
            按 <kbd>F</kbd> 显示所有快捷键
          </div>
        </>
      )}

      {/* 倍速 */}
      <div style={{ marginBottom: '20px' }}>
        <strong>🎚️ Playback Speed:</strong>{" "}
        {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
          <button
            key={rate}
            onClick={() => setPlaybackRate(rate)}
            style={{
              margin: '0 4px',
              padding: '6px 12px',
              background: playbackRate === rate ? "#4caf50" : "#eee",
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: playbackRate === rate ? 'bold' : 'normal'
            }}
          >
            {rate}x
          </button>
        ))}
        <span style={{ marginLeft: '10px', color: '#666', fontSize: '14px' }}>
          当前: <strong>{playbackRate}x</strong> | 使用 <kbd>↑</kbd> <kbd>↓</kbd> 调整
        </span>
      </div>

      {/* A-B */}
      <div style={{
        marginBottom: '20px',
        padding: '15px',
        background: loopEnabled ? 'rgba(76, 175, 80, 0.1)' : '#f9f9f9',
        borderRadius: '8px',
        border: `2px solid ${loopEnabled ? '#4caf50' : '#ddd'}`
      }}>
        <strong>🔁 A–B Loop:</strong>
        <div style={{ marginTop: '10px' }}>
          <button 
            onClick={() => setPointA(videoRef.current?.currentTime)}
            style={{ marginRight: '8px' }}
          >
            Set A (<kbd>A</kbd>)
          </button>
          <button 
            onClick={() => setPointB(videoRef.current?.currentTime)}
            style={{ marginRight: '8px' }}
          >
            Set B (<kbd>B</kbd>)
          </button>
          <button
            onClick={() => setLoopEnabled(!loopEnabled)}
            disabled={pointA === null || pointB === null}
            style={{ 
              marginRight: '8px',
              background: loopEnabled ? '#ff4444' : '#4caf50',
              color: 'white'
            }}
          >
            {loopEnabled ? "Stop Loop" : "Start Loop"} (<kbd>L</kbd>)
          </button>
          <button
            onClick={() => {
              setPointA(null);
              setPointB(null);
              setLoopEnabled(false);
            }}
            style={{ 
              background: "#666", 
              color: "white",
              marginRight: '8px'
            }}
          >
            Clear (<kbd>C</kbd>)
          </button>
        </div>
        
        <div style={{ marginTop: '12px', fontSize: '14px', color: loopEnabled ? '#4caf50' : '#666' }}>
          <strong>
            A: {pointA?.toFixed(2) ?? "--"}s | 
            B: {pointB?.toFixed(2) ?? "--"}s | 
            时长: {pointA !== null && pointB !== null ? Math.abs(pointB - pointA).toFixed(2) + "s" : "--"} |
            状态: {loopEnabled ? "✅ 循环中" : "⏸️ 未循环"}
          </strong>
        </div>
      </div>

      <hr />

      {/* 录音 */}
      <div style={{
        padding: '15px',
        background: isRecording ? 'rgba(255, 68, 68, 0.1)' : '#f9f9f9',
        borderRadius: '8px'
      }}>
        <strong>🎤 Recording:</strong>
        <div style={{ marginTop: '10px' }}>
          {!isRecording ? (
            <button 
              onClick={startRecording}
              style={{
                padding: '10px 20px',
                background: '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              ▶ Start Recording (<kbd>R</kbd>)
            </button>
          ) : (
            <button 
              onClick={stopRecording}
              style={{
                padding: '10px 20px',
                background: '#ff4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                animation: 'pulse 1s infinite'
              }}
            >
              ● Stop Recording (<kbd>R</kbd>)
            </button>
          )}

          {audioSrc && (
            <div style={{ marginTop: 15 }}>
              <strong>Your Recording:</strong>
              <div style={{ marginTop: '10px' }}>
                <audio src={audioSrc} controls style={{ width: '100%' }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 快捷键帮助弹窗 */}
      {showShortcutHint === true && (
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }} onClick={() => setShowShortcutHint(false)}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '12px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }} onClick={e => e.stopPropagation()}>
            <h2>🎮 快捷键帮助</h2>
            <button
              onClick={() => setShowShortcutHint(false)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
            
            <div style={{ marginTop: '20px' }}>
              <h3>🎥 视频控制</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li><kbd>空格键</kbd> - 播放/暂停</li>
                <li><kbd>←</kbd> - 后退5秒</li>
                <li><kbd>→</kbd> - 前进5秒</li>
                <li><kbd>↑</kbd> - 加快播放速度</li>
                <li><kbd>↓</kbd> - 减慢播放速度</li>
              </ul>
              
              <h3>🔁 A-B循环</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li><kbd>A</kbd> - 设置A点（当前播放位置）</li>
                <li><kbd>B</kbd> - 设置B点（当前播放位置）</li>
                <li><kbd>L</kbd> - 开始/停止循环</li>
                <li><kbd>C</kbd> - 清除所有循环点</li>
              </ul>
              
              <h3>🎤 录音功能</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li><kbd>R</kbd> - 开始/停止录音</li>
              </ul>
              
              <h3>🖱️ 鼠标操作</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li>点击波形图任意位置 - 跳转到对应时间</li>
                <li><kbd>Shift</kbd> + 点击波形 - 设置A点</li>
                <li><kbd>Ctrl</kbd> + 点击波形 - 设置B点</li>
                <li>拖动A/B点标记 - 调整循环位置</li>
              </ul>
              
              <h3>📋 其他</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li><kbd>F</kbd> - 显示/隐藏此帮助</li>
                <li><kbd>ESC</kbd> - 隐藏所有提示</li>
              </ul>
            </div>
            
            <div style={{
              marginTop: '20px',
              padding: '10px',
              background: '#f0f0f0',
              borderRadius: '6px',
              fontSize: '14px',
              color: '#666'
            }}>
              💡 提示：点击弹窗外区域或按ESC键关闭此窗口
            </div>
          </div>
        </div>
      )}

      {/* 添加CSS动画 */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        kbd {
          display: inline-block;
          padding: 2px 6px;
          font-family: monospace;
          font-size: 12px;
          background: #333;
          color: white;
          border-radius: 3px;
          margin: 0 2px;
          box-shadow: 0 2px 0 #000;
        }
        
        button:hover {
          opacity: 0.9;
          transform: translateY(-1px);
          transition: all 0.2s;
        }
        
        button:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}

// 格式化时间显示
const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default App;