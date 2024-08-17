<template>
  <div>
    <BaseBackground />
    <div class="relative z-10">
      <div class="p-5 sm:px-10">
        <BaseHeader />
        <slot />
      </div>
      <BaseFooter />
    </div>
  </div>
</template>
