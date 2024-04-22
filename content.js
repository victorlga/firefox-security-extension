const context = document.createElement('canvas').getContext('2d');

// Overriding the CanvasRenderingContext2D prototype to detect suspicious calls
const originalToDataURL = CanvasRenderingContext2D.prototype.toDataURL;
CanvasRenderingContext2D.prototype.toDataURL = function() {
  alert('Canvas fingerprinting attempt detected!');
  chrome.runtime.sendMessage({type: 'canvasFingerprintDetected'});
  return originalToDataURL.apply(this, arguments);
};

const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;
CanvasRenderingContext2D.prototype.getImageData = function() {
  alert('Canvas fingerprinting attempt detected!');
  chrome.runtime.sendMessage({type: 'canvasFingerprintDetected'});
  return originalGetImageData.apply(this, arguments);
};
