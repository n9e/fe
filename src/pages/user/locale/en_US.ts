const en_US = {
  user: {
    title: 'User Management',
    search_placeholder: 'Username, email or phone number',
    create: 'Create User',
    edit: 'Edit User',
  },
  team: {
    title: 'Team Management',
    list: 'Team List',
    search_placeholder: 'Username, display name, email or phone number',
    create: 'Create Team',
    edit: 'Edit Team',
    add_member: 'Add Member',
    empty: 'No team related to you, please',
    name: 'Team Name',
    add_member_selected: 'Selected {num} items',
  },
  business: {
    title: 'Business Group Management',
    list: 'Business Group',
    search_placeholder: 'Business Name',
    team_search_placeholder: 'Search Team Name',
    create: 'Create Business Group',
    edit: 'Edit Business Group',
    add_team: 'Add Team',
    perm_flag: 'Permission',
    note_content: 'Alert rules, alert events, monitoring objects, self-healing scripts, etc. all belong to the business group, which is a closed-loop organization in the system',
    empty: 'Business group (monitoring objects, monitoring dashboards, alert rules, self-healing scripts, etc.) is empty, please',
    name: 'Business Group Name',
    name_tip: `
      After being separated by a {{separator}}, it will be rendered into a tree structure <1 />
      For example: redis{{separator}}monitoring and redis{{separator}}login will be displayed as follows  <1 />
      redis <1 />
      - monitoring <1 />
      - login <1 />
    `,
    label_enable: 'Use as a label',
    label_enable_tip:
      'The system will automatically use the English identifier of the business group as a label attached to the time series data of the monitoring object under the business group',
    label_value: 'Ident',
    label_value_tip: `
      <0>
        Use English, and it cannot be repeated with other business group, the system will automatically generate
        <1>busigroup={{val}}</1>
        label
      </0>
    `,
    team_name: 'Team',
    perm_flag_0: 'ro',
    perm_flag_1: 'rw',
    user_group_msg: 'Business group team is required',
  },
  disbale: 'Disable',
  enable: 'Enable',
  ok_and_search: 'OK and Search',
};
export default en_US;
