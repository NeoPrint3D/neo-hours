<template>
  <main class="space-y-3">
    <h1 class="text-4xl font-semibold">
      {{ organizationData?.name }} Settings
    </h1>

    <div class="flex flex-col gap-5 pt-5">
      <UICard>
        <UICardHeader>
          <UICardTitle>Organization Name</UICardTitle>
          <UICardDescription>
            Used to identify your organization.
          </UICardDescription>
        </UICardHeader>
        <UICardContent>
          <UIFormField v-slot="{ field }" name="name">
            <UIFormItem>
              <UIFormControl>
                <UIInput v-bind="field" placeholder="Organization Name" />
              </UIFormControl>
              <UIFormMessage />
            </UIFormItem>
          </UIFormField>
        </UICardContent>
        <UICardFooter class="border-t px-6 py-4">
          <UIButton type="submit" @click="submitSettings">
            <Icon name="lucide:arrow-up" />
            Update</UIButton
          >
        </UICardFooter>
      </UICard>
      <UICard>
        <UICardHeader>
          <UICardTitle>Organization Description</UICardTitle>
          <UICardDescription>
            A brief description of your organization.
          </UICardDescription>
        </UICardHeader>
        <UICardContent>
          <UIFormField v-slot="{ field }" name="description">
            <UIFormItem>
              <UIFormControl>
                <UIInput
                  v-bind="field"
                  placeholder="Organization Description"
                />
              </UIFormControl>
              <UIFormMessage />
            </UIFormItem>
          </UIFormField>
        </UICardContent>
        <UICardFooter class="border-t px-6 py-4">
          <UIButton type="submit" @click="submitSettings">
            <Icon name="lucide:arrow-up" />
            Update</UIButton
          >
        </UICardFooter>
      </UICard>
      <UICard>
        <UICardHeader>
          <UICardTitle>Organization Slug</UICardTitle>
          <UICardDescription>
            A unique identifier for your organization.
          </UICardDescription>
        </UICardHeader>
        <UICardContent>
          <UIFormField v-slot="{ field }" name="slug">
            <UIFormItem>
              <UIFormControl>
                <UIInput v-bind="field" placeholder="Organization Slug" />
              </UIFormControl>
              <UIFormMessage />
            </UIFormItem>
          </UIFormField>
        </UICardContent>
        <UICardFooter class="border-t px-6 py-4">
          <UIButton type="submit" @click="submitSettings">
            <Icon name="lucide:arrow-up" />
            Update</UIButton
          >
        </UICardFooter>
      </UICard>

      <UICard>
        <UICardHeader>
          <UICardTitle>Requires Membership Approval</UICardTitle>
          <UICardDescription>
            A code that users can use to join your organization.
          </UICardDescription>
        </UICardHeader>
        <UICardFooter class="border-t px-6 py-4">
          <UIFormField
            v-slot="{ value, handleChange }"
            name="requireMembershipApproval"
          >
            <UIFormItem>
              <UIFormControl>
                <UICheckbox
                  :checked="value"
                  class="size-8"
                  @update:checked="
                    (e) => {
                      handleChange(e);
                      submitSettings();
                    }
                  "
                />
              </UIFormControl>
              <UIFormMessage />
            </UIFormItem>
          </UIFormField>
        </UICardFooter>
      </UICard>
      <UICard>
        <UICardHeader>
          <UICardTitle>Public Organization</UICardTitle>
          <UICardDescription>
            Allows anyone to see and request to join your organization
          </UICardDescription>
        </UICardHeader>
        <UICardFooter class="border-t px-6 py-4">
          <UIFormField v-slot="{ value, handleChange }" name="public">
            <UIFormItem>
              <UIFormControl>
                <UICheckbox
                  class="size-8"
                  :checked="value"
                  @update:checked="
                    (e) => {
                      handleChange(e);
                      submitSettings();
                    }
                  "
                />
              </UIFormControl>
              <UIFormMessage />
            </UIFormItem>
          </UIFormField>
        </UICardFooter>
      </UICard>
      <UICard>
        <UICardHeader>
          <UICardTitle>Join Code</UICardTitle>
          <UICardDescription>
            A code that users can use to join your organization.
          </UICardDescription>
        </UICardHeader>
        <UICardContent :key="organizationData?.joinCode!" v-motion-fade>
          Code: {{ organizationData?.joinCode }}
        </UICardContent>
        <UICardFooter class="border-t px-6 py-4">
          <UIButton
            @click="
              toast('Are you sure you want to regenerate join code?', {
                action: {
                  label: 'Regenerate Code',
                  onClick: () => regenerateJoinCode(),
                },
              })
            "
          >
            <Icon name="lucide:refresh-cw" />
            Regenerate Join Code
          </UIButton>
        </UICardFooter>
      </UICard>
      <UISeparator />
      <h2 class="text-3xl capitalize">
        {{ organizationData?.additionalInfo.type }}

        Settings
      </h2>

      <div
        v-if="organizationData?.additionalInfo.type === 'school'"
        class="flex-col flex gap-5"
      >
        <UICard>
          <UICardHeader>
            <UICardTitle> School Start Date </UICardTitle>
            <UICardDescription>
              The date your school year starts.
            </UICardDescription>
          </UICardHeader>
          <UICardContent>
            <UIFormField v-slot="{ field }" name="startDate">
              <UIFormItem class="flex flex-col">
                <UIFormLabel>Start Date</UIFormLabel>
                <UIPopover>
                  <UIPopoverTrigger as-child>
                    <UIFormControl>
                      <UIButton
                        variant="outline"
                        :class="
                          cn(
                            'w-full border-input bg-background/20',
                            !field.value && 'text-muted-foreground'
                          )
                        "
                      >
                        <span>
                          {{
                            field.value
                              ? $dayjs(new Date(field.value), {
                                  utc: true,
                                }).format("MMMM D, YYYY")
                              : "Select a date"
                          }}
                        </span>
                        <Icon
                          name="lucide:calendar"
                          class="ms-auto h-4 w-4 opacity-50"
                        />
                      </UIButton>
                      <input hidden />
                    </UIFormControl>
                  </UIPopoverTrigger>
                  <UIPopoverContent class="w-auto p-0">
                    <UICalendar
                      v-bind="field"
                      @update:model-value="
                        (v) => {
                          if (v) {
                            setFieldValue('startDate', v.toString());
                          } else {
                            setFieldValue('startDate', undefined);
                          }
                        }
                      "
                    />
                  </UIPopoverContent>
                </UIPopover>
                <UIFormMessage />
              </UIFormItem>
            </UIFormField>
          </UICardContent>
          <UICardFooter class="border-t px-6 py-4">
            <UIButton type="submit" @click="updateAdditionalInfo">
              <Icon name="lucide:arrow-up" />
              Update
            </UIButton>
          </UICardFooter>
        </UICard>
        <UICard>
          <UICardHeader>
            <UICardTitle> School End Date </UICardTitle>
            <UICardDescription>
              The date your school year ends.
            </UICardDescription>
          </UICardHeader>
          <UICardContent>
            <UIFormField v-slot="{ field }" name="endDate">
              <UIFormItem class="flex flex-col">
                <UIFormLabel>End Date</UIFormLabel>
                <UIPopover>
                  <UIPopoverTrigger as-child>
                    <UIFormControl>
                      <UIButton
                        variant="outline"
                        :class="
                          cn(
                            'w-full border-input bg-background/20',
                            !field.value && 'text-muted-foreground'
                          )
                        "
                      >
                        <span>
                          {{
                            field.value
                              ? $dayjs(new Date(field.value), {
                                  utc: true,
                                }).format("MMMM D, YYYY")
                              : "Select a date"
                          }}
                        </span>
                        <Icon
                          name="lucide:calendar"
                          class="ms-auto h-4 w-4 opacity-50"
                        />
                      </UIButton>
                      <input hidden />
                    </UIFormControl>
                  </UIPopoverTrigger>
                  <UIPopoverContent class="w-auto p-0">
                    <UICalendar
                      v-bind="field"
                      @update:model-value="
                        (v) => {
                          if (v) {
                            setFieldValue('endDate', v.toString());
                          } else {
                            setFieldValue('endDate', undefined);
                          }
                        }
                      "
                    />
                  </UIPopoverContent>
                </UIPopover>
                <UIFormMessage />
              </UIFormItem>
            </UIFormField>
          </UICardContent>
          <UICardFooter class="border-t px-6 py-4">
            <UIButton type="submit" @click="updateAdditionalInfo">
              <Icon name="lucide:arrow-up" />
              Update
            </UIButton>
          </UICardFooter>
        </UICard>
        <UICard>
          <UICardHeader>
            <UICardTitle>Grade Cut Off</UICardTitle>
            <UICardDescription>
              The grade cut off for your school.
            </UICardDescription>
          </UICardHeader>
          <UICardContent>
            <UIFormField v-slot="{ field }" name="gradeCutOff">
              <UIFormItem>
                <UIFormControl>
                  <UINumberField
                    v-bind="field"
                    :default-value="
                      organizationData?.additionalInfo.details.gradeCutOff
                    "
                    :step="1"
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
          </UICardContent>
          <UICardFooter class="border-t px-6 py-4">
            <UIButton type="submit" @click="updateAdditionalInfo">
              <Icon name="lucide:arrow-up" />
              Update
            </UIButton>
          </UICardFooter>
        </UICard>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { cn, toast } from "#imports";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import type {
  OrganizationRotatingAdditionalInfo,
  OrganizationSchoolAdditionalInfo,
} from "@neo-hours/db";

