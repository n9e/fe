/** Request 网络请求工具 更详细的 api 文档: https://github.com/umijs/umi-request */
import { extend } from 'umi-request';
import { notification } from 'antd';
import _ from 'lodash';
import { UpdateAccessToken } from '@/services/login';

/** 异常处理程序，所有的error都被这里处理，页面无法感知具体error */
const errorHandler = (error: Error): Response => {
  // 忽略掉 setting getter-only property "data" 的错误
  // 这是 umi-request 的一个 bug，当触发 abort 时 catch callback 里面不能 set data
  if (error.name !== 'AbortError' && error.message !== 'setting getter-only property "data"') {
    // @ts-ignore
    if (!error.silence) {
      notification.error({
        message: error.message,
      });
    }
    // @ts-ignore
    if (error.silence) {
      // TODO: 兼容 n9e，暂时认定只有开启 silence 的场景才需要传递 error 详情
      throw error;
    } else {
      throw new Error(error.message);
    }
  }
  throw error;
};

/** 配置request请求时的默认参数 */
const request = extend({
  errorHandler, // 默认错误处理
  credentials: 'include', // 默认请求是否带上cookie
});

request.interceptors.request.use((url, options) => {
  let headers = {
    ...options.headers,
  };
  headers['Authorization'] = `Bearer ${localStorage.getItem('access_token') || ''}`;
  if (!headers['X-Cluster']) {
    headers['X-Cluster'] = localStorage.getItem('curCluster') || '';
  }
  headers['X-Language'] = localStorage.getItem('language') === 'en_US' ? 'en' : 'zh';
  return {
    url,
    options: { ...options, headers },
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
          if (
            response.url.includes('/api/v1/') ||
            response.url.includes('/api/v2') ||
            response.url.includes('/api/n9e-plus/datasource') ||
            response.url.includes('/api/n9e/proxy')
          ) {
            if (status === 200 && !data.error) {
              return { ...data, success: true };
            } else if (data.error) {
              if (response.url.indexOf('/api/n9e/prometheus/api/v1') > -1 || response.url.indexOf('/api/v1/datasource/prometheus') > -1) {
                return data;
              } else {
                // @ts-ignore
                throw new Error(data.error.message, { cause: options.silence });
              }
            }
          } else {
            if (data.err === '' || data.status === 'success' || data.error === '') {
              if (data.data || data.dat) {
                if (data.dat && Object.prototype.toString.call(data.dat.list) === '[object Null]') {
                  data.dat.list = [];
                }
              }
              return { ...data, success: true };
            } else {
              if (options.silence) {
                throw {
                  name: data.err,
                  message: data.err,
                  silence: true,
                  data,
                  response,
                };
              } else {
                throw new Error(data.err);
              }
            }
          }
        });
    }
    // 屏蔽日志侧拉板接口报错
    if (status === 500 && response.url.indexOf('/api/v1/dimensions/log/aggregation') > -1) {
      return;
    }
    // 兼容异常处理
    if (status === 500 && (response.url.includes('/api/v1') || response.url.includes('/api/v2'))) {
      return response
        .clone()
        .json()
        .then((data) => {
          if (!data.error) {
            return { ...data, success: true };
          } else if (data.error) {
            throw {
              name: data.error.name,
              message: data.error.message,
              silence: options.silence,
              data,
              response,
            };
          }
        });
    }

    if (status === 502) {
      return response
        .clone()
        .text()
        .then((data) => {
          if (response.url.includes('/api/n9e/proxy')) {
            throw {
              name: data,
              message: data,
              silence: options.silence,
              data,
              response,
            };
          } else {
            throw new Error(data);
          }
        });
    }
    if (status === 401) {
      if (response.url.indexOf('/api/n9e/prometheus/api/v1') > -1 || response.url.indexOf('/api/v1/datasource/prometheus') > -1) {
        return response
          .clone()
          .json()
          .then((data) => {
            throw new Error(data.err ? data.err : data);
          });
      } else if (response.url.indexOf('/api/n9e/auth/refresh') > 0) {
        location.href = `/login${location.pathname != '/' ? '?redirect=' + location.pathname + location.search : ''}`;
      } else {
        localStorage.getItem('refresh_token')
          ? UpdateAccessToken().then((res) => {
              console.log('401 err', res);
              if (res.err) {
                location.href = `/login${location.pathname != '/' ? '?redirect=' + location.pathname + location.search : ''}`;
              } else {
                const { access_token, refresh_token } = res.dat;
                localStorage.setItem('access_token', access_token);
                localStorage.setItem('refresh_token', refresh_token);
                location.href = `${location.pathname}${location.search}`;
              }
            })
          : (location.href = `/login${location.pathname != '/' ? '?redirect=' + location.pathname + location.search : ''}`);
      }
    } else if (status === 403 && (response.url.includes('/api/v1') || response.url.includes('/api/v2'))) {
      return response
        .clone()
        .json()
        .then((data) => {
          location.href = '/403';
          if (data.error && data.error.message) throw new Error(data.error.message);
        });
    } else {
      const contentType = response.headers.get('content-type');
      const isPlainText = contentType?.indexOf('text/plain; charset=utf-8') !== -1;
      if (isPlainText) {
        return response
          .clone()
          .text()
          .then((data) => {
            throw new Error(data);
          });
      } else {
        return response
          .clone()
          .json()
          .then((data) => {
            // 兼容 n9e 中的 prometheus api
            if (options.silence === undefined) {
              if (response.url.indexOf('/api/n9e/prometheus/api/v1') > -1 || response.url.indexOf('/api/v1/datasource/prometheus') > -1) {
                return data;
              }
            }
            if (response.url.includes('/api/v1') || response.url.includes('/api/v2') || response.url.includes('/api/n9e/proxy')) {
              // TODO: 后端服务异常后可能返回的错误数据也不是一个正常的结构，后面得考虑下怎么处理
              const name = _.isString(data.error) ? data.error : data.error?.name ? data.error.name : JSON.stringify(data);
              const message = _.isString(data.error) ? data.error : data.error?.message ? data.error.message : JSON.stringify(data);
              throw {
                name,
                message,
                silence: options.silence,
                data,
                response,
              };
            } else {
              throw new Error(data.err ? data.err : data);
            }
          });
      }
    }
  },
  {
    global: false,
  },
);

export default request;
