// src/homescreen/EventDebug.js
// A utility to debug event handling issues

/**
 * Adds event debugging to a DOM element
 * @param {HTMLElement} element - The element to add debugging to
 */
export const addEventDebugging = (element) => {
  if (!element) return;
  
  console.log('Adding event debugging to', element);
  
  const events = [
    'click',
    'mousedown',
    'mouseup',
    'mousemove',
    'touchstart',
    'touchmove',
    'touchend',
    'pointerdown',
    'pointerup',
    'pointermove'
  ];
  
  events.forEach(eventType => {
    element.addEventListener(eventType, (e) => {
      console.log(`Event detected: ${eventType}`, {
        target: e.target,
        currentTarget: e.currentTarget,
        clientX: e.clientX,
        clientY: e.clientY,
        pointerEvents: window.getComputedStyle(e.target).pointerEvents,
        zIndex: window.getComputedStyle(e.target).zIndex
      });
    }, { capture: true });
  });
};

/**
 * Checks if pointer events are working properly
 */
export const checkPointerEvents = () => {
  console.log('--- Checking pointer events ---');
  
  // Check home container
  const homeContainer = document.getElementById('home-screen-container');
  if (homeContainer) {
    console.log('Home container styles:', {
      pointerEvents: window.getComputedStyle(homeContainer).pointerEvents,
      zIndex: window.getComputedStyle(homeContainer).zIndex,
      touchAction: window.getComputedStyle(homeContainer).touchAction
    });
  } else {
    console.log('Home container not found');
  }
  
  // Check app controller
  const appController = document.getElementById('app-controller');
  if (appController) {
    console.log('App controller styles:', {
      pointerEvents: window.getComputedStyle(appController).pointerEvents,
      zIndex: window.getComputedStyle(appController).zIndex,
      touchAction: window.getComputedStyle(appController).touchAction
    });
  } else {
    console.log('App controller not found');
  }
  
  // Check canvas if it exists
  const canvas = document.querySelector('.home-container canvas');
  if (canvas) {
    console.log('Canvas styles:', {
      pointerEvents: window.getComputedStyle(canvas).pointerEvents,
      zIndex: window.getComputedStyle(canvas).zIndex,
      touchAction: window.getComputedStyle(canvas).touchAction
    });
  } else {
    console.log('Canvas not found');
  }
  
  console.log('--- End of pointer events check ---');
}; 