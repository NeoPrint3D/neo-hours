<template>
  <form class="space-y-1" @submit.prevent="submitActivity">
    <div class="flex flex-col gap-1">
      <div class="flex gap-3">
        <div class="w-full">
          <UIFormField v-slot="{ field }" name="name">
            <UIFormLabel>Activity Name</UIFormLabel>
            <UIFormItem>
              <UIFormControl>
                <UIInput v-bind="field" placeholder="Trash Pickup" />
              </UIFormControl>
            </UIFormItem>
            <UIFormMessage />
          </UIFormField>
        </div>
        <div>
          <UIFormField v-slot="{ field }" name="hours">
            <UIFormLabel>Service Hours</UIFormLabel>
            <UIFormItem>
              <UIFormControl>
                <UINumberField
                  v-bind="field"
                  :default-value="1"
                  :format-options="{
                    style: 'unit',
                    unit: 'hour',
                    minimumFractionDigits: 1,
                  }"
                  :step="0.5"
                  :max="24"
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
        </div>
      </div>

      <UIFormField v-slot="{ field }" name="description">
        <UIFormLabel>Description (optional)</UIFormLabel>
        <UIFormItem>
          <UIFormControl>
            <UITextarea
              v-bind="field"
              placeholder="The Leo Club Helped picked up trash for the community."
            />
          </UIFormControl>
        </UIFormItem>
        <UIFormMessage />
      </UIFormField>

      <UIFormField v-slot="{ field }" name="scheduledStartDate">
        <UIFormItem class="flex flex-col">
          <UIFormLabel>Scheduled Start Date</UIFormLabel>
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
                      setFieldValue('scheduledStartDate', v.toString());
                    } else {
                      setFieldValue('scheduledStartDate', undefined);
                    }
                  }
                "
              />
            </UIPopoverContent>
          </UIPopover>
          <UIFormMessage />
        </UIFormItem>
      </UIFormField>

      <div class="flex gap-3">
        <div class="w-full">
          <UIFormField v-slot="{ field }" name="scheduledStartTime">
            <UIFormLabel>Start Time</UIFormLabel>
            <UIFormItem class="w-full">
              <UIFormControl>
                <UIInput v-bind="field" type="time" class="relative" />
              </UIFormControl>
            </UIFormItem>
            <UIFormMessage />
          </UIFormField>
        </div>
        <div class="w-full">
          <UIFormField v-slot="{ field }" name="scheduledEndTime">
            <UIFormLabel>End Time (optional)</UIFormLabel>
            <UIFormItem class="w-full">
              <UIFormControl>
                <UIInput v-bind="field" type="time" class="relative" />
              </UIFormControl>
            </UIFormItem>
            <UIFormMessage />
          </UIFormField>
        </div>
      </div>

      <UIFormField name="location">
        <UIFormItem>
          <UIFormLabel>Location</UIFormLabel>
          <UIPopover v-model:open="activityFormStatus.locationOpen">
            <UIPopoverTrigger as-child>
              <UIFormControl>
                <UIButton
                  variant="outline"
                  role="combobox"
                  class="flex w-full justify-start border-input bg-background/20"
                  :class="
                    values.location
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  "
                >
                  <Icon size="18" name="lucide:map" class="mr-2" />
                  <span
                    class="max-w-[28ch] overflow-hidden truncate sm:max-w-[42ch]"
                  >
                    {{ values.location || "Search for a location" }}
                  </span>
                  <Icon
                    size="18"
                    name="lucide:chevrons-up-down"
                    class="ml-auto"
                  />
                </UIButton>
              </UIFormControl>
            </UIPopoverTrigger>

            <UIPopoverContent class="p-0">
              <UICommand v-model:search-term="locationSearchQuery">
                <UICommandInput placeholder="Search for a location" />

                <div class="flex justify-center border-b px-3 py-2">
                  <ul v-if="locationsResults.length > 0">
                    <li v-for="location in locationsResults" :key="location.id">
                      <UIButton
                        variant="ghost"
                        size="sm"
                        class="w-full justify-start"
                        @click="
                          () => {
                            setFieldValue('location', location.displayName);
                            activityFormStatus.locationOpen = false;
                          }
                        "
                      >
                        <Icon name="lucide:map-pin" size="18" class="mr-2" />
                        <span
                          class="max-w-[28ch] truncate text-xs sm:max-w-[30ch]"
                        >
                          {{ location.displayName }}
                        </span>
                      </UIButton>
                    </li>
                  </ul>
                  <div v-else-if="activityFormStatus.locationPending">
                    <Icon name="lucide:loader" size="18" class="animate-spin" />
                  </div>
                  <div v-else-if="values.location?.length === 0">
                    <p class="text-muted-foreground">Search for a location</p>
                  </div>
                  <div v-else class="flex w-full flex-col items-center gap-2">
                    <p class="text-muted-foreground">No results found</p>
                    <UIButton
                      v-if="values.location"
                      variant="outline"
                      size="sm"
                      class="mx-auto"
                      @click="
                        () => {
                          activityFormStatus.locationOpen = false;
                          setFieldValue('location', locationSearchQuery);
                        }
                      "
                    >
                      <Icon name="lucide:map-pin" size="18" class="mr-2" />
                      Set Custom Location
                    </UIButton>
                  </div>
                </div>
              </UICommand>
            </UIPopoverContent>
          </UIPopover>
          <UIFormMessage />
        </UIFormItem>
      </UIFormField>

      <UIFormField v-slot="{ field }" name="organizationPeriodId">
        <UIFormLabel>Organization Period</UIFormLabel>
        <UIFormItem v-if="organizationPeriods?.length">
          <UISelect v-bind="field">
            <UISelectTrigger class="border hover:!bg-background/20">
              <UIFormControl>
                <UISelectValue :placeholder="organizationPeriods[0].name" />
              </UIFormControl>
            </UISelectTrigger>
            <UISelectContent>
              <UISelectGroup>
                <UISelectLabel> Periods</UISelectLabel>
                <UISelectItem
                  v-for="period in organizationPeriods"
                  :key="period.id"
                  :value="period.id"
                >
                  {{ period.name }}
                </UISelectItem>
              </UISelectGroup>
            </UISelectContent>
          </UISelect>
        </UIFormItem>
        <div v-else>
          <p class="text-muted-foreground my-3">
            Please create a period for this organization
          </p>
          <UIButton size="sm" as-child>
            <NuxtLink
              :to="`/orgs/${route.params.organization_slug}/periods?createPeriod=true`"
            >
              <Icon name="lucide:arrow-right" size="18" />
              Create a period?
            </NuxtLink>
          </UIButton>
        </div>
        <UIFormMessage />
      </UIFormField>

      <h2 class="text-2xl mt-5 font-semibold">Contact Verification</h2>
      <UIFormField v-slot="{ field }" name="contactVerificationName">
        <UIFormLabel>Contact Name</UIFormLabel>
        <UIFormItem>
          <UIFormControl>
            <UIInput v-bind="field" placeholder="John Doe" />
          </UIFormControl>
        </UIFormItem>
        <UIFormMessage />
      </UIFormField>

      <UIFormField v-slot="{ field }" name="contactVerificationEmail">
        <UIFormLabel>Contact Email</UIFormLabel>
        <UIFormItem>
          <UIFormControl>
            <UIInput v-bind="field" placeholder="john@doe.com" />
          </UIFormControl>
        </UIFormItem>
        <UIFormMessage />
      </UIFormField>

      <UIFormField v-slot="{ field }" name="contactVerificationPhone">
        <UIFormLabel>Contact Phone</UIFormLabel>
        <UIFormItem>
          <UIFormControl>
            <UIInput
              placeholder="123-456-7890"
              :model-value="field.value"
              @update:model-value="
                (v) =>
                  // format as phone number
                  setFieldValue(
                    'contactVerificationPhone',
                    (v as string)
                      .replace(/[^0-9]/g, '') // remove all non-numeric characters
                      .replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
                  )
              "
            />
          </UIFormControl>
        </UIFormItem>
        <UIFormMessage />
      </UIFormField>

      <UIFormField v-slot="{ field }" name="sendReminder">
        <UIFormLabel>Send an updated reminder</UIFormLabel>
        <UIFormItem>
          <UIFormControl>
            <UICheckbox
              class="size-8"
              :checked="field.value"
              @update:checked="
                () => {
                  setFieldValue('sendReminder', !field.value);
                }
              "
            />
          </UIFormControl>
        </UIFormItem>
        <UIFormMessage />
      </UIFormField>
      <div v-if="!edit" class="mt-5 flex justify-between gap-3">
        <UIButton
          class="w-full"
          variant="outline"
          @click="activityForm.isPublished = false"
        >
          <Icon name="lucide:drafting-compass" size="18" />
          Save as Draft
        </UIButton>
        <UIButton class="w-full" @click="activityForm.isPublished = true">
          <Icon name="lucide:arrow-big-up-dash" size="18" />
          Create and Publish
        </UIButton>
      </div>
      <div v-else class="mt-5 flex justify-between gap-3">
        <UIButton class="w-full" @click="activityForm.isPublished = true">
          <Icon name="lucide:arrow-big-up-dash" size="18" />
          Update Activity
        </UIButton>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { cn } from "#imports";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";

