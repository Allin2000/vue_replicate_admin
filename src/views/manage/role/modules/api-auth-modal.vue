<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue';
import { $t } from '@/locales';

defineOptions({
  name: 'ApiAuthModal'
});

interface Props {
  roleId: number;
}

const props = defineProps<Props>();

const visible = defineModel<boolean>('visible', {
  default: false
});

function closeModal() {
  visible.value = false;
}

const title = computed(() => $t('common.edit') + $t('page.manage.role.buttonAuth'));

// 精简：去掉所有接口调用和状态管理
</script>

<template>
  <NModal v-model:show="visible" :title="title" preset="card" class="w-480px">
    <div class="p-4 text-center text-gray-500">
      权限管理功能已移除
    </div>
    <template #footer>
      <NButton size="small" class="mt-16px" @click="closeModal">
        {{ $t('common.cancel') }}
      </NButton>
    </template>
  </NModal>
</template>

<style scoped></style>