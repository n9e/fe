import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Gauge from './Gauge';

describe('Gauge threshold label rendering', () => {
  it('uses a vertically compact viewBox for arc gauges', () => {
    const markup = renderToStaticMarkup(<Gauge min={0} max={100} value={50} custom={{ calc: 'last', textMode: 'value' }} />);
    const style = markup.match(/class="renderer-gauge-svg renderer-gauge-svg-arc" style="(.*?)"/)?.[1] ?? '';
    const width = Number(style.match(/width:([\d.]+)px/)?.[1]);
    const height = Number(style.match(/height:([\d.]+)px/)?.[1]);

    expect(markup).toContain('viewBox="8 -8 184 150"');
    expect(height / width).toBeCloseTo(150 / 184, 4);
  });

  it('keeps labels on an even radius and pins endpoint glyphs to the arc ends', () => {
    const markup = renderToStaticMarkup(
      <Gauge
        min={0}
        max={100}
        value={50}
        custom={{ calc: 'last', textMode: 'value', showLabels: true }}
        thresholds={{
          mode: 'absolute',
          steps: [
            { type: 'base', value: null, color: '#73bf69' },
            { value: 60, color: '#faad14' },
            { value: 80, color: '#f5222d' },
          ],
        }}
      />,
    );
    const rangeMarkup = markup.match(/<g class="renderer-gauge-range">([\s\S]*?)<\/g>/)?.[1];
    const labels = Array.from(rangeMarkup?.matchAll(/<text\b([^>]*)>(.*?)<\/text>/g) ?? []).map(([, attributes, text]) => ({ attributes, text }));

    expect(labels.map((label) => label.text)).toEqual(['0%', '60%', '80%', '100%']);
    expect(labels.map((label) => label.attributes.match(/text-anchor="(.*?)"/)?.[1])).toEqual(['start', 'middle', 'middle', 'end']);
    expect(Number(labels[0].attributes.match(/transform="rotate\(([-\d.]+)/)?.[1])).toBeCloseTo(-115);
    expect(Number(labels[3].attributes.match(/transform="rotate\(([-\d.]+)/)?.[1])).toBeCloseTo(115);

    const labelPositions = labels.map(({ attributes }) => {
      const x = Number(attributes.match(/\bx="([\d.-]+)"/)?.[1]);
      const y = Number(attributes.match(/\by="([\d.-]+)"/)?.[1]);
      return Math.hypot(x - 100, y - 86);
    });

    labelPositions.forEach((radius) => expect(radius).toBeCloseTo(86.5, 5));
  });

  it('keeps circular threshold labels in number-percent order and separates the end labels', () => {
    const markup = renderToStaticMarkup(
      <Gauge
        min={0}
        max={100}
        value={50}
        custom={{ calc: 'last', style: 'circle', textMode: 'value', showLabels: true }}
        thresholds={{
          mode: 'absolute',
          steps: [
            { type: 'base', value: null, color: '#73bf69' },
            { value: 60, color: '#faad14' },
            { value: 80, color: '#f5222d' },
          ],
        }}
      />,
    );
    const rangeMarkup = markup.match(/<g class="renderer-gauge-range">([\s\S]*?)<\/g>/)?.[1];
    const labels = Array.from(rangeMarkup?.matchAll(/<text\b([^>]*)>(.*?)<\/text>/g) ?? []).map(([, attributes, text]) => ({ attributes, text }));

    expect(labels.map((label) => label.text)).toEqual(['0%', '60%', '80%', '100%']);
    expect(Number(labels[2].attributes.match(/transform="rotate\(([-\d.]+)/)?.[1])).toBeCloseTo(-72);

    const x = (attributes: string) => Number(attributes.match(/\bx="([\d.-]+)"/)?.[1]);
    expect(x(labels[3].attributes)).toBeLessThan(x(labels[0].attributes));
    expect(x(labels[0].attributes) - x(labels[3].attributes)).toBeGreaterThan(25);
  });

  it('draws rounded bar caps centered exactly on the start and value boundaries', () => {
    const markup = renderToStaticMarkup(
      <Gauge min={0} max={100} value={25} custom={{ calc: 'last', style: 'circle', barStyle: 'rounded', showLabels: true, textMode: 'value' }} />,
    );
    const caps = Array.from(markup.matchAll(/<circle\b(?=[^>]*class="renderer-gauge-bar-cap")([^>]*)>/g)).map(([, attributes]) => ({
      endpoint: attributes.match(/data-endpoint="(.*?)"/)?.[1],
      x: Number(attributes.match(/\bcx="([\d.e-]+)"/)?.[1]),
      y: Number(attributes.match(/\bcy="([\d.e-]+)"/)?.[1]),
      radius: Number(attributes.match(/\br="([\d.e-]+)"/)?.[1]),
    }));

    expect(caps).toHaveLength(2);
    expect(caps[0]).toMatchObject({ endpoint: 'start', radius: 12 });
    expect(caps[0].x).toBeCloseTo(0);
    expect(caps[0].y).toBeCloseTo(-64);
    expect(caps[1]).toMatchObject({ endpoint: 'end', radius: 12 });
    expect(caps[1].x).toBeCloseTo(64);
    expect(caps[1].y).toBeCloseTo(0);
  });

  it('renders a smooth threshold color ramp on circle gauges when gradient is enabled', () => {
    const markup = renderToStaticMarkup(
      <Gauge
        min={0}
        max={100}
        value={50}
        custom={{ calc: 'last', style: 'circle', gradient: true, textMode: 'value' }}
        thresholds={{
          mode: 'absolute',
          steps: [
            { type: 'base', value: null, color: '#3FC453' },
            { value: 60, color: '#FF9919' },
            { value: 80, color: '#FF656B' },
          ],
        }}
      />,
    );
    const gradientMarkup = markup.match(/<g class="renderer-gauge-threshold-gradient"[^>]*>([\s\S]*?)<\/g>/)?.[1] ?? '';
    const fills = Array.from(gradientMarkup.matchAll(/\bfill="(.*?)"/g), ([, fill]) => fill);

    expect(fills.length).toBeGreaterThan(120);
    expect(new Set(fills).size).toBeGreaterThan(90);
  });

  it('applies the threshold gradient to the numeric value arc as well as the threshold ring', () => {
    const markup = renderToStaticMarkup(
      <Gauge
        min={0}
        max={100}
        value={50}
        custom={{ calc: 'last', style: 'circle', gradient: true, textMode: 'value' }}
        thresholds={{
          mode: 'absolute',
          steps: [
            { type: 'base', value: null, color: '#3FC453' },
            { value: 60, color: '#FF9919' },
            { value: 80, color: '#FF656B' },
          ],
        }}
      />,
    );
    const valueMarkup = markup.match(/<g class="renderer-gauge-value-fill"[^>]*>([\s\S]*?)<\/g>/)?.[1] ?? '';
    const paths = Array.from(valueMarkup.matchAll(/<path\b[^>]*fill="(.*?)"[^>]*>/g), ([, fill]) => fill);

    expect(paths.length).toBeGreaterThan(20);
    expect(new Set(paths).size).toBeGreaterThan(20);
  });

  it('applies segment spacing to the gaps between value segments', () => {
    const renderSegments = (segmentSpacing: number) =>
      renderToStaticMarkup(<Gauge min={0} max={100} value={100} custom={{ calc: 'last', segments: 4, segmentSpacing, textMode: 'value' }} />);
    const zeroSpacing = renderSegments(0).match(/<path\b(?=[^>]*class="renderer-gauge-value-segment")([^>]*)>/g) ?? [];
    const fullSpacing = renderSegments(0.5).match(/<path\b(?=[^>]*class="renderer-gauge-value-segment")([^>]*)>/g) ?? [];

    expect(zeroSpacing).toHaveLength(4);
    expect(fullSpacing).toHaveLength(4);
    expect(fullSpacing[0]).not.toEqual(zeroSpacing[0]);
  });

  it('segments the entire value track while filling only the portion reached by the value', () => {
    const markup = renderToStaticMarkup(<Gauge min={0} max={100} value={50} custom={{ calc: 'last', segments: 4, segmentSpacing: 0.16, textMode: 'value' }} />);
    const trackSegments = markup.match(/<path\b(?=[^>]*class="renderer-gauge-track-segment")[^>]*>/g) ?? [];
    const valueSegments = markup.match(/<path\b(?=[^>]*class="renderer-gauge-value-segment")[^>]*>/g) ?? [];

    expect(trackSegments).toHaveLength(4);
    expect(valueSegments).toHaveLength(2);
  });

  it('grows the value arc when the threshold band or threshold labels are hidden', () => {
    const getTrackPath = (showThresholds: boolean, showLabels: boolean) => {
      const markup = renderToStaticMarkup(<Gauge min={0} max={100} value={50} custom={{ calc: 'last', textMode: 'value', showThresholds, showLabels }} />);
      return markup.match(/<path class="renderer-gauge-track" d="(.*?)" fill=/)?.[1];
    };

    const standardTrack = getTrackPath(true, true);
    const noThresholdBandTrack = getTrackPath(false, true);
    const noLabelsTrack = getTrackPath(true, false);
    const noLabelsOrBandTrack = getTrackPath(false, false);

    expect(noThresholdBandTrack).not.toEqual(standardTrack);
    expect(noLabelsTrack).not.toEqual(standardTrack);
    expect(noLabelsOrBandTrack).not.toEqual(noThresholdBandTrack);
  });

  it('moves the value and name down when the sparkline is hidden', () => {
    const renderGauge = (showSparkline: boolean) =>
      renderToStaticMarkup(<Gauge min={0} max={100} value={50} name='series' custom={{ calc: 'last', textMode: 'valueAndName', showSparkline }} />);
    const getTextY = (markup: string, className: string) => Number(markup.match(new RegExp(`<text class="${className}"[^>]*\\by="([\\d.-]+)"`))?.[1]);
    const withSparkline = renderGauge(true);
    const withoutSparkline = renderGauge(false);

    expect(getTextY(withoutSparkline, 'renderer-gauge-value') - getTextY(withSparkline, 'renderer-gauge-value')).toBe(8);
    expect(getTextY(withoutSparkline, 'renderer-gauge-name') - getTextY(withSparkline, 'renderer-gauge-name')).toBe(8);
  });
});
