import { ref } from 'vue'

export function useBoolean(defaultValue = false) {
  const bool = ref(defaultValue)

  const setTrue = () => {
    bool.value = true
  }

  const setFalse = () => {
    bool.value = false
  }

  const toggle = () => {
    bool.value = !bool.value
  }

  return {
    bool,
    setTrue,
    setFalse,
    toggle,
  }
}