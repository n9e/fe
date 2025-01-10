const en_US = {
  user: {
    title: 'User management',
    search_placeholder: 'Username, email or phone number',
    create: 'Create user',
    edit: 'Edit user',
    busi_groups: 'Business groups',
    user_groups: 'Teams',
    last_active_time: 'Last active time',
  },
  team: {
    title: 'Team management',
    list: 'Team list',
    search_placeholder: 'Username, display name, email or phone number',
    create: 'Create team',
    edit: 'Edit team',
    add_member: 'Add member',
    empty: 'No team related to you, please',
    name: 'Team name',
    add_member_selected: 'Selected {num} items',
  },
  business: {
    title: 'Business group management',
    list: 'Business group',
    search_placeholder: 'Business name',
    team_search_placeholder: 'Search team name',
    create: 'Create business group',
    edit: 'Edit business group',
    add_team: 'Add team',
    perm_flag: 'Permission',
    note_content: 'Alert rules, alert events, monitoring objects, self-healing scripts, etc. all belong to the business group, which is a closed-loop organization in the system',
    empty: 'Business group (monitoring objects, monitoring dashboards, alert rules, self-healing scripts, etc.) is empty, please',
    name: 'Business group name',
    name_tip: `
      After being separated by a {{separator}}, it will be rendered into a tree structure <1 />
      For example: redis{{separator}}monitoring and redis{{separator}}login will be displayed as follows  <1 />
      redis <1 />
      - monitoring <1 />
      - login <1 />
    `,
    team_name: 'Team',
    perm_flag_0: 'ro',
    perm_flag_1: 'rw',
    user_group_msg: 'Business group team is required',
  },
  disbale: 'Disable',
  enable: 'Enable',
  ok_and_search: 'OK and search',
};
export default en_US;
