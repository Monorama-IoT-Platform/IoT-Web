/**
 * @typedef {Object} EnabledMetrics
 * @property {boolean} [pm25Value]
 * @property {boolean} [pm25Level]
 * @property {boolean} [pm10Value]
 * @property {boolean} [pm10Level]
 * @property {boolean} [temperature]
 * @property {boolean} [temperatureLevel]
 * @property {boolean} [humidity]
 * @property {boolean} [humidityLevel]
 * @property {boolean} [co2Value]
 * @property {boolean} [co2Level]
 * @property {boolean} [vocValue]
 * @property {boolean} [vocLevel]
 * @property {boolean} [picoDeviceLatitude]
 * @property {boolean} [picoDeviceLongitude]
 */

/**
 * @typedef {Object} Point
 * @property {string} time - ISO datetime
 * @property {Record<string, number|null>} metrics
 */

/**
 * @typedef {Object} AirProjectSeriesResponseDto
 * @property {number} projectId
 * @property {string} rangeStart
 * @property {string} rangeEnd
 * @property {number} stepSec
 * @property {number} totalBucketCount
 * @property {EnabledMetrics} enabledMetrics
 * @property {Point[]} points
 */

export const types = {};
