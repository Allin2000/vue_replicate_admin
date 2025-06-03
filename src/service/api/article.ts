import { request } from '../request';



/** 获取文章列表 */

export function fetchArticleList(params?: Api.ArticleManage.ArticleSearchParams) {
  // 设置默认分页参数
  const defaultParams = {
    current: 1,
    size: 10
  };

  // 合并默认值，如果 params 为空或未定义，则使用默认值
  const mergedParams = {
    ...defaultParams,
    ...params
  };

  return request<Api.ArticleManage.ArticleList>({
    url: '/articles',
    method: 'get',
    params: mergedParams
  });
}

/** 获取文章详情 */
export function fetchArticleById(id: number) {
  return request<Api.ArticleManage.Article>({
    url: `/articles/${id}`,
    method: 'get'
  });
}

/** 更新文章 */
export function fetchUpdateArticle(data: Api.ArticleManage.ArticleUpdateParams) {
  return request({
    url: `/articles/${data.id}`,
    method: 'patch',
    data
  });
}

/** 删除文章 */
export function fetchDeleteArticle(data: Api.ArticleManage.CommonDeleteParams) {
  return request({
    url: `/articles/${data.id}`,
    method: 'delete'
  });
}

/** 批量删除文章 */
export function fetchBatchDeleteArticle(data: Api.ArticleManage.CommonBatchDeleteParams) {
  return request({
    url: '/articles',
    method: 'delete',
    params: { ids: data.ids.join(',') }
  });
}

