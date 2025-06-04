<script setup lang="tsx">
import { computed, ref } from 'vue';
import { NButton, NCard, NDataTable } from 'naive-ui';
import type { PaginationProps } from 'naive-ui';
import { fetchArticleList, fetchBatchDeleteArticle, fetchDeleteArticle } from '@/service/api/article';
import { useTable, useTableOperate } from '@/hooks/common/table';
import ArticleSearch from './modules/article-search.vue';
import ArticleOperateDrawer from './modules/article-operate-drawer.vue';

defineOptions({ name: 'ArticleManage' });

const searchParams = ref<Api.ArticleManage.ArticleSearchParams>({
  title: '',
  author_name: '',
  time_range: ''
});

const {
  columns,
  data,
  loading,
  mobilePagination,
  getData,
  updateSearchParams,
  resetSearchParams: resetTableSearchParams
} = useTable({
  apiFn: fetchArticleList,
  apiParams: {
    current: 1,
    size: 10,
    ...searchParams.value
  },
  columns: () => [
    {
      type: 'selection',
      align: 'center',
      width: 48
    },
    {
      key: 'index',
      title: '序号',
      align: 'center',
      width: 64,
      render(row: Api.ArticleManage.Article, index: number): number {
        const pageSize: number = mobilePagination.value?.pageSize || 10;
        const page: number = mobilePagination.value?.page || 1;
        return pageSize * (page - 1) + index + 1;
      }
    },
    {
      key: 'title',
      title: '标题',
      align: 'left',
      minWidth: 200,
      ellipsis: true
    },
    {
      key: 'description',
      title: '描述',
      align: 'left',
      minWidth: 250,
      ellipsis: true
    },
    {
      key: 'authorName',
      title: '作者',
      align: 'center',
      width: 120
    },
    {
      key: 'createdAt',
      title: '创建时间',
      align: 'center',
      width: 180
    },
    {
      key: 'operate',
      title: '操作',
      align: 'center',
      width: 130,
      render(row: Api.ArticleManage.Article) {
        return (
          <div class="flex-center gap-8px">
            <NButton size="small" type="primary" ghost onClick={() => handleView(row)}>
              查看
            </NButton>
            {true && (
              <NButton size="small" type="success" ghost onClick={() => operateHooks.handleEdit(row.id)}>
                编辑
              </NButton>
            )}
            {true && (
              <NButton size="small" type="error" ghost onClick={() => handleDeleteWrapper(row.id)}>
                删除
              </NButton>
            )}
          </div>
        );
      }
    }
  ]
});

// 明确类型化的 pagination
const pagination = computed<PaginationProps>(() => mobilePagination.value);

// 从 useTableOperate 解构其返回的属性
const operateHooks = useTableOperate<Api.ArticleManage.Article>(data, getData);

// 将 useTableOperate 中的 checkedRowKeys 映射到组件中
const selectedRowKeys = operateHooks.checkedRowKeys;

// 处理单个删除的包装函数
async function handleDeleteWrapper(id: Api.ArticleManage.Article['id']) {
  const { error } = await fetchDeleteArticle({ id });
  if (!error) {
    operateHooks.onDeleted();
  }
}

const drawerVisible = operateHooks.drawerVisible;
const drawerType = operateHooks.operateType;
const currentRow = operateHooks.editingData;

function onReset() {
  searchParams.value = {
    title: '',
    author_name: '',
    time_range: ''
  };
  // 重置表格的搜索参数并重新获取数据
  resetTableSearchParams();
}

function onSearch() {
  // 更新搜索参数并重新获取数据
  updateSearchParams({
    current: 1,
    size: pagination.value.pageSize || 10,
    ...searchParams.value
  });
  getData();
}

function handleView(row: Api.ArticleManage.Article) {
  operateHooks.operateType.value = 'view' as NaiveUI.TableOperateType;
  operateHooks.editingData.value = row;
  operateHooks.openDrawer();
}

async function handleBatchDelete() {
  if (selectedRowKeys.value.length === 0) return;
  const { error } = await fetchBatchDeleteArticle({ ids: selectedRowKeys.value });
  if (!error) {
    operateHooks.onBatchDeleted();
  }
}
</script>

<template>
  <div class="main-container">
    <ArticleSearch v-model:model="searchParams" @search="onSearch" @reset="onReset" />

    <NCard :bordered="false" class="mt-4">
      <template #header>
        <div class="flex items-center justify-between">
          <div>文章列表</div>
          <div class="space-x-2">
            <NButton v-if="true" type="primary" :disabled="selectedRowKeys.length === 0" @click="handleBatchDelete">
              批量删除
            </NButton>
          </div>
        </div>
      </template>

      <NDataTable
        v-model:checked-row-keys="selectedRowKeys"
        :columns="columns"
        :data="data"
        :row-key="(row: Api.ArticleManage.Article) => row.id"
        :loading="loading"
        :pagination="pagination"
        :scroll-x="1000"
        :bordered="false"
        checkable
      />
    </NCard>

    <ArticleOperateDrawer
      v-model:visible="drawerVisible"
      :row-data="currentRow"
      :operate-type="drawerType"
      @submitted="getData"
      @close="operateHooks.closeDrawer"
    />
  </div>
</template>