const props = defineProps<{
  edit?: boolean;
  defaultValue?: typeof activitiesTable.$inferSelect;
}>();
const emit = defineEmits(["finishedAction"]);

const route = useRoute("orgs-organization_slug-activities-activity_id");

const dayjs = useDayjs();

// gets the latest period
const { data: organizationPeriods } = await useFetch(
  `/api/organizations/${route.params.organization_slug}/periods`
);

// format a date to yyyy-mm-dd

const formSchema = toTypedSchema(
  z.object({
    name: z
      .string()
      .min(3, "Minimum 3 characters")
      .max(255, "Maximum 255 characters"),
    hours: z
      .number()
      .min(0.5, "Minimum 0.5 hours")
      .max(24, "Maximum 24 hours")
      .default(1),
    description: z.string().optional(),
    scheduledStartDate: z.string().date("Should be yyyy-MM-dd"),
    scheduledStartTime: z.string(),
    scheduledEndTime: z.string().optional(),
    location: z.string().optional(),
    organizationPeriodId:
      organizationPeriods.value && organizationPeriods.value.length > 0
        ? z
            .string()
            .min(1, "Organization period is required")
            .default(organizationPeriods.value[0].id)
        : z.string().min(1, "Organization period is required"),
    sendReminder: z.boolean().default(true),
    contactVerificationName: z.string().optional(),
    contactVerificationEmail: z.string().email().optional(),
    contactVerificationPhone: z.string().optional(),
  })
);

