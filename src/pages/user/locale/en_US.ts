const en_US = {
  delete_confirm: 'Are you sure you want to delete?',
  user: {
    title: 'User management',
    search_placeholder: 'Username, email or phone number',
    create: 'Create user',
    edit: 'Edit user',
    busi_groups: 'Business groups',
    user_groups: 'Teams',
    last_active_time: 'Last active time',
    delete_success: 'User deleted successfully',
  },
  team: {
    title: 'Team management',
    list: 'Team list',
    search_placeholder: 'Username, display name, email or phone number',
    create: 'Create team',
    edit: 'Edit team',
    add_member: 'Add member',
    empty: 'You are not in any team yet, please',
    name: 'Team name',
    add_member_selected: 'Selected {{num}} items',
    delete_success: 'Team deleted successfully',
    delete_member_success: 'Member deleted successfully',
  },
  business: {
    title: 'Business group management',
    list: 'Business group',
    search_placeholder: 'Business name',
    team_search_placeholder: 'Search team name',
    create: 'Create business group',
    edit: 'Edit business group',
    add_team: 'Authorized teams',
    perm_flag: 'Permission',
    note_content: 'Alert rules, alert events, hosts, self-healing scripts and so on all belong to a business group, which is the self-contained unit of ownership in the system',
    empty: 'You do not have any business group (which owns hosts, dashboards, alert rules, self-healing scripts and so on) yet, please',
    name: 'Business group name',
    name_tip: `
      After being separated by a {{separator}}, it will be rendered into a tree structure <1 />
      For example: redis{{separator}}monitoring and redis{{separator}}login will be displayed as follows  <1 />
      redis <1 />
      - monitoring <1 />
      - login <1 />
    `,
    team_name: 'Authorized teams',
    team_name_tip: 'The following teams can manage this business group',
    perm_flag_0: 'Read only',
    perm_flag_1: 'Read & write',
    user_group_msg: 'Business group team is required',
  },
  disbale: 'Disable',
  enable: 'Enable',
  ok_and_search: 'OK and search',
};
export default en_US;
