import { mapNumberToRange } from "map-number-to-range";

import { StarColorObject } from "./types/StarColor";
import { AnimLoopEngine } from "anim-loop-engine";

type StarOpts = {
  canvas2dContext: CanvasRenderingContext2D;
  W: number;
  H: number;
  hW: number;
  hH: number;
  minV: number;
  maxV: number;
  color?:
    | StarColorObject
    | ((x: number, y: number, z: number) => StarColorObject);
  glow: boolean;
  trails: boolean;
  longerTrails: boolean;
  trailColor: StarColorObject;
  addTasks?: typeof AnimLoopEngine.prototype.addTasks;
};

export class Star {
  private x: number = 0;
  private y: number = 0;
  private z: number = 0;
  private v: number = 0;
  private radius: number = 0;

  private beforeLastX: number = 0;
  private beforeLastY: number = 0;

  private lastX: number = 0;
  private lastY: number = 0;

  // private splashLimitX: number[] = [0, 0];
  // private splashLimitY: number[] = [0, 0];

  ctx: CanvasRenderingContext2D;
  W: number;
  H: number;
  hW: number;
  hH: number;
  minV: number;
  maxV: number;
  color:
    | StarColorObject
    | ((x: number, y: number, z: number) => StarColorObject);
  glow: boolean;
  trails: boolean;
  longerTrails: boolean = false;
  trailColor: StarColorObject;

  addTasks: typeof AnimLoopEngine.prototype.addTasks;

  constructor(opts: StarOpts) {
    const {
      canvas2dContext: ctx,
      W,
      H,
      hW,
      hH,
      minV,
      maxV,
      color,
      glow,
      trails,
      addTasks,
      longerTrails,
      trailColor,
    } = opts;

    this.ctx = ctx;
    this.W = W;
    this.H = H;
    this.hW = hW;
    this.hH = hH;
    this.minV = minV;
    this.maxV = maxV;
    this.glow = glow;
    this.trails = trails;
    this.longerTrails = longerTrails ?? false;
    this.trailColor = trailColor ?? { r: 255, g: 255, b: 255 };

    this.color = color ?? { r: 255, g: 255, b: 255 };

    // this.splashLimitX = [-hW, hW];
    // this.splashLimitY = [-hH, hH];

    this.addTasks = addTasks!;

    this.reset(true);
  }

  // Get the star's initial Z depth
  private getInitialZ() {
    return (this.W > this.H ? this.H : this.W) * 2;
  }

  // Calculate the star's current position star at the current
  draw(offsetX: number, offsetY: number) {
    this.z -= this.v;
    if (this.z <= 0) {
      // Start of attempting to add bursts on "collision" with the viewport
      // if (
      //   this.lastX > this.splashLimitX[0] &&
      //   this.lastX < this.splashLimitX[1] &&
      //   this.lastY > this.splashLimitY[0] &&
      //   this.lastY < this.splashLimitY[1]
      // ) {
      //   console.log(this.lastX, this.splashLimitX, this.lastY, this.splashLimitY);
      //   const ex = new Explosion({ ctx: this.ctx, x: this.x, y: this.y });
      //   this.addTasks([ex.draw.bind(ex)]);
      // }

      this.reset();
    }

    // Update x and y - 0.8 is an arbitrary fraction of the
    const newX = this.W * (this.x / this.z) - offsetX;
    const newY = this.H * (this.y / this.z) - offsetY;

    // Get max Z and calc new radius/opacity based on star's position in Z range
    const maxZ = this.getInitialZ();

    // Calculate a new radius based on Z
    const newRadius =
      (1 - mapNumberToRange(this.z, 0, maxZ, 0, 1)) * this.radius;

    // Calculate a new opacity based on Z
    const opacity =
      Math.round(10 - mapNumberToRange(this.z, 0, maxZ, 0, 10)) / 10;
    const trailOpacity = opacity / 4;

    // Draw star trail
    if (this.trails && this.lastX !== this.x) {
      this.ctx.lineWidth = newRadius;
      this.ctx.strokeStyle = `rgba(${this.trailColor.r}, ${this.trailColor.g}, ${this.trailColor.b}, ${trailOpacity})`;
      this.ctx.beginPath();
      this.ctx.moveTo(newX, newY);
      if (this.longerTrails) {
        this.ctx.lineTo(this.beforeLastX, this.beforeLastY);
      } else {
        this.ctx.lineTo(this.lastX, this.lastY);
      }
      this.ctx.stroke();
    }

    // Save drawing settings to restore after applying the glow to stars only
    if (this.glow) {
      this.ctx.save();
      this.ctx.shadowBlur = 5;
      this.ctx.shadowColor = "#FFF";
    }

    // Draw the star
    let computedColor;
    if (typeof this.color === "function") {
      computedColor = this.color(offsetX, offsetY, this.z);
    } else {
      computedColor = this.color;
    }
    this.ctx.fillStyle = `rgb(${computedColor.r}, ${computedColor.g}, ${computedColor.b}, ${opacity})`;
    this.ctx.beginPath();
    this.ctx.arc(newX, newY, newRadius, 0, Math.PI * 2);
    this.ctx.fill();

    // Undo glow settings
    if (this.glow) {
      this.ctx.restore();
    }

    // Update last x/y
    this.beforeLastX = this.lastX;
    this.beforeLastY = this.lastY;

    this.lastX = newX;
    this.lastY = newY;
  }

  // (Re)set the star, either initially (init) or when reaching the depth limit
  reset(init = false) {
    // Define a new random position within the canvas, velocity, and radius
    this.x = Math.random() * this.W - this.hW;
    this.y = Math.random() * this.H - this.hH;
    this.v = Math.random() * (this.maxV - this.minV) + this.minV;
    this.radius = Number((Math.random() * 2 + 1).toPrecision(3));

    // Clear last x/y so we don't draw a trail from end to new reset location
    this.lastX = this.x;
    this.lastY = this.y;

    // If not init (ie. not first run), send to furthest Z, otherwise randomize
    this.z = !init ? this.getInitialZ() : Math.random() * this.getInitialZ();
  }
}
