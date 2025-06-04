<script setup lang="tsx">
import { ref } from 'vue';
import { NButton, NCard, NDataTable } from 'naive-ui';
import type { PaginationProps } from 'naive-ui'; // 导入 PaginationProps 类型
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
  mobilePagination, // 使用 mobilePagination
  getData,
  resetSearchParams: resetTableSearchParams
} = useTable({
  apiFn: fetchArticleList,
  apiParams: {
    current: 1,
    size: 10
  },
  // 移除 transformParams，因为 useTable 内部已经处理了 searchParams 的更新
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
        // 使用 mobilePagination.value 访问当前页码和每页大小
        const pageSize = mobilePagination.value?.pageSize || 10;
        const page = mobilePagination.value?.page || 1;
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
      render(row) {
        return (
          <div class="flex-center gap-8px">
            <NButton size="small" type="primary" ghost onClick={() => handleView(row)}>
              查看
            </NButton>
            {/* 你可能需要调整 hasAuth 的具体实现或引入方式 */}
            {/* 例如：从 useAuth() 获取 hasAuth */}
            {/* const { hasAuth } = useAuth(); */}
            {true && ( // 暂时用 true 代替 hasAuth('article:edit')，请根据你的业务逻辑恢复
              <NButton size="small" type="success" ghost onClick={() => operateHooks.handleEdit(row.id)}>
                编辑
              </NButton>
            )}
            {true && ( // 暂时用 true 代替 hasAuth('article:delete')，请根据你的业务逻辑恢复
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

// 将 mobilePagination 赋值给 pagination，并明确其类型
const pagination: PaginationProps = mobilePagination.value;

// 从 useTableOperate 解构其返回的属性
const operateHooks = useTableOperate<Api.ArticleManage.Article>(data, getData);

// 将 useTableOperate 中的 checkedRowKeys 映射到组件中
const selectedRowKeys = operateHooks.checkedRowKeys;

// 处理单个删除的包装函数，因为 useTableOperate 的 handleEdit/handleDelete 期望 id
// 而 useTableOperate 的 onDeleted hook 需要在删除API成功后被调用
async function handleDeleteWrapper(id: Api.ArticleManage.Article['id']) {
  const { error } = await fetchDeleteArticle({ id }); // 调用你的删除API
  if (!error) {
    operateHooks.onDeleted(); // 调用 useTableOperate 的 hook 处理删除成功后的逻辑
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
  // 保持与 useTable 的 searchParams 同步，并触发 getData
  resetTableSearchParams();
}

function onSearch() {
  // 当搜索参数变化时，更新 useTable 内部的 searchParams，并重新获取数据
  useTable({
    apiFn: fetchArticleList,
    apiParams: {
      current: 1,
      size: 10,
      ...searchParams.value // 确保将最新的搜索参数传递给 useTable
    }
  }).getData();
}

function handleView(row: Api.ArticleManage.Article) {
  operateHooks.operateType.value = 'view' as NaiveUI.TableOperateType; // 明确断言为 NaiveUI.TableOperateType
  operateHooks.editingData.value = row;
  operateHooks.openDrawer();
}

async function handleBatchDelete() {
  if (selectedRowKeys.value.length === 0) return;
  const { error } = await fetchBatchDeleteArticle({ ids: selectedRowKeys.value });
  if (!error) {
    operateHooks.onBatchDeleted(); // 调用 useTableOperate 的 hook 处理批量删除成功后的逻辑
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
