import { Injectable } from '@nestjs/common';

@Injectable()
export class MetricsService {
  private metrics = {
    httpRequests: new Map<string, number>(),
    activeConnections: 0,
    dbQueries: new Map<string, number[]>(),
  };

  recordHttpRequest(method: string, route: string, status: number, duration: number) {
    const key = `${method}_${route}_${status}`;
    this.metrics.httpRequests.set(key, (this.metrics.httpRequests.get(key) || 0) + 1);
  }

  incrementActiveConnections() {
    this.metrics.activeConnections++;
  }

  decrementActiveConnections() {
    this.metrics.activeConnections--;
  }

  recordDbQuery(operation: string, duration: number) {
    if (!this.metrics.dbQueries.has(operation)) {
      this.metrics.dbQueries.set(operation, []);
    }
    this.metrics.dbQueries.get(operation)!.push(duration);
  }

  async getMetrics(): Promise<string> {
    let output = '# HELP http_requests_total Total HTTP requests\n';
    output += '# TYPE http_requests_total counter\n';
    
    for (const [key, value] of this.metrics.httpRequests) {
      const [method, route, status] = key.split('_');
      output += `http_requests_total{method="${method}",route="${route}",status="${status}"} ${value}\n`;
    }

    output += '\n# HELP active_connections Active connections\n';
    output += '# TYPE active_connections gauge\n';
    output += `active_connections ${this.metrics.activeConnections}\n`;

    return output;
  }
}