const { handleSubmit, setFieldValue, values } = useForm({
  validationSchema: formSchema,
});

onMounted(() => {
  if (props.defaultValue) {
    setFieldValue("name", props.defaultValue.name);
    setFieldValue("hours", props.defaultValue.hours);
    if (props.defaultValue.description) {
      setFieldValue("description", props.defaultValue.description);
    }
    setFieldValue(
      "scheduledStartDate",
      dayjs(new Date(props.defaultValue.scheduledStartDatetime)).format(
        "YYYY-MM-DD"
      )
    );
    setFieldValue(
      "scheduledStartTime",
      dayjs(new Date(props.defaultValue.scheduledStartDatetime)).format("HH:mm")
    );

    if (props.defaultValue.scheduledEndDatetime) {
      setFieldValue(
        "scheduledEndTime",
        dayjs(new Date(props.defaultValue.scheduledEndDatetime)).format("HH:mm")
      );
    }
    if (props.defaultValue.location) {
      setFieldValue("location", props.defaultValue.location);
    }
    setFieldValue(
      "organizationPeriodId",
      props.defaultValue.organizationPeriodId
    );

    if (props.defaultValue.contactVerificationInfo?.name) {
      setFieldValue(
        "contactVerificationName",
        props.defaultValue.contactVerificationInfo.name
      );
    }
    if (props.defaultValue.contactVerificationInfo?.email) {
      setFieldValue(
        "contactVerificationEmail",
        props.defaultValue.contactVerificationInfo.email
      );
    }
    if (props.defaultValue.contactVerificationInfo?.phone) {
      setFieldValue(
        "contactVerificationPhone",
        props.defaultValue.contactVerificationInfo.phone
      );
    }
  }
});

