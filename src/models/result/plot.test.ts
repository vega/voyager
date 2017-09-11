import {Channel} from 'vega-lite/build/src/channel';
import {Mark} from 'vega-lite/build/src/mark';

import {SpecQueryModel} from 'compassql/build/src/model';
import {SpecQuery} from 'compassql/build/src/query/spec';
import {Schema} from 'compassql/build/src/schema';

import {fromSpecQueryModelGroup} from './plot';

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

  describe('convertToPlotListWithKey', () => {
    it('converts SpecQueryGroup<SpecQueryModel> to ResultPlotWithKey[]', () => {
      const group = buildSpecQueryModelGroup([
        {
          mark: Mark.BAR,
          encodings: [
            {channel: Channel.X}
          ]
        }
      ]);

      const plotWithKey = fromSpecQueryModelGroup(group, {name: 'a'});
      // should have a spec
      expect(plotWithKey[0].plot.spec).toEqual(
        {
          data: {name: 'a'},
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
