import { AnimLoopEngine } from "anim-loop-engine";
import { Star } from "../Star";
import { StarColorObject } from "../types/StarColor";

export type StarFieldOptions = {
  followMouse: boolean;
  followContext?: HTMLElement;
  color:
    | StarColorObject
    | ((x: number, y: number, z: number) => StarColorObject);
  glow: boolean;
  maxSpeed: number;
  minSpeed: number;
  numStars: number;
  trails: boolean;
  longerTrails: boolean;
  trailColor: StarColorObject;
};

export type StarFieldProps = {
  followMouse?: StarFieldOptions["followMouse"];
  followContext?: StarFieldOptions["followContext"];
  color?: StarFieldOptions["color"];
  glow?: StarFieldOptions["glow"];
  maxSpeed?: StarFieldOptions["maxSpeed"];
  minSpeed?: StarFieldOptions["minSpeed"];
  numStars?: StarFieldOptions["numStars"];
  trails?: StarFieldOptions["trails"];
  trailColor?: StarFieldOptions["trailColor"];
  longerTrails?: StarFieldOptions["longerTrails"];
};

const createStarFieldIntoCanvas = (
  canvas: HTMLCanvasElement,
  options: StarFieldOptions
) => {
  const engine = new StarFieldEngine(canvas, options);

  canvas.addEventListener("start-star-field", () => {
    engine.start();
  });

  canvas.addEventListener("stop-star-field", () => {
    engine.stop();
  });

  engine.start();

  return engine;
};

export const StarField = ({
  followMouse = false,
  followContext,
  color = { r: 255, g: 255, b: 255 },
  glow = false,
  maxSpeed = 5,
  minSpeed = 2,
  numStars = 400,
  trails = false,
  trailColor = { r: 255, g: 255, b: 255 },
  longerTrails = false,
}: StarFieldProps) => {
  return (
    <canvas
      style={{ backgroundColor: "black", width: "100dvw", height: "100dvh" }}
      ref={(ref) => {
        if (ref) {
          createStarFieldIntoCanvas(ref, {
            followMouse,
            followContext,
            color,
            glow,
            maxSpeed,
            minSpeed,
            numStars,
            trails,
            trailColor,
            longerTrails,
          });
        }
      }}
    ></canvas>
  );
};

class StarFieldEngine {
  private initialized: boolean = false;

  private canvasW: number = 0;
  private canvasH: number = 0;
  private canvasHalfW: number = 0;
  private canvasHalfH: number = 0;

  private offsetX: number = 0;
  private offsetY: number = 0;
  private offsetTargetX: number = 0;
  private offsetTargetY: number = 0;

  private stars: Star[] = [];

  private canvas: HTMLCanvasElement;
  private canvasRectLeft: number;
  private canvasRectTop: number;
  private canvas2dContext: CanvasRenderingContext2D;

  private engine: AnimLoopEngine;

  private resizeTimeout: number = 0;

  color:
    | StarColorObject
    | ((x: number, y: number, z: number) => StarColorObject);
  followContext: HTMLElement;
  glow: boolean;
  minSpeed: number;
  maxSpeed: number;
  numStars: number;
  trails: boolean;
  longerTrails: boolean;
  trailColor: StarColorObject;

  constructor(canvasElement: HTMLCanvasElement, opts: StarFieldOptions) {
    this.canvas = canvasElement;
    const canvas2dContext = this.canvas.getContext("2d");
    if (!canvas2dContext) {
      throw new Error("Could not get 2d context from canvas");
    }
    this.canvas2dContext = canvas2dContext;

    const rect = this.canvas.getBoundingClientRect();
    this.canvasRectLeft = rect.left;
    this.canvasRectTop = rect.top;

    // Assign follow context now that this.canvas was assigned
    this.followContext = opts.followContext ?? this.canvas;

    this.handleMouseMove = this.handleMouseMove.bind(this);

    // Set up animation engine
    this.engine = new AnimLoopEngine();
    this.engine.addTask(this.draw.bind(this));

    // Set up window events
    // Window blur/focus
    window.addEventListener("blur", () => {
      this.stop();
    });
    window.addEventListener("focus", () => {
      this.start();
    });

    // Window event - on resize to reinitialize canvas, all stars and animation
    window.addEventListener("resize", () => {
      clearTimeout(this.resizeTimeout);
      this.stop();
      this.resizeTimeout = setTimeout(() => {
        this.reset();
        this.start();
      }, 500);
    });

    // Did config set a number of stars?
    this.numStars = Math.abs(opts.numStars);

    this.trails = opts.trails;

    this.longerTrails = opts.longerTrails;

    this.trailColor = opts.trailColor;

    this.color = opts.color;

    this.glow = opts.glow;

    this.minSpeed = Math.abs(opts.minSpeed) || 1;

    this.maxSpeed = Math.abs(opts.maxSpeed) || 1;

    // Setup the canvas
    this.setupCanvas();

    // Gen new stars
    this.generateStars();

    this.initialized = true;

    // Did config enable mouse following?
    if (opts.followMouse) {
      this.setFollowMouse(true);
    }
  }

