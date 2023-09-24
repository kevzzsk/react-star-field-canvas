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

  window.addEventListener("star-field-start", () => {
    engine.start();
  });

  window.addEventListener("star-field-stop", () => {
    engine.stop();
  });

  window.addEventListener("star-field-set-options", (evt: Event) => {
    const options = (evt as CustomEvent).detail as StarFieldOptions;

    engine.setOptions(options);
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
