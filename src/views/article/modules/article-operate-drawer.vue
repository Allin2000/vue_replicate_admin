<script setup lang="ts">
import { ref, watch } from 'vue';
import { NDrawer, NDrawerContent, NForm, NFormItem, NInput } from 'naive-ui';
import { fetchArticleById, fetchUpdateArticle } from '@/service/api';
import { useNaiveForm } from '@/hooks/common/form';

interface Props {
  visible: boolean;
  operateType: 'view' | 'edit' | 'add';
  rowData: Api.ArticleManage.Article | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void;
  (e: 'submitted'): void;
}>();

const { formRef, validate } = useNaiveForm();

const model = ref<Partial<Api.ArticleManage.ArticleUpdateParams>>({});

watch(
  () => props.visible,
  async val => {
    if (val && props.rowData?.id) {
      const res = await fetchArticleById(props.rowData.id);
      model.value = res.data || {};
    }
  }
);

async function handleSubmit() {
  await validate();
  const res = await fetchUpdateArticle(model.value as Api.ArticleManage.ArticleUpdateParams);
  if (!res.error) {
    window.$message?.success('更新成功');
    emit('update:visible', false);
    emit('submitted');
  }
}
</script>

<template>
  <NDrawer v-model:show="props.visible" placement="right" width="480">
    <NDrawerContent :title="props.operateType === 'edit' ? '编辑文章' : '查看文章'" closable>
      <NForm ref="formRef" :model="model" label-placement="top">
        <NFormItem label="标题" path="title">
          <NInput v-model:value="model.title" :disabled="props.operateType === 'view'" />
        </NFormItem>
        <NFormItem label="描述" path="description">
          <NInput v-model:value="model.description" :disabled="props.operateType === 'view'" />
        </NFormItem>
        <NFormItem label="内容" path="body">
          <NInput
            v-model:value="model.body"
            type="textarea"
            :autosize="{ minRows: 6 }"
            :disabled="props.operateType === 'view'"
          />
        </NFormItem>
      </NForm>

      <template #footer>
        <NButton v-if="props.operateType === 'edit'" type="primary" @click="handleSubmit">保存</NButton>
        <NButton @click="emit('update:visible', false)">关闭</NButton>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>
