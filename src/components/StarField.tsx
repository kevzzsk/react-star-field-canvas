import { StarFieldOptions } from "../types/StarFieldOptions";
import { StarFieldEngine } from "../StarFieldEngine";

export type StarFieldProps = Partial<StarFieldOptions> & {
  className?: string;
};

const createStarFieldIntoCanvas = (
  canvas: HTMLCanvasElement,
  options: StarFieldOptions
) => {
  const engine = new StarFieldEngine(canvas, options);

  canvas.addEventListener("star-field-start", () => {
    engine.start();
  });

  canvas.addEventListener("star-field-stop", () => {
    engine.stop();
  });

  engine.start();

  return engine;
};

export const StarField = ({
  followMouse = false,
  followContext = undefined,
  color = { r: 255, g: 255, b: 255 },
  glow = false,
  maxSpeed = 5,
  minSpeed = 2,
  numStars = 400,
  trails = false,
  trailColor = { r: 255, g: 255, b: 255 },
  longerTrails = false,
  pauseOnBlur = true,
  className = "",
}: StarFieldProps) => {
  return (
    <canvas
      className={className}
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
            pauseOnBlur,
          });
        }
      }}
    ></canvas>
  );
};