  // Generate n new stars
  private generateStars() {
    for (let i = 0; i < this.numStars; i++) {
      this.stars.push(
        new Star({
          canvas2dContext: this.canvas2dContext,
          W: this.canvasW,
          H: this.canvasH,
          hW: this.canvasHalfW,
          hH: this.canvasHalfH,
          minV: this.minSpeed,
          maxV: this.maxSpeed,
          color: this.color,
          glow: this.glow,
          trails: this.trails,
          longerTrails: this.longerTrails,
          trailColor: this.trailColor,
          addTasks: this.engine.addTasks,
        })
      );
    }
  }

  // Apply canvas container size to canvas and translate origin to center
  private setupCanvas() {
    const canvasStyle: CSSStyleDeclaration = window.getComputedStyle(
      this.canvas
    );

    this.canvas.setAttribute("height", canvasStyle.height);
    this.canvas.setAttribute("width", canvasStyle.width);

    // canvasH/W/canvasHalfH/W used here and set to use elsewhere
    this.canvasH = this.canvas.height;
    this.canvasW = this.canvas.width;
    this.canvasHalfH = this.canvasH / 2;
    this.canvasHalfW = this.canvasW / 2;

    this.canvas2dContext.translate(this.canvasHalfW, this.canvasHalfH);
  }

  // Draw the stars in this frame
  private draw() {
    // Adjust offsets closer to target offset
    if (this.offsetX !== this.offsetTargetX) {
      this.offsetX += (this.offsetTargetX - this.offsetX) * 0.02;
      this.offsetY += (this.offsetTargetY - this.offsetY) * 0.02;
    }

    // Clear the canvas ready for this frame
    this.canvas2dContext.clearRect(
      -this.canvasHalfW,
      -this.canvasHalfH,
      this.canvasW,
      this.canvasH
    );

    for (const i in this.stars) {
      this.stars[i].draw(this.offsetX, this.offsetY);
    }
  }

  // Follow mouse (used in event listener definition)
  private handleMouseMove(e: MouseEvent) {
    if (this.initialized) {
      this.offsetTargetX = e.clientX - this.canvasRectLeft - this.canvasHalfW;
      this.offsetTargetY = e.clientY - this.canvasRectTop - this.canvasHalfH;
    }
  }
  private resetMouseOffset() {
    this.offsetTargetX = 0;
    this.offsetTargetY = 0;
  }

  // Start/stop the StarField
  start() {
    this.engine.start();
  }
  stop() {
    this.engine.stop();
  }

  reset() {
    // Clear stars
    this.stars = [];

    // Reset canvas
    this.setupCanvas();

    // Gen new stars
    this.generateStars();
  }

  // "Hot"-updateable config values
  setMaxSpeed(val: number) {
    this.maxSpeed = Math.abs(val) || 1;
    this.reset();
  }

  setMinSpeed(val: number) {
    this.minSpeed = Math.abs(val) || 1;
    this.reset();
  }

  setNumStars(val: number) {
    this.numStars = Math.abs(val);
    this.reset();
  }

  setFollowMouse(val: boolean) {
    if (val) {
      this.followContext.addEventListener("mousemove", this.handleMouseMove);
    } else {
      this.followContext.removeEventListener("mousemove", this.handleMouseMove);
      this.resetMouseOffset();
    }
  }
}
