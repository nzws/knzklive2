// This file is a fork of jGravity library by @nzws.
// Original Source: https://github.com/tinybigideas/jGravity

/* eslint-disable */
// @ts-nocheck

/*
 * @project:	jGravity
 * @version:	0.8 - 29/04/2012
 * @author:		Craig Thomas - www.tinybigideas.com
 * @project:	http://tinybigideas.com/plugins/jquery-gravity/
 * @license:	jGravity is licensed under a Open Source Initiative OSI MIT License: http://opensource.org/licenses/mit-license.php
 * @changlog:	http://tinybigideas.com/plugins/jquery-gravity/

 */

/*------------------------------------*\
   CREDITS
\*------------------------------------*/
/*
 - Mr. Doobs :: http://mrdoob.com/92/Google_Gravity
 - GravityScript :: http://gravityscript.googlecode.com/
 - Alex Arnell's inheritance.js :: http://code.google.com/p/inheritance/
 - Box2Djs :: http://box2d-js.sourceforge.net/
*/

/*------------------------------------*\
   CONTENTS
\*------------------------------------*/
/*

LIBRARIES
 - Alex Arnell's inheritance.js
 - Box2Djs (port of Box2DFlash 1.4.3.1) :: http://box2d-js.sourceforge.net/

WORKERS
 - variables
 - get browser dimensions
 - initialise

FUNCTIONS
 - init()
 - run()
 - onDocumentMouseDown()
 - onDocumentMouseUp()
 - onDocumentMouseMove()
 - onElementMouseDown()
 - onnElementMouseUp()
 - loop()
 - createBox()
 - mouseDrag()
 - getBodyAtMouse()
 - setWalls()
 - getBrowserDimensions()

*/

export interface GravityConfig {
  target: string;
  ignoreClass: string;
  weight: number | 'light' | 'heavy';
  depth: number;
  drag: boolean;
}

interface GravityConfigInternal extends GravityConfig {
  target: string;
  ignoreClass: string;
  weight: number;
  depth: number;
  drag: boolean;
}

export class Gravity {
  config: GravityConfigInternal;
  worldAABB: any;
  mouseJoint: any;
  canvas: any;
  world: any;
  delta: number[] = [0, 0];
  stage: number[] = [];
  isMouseDown = false;
  iterations = 1;
  timeStep = 1 / 25;
  walls: any[] = [];
  wall_thickness = 200;
  wallsSetted = false;
  mouseX = 0;
  mouseY = 0;
  mouseOnClick: number[] = [];
  timer = 0;
  bodies: any = {};
  properties: any = {};
  orientation = { x: 0, y: 1 };
  items: any[] = [];
  joints: any = {};
  isRunning = false;

  constructor(
    config: Partial<GravityConfig>,
    private container: HTMLElement
  ) {
    this.config = {
      target:
        config.target === 'everything'
          ? 'body *'
          : config.target ??
            'div, span, img, ol, ul, li, a, blockquote, button, input, embed, h1, h2, h3, h4, h5, h6, label, object, option, p, pre, span, table',
      ignoreClass: '',
      weight:
        config.weight === 'light'
          ? 50
          : config.weight === 'heavy'
            ? 1
            : config.weight ?? 50,
      depth: config.depth ?? 1,
      drag: config.drag ?? false
    };
  }

