<script setup lang="tsx">
import { ref } from 'vue';
import { NButton, NDataTable, NCard, NTag } from 'naive-ui';
import { useBoolean } from '@/hooks/common/boolean';
import { useTable } from '@/hooks/common/table';
import { fetchArticleList, fetchBatchDeleteArticle, fetchDeleteArticle } from '@/service/api/article';
import ArticleSearch from './modules/article-search.vue';
import ArticleOperateDrawer from './modules/article-operate-drawer.vue';
import { useAuth } from '@/hooks/business/auth';

defineOptions({ name: 'ArticleManage' });


console.log('Type of fetchArticleList:', typeof fetchArticleList);
console.log('Value of fetchArticleList:', fetchArticleList);



const { hasAuth } = useAuth();

const searchParams = ref<Api.ArticleManage.ArticleSearchParams>({
  title: '',
  author_name: '',
  time_range: ''
});

const {
  columns,
  rowKey,
  data,
  loading,
  mobilePagination: pagination,
  getData,
  selectedRowKeys,
  handleDelete,
  handleBatchDelete: rawBatchDelete
} = useTable({
  apiFn: fetchArticleList,
  delete: fetchDeleteArticle,
  transformParams: () => searchParams.value,
    apiParams: {
    current: 1, // 确保初始当前页
    size: 10   // 确保初始每页大小
  },
  // 自定义列定义

  transformer: (res: any) => { // 注意这里是 res，不是 response
    const { records = [], current = 1, size = 10, total = 0 } = res.data || {};
    return {
      data: records, // 提取实际的记录数组
      pageNum: current, // 确保返回的字段名与 useTable 内部期望的匹配
      pageSize: size,   // 确保返回的字段名与 useTable 内部期望的匹配
      total // 提取总数
    };
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
      render(row, index) {
        return (pagination.value.pageSize || 10) * ((pagination.value.current || 1) - 1) + index + 1;
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
      render(row) {
        return (
          <div class="flex-center gap-8px">
            <NButton size="small" type="primary" ghost onClick={() => handleView(row)}>
              查看
            </NButton>
            {hasAuth('article:edit') && (
              <NButton size="small" type="success" ghost onClick={() => handleEdit(row)}>
                编辑
              </NButton>
            )}
            {hasAuth('article:delete') && (
              <NButton size="small" type="error" ghost onClick={() => handleDelete(row.id)}>
                删除
              </NButton>
            )}
          </div>
        );
      }
    }
    
]
});

// 在这里添加 console.log
console.log('useTable 返回的 data:', data.value);
console.log('useTable 返回的 loading:', loading.value);
console.log('useTable 返回的 pagination:', pagination.value);



const {
  bool: drawerVisible,
  setTrue: openDrawer,
  setFalse: closeDrawer
} = useBoolean();

const drawerType = ref<'view' | 'edit'>('view');
const currentRow = ref<Api.ArticleManage.Article | null>(null);

function onReset() {
  searchParams.value = {
    title: '',
    author_name: '',
    time_range: ''
  };
  getData();
}

function onSearch() {
  getData();
}

function handleEdit(row: Api.ArticleManage.Article) {
  drawerType.value = 'edit';
  currentRow.value = row;
  openDrawer();
}

function handleView(row: Api.ArticleManage.Article) {
  drawerType.value = 'view';
  currentRow.value = row;
  openDrawer();
}

async function handleBatchDelete() {
  if (selectedRowKeys.value.length === 0) return;
  const { error } = await fetchBatchDeleteArticle({ ids: selectedRowKeys.value });
  if (!error) {
    // 删除成功后刷新列表和清空选择
    await getData();
    selectedRowKeys.value = [];
  }
}
</script>

<template>
  <div class="main-container">
    <!-- 搜索组件 -->
    <ArticleSearch v-model:model="searchParams" @search="onSearch" @reset="onReset" />

    <!-- 表格区域 -->
    <NCard :bordered="false" class="mt-4">
      <template #header>
        <div class="flex items-center justify-between">
          <div>文章列表</div>
          <div class="space-x-2">
            <NButton
              type="primary"
              :disabled="selectedRowKeys.length === 0"
              @click="handleBatchDelete"
              v-if="hasAuth('article:delete')"
            >
              批量删除
            </NButton>
          </div>
        </div>
      </template>

      <NDataTable
        :columns="columns"
        :data="data"
        :row-key="rowKey"
        :loading="loading"
        :pagination="pagination"
        :scroll-x="1000"
        :bordered="false"
        v-model:checked-row-keys="selectedRowKeys"
        checkable
      />
    </NCard>

    <!-- 操作抽屉 -->
    <ArticleOperateDrawer
      v-model:visible="drawerVisible"
      :row-data="currentRow"
      :operate-type="drawerType"
      @submitted="getData"
      @close="closeDrawer"
    />
  </div>
</template>