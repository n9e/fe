/* eslint-disable react/no-access-state-in-setstate */
/* eslint-disable operator-linebreak */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prop-types */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  Row, Col, Select, Input, DatePicker, Tag, message,
  Popconfirm, Badge, Button, Dropdown, Menu, Icon,
} from 'antd';
import moment from 'moment';
import _ from 'lodash';
import queryString from 'query-string';
import { FormattedMessage, injectIntl } from 'react-intl';
import {
  prefixCls, timeOptions, priorityOptions, eventTypeOptions,
} from '@common/config';
import request from '@pkgs/request';
import api from '@common/api';
import FetchTable from '@pkgs/FetchTable';

const nPrefixCls = `${prefixCls}-history`;
const { Option } = Select;
const { Search } = Input;

class index extends Component {
  static propTypes = {
    type: PropTypes.string.isRequired,
    nodepath: PropTypes.string,
    nid: PropTypes.number,
  };

  static defaultProps = {
    nodepath: undefined,
    nid: undefined,
  };

  constructor(props) {
    super(props);
    const now = moment();
    if (props.type === 'alert') {
      this.othenParamsKey = ['stime', 'etime', 'priorities', 'nodepath'];
    } else {
      this.othenParamsKey = ['stime', 'etime', 'priorities', 'nodepath', 'type'];
    }
    // eslint-disable-next-line no-restricted-globals
    const query = queryString.parse(location.search);
    this.state = {
      ...this.state,
      url: props.type === 'alert' ? `${api.event}/cur` : `${api.event}/his`,
      data: [],
      loading: false,
      customTime: false,
      hours: query.hours || 2,
      stime: now.clone().subtract(query.hours || 2, 'hours').unix(),
      etime: now.clone().unix(),
      priorities: undefined,
      type: query.type || undefined,
      nodepath: props.nodepath,
    };
  }

  componentWillReceiveProps = (nextProps) => {
    if (this.props.nodepath !== nextProps.nodepath) {
      const { stime, etime } = this.state;
      const now = moment();
      const newEtime = now.clone().unix();
      const duration = newEtime - etime;
      this.setState({
        nodepath: nextProps.nodepath,
        stime: stime + duration,
        etime: newEtime,
      });
    }
  }

  updateTime = (updateState) => {
    const now = moment();
    const duration = this.state.etime - this.state.stime;
    this.setState({
      stime: now.clone().unix() - duration,
      etime: now.clone().unix(),
      ...updateState,
    });
  }

  handleDelete = (id) => {
    request(`${api.event}/cur/${id}`, {
      method: 'DELETE',
    }).then(() => {
      message.success(this.props.intl.formatMessage({ id: 'event.msg.ignore.success' }));
      this.fetchTable.reload();
    });
  }

  handleClaim = (id) => {
    request(`${this.state.url}/claim`, {
      method: 'POST',
      body: JSON.stringify({ id }),
    }).then(() => {
      message.success(this.props.intl.formatMessage({ id: 'event.msg.claim.success' }));
      this.fetchTable.reload();
    });
  }

  handleClaimAll = () => {
    request(`${this.state.url}/claim`, {
      method: 'POST',
      body: JSON.stringify({
        nodepath: this.props.nodepath,
      }),
    }).then(() => {
      message.success(this.props.intl.formatMessage({ id: 'event.msg.claim.all.success' }));
      this.fetchTable.reload();
    });
  }