  async init() {
    if (this.isRunning) {
      return;
    }

    if (!document.getElementById('inheritance')) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.id = 'inheritance';
        script.src = '/static/vendor/inheritance.min.js';
        document.body.appendChild(script);

        script.onload = resolve;
        script.onerror = reject;
      });
    }

    // load box2d.js
    if (!document.getElementById('box2d')) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.id = 'box2d';
        script.src = '/static/vendor/box2d.min.js';
        document.body.appendChild(script);

        script.onload = resolve;
        script.onerror = reject;
      });
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    // init box2d
    this.worldAABB = new window.b2AABB();
    this.worldAABB.minVertex.Set(-200, -200);
    const box = this.container.getBoundingClientRect();
    this.worldAABB.maxVertex.Set(box.width + 200, box.height + 200);

    this.world = new window.b2World(this.worldAABB, new b2Vec2(0, 0), true);

    // walls
    this.setWalls();

    this.isRunning = true;
    this.loop();
  }

  private getBrowserDimensions() {
    let changed = false;

    const box = this.container.getBoundingClientRect();

    const left = window.screenX + box.left;
    if (this.stage[0] !== left) {
      this.delta[0] =
        this.stage[0] === undefined ? 0 : (left - this.stage[0]) * 50;
      this.stage[0] = left;
      changed = true;
    }

    const top = window.screenY + box.top;
    if (this.stage[1] !== top) {
      this.delta[1] =
        this.stage[1] === undefined ? 0 : (top - (this.stage[1] ?? 0)) * 50;
      this.stage[1] = top;
      changed = true;
    }

    const width = box.width;
    if (this.stage[2] !== width) {
      this.stage[2] = width;
      changed = true;
    }

    const height = box.height;
    if (this.stage[3] !== height) {
      this.stage[3] = height;
      changed = true;
    }

    return changed;
  }

  private setWalls() {
    if (this.wallsSetted) {
      this.world.DestroyBody(this.walls[0]);
      this.world.DestroyBody(this.walls[1]);
      this.world.DestroyBody(this.walls[2]);
      this.world.DestroyBody(this.walls[3]);

      this.walls[0] = null;
      this.walls[1] = null;
      this.walls[2] = null;
      this.walls[3] = null;
    }

    this.walls[0] = this.createBox(
      this.world,
      this.stage[2] / 2,
      -this.wall_thickness,
      this.stage[2],
      this.wall_thickness
    );
    this.walls[1] = this.createBox(
      this.world,
      this.stage[2] / 2,
      this.stage[3] + this.wall_thickness,
      this.stage[2],
      this.wall_thickness
    );
    this.walls[2] = this.createBox(
      this.world,
      -this.wall_thickness,
      this.stage[3] / 2,
      this.wall_thickness,
      this.stage[3]
    );
    this.walls[3] = this.createBox(
      this.world,
      this.stage[2] + this.wall_thickness,
      this.stage[3] / 2,
      this.wall_thickness,
      this.stage[3]
    );

    this.wallsSetted = true;
  }

  private findPos(obj: HTMLElement, index: number) {
    let curleft = 0;
    let curtop = 0;

    if (obj.offsetParent) {
      do {
        curleft += obj.offsetLeft;
        curtop += obj.offsetTop;
      } while ((obj = obj.offsetParent as HTMLElement));
    }

    return [curleft + index * -20, curtop];
  }

  private getBodyAtMouse() {
    // Make a small box.
    const mousePVec = new window.b2Vec2();
    mousePVec.Set(this.mouseX, this.mouseY);

    const aabb = new window.b2AABB();
    aabb.minVertex.Set(this.mouseX - 1, this.mouseY - 1);
    aabb.maxVertex.Set(this.mouseX + 1, this.mouseY + 1);

    // Query the world for overlapping shapes.
    const k_maxCount = 10;
    const shapes = [];
    const count = this.world.Query(aabb, shapes, k_maxCount);
    let body = null;

    for (let i = 0; i < count; ++i) {
      if (!shapes[i].m_body.IsStatic()) {
        if (shapes[i].TestPoint(mousePVec)) {
          body = shapes[i].m_body;
          break;
        }
      }
    }

    return body;
  }

  private createBox(
    world: any,
    x: number,
    y: number,
    width: number,
    height: number,
    fixed: boolean,
    element: HTMLElement
  ) {
    if (typeof fixed === 'undefined') fixed = true;

    const boxSd = new window.b2BoxDef();

    if (!fixed) boxSd.density = 1.0;

    boxSd.extents.Set(width, height);

    const boxBd = new window.b2BodyDef();
    boxBd.AddShape(boxSd);
    boxBd.position.Set(x, y);
    boxBd.userData = { element: element };

    return world.CreateBody(boxBd);
  }

  private mouseDrag() {
    if (this.config.drag) {
      // mouse press
      if (this.isMouseDown && !this.mouseJoint) {
        const body = this.getBodyAtMouse();

        if (body) {
          const md = new window.b2MouseJointDef();
          md.body1 = this.world.m_groundBody;
          md.body2 = body;
          md.target.Set(this.mouseX, this.mouseY);
          md.maxForce = 30000.0 * body.m_mass;
          md.timeStep = this.timeStep;
          this.mouseJoint = this.world.CreateJoint(md);
          body.WakeUp();
        }
      }

      // mouse release
      if (!this.isMouseDown) {
        if (this.mouseJoint) {
          this.world.DestroyJoint(this.mouseJoint);
          this.mouseJoint = null;
        }
      }

      // mouse move
      if (this.mouseJoint) {
        const p2 = new window.b2Vec2(this.mouseX, this.mouseY);
        this.mouseJoint.SetTarget(p2);
      }
    }
  }

  private loop() {
    if (!this.isRunning) {
      return;
    }

    if (this.getBrowserDimensions()) this.setWalls();

    this.delta[0] += (0 - this.delta[0]) * 0.5;
    this.delta[1] += (0 - this.delta[1]) * 0.5;

    this.world.m_gravity.x = this.orientation.x * 350 + this.delta[0];
    this.world.m_gravity.y = this.orientation.y * 350 + this.delta[1];

    this.mouseDrag();
    this.world.Step(this.timeStep, this.iterations);

    this.items.forEach(element => {
      if (!element || !element.dataset || !element.dataset.id) {
        return false;
      }
      const id = element.dataset.id;

      const body = this.bodies[id];

      element.style.left =
        body.m_position0.x - (this.properties[id][2] >> 1) + 'px';
      element.style.top =
        body.m_position0.y - (this.properties[id][3] >> 1) + 'px';

      if (!element.isGunya) {
        const rotationStyle =
          'rotate(' + body.m_rotation0 * 57.2957795 + 'deg)';

        element.style.WebkitTransform = rotationStyle;
        element.style.MozTransform = rotationStyle;
        element.style.OTransform = rotationStyle;
      }
    });

    window.requestAnimationFrame(this.loop.bind(this));
  }

  public add(text: string, isGunya: boolean): HTMLElement | HTMLElement[] {
    const jointItem = [];

    const run = (text: string, index = 0) => {
      const element = document.createElement('span');
      element.innerText = text;
      element.className = 'box2d';
      // const min = 5;
      // const max = 80;

      // const leftPer = Math.floor(Math.random() * (max + 1 - min)) + min;
      //element.style.left = `${leftPer}%`;
      // element.style.top = '0';
      // console.log(leftPer);
      this.container.appendChild(element);

      const id = Math.random().toString(32).substring(2);
      const elementBox = element.getBoundingClientRect();

      element.dataset.id = id;
      const boxWidth = this.stage[2];
      this.properties[id] = [
        Math.max(Math.floor(Math.random() * (boxWidth - elementBox.width)), 0),
        0,
        Math.min(elementBox.width, boxWidth) - 5,
        elementBox.height - 5
      ];

      element.style.position = 'absolute';
      element.style.left = this.properties[id][0] + 'px';
      element.style.top = this.properties[id][1] + 'px';

      element.onmousedown = () => {
        this.mouseOnClick[0] = window.event.clientX;
        this.mouseOnClick[1] = window.event.clientY;
        return false;
      };
      element.onmouseup = () => false;

      this.bodies[id] = this.createBox(
        this.world,
        this.properties[id][0] + (this.properties[id][2] >> 1),
        this.properties[id][1] + (this.properties[id][3] >> 1),
        this.properties[id][2] / 2,
        this.properties[id][3] / 2,
        false,
        element
      );
      element.isGunya = isGunya;
      this.items.push(element);

      if (isGunya) {
        jointItem[index] = this.bodies[id];

        if (isGunya && index > 0) {
          const jointDef = new window.b2DistanceJointDef();
          jointDef.body1 = jointItem[index];
          jointDef.body2 = jointItem[index - 1];

          jointDef.anchorPoint1 = new window.b2Vec2(
            jointDef.body1.m_center.x,
            jointDef.body1.m_center.y
          );
          jointDef.anchorPoint2 = new window.b2Vec2(
            jointDef.body2.m_center.x,
            jointDef.body2.m_center.y
          );

          this.joints[id] = this.world.CreateJoint(jointDef);
        }
      }

      return element;
    };

    if (isGunya) {
      return text.split('').reverse().map(run);
    } else {
      return run(text);
    }
  }

  public remove(elem: HTMLElement | HTMLElement[]) {
    const run = (element: HTMLElement) => {
      try {
        if (this.isMouseDown) {
          return setTimeout(() => run(element), 500);
        }

        const id = element.dataset.id;
        element.parentNode && element.parentNode.removeChild(element);

        this.joints[id] && this.world.DestroyJoint(this.joints[id]);
        this.joints[id] = null;

        this.bodies[id] && this.world.DestroyBody(this.bodies[id]);
        this.bodies[id] = null;

        const index = this.items.indexOf(element);
        index !== -1 && delete this.items[index];
      } catch (e) {
        console.warn(e);
      }
    };

    if (Array.isArray(elem)) {
      elem.forEach(run);
    } else {
      run(elem);
    }
  }

  public destroy() {
    this.remove(this.items);

    this.items = [];
    this.bodies = {};
    this.properties = {};
    this.world = null;
    this.worldAABB = null;

    this.isRunning = false;
  }
}
