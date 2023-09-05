const en_US = {
  title: 'Notification Settings',
  webhooks: {
    title: 'Callbacks',
    enable: 'Enable',
    note: 'Note',
    url: 'URL',
    timeout: 'Timeout (unit: s)',
    basic_auth_user: 'Username (Basic Auth)',
    basic_auth_password: 'Password (Basic Auth)',
    skip_verify: 'Skip SSL verification',
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
