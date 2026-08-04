const en_US = {
  title: 'Notification settings',
  disabled: 'Disable',
  webhooks: {
    help_content:
      'Callback mechanism for integrating Nightingale with other systems. After Nightingale generates an alert event, it pushes the event to each callback URL. You can build your own HTTP API and configure it here to receive Nightingale alert events and run automated, customized logic. Nightingale calls back with HTTP POST and puts the alert event in the request body as JSON; refer to the docs for the event data structure. To try it out, find a machine reachable from Nightingale (say its IP is 10.1.2.3), listen on a port with nc (e.g. `nc -k -l 4321`), configure `http://10.1.2.3:4321` as the callback URL, then create an alert rule; once it triggers, Nightingale calls back this address and the nc output shows the exact callback data format.',
    title: 'Callbacks',
    enable: 'Enable',
    note: 'Note',
    url: 'URL',
    timeout: 'Timeout (unit: s)',
    basic_auth_user: 'Username (Basic Auth)',
    basic_auth_password: 'Password (Basic Auth)',
    skip_verify: 'Skip SSL verify',
    add: 'Add',
    help: `
      If you want to forward all Nightingale alert events to another platform for processing, you can achieve this through the global callback URL here.
      <br />
      <br />
      Generally speaking, the monitoring system focuses on data collection, storage, analysis, and alert event generation. The subsequent routing, noise reduction, claiming, escalation, scheduling, and collaboration on events is usually handled by a separate product, collectively called an OnCall product. OnCall products are widely used in companies that practice the SRE concept.
      <br />
      <br />
      OnCall products usually can connect to various monitoring systems, such as Prometheus, Nightingale, Zabbix, ElastAlert, Blue Whale, various cloud monitoring, etc. Each monitoring system pushes alert events to the OnCall center through webhooks, and users complete subsequent routing, noise reduction, and processing in the OnCall center.
      <br />
      <br />
      Well-known OnCall products include <a1>PagerDuty</a1> overseas and <a2>FlashDuty</a2> in China. You can register for a free trial.
    `,
  },
  script: {
    title: 'Script',
    enable: 'Enable',
    timeout: 'Timeout (unit: s)',
    type: ['Script', 'File path'],
    path: 'Path',
    content: 'Script content',
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
