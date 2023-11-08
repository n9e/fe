import React, { useEffect, useState } from 'react';
import { getUserInfoList, getTeamInfoList, getBusiGroupList } from './services';
export interface Item {
  value: string;
  label: string;
}
export default function useAssigneeList(): { userList?: Item[]; teamList?: Item[]; busiGroupList?: Item[] } {
  const [result, setResult] = useState<{ userList: Item[]; teamList: Item[]; busiGroupList: Item[] }>({ userList: [], teamList: [], busiGroupList: [] });

  useEffect(() => {
    Promise.all([getUserInfoList({ limit: 1000 }), getTeamInfoList({ limit: 1000 }), getBusiGroupList({ limit: 1000 })]).then(([user, team, busiGroup]) => {
      setResult({
        userList: user.dat.list.map((el: any) => ({
          label: el.username,
          value: el.id,
        })),
        teamList: team.dat.map((el: any) => ({
          label: el.name,
          value: el.id,
        })),
        busiGroupList: busiGroup.dat.map((el: any) => ({
          label: el.name,
          value: el.id,
        })),
      });
    });
  }, []);

  return result;
}
