import * as React from 'react';

import renderIntoCanvas from './render-into-canvas';
import colorGenerator from '../../../utils/color-generator';
import { TNil } from '../../../type';

type CanvasSpanGraphProps = {
  items: { valueWidth: number; valueOffset: number; serviceName: string }[];
  valueWidth: number;
};

const getColor = (hex: string) => colorGenerator.getRgbColorByKey(hex);

export default class CanvasSpanGraph extends React.PureComponent<CanvasSpanGraphProps> {
  _canvasElm: HTMLCanvasElement | TNil;

  constructor(props: CanvasSpanGraphProps) {
    super(props);
    this._canvasElm = undefined;
  }

  componentDidMount() {
    this._draw();
  }

  componentDidUpdate() {
    this._draw();
  }

  _setCanvasRef = (elm: HTMLCanvasElement | TNil) => {
    this._canvasElm = elm;
  };

  _draw() {
    if (this._canvasElm) {
      const { valueWidth: totalValueWidth, items } = this.props;
      renderIntoCanvas(this._canvasElm, items, totalValueWidth, getColor);
    }
  }

  render() {
    return <canvas className='CanvasSpanGraph' ref={this._setCanvasRef} />;
  }
}
