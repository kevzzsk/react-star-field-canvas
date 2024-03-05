import { StarFieldOptions } from "../types/StarFieldOptions";
import { StarFieldEngine } from "../StarFieldEngine";
import { FunctionComponent } from "react";

export type StarFieldProps = Partial<StarFieldOptions> & {
  className?: string;
};

const defaultPropsValues: StarFieldProps = {
  followMouse: false,
  followContext: undefined,
  color: { r: 255, g: 255, b: 255 },
  glow: false,
  maxSpeed: 5,
  minSpeed: 2,
  numStars: 400,
  trails: false,
  trailColor: { r: 255, g: 255, b: 255 },
  longerTrails: false,
  pauseOnBlur: true,
  reinitializeOnResize: true,
  className: "",
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

  window.addEventListener("star-field-reset", () => {
    engine.reset();
  });

  window.addEventListener("star-field-set-options", (evt: Event) => {
    const options = (evt as CustomEvent).detail as StarFieldOptions;

    engine.setOptions(options);
  });

  engine.start();

  return engine;
};

export const StarField: FunctionComponent<StarFieldProps> = ({
  className,
  ...options
}: StarFieldProps) => {
  const currentOptions = { ...defaultPropsValues, ...options };
  return (
    <canvas
      className={className}
      ref={(ref) => {
        if (ref) {
          createStarFieldIntoCanvas(ref, currentOptions as StarFieldOptions);
        }
      }}
    ></canvas>
  );
};