const route = useRoute("orgs-organization_slug-settings");
const organization = useOrganization();
const dayjs = useDayjs();

const { data: organizationData } = await useFetch(
  `/api/organizations/${route.params.organization_slug}`
);

const baseSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  slug: z.string().optional(),
  joinCode: z.string().optional(),
  public: z.boolean().optional(),
  requireMembershipApproval: z.boolean().optional(),
});

const schoolSchema = baseSchema.merge(
  z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    gradeCutOff: z.number().optional(),
  })
);

const rotatingSchema = baseSchema.merge(
  z.object({
    ageCutOff: z.number().optional(),
  })
);

const formSchema = toTypedSchema(
  organizationData.value?.additionalInfo.type === "school"
    ? schoolSchema.refine(
        (data) => {
          if (data.startDate && data.endDate) {
            return new Date(data.endDate) > new Date(data.startDate);
          }

          return true;
        },
        {
          message: "End date must be after start date",
          path: ["endDate"],
        }
      )
    : rotatingSchema
);

const { handleSubmit, setFieldValue, values } = useForm({
  validationSchema: formSchema,
});

onMounted(() => {
  if (organizationData.value) {
    setFieldValue("name", organizationData.value.name);
    setFieldValue("description", organizationData.value.description!);
    setFieldValue("joinCode", organizationData.value.joinCode!);
    setFieldValue("slug", organizationData.value.slug!);
    setFieldValue("public", organizationData.value.isPublic!);
    setFieldValue(
      "requireMembershipApproval",
      organizationData.value.requireMembershipApproval!
    );
    switch (organizationData.value.additionalInfo.type) {
      case "school": {
        setFieldValue(
          "startDate",
          dayjs(organizationData.value.additionalInfo.details.startDate, {
            utc: true,
          }).format("YYYY-MM-DD")
        );

        setFieldValue(
          "endDate",
          dayjs(organizationData.value.additionalInfo.details.endDate, {
            utc: true,
          }).format("YYYY-MM-DD")
        );

        setFieldValue(
          "gradeCutOff",
          organizationData.value.additionalInfo.details.gradeCutOff
        );
        break;
      }
      case "rotating": {
        setFieldValue(
          "ageCutOff",
          organizationData.value.additionalInfo.details.ageCutOff!
        );
        break;
      }
    }
  }
});

