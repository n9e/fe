const en_US = {
  title: 'Notification settings',
  webhooks: {
    help_content:
      'Callback mechanism, used for integration between Nightingale and other systems. After Nightingale generates an alarm event, it will be pushed to various callback addresses. You can develop an HTTP API by yourself and configure it here to receive Nightingale alarm events and then do some automated, customized logic. The HTTP method used by Nightingale when calling back is POST, and the content of the alarm event will be placed in the HTTP Request Body in JSON format. Please refer to here for the event data structure. You can find a machine that is networked with Nightingale (assuming its IP is 10.1.2.3), start a port on it with nc, for example, `nc -k -l 4321` can use nc to listen on port 4321, then you configure `http://10.1.2.3:4321` into the callback address, then go to create an alarm rule, once triggered, Nightingale will call back this address, you can see the detailed data format of Nightingale callback in the output of the nc command.',
    title: 'Callbacks',
    enable: 'Enable',
    note: 'Note',
    url: 'URL',
    timeout: 'Timeout (unit: s)',
    basic_auth_user: 'Username (Basic Auth)',
    basic_auth_password: 'Password (Basic Auth)',
    skip_verify: 'Skip SSL',
    add: 'Add',
    help: `
      If you want to forward all Nightingale alarm events to another platform for processing, you can achieve this through the global callback address here.
      <br />
      <br />
      Generally speaking, the monitoring system focuses on data collection, storage, analysis, and alarm event generation. For the subsequent distribution, noise reduction, recognition, upgrade, scheduling, and collaboration of events, it is usually solved by a separate product, which is collectively called an event OnCall product. OnCall products are widely used in companies that practice the SRE concept.
      <br />
      <br />
      OnCall products usually can connect to various monitoring systems, such as Prometheus, Nightingale, Zabbix, ElastAlert, Blue Whale, various cloud monitoring, etc. Each monitoring system pushes alarm events to the OnCall center through WebHook, and users complete subsequent distribution, noise reduction, and processing in the OnCall center.
      <br />
      <br />
      The OnCall product is first launched overseas with <a1>PagerDuty</a1> and domestically with <a2>FlashDuty</a2>, Everyone can register for a free trial。
    `,
  },
  script: {
    title: 'Script',
    enable: 'Enable',
    timeout: 'Timeout (unit: s)',
    type: ['Script', 'File Path'],
    path: 'Path',
  },
  channels: {
    title: 'Channels',
    name: 'Name',
    ident: 'Ident',
    ident_msg1: 'Ident must contain letters, numbers, underscores and hyphens',
    ident_msg2: 'Ident already exists',
    hide: 'Hide',
    add: 'Add',
    add_title: 'Add channel',
    edit_title: 'Edit channel',
    enabled: 'Enabled',
  },
  contacts: {
    title: 'Contacts',
    add_title: 'Add contact',
    edit_title: 'Edit contact',
  },
  smtp: {
    title: 'SMTP',
    testMessage: 'Test email has been sent, please check',
  },
  ibex: {
    title: 'Ibex settings',
  },
};
export default en_US;
