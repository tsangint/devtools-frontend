// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

export default class PerformanceMetricsModel extends SDK.SDKModel {
  /**
   * @param {!SDK.Target} target
   */
  constructor(target) {
    super(target);
    this._agent = target.performanceAgent();

    const mode = MetricMode;
    /** @type {!Map<string, !MetricMode>} */
    this._metricModes = new Map([
      ['TaskDuration', mode.CumulativeTime], ['ScriptDuration', mode.CumulativeTime],
      ['LayoutDuration', mode.CumulativeTime], ['RecalcStyleDuration', mode.CumulativeTime],
      ['LayoutCount', mode.CumulativeCount], ['RecalcStyleCount', mode.CumulativeCount]
    ]);

    /** @type {!Map<string, !{lastValue: (number|undefined), lastTimestamp: (number|undefined)}>} */
    this._metricData = new Map();
  }

  /**
   * @return {!Promise}
   */
  enable() {
    return this._agent.enable();
  }

  /**
   * @return {!Promise}
   */
  disable() {
    return this._agent.disable();
  }

  /**
   * @return {!Promise<!{metrics: !Map<string, number>, timestamp: number}>}
   */
  async requestMetrics() {
    const rawMetrics = await this._agent.getMetrics() || [];
    const metrics = new Map();
    const timestamp = performance.now();
    for (const metric of rawMetrics) {
      let data = this._metricData.get(metric.name);
      if (!data) {
        data = {};
        this._metricData.set(metric.name, data);
      }
      let value;
      switch (this._metricModes.get(metric.name)) {
        case MetricMode.CumulativeTime:
          value = data.lastTimestamp ?
              Number.constrain((metric.value - data.lastValue) * 1000 / (timestamp - data.lastTimestamp), 0, 1) :
              0;
          data.lastValue = metric.value;
          data.lastTimestamp = timestamp;
          break;
        case MetricMode.CumulativeCount:
          value = data.lastTimestamp ?
              Math.max(0, (metric.value - data.lastValue) * 1000 / (timestamp - data.lastTimestamp)) :
              0;
          data.lastValue = metric.value;
          data.lastTimestamp = timestamp;
          break;
        default:
          value = metric.value;
          break;
      }
      metrics.set(metric.name, value);
    }
    return {metrics: metrics, timestamp: timestamp};
  }
}

/** @enum {symbol} */
export const MetricMode = {
  CumulativeTime: Symbol('CumulativeTime'),
  CumulativeCount: Symbol('CumulativeCount'),
};

/* Legacy exported object */
self.SDK = self.SDK || {};

/* Legacy exported object */
SDK = SDK || {};

/** @constructor */
SDK.PerformanceMetricsModel = PerformanceMetricsModel;

/** @enum {symbol} */
SDK.PerformanceMetricsModel.MetricMode = MetricMode;

SDK.SDKModel.register(SDK.PerformanceMetricsModel, SDK.Target.Capability.DOM, false);
