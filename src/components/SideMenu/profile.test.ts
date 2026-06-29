import { getSidebarProfileDisplay } from './profile';

describe('getSidebarProfileDisplay', () => {
  it('uses nickname, email, and nickname initial when they are available', () => {
    expect(
      getSidebarProfileDisplay({
        nickname: 'Admin user',
        username: 'admin',
        email: 'admin@flashcat.cloud',
      }),
    ).toEqual({
      name: 'Admin user',
      detail: 'admin@flashcat.cloud',
      initial: 'A',
    });
  });

  it('falls back to username and phone when profile fields are sparse', () => {
    expect(
      getSidebarProfileDisplay({
        username: 'operator',
        phone: '13800138000',
      }),
    ).toEqual({
      name: 'operator',
      detail: '13800138000',
      initial: 'O',
    });
  });
});
