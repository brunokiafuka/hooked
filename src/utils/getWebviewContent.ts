export function getWebviewContent(data: string) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  
  <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Hooked - Dependency Graph</title>
      <style>
        .graph-container {
          width: 100%;
          height: 100vh;
          overflow: hidden;
          position: relative;
          background-color: #f5f5f5;
          background-image: radial-gradient(#e0e0e0 1px, transparent 1px);
          background-size: 20px 20px;
        }
        .controls {
          position: absolute;
          top: 10px;
          right: 10px;
          z-index: 1000;
        }
        .zoom-btn {
          padding: 5px 10px;
          margin: 0 5px;
          cursor: pointer;
          background: #fff;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        .node-tooltip {
          position: absolute;
          background: white;
          border: 1px solid #ccc;
          padding: 5px;
          border-radius: 4px;
          display: none;
          z-index: 1000;
        }
        .node {
          cursor: pointer !important;
        }
        .node rect, .node circle {
          cursor: pointer !important;
        }
        .dragging {
          opacity: 0.8;
          cursor: grabbing !important;
        }
        .node.dragging rect, .node.dragging circle {
          cursor: grabbing !important;
        }
        .mermaid {
          transform-origin: center center;
          transition: transform 0.1s ease-out;
        }
        .panning {
          cursor: grabbing !important;
        }
        .screenshot-btn {
          background-color: #4CAF50;
          color: white;
        }
      </style>
  </head>
  
  <body>
      <div class="graph-container">
        <div class="controls">
          <button class="zoom-btn" id="zoomIn">+</button>
          <button class="zoom-btn" id="resetZoom">Reset</button>
          <button class="zoom-btn" id="zoomOut">-</button>
          <button class="zoom-btn" id="screenshot">📸</button>
          <button class="zoom-btn" id="copyMermaid">📋</button>
        </div>
        <div class="node-tooltip" id="tooltip"></div>
        <pre class="mermaid">
        ${data}
        </pre>
      </div>
  
      <script>
          const vscode = acquireVsCodeApi();
          
          // Global zoom variables
          let currentZoom = 1;
          const ZOOM_STEP = 0.1;
          const MAX_ZOOM = 2;
          const MIN_ZOOM = 0.5;
          
          // Global pan variables
          let panX = 0;
          let panY = 0;
          let isPanning = false;
          let startX = 0;
          let startY = 0;
          
          // Store the original Mermaid data
          const originalMermaidData = \`${data}\`;

          // Global zoom functions
          function zoomIn() {
              if (currentZoom < MAX_ZOOM) {
                  currentZoom += ZOOM_STEP;
                  applyZoom();
              }
          }

          function zoomOut() {
              if (currentZoom > MIN_ZOOM) {
                  currentZoom -= ZOOM_STEP;
                  applyZoom();
              }
          }

          function resetZoom() {
              currentZoom = 1;
              panX = 0;
              panY = 0;
              applyZoom();
          }

          function applyZoom() {
              const container = document.querySelector('.mermaid');
              container.style.transform = \`scale(\${currentZoom}) translate(\${panX}px, \${panY}px)\`;
          }
          
          // Copy Mermaid functionality
          function copyMermaidToClipboard() { 
              vscode.postMessage({
                  command: 'copyMermaid',
                  data: originalMermaidData
              });
          }
          
          // Screenshot functionality
          function takeScreenshot() {
             
              const controls = document.querySelector('.controls');
              controls.style.display = 'none';
              
             
              const script = document.createElement('script');
              script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
              script.onload = function() {
                  const graphContainer = document.querySelector('.graph-container');
                  
                  html2canvas(graphContainer, {
                      backgroundColor: '#f5f5f5',
                      scale: 2, 
                      logging: false,
                      useCORS: true
                  }).then(canvas => {
                      controls.style.display = 'block';
                      
                      // Convert canvas to data URL
                      const dataURL = canvas.toDataURL('image/png');
                      
                      vscode.postMessage({
                          command: 'screenshot',
                          data: dataURL
                      });
                  });
              };
              document.head.appendChild(script);
          }
          
        
          function setupPanning() {
              const container = document.querySelector('.graph-container');
              
              container.addEventListener('mousedown', (e) => {
                  // Only enable panning when zoomed in
                  if (currentZoom > 1) {
                      isPanning = true;
                      startX = e.clientX - panX;
                      startY = e.clientY - panY;
                      container.classList.add('panning');
                  }
              });
              
              document.addEventListener('mousemove', (e) => {
                  if (isPanning) {
                      panX = e.clientX - startX;
                      panY = e.clientY - startY;
                      applyZoom();
                  }
              });
              
              document.addEventListener('mouseup', () => {
                  isPanning = false;
                  container.classList.remove('panning');
              });
              
              // Also handle touch events for mobile
              container.addEventListener('touchstart', (e) => {
                  if (currentZoom > 1) {
                      isPanning = true;
                      startX = e.touches[0].clientX - panX;
                      startY = e.touches[0].clientY - panY;
                      container.classList.add('panning');
                  }
              });
              
              document.addEventListener('touchmove', (e) => {
                  if (isPanning) {
                      panX = e.touches[0].clientX - startX;
                      panY = e.touches[0].clientY - startY;
                      applyZoom();
                  }
              });
              
              document.addEventListener('touchend', () => {
                  isPanning = false;
                  container.classList.remove('panning');
              });
              
              // Add wheel zoom functionality
              container.addEventListener('wheel', (e) => {
                  e.preventDefault();
                  
                  // Check if it's a pinch-to-zoom gesture (trackpad) or mouse wheel
                  const isPinchZoom = e.ctrlKey || e.metaKey;
                  
                  if (isPinchZoom) {
                      // For trackpad pinch-to-zoom
                      const delta = -e.deltaY;
                      const zoomFactor = 0.01;
                      
                     
                      const newZoom = currentZoom + (delta * zoomFactor);
                      
                      
                      if (newZoom >= MIN_ZOOM && newZoom <= MAX_ZOOM) {
                          currentZoom = newZoom;
                          applyZoom();
                      }
                  } else {
                     
                      if (currentZoom > 1) {
                          panX -= e.deltaX * 0.5;
                          panY -= e.deltaY * 0.5;
                          applyZoom();
                      }
                  }
              }, { passive: false });
          }

          // Set up zoom button listeners
          document.getElementById('zoomIn').addEventListener('click', zoomIn);
          document.getElementById('zoomOut').addEventListener('click', zoomOut);
          document.getElementById('resetZoom').addEventListener('click', resetZoom);
          document.getElementById('screenshot').addEventListener('click', takeScreenshot);
          document.getElementById('copyMermaid').addEventListener('click', copyMermaidToClipboard);
          
          document.addEventListener('DOMContentLoaded', setupPanning);
      </script>

      <script src="https://cdn.jsdelivr.net/npm/d3@7"></script>
      <script type="module">
          import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";
  
          window.mermaid = mermaid;
  
          document.addEventListener("DOMContentLoaded", function () {
              mermaid.initialize({
                  startOnLoad: true,
                  securityLevel: 'loose',
                  flowchart: {
                      htmlLabels: true,
                      curve: 'basis'
                  }
              });
  
              mermaid.run({
                  suppressErrors: true,
              }).then(() => {
                  setupNodeInteractions();
                  setupDragging();
              }).catch(err => {
                  console.error("Error rendering mermaid:", err);
              });
          });

          function setupNodeInteractions() {
              setTimeout(() => {
                 
                  const nodes = document.querySelectorAll('.node');
                  
                  nodes.forEach(node => {
                     
                      const labelElement = node.querySelector('.label');
                      if (labelElement) {
                          const nodeText = labelElement.textContent.trim();
                          const cleanNodeText = nodeText.replace(/^["']|["']$/g, '');
                        
                          
                          const clickTargets = [
                              node,
                              ...node.querySelectorAll('rect, circle, polygon, ellipse')
                          ];
                          
                          clickTargets.forEach(target => {
                              target.style.cursor = 'pointer';
                              target.addEventListener('click', (e) => {
                                  e.stopPropagation(); 
                                  handleNodeClick(cleanNodeText);
                              });
                              target.addEventListener('mouseover', (e) => {
                                  e.stopPropagation();
                                  handleNodeHover(e, cleanNodeText);
                              });
                              target.addEventListener('mouseout', handleNodeLeave);
                          });
                      }
                  });
              }, 1000);
          }

          function setupDragging() {
              setTimeout(() => {
                  const d3 = window.d3;
                  const svg = d3.select('.mermaid svg');
                  
                 
                  const drag = d3.drag()
                      .filter(event => {
                          return Math.abs(event.dx) > 5 || Math.abs(event.dy) > 5;
                      })
                      .on('start', dragStarted)
                      .on('drag', dragged)
                      .on('end', dragEnded);
                  
                  svg.selectAll('.node').call(drag);
                  
                  function dragStarted(event, d) {
                      d3.select(this).classed('dragging', true);
                      event.sourceEvent.preventDefault();
                  }
                  
                  function dragged(event, d) {
                    
                      event.sourceEvent.preventDefault();
                      
                      // Get the current transform of the node
                      const transform = d3.select(this).attr('transform');
                      let translateX = 0;
                      let translateY = 0;
                      
                      // Extract current translation values if they exist
                      if (transform) {
                          const match = transform.match(/translate\(([^,]+),([^)]+)\)/);
                          if (match) {
                              translateX = parseFloat(match[1]);
                              translateY = parseFloat(match[2]);
                          }
                      }
                      
                      // Apply new translation
                      d3.select(this).attr('transform', 
                          \`translate(\${translateX + event.dx}, \${translateY + event.dy})\`);
                  }
                  
                  function dragEnded(event, d) {
                      d3.select(this).classed('dragging', false);
                    
                      event.sourceEvent.preventDefault();
                  }
              }, 1000);
          }

          function handleNodeClick(nodeText) {
              if (nodeText) {
                  vscode.postMessage({
                      command: 'nodeClick',
                      nodeId: nodeText
                  });
              }
          }

          function handleNodeHover(event, nodeText) {
              if (nodeText) {
                  const tooltip = document.getElementById('tooltip');
                  const rect = event.target.getBoundingClientRect();
                  tooltip.style.display = 'block';
                  tooltip.style.left = \`\${rect.right + 10}px\`;
                  tooltip.style.top = \`\${rect.top}px\`;
                  tooltip.textContent = \`Node: \${nodeText}\`;
              }
          }

          function handleNodeLeave() {
              const tooltip = document.getElementById('tooltip');
              tooltip.style.display = 'none';
          }
      </script>
  </body>
  
  </html>
  `;
}