watch(organizationData, () => {
  if (organizationData.value) {
    organization.value = organizationData.value;
  }
});

const submitSettings = handleSubmit(async (values) => {
  console.log(values);
  const fetcher = $fetch(
    `/api/organizations/${route.params.organization_slug}`,
    {
      method: "PUT",
      body: {
        action: "edit",
        data: values,
      },
    }
  );

  toast.promise(fetcher, {
    loading: "Updating organization settings...",
    success: () => "Organization settings updated!",
    error: () => "Failed to update organization settings.",
  });

  await refreshNuxtData();
});

async function updateAdditionalInfo() {
  const payload =
    organizationData.value?.additionalInfo.type === "school"
      ? {
          type: organizationData.value?.additionalInfo.type,
          startDate: new Date(
            (values as OrganizationSchoolAdditionalInfo["details"]).startDate
          ).toISOString(),
          endDate: new Date(
            (values as OrganizationSchoolAdditionalInfo["details"]).endDate
          ).toISOString(),
          gradeCutOff: (values as OrganizationSchoolAdditionalInfo["details"])
            .gradeCutOff,
        }
      : {
          type: organizationData.value?.additionalInfo.type,
          ageCutOff: (values as OrganizationRotatingAdditionalInfo["details"])
            .ageCutOff,
        };

  const fetcher = $fetch(
    `/api/organizations/${route.params.organization_slug}`,
    {
      method: "PUT",
      body: {
        action: "update_additional_info",
        data: payload,
      },
    }
  );

  toast.promise(fetcher, {
    loading: "Updating organization settings...",
    success: () => "Organization settings updated!",
    error: () => "Failed to update organization settings.",
  });

  await refreshNuxtData();
}

async function regenerateJoinCode() {
  const fetcher = $fetch(
    `/api/organizations/${route.params.organization_slug}`,
    {
      method: "PUT",
      body: {
        action: "regenerate_join_code",
      },
    }
  );

  toast.promise(fetcher, {
    loading: "Regenerating join code...",
    success: () => "Join code regenerated!",
    error: () => "Failed to regenerate join code.",
  });

  await refreshNuxtData();
}
</script>
