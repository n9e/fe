export default function prefixPlugin(prefix: string) {
  return {
    name: 'prefix-plugin',
    // apply: 'serve',

    transformIndexHtml(html) {
      // 在 index.html 中的静态资源链接上添加前缀
      // console.log('html222', html);
      console.log('prefix222', prefix);

      // const handleHtml = html.replace(/src="\/(.*?\.(js|css|svg|png|jpg))"/g, `src="${prefix}/$1"`);

      const handleHtml = html.replace(/<img([^>]+?src="([^"]+)")/g, (match, attr, src) => {
        // 获取 Vite 处理后的 URL
        const transformedSrc = this.resolve(src);

        // 判断是否需要添加前缀
        if (!transformedSrc.startsWith(prefix)) {
          // 添加前缀给 img 标签的 src 属性
          const prefixedSrc = `${prefix}${transformedSrc}`;
          return `<img${attr.replace(src, prefixedSrc)}"`; // 替换原始 src 属性为带前缀的 src
        }

        return match; // 已经添加过前缀，直接返回原始匹配的内容
      });

      console.log('handleHtml', handleHtml);

      return handleHtml;
    },
    // transform(code, id) {
    //   if (id.includes('/login/')) {
    //     console.log('code', code);
    //     console.log('id', id);
    //   }

    //   // if (id.endsWith('.js')) {
    //   //   // 在 JavaScript 文件中的静态资源链接上添加前缀
    //   //   return code.replace(/import\s*['"]\/(.*?)['"]/g, `import '${prefix}/$1'`);
    //   // }
    //   return code.replace(/img src="\/(.*?\.(js|css|svg|png|jpg))"/g, `src="${prefix}/$1"`);
    // },
  };
}
