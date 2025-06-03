<script setup lang="ts">
import { ref } from 'vue';
import { $t } from '@/locales';
import { useNaiveForm } from '@/hooks/common/form';
import { useAuth } from '@/hooks/business/auth';

defineOptions({
  name: 'ArticleSearch'
});

interface Emits {
  (e: 'reset'): void;
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();
const { hasAuth } = useAuth();
const { formRef, validate, restoreValidation } = useNaiveForm();

const model = defineModel<Api.ArticleManage.ArticleSearchParams>('model', { required: true });

const timeRange = ref<[number, number] | null>(null);

async function reset() {
  await restoreValidation();
  emit('reset');
}

async function search() {
  await validate();
  if (timeRange.value) {
    model.value.time_range = timeRange.value.join(',');
  }
  emit('search');
}
</script>

<template>
  <NCard :title="$t('common.search')" :bordered="false" size="small" class="card-wrapper">
    <NForm ref="formRef" :model="model" label-placement="left" :label-width="80">
      <NGrid :cols="4" :x-gap="12">
        <NFormItemGi :span="1" label="标题" path="title">
          <NInput v-model:value="model.title" :placeholder="$t('common.inputText')" clearable />
        </NFormItemGi>
        <NFormItemGi :span="1" label="作者" path="author_name">
          <NInput v-model:value="model.author_name" :placeholder="$t('common.inputText')" clearable />
        </NFormItemGi>
        <NFormItemGi :span="1" label="时间范围" path="time_range">
          <NDatePicker v-model:value="timeRange" type="datetimerange" clearable style="width: 100%" />
        </NFormItemGi>
        <NFormItemGi :span="1" class="flex items-center">
          <NButton type="primary" @click="search" class="mr-8px">
            {{ $t('common.search') }}
          </NButton>
          <NButton @click="reset">
            {{ $t('common.reset') }}
          </NButton>
        </NFormItemGi>
      </NGrid>
    </NForm>
  </NCard>
</template>
