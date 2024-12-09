import { onUnmounted } from 'vue'

export function useDebounce() {
  let timer = null

  const debounce = (fn, delay) => {
    return (...args) => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        fn.apply(this, args)
      }, delay)
    }
  }

  onUnmounted(() => {
    if (timer) clearTimeout(timer)
  })

  return {
    debounce
  }
} 