# star-field-canvas

Configurable fly-through star field effect for HTML canvas.

<https://tdous.github.io/star-field-canvas/>

## Installing

```bash
npm install --save tdous/star-field-canvas
```

## Usage

### Instantiating

The main class is exported at the moment as a traditional global library, not an ES6 module. This is done via the webpack expose-loader, hence it's encapsulated within a 'library' to minimize pollution, which means instantiating with...

```typescript
var sf = new StarFieldCanvas.StarField('my-canvas-element-id');

sf.start();
```

...rather than simply "new Starfield(...)".

### Options

The ```canvas``` id is required. Otherwise all options are... optional. These are the defaults:

```typescript
var sf = new StarFieldCanvas.StarField('my-canvas-element-id', {
  followContext: [uses 'this.canvas' within the class],
  followMouse: false,
  color: { r: 255, g: 255, b: 255 },
  glow: false,
  minV: 2,
  maxV: 5,
  numStars: 400,
  trails: false
});

sf.start();
```

The ```followContext``` option is the element or object to attach the mousemove listener to, if you enable ```followMouse``` but need it to respond to something other than the canvas, perhaps if the canvas is behind another fullscreen element. eg. you can use the global window as the context:

```typescript
var sf = new StarFieldCanvas.StarField('my-canvas-element-id', {
  followContext: window,
  ...
});
```

### Stop is you must

```typescript
sf.stop();
```

### Style the ```canvas``` yourself

In case you want to use it for a flying star field effect but with alternate colors, ie. not white stars on black space background, this script does not fill the canvas background at all. It *only* draws the stars. You should style the canvas with CSS. There is no need to use height or width attributes on the ```canvas``` element CSS computed values be applied to the canvas in the script.

See the demo JS file for an example, running at <https://tdous.github.io/star-field-canvas/>.
