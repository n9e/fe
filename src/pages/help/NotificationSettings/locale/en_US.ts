const en_US = {
  title: 'Notification Settings',
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
      Dear Nightingale users, if you want to forward all Nightingale alarm events to another platform for processing, you can do it with callbacks.
      <br />
      <br />
      FlashDuty from the Flashcat Team is an OnCall product that has started public testing. You can push the alarm events of each monitoring system to FlashDuty, and enjoy the one-stop experience of alarm aggregation, noise reduction, scheduling, claiming, upgrading, and collaborative processing.
      <br />
      <br />
      <a href='https://console.flashcat.cloud/?from=n9e' target='_blank'>
      Free Trial
      </a>
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
    add_title: 'Add Channel',
    edit_title: 'Edit Channel',
    enabled: 'Enabled',
  },
  contacts: {
    title: 'Contacts',
    add_title: 'Add Contact',
    edit_title: 'Edit Contact',
  },
  smtp: {
    title: 'SMTP',
    testMessage: 'Test email has been sent, please check',
  },
  ibex: {
    title: 'Ibex Settings',
  },
};
export default en_US;