  getColumns() {
    const columns = [
      {
        title: <FormattedMessage id="event.table.time" />,
        dataIndex: 'etime',
        width: 110,
        render: (text) => {
          return moment.unix(text).format('YYYY-MM-DD HH:mm:ss');
        },
      }, {
        title: <FormattedMessage id="event.table.stra" />,
        dataIndex: 'sname',
        width: 100,
      }, {
        title: <FormattedMessage id="event.table.priority" />,
        dataIndex: 'priority',
        width: 60,
        render: (text) => {
          const priorityObj = _.find(priorityOptions, { value: text });
          return (
            <Tag color={_.get(priorityObj, 'color')}>
              {_.get(priorityObj, 'label')}
            </Tag>
          );
        },
      }, {
        title: 'Endpoint',
        dataIndex: 'endpoint',
      }, {
        title: '????????????',
        dataIndex: 'cur_node_path',
      }, {
        title: 'Tags',
        dataIndex: 'tags',
        width: 100,
        render: (text) => {
          return (
            <div>
              {text}
            </div>
          );
        },
      }, {
        title: <FormattedMessage id="event.table.notify" />,
        dataIndex: 'status',
        width: 80,
        render: (text) => {
          return _.join(text, ', ');
        },
      }, {
        title: <FormattedMessage id="table.operations" />,
        width: 80,
        render: (text, record) => {
          return (
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item>
                    <Link
                      to={{
                        pathname: `/history/${this.props.type === 'alert' ? 'cur' : 'his'}/${record.id}`,
                      }}
                      target="_blank"
                    >
                      <FormattedMessage id="table.detail" />
                    </Link>
                  </Menu.Item>
                  {
                    this.props.type === 'alert' ?
                      <Menu.Item>
                        <Popconfirm title={<FormattedMessage id="event.table.ignore.sure" />} onConfirm={() => this.handleDelete(record.id)}>
                          <a><FormattedMessage id="event.table.ignore" /></a>
                        </Popconfirm>
                      </Menu.Item> : null
                  }
                  {
                    this.props.type === 'alert' ?
                      <Menu.Item>
                        <Popconfirm title={<FormattedMessage id="event.table.claim.sure" />} onConfirm={() => this.handleClaim(record.id)}>
                          <a><FormattedMessage id="event.table.claim" /></a>
                        </Popconfirm>
                      </Menu.Item> : null
                  }
                  <Menu.Item>
                    <Link
                      to={{
                        pathname: '/silence/add',
                        search: `${this.props.type === 'alert' ? 'cur' : 'his'}=${record.id}&nid=${this.props.nid}`,
                      }}
                      target="_blank"
                    >
                      <FormattedMessage id="event.table.shield" />
                    </Link>
                  </Menu.Item>
                </Menu>
              }
            >
              <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
                <Icon type="more" style={{ fontSize: 24, fontWeight: 900 }} />
              </a>
            </Dropdown>
          );
        },
      },
    ];
    if (this.props.type === 'alert') {
      columns.splice(5, 0, {
        title: <FormattedMessage id="event.table.assignees" />,
        dataIndex: 'claimants',
        width: 70,
        // fixed: 'right',
        render: (text) => {
          return _.join(text, ', ');
        },
      });
    }
    if (this.props.type === 'all') {
      columns.splice(3, 0, {
        title: <FormattedMessage id="event.table.status" />,
        dataIndex: 'event_type',
        width: 90,
        render: (text) => {
          const eventTypeObj = _.find(eventTypeOptions, { value: text }) || {};
          return (
            <span style={{ color: eventTypeObj.color }}>
              <Badge status={eventTypeObj.status} />
              <FormattedMessage id={`event.table.status.${eventTypeObj.value}`} />
            </span>
          );
        },
      });
    }
    return columns;
  }

  render() {
    const {
      searchValue: query, customTime, stime, etime, priorities, nodepath, type, hours,
    } = this.state;
    const duration = customTime ? 'custom' : hours;
    const reqQuery = {
      stime, etime, priorities, nodepath, query,
    };

    if (hours) {
      delete reqQuery.stime;
      delete reqQuery.etime;
      reqQuery.hours = hours;
    }

    if (this.props.type !== 'alert') {
      reqQuery.type = type;
    }

    return (
      <div className={nPrefixCls}>
        <div className={`${nPrefixCls}-operationbar`} style={{ marginBottom: 10 }}>
          <Row>
            <Col span={18}>
              <Select
                style={{ width: 100, marginRight: 8 }}
                value={duration}
                onChange={(val) => {
                  if (val !== 'custom') {
                    this.setState({ hours: val });
                  } else {
                    this.setState({ customTime: true, hours: undefined });
                  }
                }}
              >
                {
                  _.map(timeOptions, (option) => {
                    return (
                      <Option key={option.value} value={option.value}>
                        <FormattedMessage id={option.label} />
                      </Option>
                    );
                  })
                }
              </Select>
              {
                customTime ?
                  <span>
                    <DatePicker
                      style={{ marginRight: 8 }}
                      showTime
                      format="YYYY-MM-DD HH:mm:ss"
                      value={moment.unix(stime)}
                      placeholder="????????????"
                      onChange={(val) => {
                        this.setState({ stime: val.unix() });
                      }}
                    />
                    <DatePicker
                      style={{ marginRight: 8 }}
                      showTime
                      format="YYYY-MM-DD HH:mm:ss"
                      value={moment.unix(etime)}
                      placeholder="????????????"
                      onChange={(val) => {
                        this.setState({ etime: val.unix() });
                      }}
                    />
                  </span> : null
              }
              {
                this.props.type === 'all' ?
                  <Select
                    style={{ minWidth: 100, marginRight: 8 }}
                    placeholder={<FormattedMessage id="event.table.status" />}
                    allowClear
                    value={type}
                    onChange={(value) => {
                      this.updateTime({ type: value });
                    }}
                  >
                    {
                      _.map(eventTypeOptions, (option) => {
                        return <Option key={option.value} value={option.value}><FormattedMessage id={`event.table.status.${option.value}`} /></Option>;
                      })
                    }
                  </Select> : null
              }
              <Select
                style={{ minWidth: 90, marginRight: 8 }}
                placeholder={<FormattedMessage id="event.table.priority" />}
                allowClear
                mode="multiple"
                value={priorities ? _.map(_.split(priorities, ','), _.toNumber) : []}
                onChange={(value) => {
                  this.updateTime({ priorities: !_.isEmpty(value) ? _.join(value, ',') : undefined });
                }}
              >
                {
                  _.map(priorityOptions, (option) => {
                    return <Option key={option.value} value={option.value}>{option.label}</Option>;
                  })
                }
              </Select>
              <Search
                placeholder="?????????????????????"
                style={{ width: 200 }}
                onSearch={(value) => {
                  this.setState({ searchValue: value });
                }}
              />
            </Col>
            <Col span={6} style={{ textAlign: 'right' }}>
              {
                this.props.type === 'alert' ?
                  <Popconfirm title={<FormattedMessage id="event.table.claim.all.sure" />} onConfirm={() => this.handleClaimAll()}>
                    <Button><FormattedMessage id="event.table.claim.all" /></Button>
                  </Popconfirm> : null
              }
            </Col>
          </Row>
        </div>
        <div className="alarm-strategy-content">
          <FetchTable
            ref={(ref) => { this.fetchTable = ref; }}
            url={this.state.url}
            query={reqQuery}
            tableProps={{
              columns: this.getColumns(),
              scroll: { x: 900 },
            }}
          />
        </div>
      </div>
    );
  }
}

export default injectIntl(index);
