// src/components/Canvas.jsx
import React, { useState, useEffect } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import io from "socket.io-client";
import debounce from "lodash/debounce"; // Add lodash for debouncing

const socket = io("https://collabcanvas-66mr.onrender.com");

const Canvas = () => {
  const [excalidrawAPI, setExcalidrawAPI] = useState(null);

  useEffect(() => {
    socket.on("connect", () => console.log("Connected to backend"));
    socket.on("connect_error", (err) =>
      console.error("Connection error:", err)
    );

    if (!excalidrawAPI) return;

    socket.on("canvas-update", (elements) => {
      excalidrawAPI.updateScene({ elements });
      console.log("Received canvas update:", elements);
    });

    return () => {
      socket.off("canvas-update");
      socket.off("connect");
      socket.off("connect_error");
    };
  }, [excalidrawAPI]);

  const debouncedUpdate = debounce((elements) => {
    socket.emit("canvas-update", elements);
    console.log("Sent canvas update:", elements);
  }, 100); // 100ms debounce

  const onChange = (elements) => {
    debouncedUpdate(elements);
  };

  return (
    <div style={{ height: "500px", border: "1px solid #ccc" }}>
      <Excalidraw
        initialData={{
          elements: [],
          appState: { viewBackgroundColor: "#ffffff" },
        }}
        onChange={onChange}
        excalidrawAPI={(api) => setExcalidrawAPI(api)}
        UIOptions={{ canvasActions: { multiplayer: false } }}
      />
    </div>
  );
};

export default Canvas;
