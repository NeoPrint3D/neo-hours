<template>
  <main class="flex min-h-page flex-col items-center justify-center">
    <UICard
      v-if="organization"
      class="mx-auto max-h-[100%] w-full max-w-xl p-3 transition-all duration-300"
    >
      <UICardHeader>
        <UICardTitle>Join the {{ organization.name }} Organization</UICardTitle>
        <p
          class="chip"
          :class="{
            'bg-red-500/30': organization.requireMembershipApproval,
            'bg-green-500/30': !organization.requireMembershipApproval,
          }"
        >
          {{
            organization.requireMembershipApproval
              ? "Approval Required"
              : "No Approval Required"
          }}
        </p>
        <p class="text-muted-foreground">
          Type:
          <span class="font-bold">{{ organization.additionalInfo.type }}</span>
        </p>
        <p
          v-if="organization.description"
          class="text-muted-foreground flex gap-1"
        >
          Description:
          <span class="line-clamp-2">
            {{ organization.description }}
          </span>
        </p>
      </UICardHeader>
      <UICardContent>
        <form @submit.prevent="joinOrganization">
          <UIFormField v-slot="{ field }" name="displayName">
            <UIFormLabel>Display Name</UIFormLabel>
            <UIFormItem>
              <UIFormControl>
                <UIInput v-bind="field" placeholder="John Doe" />
              </UIFormControl>
            </UIFormItem>
            <button
              v-if="auth.user?.displayName"
              type="button"
              class="mt-1 text-xs text-gray-500 hover:underline"
              variant="link"
              @click="
                setFieldValue('displayName', auth.user?.displayName || '')
              "
            >
              Use My Account Name
            </button>
            <UIFormMessage />
          </UIFormField>
          <UIFormField v-slot="{ value }" name="joinCode">
            <UIFormItem>
              <UIFormLabel>Join Code</UIFormLabel>
              <UIFormControl>
                <UIPinInput
                  id="pin-input"
                  v-model="value!"
                  placeholder="○"
                  class="mt-1 flex items-center gap-2"
                  type="text"
                  @update:model-value="
                    (arrStr) => {
                      setFieldValue(
                        'joinCode',
                        arrStr.filter(Boolean).map((val) => val.toUpperCase())
                      );
                    }
                  "
                >
                  <UIPinInputGroup>
                    <UIPinInputInput
                      v-for="(id, index) in 6"
                      :key="id"
                      :index="index"
                    />
                  </UIPinInputGroup>
                </UIPinInput>
              </UIFormControl>
              <UIFormMessage />
            </UIFormItem>
          </UIFormField>

          <h2 class="py-3 text-2xl font-semibold">Additional Info</h2>
          <div
            v-if="organization?.additionalInfo.type === 'school'"
            class="flex gap-3"
          >
            <div class="w-1/2">
              <UIFormField v-slot="{ field }" name="studentId">
                <UIFormLabel>School ID</UIFormLabel>
                <UIFormItem>
                  <UIFormControl>
                    <UIInput v-bind="field" placeholder="123456" />
                  </UIFormControl>
                </UIFormItem>
                <UIFormMessage />
              </UIFormField>
            </div>
            <div class="w-1/2">
              <UIFormField v-slot="{ field }" name="gradeLevel">
                <UIFormLabel>Grade Level</UIFormLabel>
                <UIFormItem>
                  <UIFormControl>
                    <UINumberField
                      v-bind="field"
                      :default-value="1"
                      :max="12"
                      :min="1"
                    >
                      <UINumberFieldContent>
                        <UINumberFieldDecrement />
                        <UINumberFieldInput />
                        <UINumberFieldIncrement />
                      </UINumberFieldContent>
                    </UINumberField>
                  </UIFormControl>
                </UIFormItem>
                <UIFormMessage />
              </UIFormField>
            </div>
          </div>

          <div
            v-if="organization?.additionalInfo.type === 'rotating'"
            class="w-1/2"
          >
            <UIFormField v-slot="{ field }" name="age">
              <UIFormLabel>Age</UIFormLabel>
              <UIFormItem>
                <UIFormControl>
                  <UINumberField
                    v-bind="field"
                    :default-value="1"
                    :max="100"
                    :min="1"
                  >
                    <UINumberFieldContent>
                      <UINumberFieldDecrement />
                      <UINumberFieldInput />
                      <UINumberFieldIncrement />
                    </UINumberFieldContent>
                  </UINumberField>
                </UIFormControl>
              </UIFormItem>
              <UIFormMessage />
            </UIFormField>
          </div>
          <UIButton type="submit" class="mt-10 w-full">
            <Icon name="lucide:building-2" class="mr-2" />
            {{
              organization?.requireMembershipApproval
                ? "Request to Join Organization"
                : "Join Organization"
            }}
          </UIButton>
        </form>
      </UICardContent>
    </UICard>
  </main>
