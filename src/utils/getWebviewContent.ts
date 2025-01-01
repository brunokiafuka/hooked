export function getWebviewContent(data: string) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  
  <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Cat Coding</title>
  </head>
  
  <body>
      <pre class="mermaid">
      ${data}
      </pre>
  
      <script>
          window.$docsify = {
  
              mermaidConfig: {
                  querySelector: ".mermaid",
              }
  
          };
      </script>
      <!-- Import D3.js -->
      <script src="https://cdn.jsdelivr.net/npm/d3@7"></script>
      <script type="module">
          import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";
  
          window.mermaid = mermaid;
  
          document.addEventListener("DOMContentLoaded", function () {
              mermaid.initialize({
                  startOnLoad: true,
              });
  
              mermaid.run({
                  suppressErrors: true,
              });
          });
      </script>
      <!-- Import Docsify-mermaid-zoom -->
      <script src="https://unpkg.com/docsify-mermaid@2.0.0/dist/docsify-mermaid.js"></script>
      <script src="https://unpkg.com/docsify-mermaid-zoom/dist/docsify-mermaid-zoom.js"></script>
  </body>
  
  </html>
  
    `;
}
