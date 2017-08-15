import {Channel} from 'vega-lite/build/src/channel';
import {Mark} from 'vega-lite/build/src/mark';

import {SpecQueryModel} from 'compassql/build/src/model';
import {SpecQuery} from 'compassql/build/src/query/spec';
import {Schema} from 'compassql/build/src/schema';

import {convertToPlotList} from './plot';

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

      const plotObjectGroup = convertToPlotList(group, data);
      // should have a spec
      expect(plotObjectGroup[0].spec).toEqual(
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
});
