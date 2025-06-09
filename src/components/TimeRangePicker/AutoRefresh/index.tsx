// 要保证一下行为可以正常
// 1. 设置20s时，拿手机算了算差不多20s刷新
// 2. 20s切换到1m时，间隔会从20s 到1m
// 3. off时不触发
// 4. 从off切换到5s时可以正常触发
// 5. 切换到其他页面时，会关闭（不会出发之前的轮询）
import React, { useState, useEffect, useRef, useImperativeHandle } from 'react';
import { Dropdown, Button, Menu, Tooltip } from 'antd';
import { DownOutlined, UpOutlined, SyncOutlined } from '@ant-design/icons';
import _ from 'lodash';
import './style.less';

const refreshMap = {
  0: 'Off',
  5: '5s',
  10: '10s',
  20: '20s',
  30: '30s',
  60: '1m',
  120: '2m',
  180: '3m',
  300: '5m',
  600: '10m',
};

interface IProps {
  tooltip?: string;
  onRefresh: () => void;
  localKey?: string;
  intervalSeconds?: number;
  onIntervalSecondsChange?: (intervalSeconds: number) => void;
}

function Refresh(props: IProps, ref) {
  const intervalSecondsCache = props.localKey ? _.toNumber(window.localStorage.getItem(props.localKey)) : 0;
  const [intervalSeconds, setIntervalSeconds] = useState(props.intervalSeconds || intervalSecondsCache);
  const [visible, setVisible] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();
  const removeRef = useRef(false);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (intervalSeconds) {
      (function loop() {
        if (removeRef.current) return;
        intervalRef.current = setTimeout(function () {
          props.onRefresh();
          loop();
        }, intervalSeconds * 1000);
      })();
    }
  }, [intervalSeconds, props.onRefresh]);

  useEffect(() => {
    return () => {
      removeRef.current = true;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setIntervalSeconds(props.intervalSeconds || intervalSecondsCache);
  }, [props.intervalSeconds]);

  useImperativeHandle(ref, () => ({
    closeRefresh() {
      setIntervalSeconds(0);
      props.localKey && window.localStorage.setItem(props.localKey, '0');
    },
  }));

  return (
    <div className='auto-refresh-container'>
      <Tooltip title={props.tooltip}>
        <Button icon={<SyncOutlined className={intervalSeconds ? 'rotate-icon' : ''} />} onClick={props.onRefresh} />
      </Tooltip>
      <Dropdown
        trigger={['click']}
        visible={visible}
        onVisibleChange={(visible) => {
          setVisible(visible);
        }}
        overlay={
          <Menu
            onClick={(e) => {
              setIntervalSeconds(_.toNumber(e.key));
              props.localKey && window.localStorage.setItem(props.localKey, e.key);
              props.onIntervalSecondsChange && props.onIntervalSecondsChange(_.toNumber(e.key));
              setVisible(false);
            }}
          >
            {_.map(refreshMap, (text, value) => {
              return <Menu.Item key={value}>{text}</Menu.Item>;
            })}
          </Menu>
        }
      >
        <Button
          onClick={() => {
            setVisible(!visible);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {refreshMap[intervalSeconds]} {visible ? <UpOutlined /> : <DownOutlined style={{ fontSize: 12 }} />}
        </Button>
      </Dropdown>
    </div>
  );
}

export default React.forwardRef(Refresh);
