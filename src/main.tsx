import React from "react";
import ReactDOM from "react-dom/client";
import { StarField } from ".";
import { StarColorObject } from "./types/StarColor";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <StarField
      followMouse={true}
      followContext={document.body}
      glow={false}
      trails={false}
      trailColor={{ r: 255, g: 255, b: 0 }}
      longerTrails={true}
      color={() =>
        ({
          r: Math.floor((Math.sin(Date.now() / 1000) + 1) * 128),
          g: Math.floor((Math.sin(Date.now() / 1000 + 2) + 1) * 128),
          b: Math.floor((Math.sin(Date.now() / 1000 + 4) + 1) * 128),
        } as StarColorObject)
      }
      minSpeed={1}
      maxSpeed={10}
    />
  </React.StrictMode>
);
