import { StarColorObject } from "./StarColor";

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
  pauseOnBlur: boolean;
};