</template>

<script setup lang="ts">
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
const route = useRoute("orgs-organization_slug");
const auth = useAuth();
const membership = useMembership();

const { data: organization } = await useFetch(
  `/api/organizations/${route.params.organization_slug}`
);

const formSchema = toTypedSchema(
  organization.value?.additionalInfo.type === "school"
    ? z.object({
        displayName: z
          .string()
          .min(3, "Display name must be at least 3 characters long")
          .max(50, "Display name must be at most 50 characters long"),
        joinCode: z
          .array(z.coerce.string())
          .length(6, "Join code must be 6 characters long"),

        studentId: z
          .string()
          .min(3, "School ID must be at least 3 characters long"),
        gradeLevel: z
          .number()
          .int()
          .min(1, "Grade level must be at least 1")
          .default(1),
      })
    : organization.value?.additionalInfo.type === "rotating"
      ? z.object({
          displayName: z
            .string()
            .min(3, "Display name must be at least 3 characters long")
            .max(50, "Display name must be at most 50 characters long"),
          joinCode: z
            .array(z.coerce.string())
            .length(6, "Join code must be 6 characters long"),

          age: z.number().min(1, "Age must be at least 1").default(1),
        })
      : z.object({
          displayName: z
            .string()
            .min(3, "Display name must be at least 3 characters long")
            .max(50, "Display name must be at most 50 characters long"),
          joinCode: z
            .array(z.coerce.string())
            .length(6, "Join code must be 6 characters long"),
        })
);

const { handleSubmit, setFieldValue } = useForm({
  validationSchema: formSchema,
});

type StudentDetails = {
  studentId: string;
  gradeLevel: number;
};

type RotatingDetails = {
  age: number;
};

onMounted(async () => {
  const joinCode = route.query.joinCode as string;
  if (joinCode) {
    setFieldValue(
      "joinCode",
      joinCode.split("").map((val) => val.toUpperCase())
    );
  }
});

const joinOrganization = handleSubmit(async (values) => {
  const res = await $fetch(
    `/api/organizations/${route.params.organization_slug}/members`,
    {
      method: "POST",
      body: {
        action: "join",
        displayName: values.displayName,
        joinCode: values.joinCode.join(""),

        additionalInfo:
          organization.value?.additionalInfo.type === "school"
            ? {
                type: "school",
                details: {
                  studentId: (values as unknown as StudentDetails).studentId,
                  grade: (values as unknown as StudentDetails).gradeLevel,
                },
              }
            : organization.value?.additionalInfo.type === "rotating"
              ? {
                  type: "rotating",
                  details: {
                    age: (values as unknown as RotatingDetails).age,
                  },
                }
              : {
                  type: "consistent",
                  details: {},
                },
      },
    }
  );
  toast.success(res.message);

  if (res.message === "Joined organization") {
    membership.value = (await $fetch(
      `/api/organizations/${route.params.organization_slug}/membership`
    )) as unknown as typeof organizationMembersTable.$inferSelect;
    await navigateTo(`/orgs/${route.params.organization_slug}/home`);
  }
});
</script>
