import _ from 'lodash';

const ENABLED_DATASOURCE_CATES = ['prometheus'];

// 如果是旧版通知规则，这里的高级设置需要展示：通知升级、通知聚合
// 或者如果是 prometheus 数据源，这里的高级设置需要展示：网络设备高级配置、生效网络设备、关联采集模板
export default function shouldShowAdvancedSettings(notifyVersion: number, datasourceCate: string) {
  return notifyVersion === 0 || _.includes(ENABLED_DATASOURCE_CATES, datasourceCate);
}
