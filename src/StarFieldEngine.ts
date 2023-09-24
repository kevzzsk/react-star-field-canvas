import { AnimLoopEngine } from "anim-loop-engine";
import { Star } from "./Star";
import { StarFieldOptions } from "./types/StarFieldOptions";

export class StarFieldEngine {
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

  options: StarFieldOptions;

  sanitizeOptions(options: StarFieldOptions) {
    options.followContext = options.followContext ?? this.canvas;
    options.numStars = Math.abs(options.numStars);
    options.minSpeed = Math.abs(options.minSpeed) || 1;
    options.maxSpeed = Math.abs(options.maxSpeed) || 1;

    return options;
  }

  constructor(canvasElement: HTMLCanvasElement, options: StarFieldOptions) {
    this.canvas = canvasElement;
    const canvas2dContext = this.canvas.getContext("2d");
    if (!canvas2dContext) {
      throw new Error("Could not get 2d context from canvas");
    }
    this.canvas2dContext = canvas2dContext;

    this.options = this.sanitizeOptions(options);

    const rect = this.canvas.getBoundingClientRect();
    this.canvasRectLeft = rect.left;
    this.canvasRectTop = rect.top;

    this.handleMouseMove = this.handleMouseMove.bind(this);

    // Set up animation engine
    this.engine = new AnimLoopEngine();
    this.engine.addTask(this.draw.bind(this));

    // Set up window events
    // Window blur/focus
    if (this.options.pauseOnBlur) {
      window.addEventListener("blur", () => {
        this.stop();
      });
      window.addEventListener("focus", () => {
        this.start();
      });
    }

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

    // Setup the canvas
    this.setupCanvas();

    // Gen new stars
    this.generateStars();

    this.initialized = true;

    // Did config enable mouse following?
    if (options.followMouse) {
      this.setFollowMouse(true);
    }
  }

  // Generate n new stars
  private generateStars() {
    for (let i = 0; i < this.options.numStars; i++) {
      this.stars.push(
        new Star({
          canvas2dContext: this.canvas2dContext,
          W: this.canvasW,
          H: this.canvasH,
          hW: this.canvasHalfW,
          hH: this.canvasHalfH,
          addTasks: this.engine.addTasks,
          options: this.options,
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
    this.options.maxSpeed = Math.abs(val) || 1;
    this.reset();
  }

  setMinSpeed(val: number) {
    this.options.minSpeed = Math.abs(val) || 1;
    this.reset();
  }

  setNumStars(val: number) {
    this.options.numStars = Math.abs(val);
    this.reset();
  }

  setFollowMouse(val: boolean) {
    if (!this.options.followContext) return;

    if (val) {
      this.options.followContext.addEventListener(
        "mousemove",
        this.handleMouseMove
      );
    } else {
      this.options.followContext.removeEventListener(
        "mousemove",
        this.handleMouseMove
      );
      this.resetMouseOffset();
    }
  }
}
