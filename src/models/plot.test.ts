import {Channel} from 'vega-lite/build/src/channel';
import {Mark} from 'vega-lite/build/src/mark';

import {getTopSpecQueryItem, SpecQueryModel} from 'compassql/build/src/model';
import {SpecQuery} from 'compassql/build/src/query/spec';
import {Schema} from 'compassql/build/src/schema';

import {convertToPlotObjectsGroup, extractPlotObjects} from './plot';

import {DEFAULT_QUERY_CONFIG} from 'compassql/build/src/config';


describe('models/plot', () => {

  const schema = new Schema({fields: []});

  function buildSpecQueryModel(specQ: SpecQuery) {
    return SpecQueryModel.build(specQ, schema, DEFAULT_QUERY_CONFIG);
  }

  function buildSpecQueryModelGroup(specQs: SpecQuery[]) {
    const items = specQs.map(specQ => buildSpecQueryModel(specQ));
    return {
      name: 'a name',
      path: 'path',
      items: items,
    };
  }

  describe('convertToPlotObjectsGroup', () => {
    it('converts SpecQueryGroup<SpecQueryModel> to SpecQueryGroup<PlotObject>', () => {
      const group = buildSpecQueryModelGroup([
        {
          mark: Mark.BAR,
          encodings: [
            {channel: Channel.X}
          ]
        }
      ]);

      const data = {url: 'a/data/set.csv'};

      const plotObjectGroup = convertToPlotObjectsGroup(group, data);
      // should have a spec
      expect(getTopSpecQueryItem(plotObjectGroup).spec).toEqual(
        {
          data: { url: 'a/data/set.csv' },
          mark: 'bar',
          encoding: { x: {} },
          config:
          {
            overlay: { line: true },
            scale: { useUnaggregatedDomain: true }
          }
        });
    });
  });

  describe('extractPlotObjects', () => {
    it('extracts plot objects from SpecQueryGroup<PlotObject>', () => {
      const group = buildSpecQueryModelGroup([
        {
          mark: Mark.BAR,
          encodings: [
            {channel: Channel.X}
          ]
        }
      ]);

      const data = {url: 'a/data/set.csv'};

      const plotObjectGroup = convertToPlotObjectsGroup(group, data);
      const filter = {field: 'q1', range: [0, 1]};
      const plotObjects = extractPlotObjects(plotObjectGroup, [filter]);
      expect(plotObjects.length).toEqual(1);
      expect(plotObjects[0].spec).toEqual({
        data: { url: 'a/data/set.csv' },
        mark: 'bar',
        encoding: { x: {} },
        transform: [
          {filter}
        ],
        config:
        {
          overlay: { line: true },
          scale: { useUnaggregatedDomain: true }
        }
      });
    });
  });
});
