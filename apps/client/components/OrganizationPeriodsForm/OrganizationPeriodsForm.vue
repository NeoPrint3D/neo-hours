<template>
  <form class="space-y-1" @submit.prevent="submitPeriod">
    <div class="flex gap-3">
      <UIFormField v-slot="{ field }" name="startDate">
        <UIFormItem class="flex w-full flex-col">
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
                        ? $dayjs(new Date(field.value), { utc: true }).format(
                            "MMM DD, YYYY"
                          )
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
      <UIFormField v-slot="{ field }" name="endDate">
        <UIFormItem class="flex w-full flex-col">
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
                          }).format("MMM DD, YYYY")
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
    </div>

    <div>
      <UIFormField name="name">
        <UIFormItem>
          <UIFormLabel>Period Name</UIFormLabel>
          <UIFormControl>
            <UIInput v-model="values.name" :placeholder="'Enter a name'" />
          </UIFormControl>
          <button
            v-if="values.startDate && values.endDate && organization"
            type="button"
            class="underline"
            @click.prevent="
              setFieldValue(
                'name',
                `${organization.name}: ${dayjs(new Date(values.startDate)).format('MMM YYYY')} - ${dayjs(
                  new Date(values.endDate)
                ).format('MMM YYYY')}`
              )
            "
          >
            Use suggested name
          </button>
          <UIFormMessage />
        </UIFormItem>
      </UIFormField>
    </div>
    <div>
      <UIFormField v-slot="{ field }" name="hourRequirement">
        <UIFormLabel>Required Hours</UIFormLabel>
        <UIFormItem>
          <UIFormControl>
            <UINumberField
              v-bind="field"
              :default-value="15"
              :format-options="{
                style: 'unit',
                unit: 'hour',
                minimumFractionDigits: 1,
              }"
              :step="0.5"
              :min="0.5"
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

      <UIButton type="submit" class="mt-10 w-full">
        <Icon name="lucide:calendar-plus" />
        {{ props.edit ? "Update" : "Create" }} Period
      </UIButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { cn } from "#imports";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
const props = defineProps<{
  edit?: boolean;
  defaultValue?: typeof organizationPeriodsTable.$inferSelect;
}>();

const dayjs = useDayjs();

const emit = defineEmits(["finishedAction"]);

const route = useRoute("orgs-organization_slug-periods-period_id-edit");
const router = useRouter();
const organization = useOrganization();

const periods = usePeriods();

const formSchema = toTypedSchema(
  z
    .object({
      name: z.string(),
      startDate: z.string().date("Should be yyyy-MM-dd format"),
      endDate: z.string().date("Should be yyyy-MM-dd format"),
      hourRequirement: z.number().positive().default(15),
    })
    .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
      message: "End date must be after start date",
      path: ["endDate"],
    })
);

const { values, handleSubmit, setFieldValue } = useForm({
  validationSchema: formSchema,
});

onMounted(() => {
  if (props.defaultValue) {
    setFieldValue("name", props.defaultValue.name);

    setFieldValue(
      "startDate",
      dayjs(new Date(props.defaultValue.startDate), { utc: true }).format(
        "YYYY-MM-DD"
      )
    );
    setFieldValue(
      "endDate",
      dayjs(new Date(props.defaultValue.endDate), { utc: true }).format(
        "YYYY-MM-DD"
      )
    );

    setFieldValue("hourRequirement", props.defaultValue.hourRequirement);
  }
});

const submitPeriod = handleSubmit(async (values) => {
  // await organizationPeriodsTable.insert(values)

  const res = props.edit
    ? await $fetch(
        `/api/organizations/${route.params.organization_slug}/periods/${route.params.period_id}`,
        {
          method: "PUT",
          body: {
            action: "edit",
            data: {
              name: values.name,
              startDate: new Date(values.startDate).toISOString(),
              endDate: new Date(values.endDate).toISOString(),
              hourRequirement: values.hourRequirement,
            },
          },
          onResponseError: (res) => {
            toast.error(res.response._data.data.details);
          },
        }
      )
    : await $fetch(
        `/api/organizations/${route.params.organization_slug}/periods`,
        {
          method: "POST",
          body: {
            name: values.name,
            startDate: new Date(values.startDate).toISOString(),
            endDate: new Date(values.endDate).toISOString(),
            hourRequirement: values.hourRequirement,
          },
          onResponseError: (error) => {
            console.error(error);
            toast.error("Failed to create period");
          },
        }
      );
  toast.success(res.message);
  const newPeriods = await $fetch(
    `/api/organizations/${route.params.organization_slug}/periods`
  );
  periods.value = newPeriods;
  await router.push({
    query: {},
  });

  await refreshNuxtData();
  emit("finishedAction");
});
</script>
