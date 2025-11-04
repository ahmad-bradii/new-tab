// Performance monitoring utility
class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.startTime = performance.now();
  }

  // Start timing a specific operation
  startTiming(name) {
    this.metrics[name] = { start: performance.now() };
  }

  // End timing and calculate duration
  endTiming(name) {
    if (this.metrics[name]) {
      this.metrics[name].end = performance.now();
      this.metrics[name].duration =
        this.metrics[name].end - this.metrics[name].start;
      // console.log(`⏱️ ${name}: ${this.metrics[name].duration.toFixed(2)}ms`);
    }
  }

  // Measure Core Web Vitals
  measureCoreWebVitals() {
    // Measure CLS (Cumulative Layout Shift)
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          // console.log("📊 CLS Score:", entry.value.toFixed(4));
        }
      }
    }).observe({ type: "layout-shift", buffered: true });

    // Measure LCP (Largest Contentful Paint)
    // new PerformanceObserver((list) => {
    //   for (const entry of list.getEntries()) {
    //     console.log("🎨 LCP:", entry.startTime.toFixed(2) + "ms");
    //   }
    // }).observe({ type: "largest-contentful-paint", buffered: true });

    // Measure FID (First Input Delay)
    // new PerformanceObserver((list) => {
    //   for (const entry of list.getEntries()) {
    //     console.log("⚡ FID:", entry.processingStart - entry.startTime + "ms");
    //   }
    // }).observe({ type: "first-input", buffered: true });
  }

  // Monitor frame rate
  monitorFPS() {
    let frames = 0;
    let lastTime = performance.now();

    // const countFrames = () => {
    //   frames++;
    //   const currentTime = performance.now();

    //   if (currentTime >= lastTime + 1000) {
    //     console.log(`🎯 FPS: ${frames}`);
    //     frames = 0;
    //     lastTime = currentTime;
    //   }

    //   requestAnimationFrame(countFrames);
    // };

    // requestAnimationFrame(countFrames);
  }

  // Measure memory usage (if available)
  measureMemory() {
    if ("memory" in performance) {
      const memInfo = performance.memory;
      console.log("💾 Memory Usage:", {
        used: (memInfo.usedJSHeapSize / 1024 / 1024).toFixed(2) + "MB",
        total: (memInfo.totalJSHeapSize / 1024 / 1024).toFixed(2) + "MB",
        limit: (memInfo.jsHeapSizeLimit / 1024 / 1024).toFixed(2) + "MB",
      });
    }
  }

  // Overall performance summary
  getPerformanceSummary() {
    const navigation = performance.getEntriesByType("navigation")[0];
    if (navigation) {
      console.log("📈 Performance Summary:", {
        "DNS Lookup":
          (navigation.domainLookupEnd - navigation.domainLookupStart).toFixed(
            2
          ) + "ms",
        "TCP Connection":
          (navigation.connectEnd - navigation.connectStart).toFixed(2) + "ms",
        "Request Time":
          (navigation.responseEnd - navigation.requestStart).toFixed(2) + "ms",
        "DOM Load":
          (
            navigation.domContentLoadedEventEnd - navigation.navigationStart
          ).toFixed(2) + "ms",
        "Page Load":
          (navigation.loadEventEnd - navigation.navigationStart).toFixed(2) +
          "ms",
      });
    }
  }
}

// // Initialize performance monitoring
// const perfMonitor = new PerformanceMonitor();

// // Start monitoring when page loads
// window.addEventListener("load", () => {
//   perfMonitor.measureCoreWebVitals();
//   perfMonitor.getPerformanceSummary();
//   perfMonitor.measureMemory();

//   // Monitor FPS in development
//   if (process.env.NODE_ENV === "development") {
//     perfMonitor.monitorFPS();
//   }
// });

// export default perfMonitor;
