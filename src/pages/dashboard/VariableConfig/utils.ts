export function normalizeESQueryRequestBody(params: any, date_field: string | undefined, start: number, end: number) {
  console.log('params', params);
  let orderBy = '_key';
  if (params?.orderBy === 'doc_count') {
    orderBy = '_count';
  }
  const body: any = {
    size: 0,
    query: {
      bool: {
        filter: [
          {
            range: {
              [date_field || '@timestamp']: {
                gte: start,
                lte: end,
                format: 'epoch_millis',
              },
            },
          },
        ],
      },
    },
    aggs: {
      A: {
        [params?.find]: {
          field: `${params?.field}`,
          size: params.size || 500,
          order: {
            [orderBy]: params.order || 'desc',
          },
        },
      },
    },
  };

  if (params.query && params.query !== '') {
    body.query.bool.filter = [
      ...body.query.bool.filter,
      {
        query_string: {
          analyze_wildcard: true,
          query: params?.query,
        },
      },
    ];
  }

  return body;
}
