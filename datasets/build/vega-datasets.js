(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, global.vegaDatasets = factory());
}(this, (function () { 'use strict';

    var version = "1.31.1";

    var urls = {
        'annual-precip.json': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/annual-precip.json`,
        'anscombe.json': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/anscombe.json`,
        'barley.json': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/barley.json`,
        'birdstrikes.json': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/birdstrikes.json`,
        'budget.json': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/budget.json`,
        'budgets.json': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/budgets.json`,
        'burtin.json': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/burtin.json`,
        'cars.json': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/cars.json`,
        'climate.json': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/climate.json`,
        'countries.json': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/countries.json`,
        'crimea.json': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/crimea.json`,
        'driving.json': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/driving.json`,
        'earthquakes.json': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/earthquakes.json`,
        'flare-dependencies.json': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/flare-dependencies.json`,
        'flare.json': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/flare.json`,
        'flights-10k.json': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/flights-10k.json`,
        'flights-200k.json': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/flights-200k.json`,
        'flights-20k.json': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/flights-20k.json`,
        'flights-2k.json': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/flights-2k.json`,
        'flights-5k.json': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/flights-5k.json`,
        'gapminder.json': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/gapminder.json`,
        'graticule.json': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/graticule.json`,
        'income.json': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/income.json`,
        'iris.json': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/iris.json`,
        'jobs.json': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/jobs.json`,
        'londonBoroughs.json': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/londonBoroughs.json`,
        'londonCentroids.json': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/londonCentroids.json`,
        'londonTubeLines.json': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/londonTubeLines.json`,
        'miserables.json': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/miserables.json`,
        'monarchs.json': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/monarchs.json`,
        'movies.json': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/movies.json`,
        'normal-2d.json': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/normal-2d.json`,
        'obesity.json': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/obesity.json`,
        'ohlc.json': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/ohlc.json`,
        'points.json': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/points.json`,
        'population.json': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/population.json`,
        'udistrict.json': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/udistrict.json`,
        'unemployment-across-industries.json': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/unemployment-across-industries.json`,
        'uniform-2d.json': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/uniform-2d.json`,
        'us-10m.json': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/us-10m.json`,
        'us-state-capitals.json': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/us-state-capitals.json`,
        'volcano.json': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/volcano.json`,
        'weather.json': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/weather.json`,
        'weball26.json': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/weball26.json`,
        'wheat.json': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/wheat.json`,
        'world-110m.json': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/world-110m.json`,
        'airports.csv': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/airports.csv`,
        'co2-concentration.csv': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/co2-concentration.csv`,
        'disasters.csv': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/disasters.csv`,
        'flights-3m.csv': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/flights-3m.csv`,
        'flights-airport.csv': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/flights-airport.csv`,
        'gapminder-health-income.csv': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/gapminder-health-income.csv`,
        'github.csv': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/github.csv`,
        'iowa-electricity.csv': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/iowa-electricity.csv`,
        'la-riots.csv': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/la-riots.csv`,
        'lookup_groups.csv': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/lookup_groups.csv`,
        'lookup_people.csv': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/lookup_people.csv`,
        'population_engineers_hurricanes.csv': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/population_engineers_hurricanes.csv`,
        'seattle-temps.csv': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/seattle-temps.csv`,
        'seattle-weather.csv': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/seattle-weather.csv`,
        'sf-temps.csv': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/sf-temps.csv`,
        'sp500.csv': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/sp500.csv`,
        'stocks.csv': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/stocks.csv`,
        'us-employment.csv': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/us-employment.csv`,
        'weather.csv': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/weather.csv`,
        'windvectors.csv': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/windvectors.csv`,
        'zipcodes.csv': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/zipcodes.csv`,
        'unemployment.tsv': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/unemployment.tsv`,
        'flights-200k.arrow': `https://cdn.jsdelivr.net/npm/vega-datasets@${version}/data/flights-200k.arrow`,
    };

    var EOL = {},
        EOF = {},
        QUOTE = 34,
        NEWLINE = 10,
        RETURN = 13;

    function objectConverter(columns) {
      return new Function("d", "return {" + columns.map(function(name, i) {
        return JSON.stringify(name) + ": d[" + i + "] || \"\"";
      }).join(",") + "}");
    }

    function customConverter(columns, f) {
      var object = objectConverter(columns);
      return function(row, i) {
        return f(object(row), i, columns);
      };
    }

    // Compute unique columns in order of discovery.
    function inferColumns(rows) {
      var columnSet = Object.create(null),
          columns = [];

      rows.forEach(function(row) {
        for (var column in row) {
          if (!(column in columnSet)) {
            columns.push(columnSet[column] = column);
          }
        }
      });

      return columns;
    }

    function pad(value, width) {
      var s = value + "", length = s.length;
      return length < width ? new Array(width - length + 1).join(0) + s : s;
    }

    function formatYear(year) {
      return year < 0 ? "-" + pad(-year, 6)
        : year > 9999 ? "+" + pad(year, 6)
        : pad(year, 4);
    }

    function formatDate(date) {
      var hours = date.getUTCHours(),
          minutes = date.getUTCMinutes(),
          seconds = date.getUTCSeconds(),
          milliseconds = date.getUTCMilliseconds();
      return isNaN(date) ? "Invalid Date"
          : formatYear(date.getUTCFullYear()) + "-" + pad(date.getUTCMonth() + 1, 2) + "-" + pad(date.getUTCDate(), 2)
          + (milliseconds ? "T" + pad(hours, 2) + ":" + pad(minutes, 2) + ":" + pad(seconds, 2) + "." + pad(milliseconds, 3) + "Z"
          : seconds ? "T" + pad(hours, 2) + ":" + pad(minutes, 2) + ":" + pad(seconds, 2) + "Z"
          : minutes || hours ? "T" + pad(hours, 2) + ":" + pad(minutes, 2) + "Z"
          : "");
    }

    function dsv(delimiter) {
      var reFormat = new RegExp("[\"" + delimiter + "\n\r]"),
          DELIMITER = delimiter.charCodeAt(0);

      function parse(text, f) {
        var convert, columns, rows = parseRows(text, function(row, i) {
          if (convert) return convert(row, i - 1);
          columns = row, convert = f ? customConverter(row, f) : objectConverter(row);
        });
        rows.columns = columns || [];
        return rows;
      }

      function parseRows(text, f) {
        var rows = [], // output rows
            N = text.length,
            I = 0, // current character index
            n = 0, // current line number
            t, // current token
            eof = N <= 0, // current token followed by EOF?
            eol = false; // current token followed by EOL?

        // Strip the trailing newline.
        if (text.charCodeAt(N - 1) === NEWLINE) --N;
        if (text.charCodeAt(N - 1) === RETURN) --N;

        function token() {
          if (eof) return EOF;
          if (eol) return eol = false, EOL;

          // Unescape quotes.
          var i, j = I, c;
          if (text.charCodeAt(j) === QUOTE) {
            while (I++ < N && text.charCodeAt(I) !== QUOTE || text.charCodeAt(++I) === QUOTE);
            if ((i = I) >= N) eof = true;
            else if ((c = text.charCodeAt(I++)) === NEWLINE) eol = true;
            else if (c === RETURN) { eol = true; if (text.charCodeAt(I) === NEWLINE) ++I; }
            return text.slice(j + 1, i - 1).replace(/""/g, "\"");
          }

          // Find next delimiter or newline.
          while (I < N) {
            if ((c = text.charCodeAt(i = I++)) === NEWLINE) eol = true;
            else if (c === RETURN) { eol = true; if (text.charCodeAt(I) === NEWLINE) ++I; }
            else if (c !== DELIMITER) continue;
            return text.slice(j, i);
          }

          // Return last token before EOF.
          return eof = true, text.slice(j, N);
        }

        while ((t = token()) !== EOF) {
          var row = [];
          while (t !== EOL && t !== EOF) row.push(t), t = token();
          if (f && (row = f(row, n++)) == null) continue;
          rows.push(row);
        }

        return rows;
      }

      function preformatBody(rows, columns) {
        return rows.map(function(row) {
          return columns.map(function(column) {
            return formatValue(row[column]);
          }).join(delimiter);
        });
      }

      function format(rows, columns) {
        if (columns == null) columns = inferColumns(rows);
        return [columns.map(formatValue).join(delimiter)].concat(preformatBody(rows, columns)).join("\n");
      }

      function formatBody(rows, columns) {
        if (columns == null) columns = inferColumns(rows);
        return preformatBody(rows, columns).join("\n");
      }

      function formatRows(rows) {
        return rows.map(formatRow).join("\n");
      }

      function formatRow(row) {
        return row.map(formatValue).join(delimiter);
      }

      function formatValue(value) {
        return value == null ? ""
            : value instanceof Date ? formatDate(value)
            : reFormat.test(value += "") ? "\"" + value.replace(/"/g, "\"\"") + "\""
            : value;
      }

      return {
        parse: parse,
        parseRows: parseRows,
        format: format,
        formatBody: formatBody,
        formatRows: formatRows,
        formatRow: formatRow,
        formatValue: formatValue
      };
    }

    var csv = dsv(",");

    var csvParse = csv.parse;

    function autoType(object) {
      for (var key in object) {
        var value = object[key].trim(), number, m;
        if (!value) value = null;
        else if (value === "true") value = true;
        else if (value === "false") value = false;
        else if (value === "NaN") value = NaN;
        else if (!isNaN(number = +value)) value = number;
        else if (m = value.match(/^([-+]\d{2})?\d{4}(-\d{2}(-\d{2})?)?(T\d{2}:\d{2}(:\d{2}(\.\d{3})?)?(Z|[-+]\d{2}:\d{2})?)?$/)) {
          if (fixtz && !!m[4] && !m[7]) value = value.replace(/-/g, "/").replace(/T/, " ");
          value = new Date(value);
        }
        else continue;
        object[key] = value;
      }
      return object;
    }

    // https://github.com/d3/d3-dsv/issues/45
    var fixtz = new Date("2019-01-01T00:00").getHours() || new Date("2019-07-01T00:00").getHours();

    var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    const data = {};
    for (const name of Object.keys(urls)) {
        const url = urls[name];
        const f = function () {
            return __awaiter(this, void 0, void 0, function* () {
                const result = yield fetch(url);
                if (name.endsWith('.json')) {
                    return yield result.json();
                }
                else if (name.endsWith('.csv')) {
                    // TODO: remove "as any" once @types/d3-dsv has been updated
                    return csvParse(yield result.text(), autoType);
                }
                else {
                    return yield result.text();
                }
            });
        };
        f.url = url;
        data[name] = f;
    }

    return data;

})));
//# sourceMappingURL=vega-datasets.js.map
