import 'babel-polyfill';

import dataHandler from './dataHandler';
import helper from './helper';

// import vtkURLExtract from 'vtk.js/Sources/Common/Core/URLExtract';
// const userParams = vtkURLExtract.extractURLParameters();
// console.log(userParams);

let doNotInitViewers = false;

export function createLocalFileReader() {
  doNotInitViewers = true;
  helper.createFileDragAndDrop(null, dataHandler.processData);
}

export function createViewer(el, url) {
  helper.emptyContainer(el);
  helper.createLoadingProgress(el);

  // FIXME need to get ITK to read a Blob (missing name/type?)
  return helper.fetchBinaryContent(url).then((arrayBuffer) => {
    const file = new Blob([arrayBuffer]);
    file.name = url;
    return dataHandler.processData(el, { file });
  });
}

export function initializeViewers() {
  if (doNotInitViewers) {
    return;
  }
  const viewers = document.querySelectorAll('.itk-vtk-image-viewer');
  let count = viewers.length;
  while (count--) {
    const el = viewers[count];
    if (!el.dataset.loaded) {
      el.dataset.loaded = true;
      const [width, height] = (el.dataset.viewport || '500x500').split('x');
      el.style.position = 'relative';
      el.style.width = Number.isFinite(Number(width)) ? `${width}px` : width;
      el.style.height = Number.isFinite(Number(height)) ? `${height}px` : height;
      createViewer(el, el.dataset.url)
        .then((viewer) => {
          // Background color handling
          if (el.dataset.backgroundColor && viewer.geometryBuilder) {
            const color = el.dataset.backgroundColor;
            const bgColor = [color.slice(0, 2), color.slice(2, 4), color.slice(4, 6)].map(v => (parseInt(v, 16) / 255));
            viewer.renderWindow.setBackground(bgColor);
          }

          // Update size
        });
    }
  }
}

// Ensure processing of viewers
setTimeout(initializeViewers, 100);