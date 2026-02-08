# Solana AI City - Monitoring & Alerting Guide

## Overview

This document describes the monitoring, logging, and alerting infrastructure for Solana AI City.

## Table of Contents

1. [Metrics Collection](#metrics-collection)
2. [Logging](#logging)
3. [Alerting](#alerting)
4. [Dashboards](#dashboards)
5. [SLOs & SLIs](#slos--slis)

---

## Metrics Collection

### Application Metrics

```typescript
// src/metrics/index.ts
import { Counter, Histogram, Gauge } from 'prom-client';

export const metrics = {
  // HTTP metrics
  httpRequestsTotal: new Counter({
    name: 'solana_ai_city_http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'path', 'status'],
  }),
  
  httpRequestDuration: new Histogram({
    name: 'solana_ai_city_http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'path'],
    buckets: [0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  }),

  // Game metrics
  activeUsers: new Gauge({
    name: 'solana_ai_city_active_users',
    help: 'Number of active users',
  }),

  citiesCreated: new Counter({
    name: 'solana_ai_city_cities_created_total',
    help: 'Total cities created',
  }),

  buildingsConstructed: new Counter({
    name: 'solana_ai_city_buildings_constructed_total',
    help: 'Total buildings constructed',
    labelNames: ['type'],
  }),

  questsCompleted: new Counter({
    name: 'solana_ai_city_quests_completed_total',
    help: 'Total quests completed',
    labelNames: ['type'],
  }),

  tradesExecuted: new Counter({
    name: 'solana_ai_city_trades_executed_total',
    help: 'Total trades executed',
    labelNames: ['type'],
  }),

  nftsMinted: new Counter({
    name: 'solana_ai_city_nfts_minted_total',
    help: 'Total NFTs minted',
    labelNames: ['achievement_id'],
  }),

  // Blockchain metrics
  walletConnections: new Counter({
    name: 'solana_ai_city_wallet_connections_total',
    help: 'Total wallet connections',
    labelNames: ['wallet_name'],
  }),

  transactionsSent: new Counter({
    name: 'solana_ai_city_transactions_sent_total',
    help: 'Total transactions sent',
    labelNames: ['type', 'status'],
  }),

  // Business metrics
  revenue: new Counter({
    name: 'solana_ai_city_revenue_total',
    help: 'Total revenue',
    labelNames: ['source', 'currency'],
  }),

  // System metrics
  databaseConnections: new Gauge({
    name: 'solana_ai_city_database_connections',
    help: 'Number of active database connections',
  }),

  memoryUsage: new Gauge({
    name: 'solana_ai_city_memory_usage_bytes',
    help: 'Memory usage in bytes',
    labelNames: ['type'],
  }),
};

// Middleware to track requests
export function metricsMiddleware(req: any, res: any, next: any) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    metrics.httpRequestsTotal.inc({
      method: req.method,
      path: req.route?.path || req.path,
      status: res.statusCode,
    });
    metrics.httpRequestDuration.observe(
      { method: req.method, path: req.route?.path || req.path },
      duration
    );
  });
  
  next();
}
```

### Custom Metrics

```typescript
// Track game-specific metrics
export function trackCityCreation(userId: string) {
  metrics.citiesCreated.inc();
}

export function trackBuildingConstruction(type: string) {
  metrics.buildingsConstructed.inc({ type });
}

export function trackQuestCompletion(type: string) {
  metrics.questsCompleted.inc({ type });
}

export function trackTradeExecution(type: string) {
  metrics.tradesExecuted.inc({ type });
}

export function trackNFTMinting(achievementId: string) {
  metrics.nftsMinted.inc({ achievement_id: achievementId });
}

export function trackWalletConnection(walletName: string) {
  metrics.walletConnections.inc({ wallet_name: walletName });
}

export function trackTransaction(type: string, status: string) {
  metrics.transactionsSent.inc({ type, status });
}
```

---

## Logging

### Winston Configuration

```typescript
// src/utils/logger.ts
import winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  if (stack) {
    msg += `\n${stack}`;
  }
  return msg;
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    logFormat
  ),
  defaultMeta: { service: 'solana-ai-city' },
  transports: [
    // Console output
    new winston.transports.Console({
      format: combine(colorize(), logFormat),
    }),
    
    // Error logs
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Combined logs
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 5,
    }),
    
    // JSON logs for production
    ...(process.env.NODE_ENV === 'production' ? [
      new winston.transports.File({
        filename: 'logs/json.log',
        format: combine(timestamp(), winston.format.json()),
      }),
    ] : []),
  ],
});

// Create logs directory
import fs from 'fs';
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs');
}

// Request logging
export function requestLogger(req: any, res: any, next: any) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('user-agent'),
      ip: req.ip,
    });
  });
  
  next();
}
```

### Log Structure

```json
{
  "timestamp": "2026-02-07 20:00:00",
  "level": "info",
  "message": "User logged in",
  "service": "solana-ai-city",
  "metadata": {
    "userId": "user123",
    "walletAddress": "7nY...",
    "action": "login"
  }
}
```

---

## Alerting

### Prometheus Alert Rules

```yaml
# prometheus/alerts.yml
groups:
  - name: solana-ai-city-alerts
    rules:
      # High error rate
      - alert: HighErrorRate
        expr: |
          rate(solana_ai_city_http_requests_total{status=~"5.."}[5m])
          /
          rate(solana_ai_city_http_requests_total[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | humanizePercentage }} for the last 5 minutes"
          runbook_url: "https://docs.example.com/runbooks/high-error-rate"

      # High latency
      - alert: HighLatency
        expr: |
          histogram_quantile(0.95, 
            rate(solana_ai_city_http_request_duration_seconds_bucket[5m])
          ) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High API latency detected"
          description: "95th percentile latency is {{ $value | humanizeDuration }}"
          runbook_url: "https://docs.example.com/runbooks/high-latency"

      # Database connection issues
      - alert: DatabaseConnectionIssues
        expr: solana_ai_city_database_connections < 5
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Low database connections"
          description: "Only {{ $value }} database connections available"
          runbook_url: "https://docs.example.com/runbooks/db-connections"

      # No active users
      - alert: NoActiveUsers
        expr: solana_ai_city_active_users == 0
        for: 30m
        labels:
          severity: warning
        annotations:
          summary: "No active users detected"
          description: "Zero active users for 30 minutes"

      # High memory usage
      - alert: HighMemoryUsage
        expr: |
          solana_ai_city_memory_usage_bytes{type="heap"}
          /
          node_memory_MemTotal_bytes * 100 > 85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Memory usage is {{ $value | humanizePercentage }}"

      # Blockchain transaction failures
      - alert: HighTransactionFailureRate
        expr: |
          rate(solana_ai_city_transactions_sent_total{status="failed"}[5m])
          /
          rate(solana_ai_city_transactions_sent_total[5m]) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High blockchain transaction failure rate"
          description: "Transaction failure rate is {{ $value | humanizePercentage }}"
          runbook_url: "https://docs.example.com/runbooks/tx-failures"

      # Missing daily metrics
      - alert: MissingDailyMetrics
        expr: increase(solana_ai_city_cities_created_total[25h]) == 0
        for: 1h
        labels:
          severity: warning
        annotations:
          summary: "No new cities created in 24 hours"
          description: "This might indicate an issue with user signups"

      # Low quest completion
      - alert: LowQuestCompletion
        expr: |
          rate(solana_ai_city_quests_completed_total[1h])
          < 10
        for: 2h
        labels:
          severity: warning
        annotations:
          summary: "Low quest completion rate"
          description: "Less than 10 quests completed per hour"
```

### Alertmanager Configuration

```yaml
# prometheus/alertmanager.yml
global:
  resolve_timeout: 5m
  slack_api_url: '${SLACK_WEBHOOK_URL}'

route:
  group_by: ['alertname', 'severity']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  receiver: 'default-receiver'
  routes:
    - match:
        severity: critical
      receiver: 'critical-receiver'
      continue: true
    - match:
        severity: warning
      receiver: 'warning-receiver'

receivers:
  - name: 'default-receiver'
    slack_configs:
      - channel: '#alerts-default'
        title: "{{ range .Alerts }}{{ .Annotations.summary }}\n{{ end }}"
        text: |
          {{ range .Alerts }}
          *Description:* {{ .Annotations.description }}
          *Start:* {{ .StartsAt.Format "2006-01-02 15:04:05" }}
          *Runbook:* {{ .Annotations.runbook_url }}
          {{ end }}
        severity: critical

  - name: 'critical-receiver'
    slack_configs:
      - channel: '#alerts-critical'
        severity: critical
        title: "🚨 CRITICAL: {{ range .Alerts }}{{ .Annotations.summary }}{{ end }}"
        text: |
          Critical alert triggered!
          {{ range .Alerts }}
          {{ .Annotations.description }}
          {{ end }}

  - name: 'warning-receiver'
    slack_configs:
      - channel: '#alerts-warning'
        severity: warning
        title: "⚠️ WARNING: {{ range .Alerts }}{{ .Annotations.summary }}{{ end }}"

  - name: 'pagerduty'
    pagerduty_configs:
      - service_key: '${PAGERDUTY_SERVICE_KEY}'
        severity: critical
        description: "Solana AI City alert"
```

---

## Dashboards

### Grafana Dashboard

```json
{
  "dashboard": {
    "title": "Solana AI City - Overview",
    "tags": ["solana", "gaming"],
    "timezone": "browser",
    "refresh": "30s",
    "panels": [
      {
        "title": "Active Users",
        "type": "stat",
        "gridPos": { "x": 0, "y": 0, "w": 6, "h": 6 },
        "targets": [{
          "expr": "solana_ai_city_active_users",
          "legendFormat": "Active Users"
        }]
      },
      {
        "title": "Requests per Second",
        "type": "graph",
        "gridPos": { "x": 6, "y": 0, "w": 12, "h": 6 },
        "targets": [{
          "expr": "rate(solana_ai_city_http_requests_total[5m])",
          "legendFormat": "{{method}} {{path}}"
        }]
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "gridPos": { "x": 18, "y": 0, "w": 6, "h": 6 },
        "targets": [{
          "expr": "rate(solana_ai_city_http_requests_total{status=~\"5..\"}[5m]) / rate(solana_ai_city_http_requests_total[5m]) * 100",
          "legendFormat": "Error Rate %"
        }]
      },
      {
        "title": "Cities Created Today",
        "type": "stat",
        "gridPos": { "x": 0, "y": 6, "w": 6, "h": 6 },
        "targets": [{
          "expr": "increase(solana_ai_city_cities_created_total[24h])",
          "legendFormat": "New Cities"
        }]
      },
      {
        "title": "Quests Completed",
        "type": "graph",
        "gridPos": { "x": 6, "y": 6, "w": 12, "h": 6 },
        "targets": [{
          "expr": "increase(solana_ai_city_quests_completed_total[1h])",
          "legendFormat": "{{type}}"
        }]
      },
      {
        "title": "NFTs Minted",
        "type": "stat",
        "gridPos": { "x": 18, "y": 6, "w": 6, "h": 6 },
        "targets": [{
          "expr": "increase(solana_ai_city_nfts_minted_total[24h])",
          "legendFormat": "NFTs Minted"
        }]
      },
      {
        "title": "Response Time (95th percentile)",
        "type": "graph",
        "gridPos": { "x": 0, "y": 12, "w": 12, "h": 6 },
        "targets": [{
          "expr": "histogram_quantile(0.95, rate(solana_ai_city_http_request_duration_seconds_bucket[5m]))",
          "legendFormat": "{{path}}"
        }]
      },
      {
        "title": "Wallet Connections by Type",
        "type": "piechart",
        "gridPos": { "x": 12, "y": 12, "w": 12, "h": 6 },
        "targets": [{
          "expr": "solana_ai_city_wallet_connections_total",
          "legendFormat": "{{wallet_name}}"
        }]
      },
      {
        "title": "Transaction Success Rate",
        "type": "gauge",
        "gridPos": { "x": 0, "y": 18, "w": 6, "h": 6 },
        "targets": [{
          "expr": "(1 - rate(solana_ai_city_transactions_sent_total{status=\"failed\"}[5m]) / rate(solana_ai_city_transactions_sent_total[5m])) * 100",
          "legendFormat": "Success Rate"
        }]
      },
      {
        "title": "Revenue (24h)",
        "type": "stat",
        "gridPos": { "x": 6, "y": 18, "w": 6, "h": 6 },
        "targets": [{
          "expr": "increase(solana_ai_city_revenue_total[24h])",
          "legendFormat": "Revenue"
        }]
      }
    ]
  }
}
```

---

## SLOs & SLIs

### Service Level Objectives

| Service | SLI | SLO | Target |
|---------|-----|-----|--------|
| API Availability | Availability | 99.9% | 99.9% |
| API Latency (p95) | Latency | < 500ms | 500ms |
| API Latency (p99) | Latency | < 1000ms | 1000ms |
| Wallet Connection | Success Rate | > 99% | 99% |
| Transaction Success | Success Rate | > 98% | 98% |
| Page Load | Latency | < 3s | 3s |
| Error Rate | Error Rate | < 1% | 1% |

### Error Budget

| Service | Error Budget | Monthly Budget |
|---------|-------------|---------------|
| API | 0.1% | ~43 minutes downtime/month |
| Wallet | 1% | ~7.3 hours failed transactions/month |
| Page Load | 1% | ~7.3 hours slow loads/month |

### Reporting

```typescript
// Monthly SLO report generator
export async function generateSLOReport() {
  const report = {
    period: getCurrentMonth(),
    slo: [],
  };

  // Calculate each SLO
  const availability = await calculateAvailability();
  const latency95 = await calculateLatencyP95();
  const latency99 = await calculateLatencyP99();
  const walletSuccess = await calculateWalletSuccessRate();
  const txSuccess = await calculateTxSuccessRate();
  const pageLoad = await calculatePageLoadTime();
  const errorRate = await calculateErrorRate();

  report.slo = [
    { name: 'API Availability', value: availability, target: 99.9, status: availability >= 99.9 ? '✅' : '❌' },
    { name: 'API Latency (p95)', value: latency95, target: 500, status: latency95 < 500 ? '✅' : '❌' },
    { name: 'API Latency (p99)', value: latency99, target: 1000, status: latency99 < 1000 ? '✅' : '❌' },
    { name: 'Wallet Success', value: walletSuccess, target: 99, status: walletSuccess >= 99 ? '✅' : '❌' },
    { name: 'Tx Success', value: txSuccess, target: 98, status: txSuccess >= 98 ? '✅' : '❌' },
    { name: 'Page Load', value: pageLoad, target: 3000, status: pageLoad < 3000 ? '✅' : '❌' },
    { name: 'Error Rate', value: errorRate, target: 1, status: errorRate < 1 ? '✅' : '❌' },
  ];

  return report;
}
```

---

## Incident Response

### Runbook: High Error Rate

1. **Acknowledge** the alert in PagerDuty/Slack
2. **Check** Grafana dashboards for patterns
3. **Investigate** application logs
4. **Check** database connection pools
5. **Check** external service status (Solana RPC)
6. **If database issue**: 
   - Check connection leaks
   - Restart affected services
7. **If RPC issue**:
   - Try fallback RPC endpoints
   - Check Solana status page
8. **Communicate** with users if needed
9. **Document** incident in retrospectives

### Runbook: High Latency

1. **Check** database query performance
2. **Review** recent code deployments
3. **Check** for memory leaks
4. **Scale** horizontal if needed
5. **Add** caching where appropriate
6. **Optimize** slow queries

---

## Links

- **Dashboard**: https://grafana.solana-ai-city.com
- **Alertmanager**: https://alertmanager.solana-ai-city.com
- **Runbooks**: https://docs.solana-ai-city.com/runbooks
- **Status Page**: https://status.solana-ai-city.com
