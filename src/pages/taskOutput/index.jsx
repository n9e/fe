import React, { Component } from 'react';
import { Spin } from 'antd';
import _ from 'lodash';
import request from '@/utils/request';
import api from '@/utils/api';

export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      data: [],
    };
  }

  componentDidMount = () => {
    this.fetchData();
    document.title = '任务输出';
    document.body.style.backgroundColor = '#fff';
    document.body.style.color = '#000';
  };

  componentWillMount = () => {
    document.body.style.backgroundColor = '#f0f2f5';
    document.body.style.color = 'rgba(0, 0, 0, 0.65)';
  };

  fetchData() {
    const busiId = _.get(this.props, 'match.params.busiId');
    const taskId = _.get(this.props, 'match.params.taskId');
    const outputType = _.get(this.props, 'match.params.outputType');

    if (taskId !== undefined && outputType !== undefined) {
      this.setState({ loading: true });
      request(`${api.task(busiId)}/${taskId}/${outputType}`)
        .then((data) => {
          this.setState({ data: data.dat });
        })
        .finally(() => {
          this.setState({ loading: false });
        });
    }
  }

  getOutput() {
    const outputType = _.get(this.props, 'match.params.outputType');
    const { data } = this.state;
    let output = '';
    _.each(data, (item) => {
      output += `${item.host}\n`;
      output += `${item[outputType]}\n\n`;
    });
    return output;
  }

  render() {
    const { loading } = this.state;
    const output = this.getOutput();
    return (
      <Spin spinning={loading}>
        <pre style={{ fontSize: 12, padding: 10, height: '100vh', width: '100vw' }}>{output}</pre>
      </Spin>
    );
  }
}
