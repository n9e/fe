import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getMatchRoute } from './index';
import qs from 'query-string';
import { EPageType } from '../config';
import { getFlashAiDatasource } from '../services';
import { getAiAnalysisStatus } from '@/Packages/Outfire/services/aiAnalysis';
import { IMatchRoute } from '../store';

export interface IUseAiInit {
  aiStatus: typeof defaultAiStatus;
  dataSourceList: any[];
  isMatchRoute?: IMatchRoute;
  urlQuery: any;
  isFiremap: boolean;
}

const defaultAiStatus = {
  aiReady: false,
  aiStatusEnable: false,
};

export function useAiInit(): IUseAiInit {
  const location = useLocation();
  const isMatchRoute = getMatchRoute(location.pathname);
  const urlQuery = qs.parse(location.search);
  const isFiremap = [EPageType.FiremapHomepage, EPageType.FiremapFunction, EPageType.FiremapSystem].includes(isMatchRoute?.pageType!);

  const [aiStatus, setAiStatus] = useState(defaultAiStatus);
  const [dataSourceList, setDataSourceList] = useState([]);

  useEffect(() => {
    if (!!isMatchRoute) {
      checkAiStatus();
    }
  }, [location.pathname]);

  const checkAiStatus = () => {
    getAiAnalysisStatus().then((res) => {
      setAiStatus({
        ...defaultAiStatus,
        aiStatusEnable: res.enable,
      });
      if (res.enable) {
        getAiDataSource();
      }
    });
  };

  const getAiDataSource = () => {
    if (!isMatchRoute) return;
    getFlashAiDatasource().then((res) => {
      setDataSourceList(res?.items);
      // setDataSourceInited(true);
      setAiStatus((prev) => ({ ...prev, aiReady: true }));
    });
  };

  return {
    isMatchRoute,
    urlQuery,
    aiStatus,
    dataSourceList,
    isFiremap,
  };
}