const activityForm = ref({
  isPublished: true,
});

const activityFormStatus = ref({
  locationOpen: false,
  locationPending: false,
});

const submitActivity = handleSubmit(async (values) => {
  const [startDateYear, startDateMonth, startDateDay] =
    values.scheduledStartDate.split("-").map((date) => parseInt(date));

  const [startTimeHour, startTimeMinute] = values.scheduledStartTime
    .split(":")
    .map((time) => parseInt(time));

  let endDateString;

  if (values.scheduledEndTime) {
    const [endDateYear, endDateMonth, endDateDay] = values.scheduledStartDate
      .split("-")
      .map((date) => parseInt(date));

    const [endTimeHour, endTimeMinute] = values.scheduledEndTime
      .split(":")
      .map((time) => parseInt(time));

    endDateString = new Date(
      endDateYear,
      endDateMonth - 1,
      endDateDay,
      endTimeHour,
      endTimeMinute
    ).toISOString();
  }

  const activityPayload: Omit<
    typeof activitiesTable.$inferInsert,
    "organizationId"
  > & {
    sendReminder: boolean;
  } = {
    name: values.name!,
    scheduledStartDatetime: new Date(
      startDateYear,
      startDateMonth - 1,
      startDateDay,
      startTimeHour,
      startTimeMinute
    ).toISOString(),
    scheduledEndDatetime: endDateString,
    hours: values.hours!,
    organizationPeriodId: values.organizationPeriodId!,
    location: values.location,
    contactVerificationInfo: {
      name: values.contactVerificationName,
      email: values.contactVerificationEmail,
      phone: values.contactVerificationPhone,
    },
    isPublished: activityForm.value.isPublished,
    sendReminder: values.sendReminder,
  };

  console.log(activityPayload);
  try {
    const fetchResult = props.edit
      ? await $fetch(
          `/api/organizations/${route.params.organization_slug}/activities/${route.params.activity_id}`,
          {
            // @ts-expect-error - Weird typing issue
            method: "PUT",
            body: {
              action: "edit",
              data: activityPayload,
            },
          }
        )
      : await $fetch(
          `/api/organizations/${route.params.organization_slug}/activities`,
          {
            method: "POST",
            body: activityPayload,
            onResponse: ({ response }) => {
              if (getMessageStatusType(response.status) === "success") {
                useTrackEvent("activity_created", {
                  props: {
                    organizationId: route.params.organization_slug,
                  },
                });
              }
            },
          }
        );
    // @ts-expect-error - fetchPayload is not a valid fetch option
    toast.success(fetchResult.message);

    emit("finishedAction");
  } catch (error) {
    const typedError = error as CustomError;
    console.log(typedError);
    if (typedError.statusCode === 400) {
      toast.error(typedError.message);
    } else {
      toast.error("An error occurred while creating the activity");
    }
  }
});

const locationSearchQuery = ref("");

interface LocationRes {
  osm_id: number;
  display_name: string;
  // lat: string
  // lon: string
}

const locationsResults = ref<
  {
    id: number;
    displayName: string;
    // lat: string
    // lon: string
  }[]
>([]);

debouncedWatch(
  () => locationSearchQuery.value,
  async (location) => {
    console.log(location);
    if (!location) {
      locationsResults.value = [];
      return;
    }

    activityFormStatus.value.locationPending = true;
    const locations = await $fetch<LocationRes[]>(
      `https://nominatim.openstreetmap.org/search?q=${location}&format=json&limit=3`
    );

    locationsResults.value = locations.map((location) => ({
      id: location.osm_id,
      displayName: location.display_name,
      // lat: location.lat,
      // lon: location.lon,
    }));
    activityFormStatus.value.locationPending = false;
  },
  { debounce: 300 }
);
</script>

<style scoped>
input[type="time"]::-webkit-calendar-picker-indicator {
  opacity: 0;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  cursor: pointer;
}
</style>
