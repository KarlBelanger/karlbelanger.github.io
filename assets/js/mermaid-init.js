document.addEventListener("DOMContentLoaded", function() {
  mermaid.initialize({
    startOnLoad: false,
    flowchart: {
      subGraphTitleMargin: { top: 10, bottom: 10 }
    }
  });
  mermaid.run();
});
