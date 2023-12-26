export function normalizeESQueryRequestBody(params: any) {
  const query = {
    bool: {
      filter: [
        {
          query_string: {
            analyze_wildcard: true,
            query: params?.query,
          },
        },
      ],
    },
  };
  const body = {
    size: 0,
    aggs: {
      A: {
        [params?.find]: {
          field: `${params?.field}`,
          size: params.size || 500,
          order: {
            _key: 'asc',
          },
        },
      },
    },
  };

  if (params?.query) {
    body['query'] = query;
  }

  return body;
}
