/**
 * Performance monitoring and optimization utilities
 */
import React from "react";

// Performance metrics tracking
export const performanceMetrics = {
  // Track component render times
  trackComponentRender: (componentName: string, startTime: number) => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;

    if (renderTime > 16) {
      // More than one frame (60fps)
      console.warn(
        `Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`
      );
    }

    // Store metrics for analysis
    if (typeof window !== "undefined" && window.localStorage) {
      const metrics = JSON.parse(
        localStorage.getItem("performance-metrics") || "[]"
      );
      metrics.push({
        component: componentName,
        renderTime,
        timestamp: Date.now(),
      });

      // Keep only last 100 entries
      if (metrics.length > 100) {
        metrics.shift();
      }

      localStorage.setItem("performance-metrics", JSON.stringify(metrics));
    }
  },

  // Track API response times
  trackApiCall: (endpoint: string, startTime: number, success: boolean) => {
    const endTime = performance.now();
    const responseTime = endTime - startTime;

    console.log(
      `API ${endpoint}: ${responseTime.toFixed(2)}ms - ${
        success ? "SUCCESS" : "ERROR"
      }`
    );

    if (typeof window !== "undefined" && window.localStorage) {
      const apiMetrics = JSON.parse(
        localStorage.getItem("api-metrics") || "[]"
      );
      apiMetrics.push({
        endpoint,
        responseTime,
        success,
        timestamp: Date.now(),
      });

      // Keep only last 50 entries
      if (apiMetrics.length > 50) {
        apiMetrics.shift();
      }

      localStorage.setItem("api-metrics", JSON.stringify(apiMetrics));
    }
  },

  // Get performance summary
  getPerformanceSummary: () => {
    if (typeof window === "undefined") return null;

    const componentMetrics = JSON.parse(
      localStorage.getItem("performance-metrics") || "[]"
    );
    const apiMetrics = JSON.parse(localStorage.getItem("api-metrics") || "[]");

    const avgComponentRenderTime =
      componentMetrics.length > 0
        ? componentMetrics.reduce(
            (sum: number, metric: any) => sum + metric.renderTime,
            0
          ) / componentMetrics.length
        : 0;

    const avgApiResponseTime =
      apiMetrics.length > 0
        ? apiMetrics.reduce(
            (sum: number, metric: any) => sum + metric.responseTime,
            0
          ) / apiMetrics.length
        : 0;

    const slowComponents = componentMetrics.filter(
      (metric: any) => metric.renderTime > 50
    );
    const slowApis = apiMetrics.filter(
      (metric: any) => metric.responseTime > 1000
    );

    return {
      components: {
        total: componentMetrics.length,
        avgRenderTime: avgComponentRenderTime.toFixed(2),
        slowComponents: slowComponents.length,
        slowestComponents: slowComponents
          .sort((a: any, b: any) => b.renderTime - a.renderTime)
          .slice(0, 5),
      },
      apis: {
        total: apiMetrics.length,
        avgResponseTime: avgApiResponseTime.toFixed(2),
        slowApis: slowApis.length,
        errorRate:
          (
            (apiMetrics.filter((m: any) => !m.success).length /
              apiMetrics.length) *
            100
          ).toFixed(2) + "%",
        slowestApis: slowApis
          .sort((a: any, b: any) => b.responseTime - a.responseTime)
          .slice(0, 5),
      },
    };
  },

  // Clear all metrics
  clearMetrics: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("performance-metrics");
      localStorage.removeItem("api-metrics");
    }
  },
};

// Performance monitoring HOC
export const withPerformanceMonitoring = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) => {
  return React.memo((props: P) => {
    const startTime = performance.now();

    React.useEffect(() => {
      performanceMetrics.trackComponentRender(
        componentName || WrappedComponent.name || "Unknown Component",
        startTime
      );
    });

    return <WrappedComponent {...props} />;
  });
};

// Bundle size analysis
export const bundleAnalysis = {
  // Check if code splitting is working
  checkCodeSplitting: () => {
    if (typeof window === "undefined") return;

    const scripts = Array.from(document.querySelectorAll("script[src]"));
    const chunks = scripts.filter(
      (script) =>
        script.getAttribute("src")?.includes("chunk") ||
        script.getAttribute("src")?.includes("lazy")
    );

    console.log(`Code splitting analysis:`, {
      totalScripts: scripts.length,
      lazyChunks: chunks.length,
      isCodeSplittingActive: chunks.length > 0,
    });

    return {
      totalScripts: scripts.length,
      lazyChunks: chunks.length,
      isCodeSplittingActive: chunks.length > 0,
    };
  },

  // Monitor lazy loading effectiveness
  monitorLazyLoading: () => {
    if (typeof window === "undefined") return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLElement;
          if (target.dataset.lazy) {
            console.log(`Lazy component loaded: ${target.dataset.lazy}`);
          }
        }
      });
    });

    // Observe all lazy-loaded elements
    document.querySelectorAll("[data-lazy]").forEach((el) => {
      observer.observe(el);
    });

    return observer;
  },
};

export default performanceMetrics;
