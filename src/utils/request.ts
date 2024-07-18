/** Request 网络请求工具 更详细的 api 文档: https://github.com/umijs/umi-request */
import Request, { ResponseError, extend } from 'umi-request';
import { notification } from 'antd';
import _ from 'lodash';
import { UpdateAccessToken } from '@/services/login';
import { N9E_PATHNAME, AccessTokenKey } from '@/utils/constant';
import i18next from 'i18next';
import { basePrefix } from '@/App';

/** 异常处理程序，所有的error都被这里处理，页面无法感知具体error */
const errorHandler = (error: ResponseError<any>): Response => {
  // 忽略掉 setting getter-only property "data" 的错误
  // 这是 umi-request 的一个 bug，当触发 abort 时 catch callback 里面不能 set data
  if (error.name !== 'AbortError' && error.message !== 'setting getter-only property "data"' && !Request.isCancel(error)) {
    if (error.request.options.sourcePathname !== location.pathname) {
      throw error;
    }
    // @ts-ignore
    else if (!error.silence) {
      notification.error({
        key: error.message,
        message: error.message,
      });
    }
    // 暂时认定只有开启 silence 的时候才需要传递 error 详情以便更加精确的处理错误
    // @ts-ignore
    if (error.silence) {
      throw error;
    } else {
      throw new Error(error.message);
    }
  }
  throw error;
};

/** 处理后端返回的错误信息 */
const processError = (res: any): string => {
  if (res?.error?.message) {
    return _.isString(res?.error?.message) ? res?.error?.message : JSON.stringify(res?.error?.message);
  }
  if (res?.error) {
    return _.isString(res?.error) ? res.error : JSON.stringify(res?.error);
  }
  if (res?.err) {
    return _.isString(res?.err) ? res.err : JSON.stringify(res?.err);
  }
  if (res?.errors) {
    return _.isString(res?.errors) ? res.errors : JSON.stringify(res?.errors);
  }
  if (res?.message) {
    return _.isString(res?.message) ? res.message : JSON.stringify(res?.message);
  }
  return JSON.stringify(res);
};

const combineLoginURL = () => {
  return `${basePrefix}/login${location.pathname != '/' ? '?redirect=' + encodeURIComponent(location.pathname + location.search) : ''}`;
};

/** 配置request请求时的默认参数 */
const request = extend({
  errorHandler,
  credentials: 'include',
});

request.interceptors.request.use((url, options) => {
  let headers = {
    ...options.headers,
  };
  headers['Authorization'] = `Bearer ${localStorage.getItem(AccessTokenKey) || ''}`;
  headers['X-Language'] = i18next.language;
  return {
    url: basePrefix + url,
    options: { ...options, headers, sourcePathname: location.pathname },
  };
});

/**
 * 响应拦截
 */
request.interceptors.response.use(
  async (response, options) => {
    const { status } = response;
    if (status === 200) {
      return response
        .clone()
        .json()
        .then((data) => {
          const { url } = response;
          // TODO: 糟糕的逻辑，后端返回的数据结构不统一，需要兼容
          // /n9e/datasource/ 返回的数据结构是 { error: '', data: [] }
          // proxy/prometheus 返回的数据结构是 { status: 'success', data: {} }
          // proxy/elasticsearch 返回的数据结构是 { ...data }
          // proxy/jeager 返回的数据结构是 { data: [], errors: [] }
          if (
            _.some([`/api/${N9E_PATHNAME}/proxy`, '/probe/v1'], (item) => {
              return url.includes(item);
            })
          ) {
            return data;
          } else if (
            _.some(['/api/v1', '/api/v2', '/api/n9e/datasource'], (item) => {
              return url.includes(item);
            })
          ) {
            if (!data.error) {
              return { ...data, success: true };
            } else {
              throw {
                name: processError(data),
                message: processError(data),
                silence: options.silence,
                data,
                response,
              };
            }
          } else {
            // n9e 和 n9e-plus 大部分接口返回的数据结构是 { err: '', dat: {} }
            if (data.err === '' || data.status === 'success' || data.error === '') {
              return { ...data, success: true };
            } else {
              throw {
                name: processError(data),
                message: processError(data),
                silence: options.silence,
                data,
                response,
              };
            }
          }
        });
    } else if (status === 401 && !_.includes(response.url, '/api/n9e-plus/proxy') && !_.includes(response.url, '/api/n9e/proxy')) {
      if (response.url.indexOf('/api/n9e/auth/refresh') > 0) {
        location.href = combineLoginURL();
      } else {
        localStorage.getItem('refresh_token')
          ? UpdateAccessToken().then((res) => {
              console.log('401 err', res);
              if (res.err) {
                location.href = combineLoginURL();
              } else {
                const { access_token, refresh_token } = res.dat;
                localStorage.setItem(AccessTokenKey, access_token);
                localStorage.setItem('refresh_token', refresh_token);
                location.href = `${basePrefix}${location.pathname}${location.search}`;
              }
            })
          : (location.href = combineLoginURL());
      }
    } else if (
      status === 403 &&
      (response.url.includes('/api/v1') || response.url.includes('/api/v2')) &&
      // 排除掉 proxy 的接口
      !_.includes(response.url, '/api/n9e-plus/proxy') &&
      !_.includes(response.url, '/api/n9e/proxy')
    ) {
      return response
        .clone()
        .json()
        .then((data) => {
          location.href = `${basePrefix}/403`;
          if (data.error && data.error.message) throw new Error(data.error.message);
        });
    } else if ([502, 503, 504].includes(status)) {
      throw {
        message: i18next.t('common:request_fail_msg'),
      };
    } else {
      return response
        .clone()
        .text()
        .then((data) => {
          let errObj = {};
          try {
            const parsed = JSON.parse(data);
            const errMessage = processError(parsed);
            errObj = {
              name: errMessage,
              message: errMessage,
              data: parsed,
            };
          } catch (error) {
            errObj = {
              name: data,
              message: data,
            };
          }
          throw {
            ...errObj,
            silence: options.silence,
          };
        });
    }
  },
  {
    global: false,
  },
);

export default request;
