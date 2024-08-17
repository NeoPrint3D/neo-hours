<template>
  <header
    class="border-gradient-content z-50 mx-auto h-16 rounded-xl backdrop-blur-xl transition-shadow"
    :class="y > 0 ? 'shadow-xl shadow-secondary/20' : 'shadow-0'"
  >
    <div class="flex h-full items-center justify-between px-4">
      <div class="flex items-center space-x-4">
        <NuxtLink class="text-xl font-black uppercase" to="/">
          Leo Hours
        </NuxtLink>
      </div>
      <div />
      <div>
        <div
          v-if="auth.session && auth.user?.verifiedAt"
          class="flex items-center gap-2"
        >
          <UIButton size="sm">
            <NuxtLink to="/orgs"> View Orgs. </NuxtLink>
          </UIButton>
          <UIDropdownMenu>
            <UIDropdownMenuTrigger>
              <UIAvatar>
                {{
                  auth.user.displayName
                    .split(" ")
                    .splice(0, 2)
                    .map((name) => name[0])
                    .join("")
                }}
              </UIAvatar>
            </UIDropdownMenuTrigger>
            <UIDropdownMenuContent>
              <UIDropdownMenuItem>
                <UIButton class="w-full" size="xs" @click="logout"
                  >Logout</UIButton
                >
              </UIDropdownMenuItem>
            </UIDropdownMenuContent>
          </UIDropdownMenu>
        </div>
        <div v-if="auth.session && !auth.user?.verifiedAt">
          <UIButton size="sm">
            <NuxtLink to="/verify-email"> Finish Verifying Email </NuxtLink>
          </UIButton>
        </div>
        <div v-else-if="!auth.session" class="flex gap-2">
          <UIButton variant="ghost">
            <NuxtLink class="btn btn-primary" to="/login"> Login </NuxtLink>
          </UIButton>
          <UIButton>
            <NuxtLink class="btn btn-secondary" to="/signup"> Signup </NuxtLink>
          </UIButton>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { logout } from "#imports";
const { y } = useWindowScroll();
const auth = useAuth();
</script>
