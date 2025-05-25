'use client';

interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {};
  private observers: PerformanceObserver[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers();
    }
  }

  private initializeObservers() {
    // Observe paint metrics (FCP, LCP)
    if ('PerformanceObserver' in window) {
      try {
        const paintObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              this.metrics.fcp = entry.startTime;
              console.log(`🎨 First Contentful Paint: ${entry.startTime.toFixed(2)}ms`);
            }
          }
        });
        paintObserver.observe({ entryTypes: ['paint'] });
        this.observers.push(paintObserver);

        // Observe LCP
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.metrics.lcp = lastEntry.startTime;
          console.log(`🖼️ Largest Contentful Paint: ${lastEntry.startTime.toFixed(2)}ms`);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);

        // Observe FID
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.metrics.fid = (entry as any).processingStart - entry.startTime;
            console.log(`⚡ First Input Delay: ${this.metrics.fid.toFixed(2)}ms`);
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);

        // Observe CLS
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          this.metrics.cls = clsValue;
          console.log(`📐 Cumulative Layout Shift: ${clsValue.toFixed(4)}`);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);

      } catch (error) {
        console.warn('Performance monitoring not supported:', error);
      }
    }

    // Measure TTFB
    if ('performance' in window && 'timing' in performance) {
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          this.metrics.ttfb = navigation.responseStart - navigation.requestStart;
          console.log(`🌐 Time to First Byte: ${this.metrics.ttfb.toFixed(2)}ms`);
        }
      });
    }
  }

  // Monitor scroll performance
  public monitorScrollPerformance() {
    let scrollCount = 0;
    let lastScrollTime = performance.now();
    let frameDrops = 0;

    const handleScroll = () => {
      scrollCount++;
      const currentTime = performance.now();
      const timeDiff = currentTime - lastScrollTime;
      
      // Detect frame drops (assuming 60fps = 16.67ms per frame)
      if (timeDiff > 32) { // More than 2 frames
        frameDrops++;
      }
      
      lastScrollTime = currentTime;

      // Log performance every 100 scroll events
      if (scrollCount % 100 === 0) {
        const frameDropRate = (frameDrops / scrollCount) * 100;
        console.log(`📊 Scroll Performance - Events: ${scrollCount}, Frame drops: ${frameDrops} (${frameDropRate.toFixed(1)}%)`);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }

  // Monitor memory usage
  public monitorMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
      const totalMB = Math.round(memory.totalJSHeapSize / 1048576);
      const limitMB = Math.round(memory.jsHeapSizeLimit / 1048576);
      
      console.log(`🧠 Memory Usage: ${usedMB}MB / ${totalMB}MB (Limit: ${limitMB}MB)`);
      
      // Warn if memory usage is high
      if (usedMB / limitMB > 0.8) {
        console.warn('⚠️ High memory usage detected!');
      }
    }
  }

  // Get current metrics
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  // Log performance summary
  public logSummary() {
    console.group('🚀 Performance Summary');
    console.log('First Contentful Paint:', this.metrics.fcp ? `${this.metrics.fcp.toFixed(2)}ms` : 'Not measured');
    console.log('Largest Contentful Paint:', this.metrics.lcp ? `${this.metrics.lcp.toFixed(2)}ms` : 'Not measured');
    console.log('First Input Delay:', this.metrics.fid ? `${this.metrics.fid.toFixed(2)}ms` : 'Not measured');
    console.log('Cumulative Layout Shift:', this.metrics.cls ? this.metrics.cls.toFixed(4) : 'Not measured');
    console.log('Time to First Byte:', this.metrics.ttfb ? `${this.metrics.ttfb.toFixed(2)}ms` : 'Not measured');
    console.groupEnd();
  }

  // Cleanup observers
  public cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

export default performanceMonitor;
